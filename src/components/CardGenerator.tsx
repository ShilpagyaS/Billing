"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";
import { GemCertificate } from "@/types/certificate";
import CertificateForm from "./CertificateForm";
import GemCard from "./GemCard";

const INITIAL_FORM: GemCertificate = {
  certificateNo: "",
  variety: "",
  weight: "",
  color: "",
  shapeAndCut: "",
  measurement: "",
  specificGravity: "",
  comment: "",
  gemmologist: "AKASH SONI",
  gemImageUrl: "",
};

export default function CardGenerator() {
  const router = useRouter();
  const [form, setForm] = useState<GemCertificate>(INITIAL_FORM);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleChange = (key: keyof GemCertificate, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (isGenerated) setIsGenerated(false);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setForm((prev) => ({ ...prev, gemImageUrl: url }));
    };
    reader.readAsDataURL(file);
  };

  const generateQR = async () => {
    if (!form.certificateNo || !form.variety || !form.weight) {
      setError("Please fill in at least Certificate No., Variety, and Weight.");
      return;
    }
    setError("");
    setIsGenerating(true);
    try {
      const saveRes = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!saveRes.ok) {
        const errData = await saveRes.json();
        throw new Error(errData.error || "Failed to save certificate");
      }
      const certNo = form.certificateNo.trim().toUpperCase();
      const verifyUrl = window.location.origin + "/verify/" + encodeURIComponent(certNo);
      const qrUrl = await QRCode.toDataURL(verifyUrl, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "L",
      });
      setQrDataUrl(qrUrl);
      setIsGenerated(true);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * PRINT — No html2canvas.
   *
   * 1. Collect every <img> inside the card
   * 2. Convert /public-path imgs → base64 via canvas (CORS anonymous)
   *    data: URLs (QR, gem upload) pass through unchanged
   * 3. Clone card DOM, swap all img.src to data URLs
   * 4. Serialize to HTML string and open in print popup
   * 5. @page size = 85.6mm × 53.98mm (CR80 debit card)
   * 6. CSS transform scales the 600×378 div down to fit the page exactly
   * 7. print-color-adjust:exact forces ALL colors + backgrounds
   *
   * Scale math:
   *   85.6mm @ 96dpi = 85.6 × 3.7795 = 323.5px
   *   Scale = 323.5 / 600 = 0.53916...
   *   Height check: 378 × 0.5392 = 203.8px → 203.8/3.7795 = 53.92mm ✓
   */
  const handlePrint = async () => {
    if (!cardRef.current || isPrinting) return;
    setIsPrinting(true);

    try {
      const cardEl = cardRef.current;
      const imgs = Array.from(cardEl.querySelectorAll("img")) as HTMLImageElement[];

      // Convert a URL-based image src → base64 data URL
      const toDataURL = (img: HTMLImageElement): Promise<string> => {
        return new Promise((resolve) => {
          // Already inline data URL — pass through
          if (img.src.startsWith("data:")) {
            resolve(img.src);
            return;
          }
          const freshImg = new window.Image();
          freshImg.crossOrigin = "anonymous";
          freshImg.onload = () => {
            const c = document.createElement("canvas");
            c.width = freshImg.naturalWidth || 300;
            c.height = freshImg.naturalHeight || 300;
            const ctx = c.getContext("2d");
            if (ctx) {
              ctx.drawImage(freshImg, 0, 0);
              try {
                resolve(c.toDataURL("image/png"));
              } catch {
                resolve(img.src);
              }
            } else {
              resolve(img.src);
            }
          };
          freshImg.onerror = () => resolve(img.src);
          // Cache-bust to avoid stale CORS-cached responses
          const sep = img.src.includes("?") ? "&" : "?";
          freshImg.src = img.src + sep + "_cb=" + Date.now();
        });
      };

      // Resolve all image srcs in parallel
      const dataUrls = await Promise.all(imgs.map(toDataURL));

      // Deep-clone the card and inline all image data
      const clone = cardEl.cloneNode(true) as HTMLElement;
      const cloneImgs = Array.from(clone.querySelectorAll("img")) as HTMLImageElement[];
      cloneImgs.forEach((img, i) => {
        img.src = dataUrls[i];
        img.style.mixBlendMode = "normal"; // remove any blend modes
      });

      // Remove box-shadow from card root (not needed — outline handles border glow)
      (clone as HTMLElement).style.boxShadow = "none";

      const cardHtml = clone.outerHTML;

      /*
       * The card div is naturally 600 × 378 px.
       * We place it in a 600 × 378 wrapper and apply transform-origin: top left.
       * scale(0.5392) maps it to exactly 323.5 × 203.8 px = 85.6 × 53.9 mm.
       *
       * In @media print we set the body/page to exactly those mm dimensions.
       * overflow:hidden on body clips anything outside.
       */
      const printDoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
*,*::before,*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

/* ── Screen preview ── */
body {
  background: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

/* Card wrapper — natural size for screen */
.card-wrap {
  width: 600px;
  height: 378px;
  overflow: hidden;
  line-height: 0;
  /* Show the outline on screen too */
  outline: 2px solid #c8a030;
  border-radius: 12px;
}

/* ── CR80 debit-card print page ── */
@page {
  size: 85.6mm 53.98mm;
  margin: 0mm;
}

@media print {
  html, body {
    width: 85.6mm !important;
    height: 53.98mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    display: block !important;
    overflow: hidden !important;
  }

  /* Remove screen centering; pin card to top-left */
  body {
    min-height: unset !important;
    align-items: unset !important;
    justify-content: unset !important;
  }

  .card-wrap {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 600px !important;
    height: 378px !important;
    transform: scale(0.53916) !important;
    transform-origin: 0 0 !important;
    overflow: hidden !important;
    outline: 2px solid #c8a030 !important;
    border-radius: 12px !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Force all descendant backgrounds to print */
  .card-wrap * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}
</style>
</head>
<body>
<div class="card-wrap">${cardHtml}</div>
</body>
</html>`;

      // Print via an off-screen iframe using srcdoc — works in Chrome AND Safari,
      // and never opens a popup so blockers don't trigger.
      const existing = document.getElementById("rgtl-print-frame");
      if (existing) existing.remove();

      const iframe = document.createElement("iframe");
      iframe.id = "rgtl-print-frame";
      // Off-screen but NOT zero-size / display:none — Safari won't print those.
      iframe.style.position = "fixed";
      iframe.style.left = "-10000px";
      iframe.style.top = "0";
      iframe.style.width = "400px";
      iframe.style.height = "300px";
      iframe.style.border = "0";
      iframe.setAttribute("aria-hidden", "true");

      let printed = false;
      const doPrint = () => {
        if (printed) return;
        printed = true;
        const win = iframe.contentWindow;
        if (!win) return;
        win.focus();
        win.print();
        // Clean up after the dialog closes (afterprint is unreliable in Safari, so also time-fallback).
        win.addEventListener?.("afterprint", () => setTimeout(() => iframe.remove(), 300));
        setTimeout(() => { if (document.getElementById("rgtl-print-frame")) iframe.remove(); }, 60000);
      };

      // Print once the iframe's own document has loaded and rendered.
      iframe.onload = () => setTimeout(doPrint, 500);

      // srcdoc is more reliable than document.write in Safari.
      iframe.srcdoc = printDoc;
      document.body.appendChild(iframe);

    } catch (err) {
      console.error("Print failed:", err);
      alert("Print failed. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setQrDataUrl("");
    setIsGenerated(false);
    setError("");
  };

  const verifyUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/verify/" + form.certificateNo.trim().toUpperCase()
      : "/verify/" + form.certificateNo;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      padding: "32px 24px 48px",
    }}>
      {/* ── Page Header ── */}
      <div style={{ textAlign: "center", marginBottom: "40px", position: "relative" }}>
        <button onClick={handleLogout} style={{
          position: "absolute", top: 0, right: 0,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(200,169,81,0.25)",
          borderRadius: "8px", padding: "7px 14px",
          color: "#8899bb", fontSize: "12px", cursor: "pointer",
          fontWeight: 600, letterSpacing: "0.5px",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#e8c97a")}
          onMouseLeave={e => (e.currentTarget.style.color = "#8899bb")}
        >
          Sign Out
        </button>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden",
            border: "2.5px solid #c8a951", boxShadow: "0 0 16px rgba(200,169,81,0.5)", background: "#fff",
          }}>
            <Image src="/rgtl-logo.jpg" alt="RGTL" width={64} height={64}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#e8c97a", letterSpacing: "1px", lineHeight: 1 }}>
              RAJA GEMS
            </h1>
            <p style={{ color: "#8899bb", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", marginTop: "2px" }}>
              Testing Lab · Certificate Generator
            </p>
          </div>
        </div>
        <p style={{ color: "#556", fontSize: "12px", letterSpacing: "0.5px" }}>
          Aashirwad Swarn Market, Nunhai Sarafa Bazar Jabalpur (M.P.)
        </p>
      </div>

      {/* ── Main layout ── */}
      <div style={{
        display: "flex", gap: "40px", maxWidth: "1100px", margin: "0 auto",
        alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center",
      }}>
        <CertificateForm
          form={form}
          onChange={handleChange}
          onGenerate={generateQR}
          onImageUpload={handleImageUpload}
          isGenerating={isGenerating}
        />

        {/* ── Card preview + actions ── */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
          position: "sticky", top: "32px",
        }}>
          <h2 style={{
            color: "#e8c97a", fontSize: "13px", fontWeight: 700,
            letterSpacing: "1.5px", textTransform: "uppercase", margin: 0,
          }}>
            ✦ Card Preview
          </h2>

          {error && (
            <div style={{
              background: "rgba(220,50,50,0.15)", border: "1px solid rgba(220,50,50,0.4)",
              borderRadius: "8px", padding: "10px 16px", color: "#ff8888",
              fontSize: "12px", maxWidth: "340px", textAlign: "center",
            }}>
              {error}
            </div>
          )}

          <GemCard ref={cardRef} data={form} qrDataUrl={qrDataUrl} />

          <p style={{
            color: isGenerated ? "#7ac97a" : "#556",
            fontSize: "12px", textAlign: "center", maxWidth: "320px", lineHeight: "1.5",
          }}>
            {isGenerated
              ? "✓ Saved to database — scanning QR opens this card on your website"
              : "Fill the form and click Generate to save and preview your certificate"}
          </p>

          {isGenerated && (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                style={{
                  background: isPrinting
                    ? "linear-gradient(135deg, #8a7535,#a08840)"
                    : "linear-gradient(135deg, #c8a951, #e8c97a)",
                  color: "#1a1a2e", fontWeight: 800, fontSize: "12px",
                  letterSpacing: "1px", padding: "10px 28px",
                  borderRadius: "8px", border: "none",
                  cursor: isPrinting ? "not-allowed" : "pointer",
                  textTransform: "uppercase", minWidth: "170px",
                }}
              >
                {isPrinting ? "⏳ Preparing..." : "⎙ Print / Save PDF"}
              </button>
              <button onClick={handleReset} style={{
                background: "transparent", border: "1px solid rgba(200,169,81,0.4)",
                color: "#e8c97a", fontWeight: 600, fontSize: "12px",
                letterSpacing: "1px", padding: "10px 24px",
                borderRadius: "8px", cursor: "pointer", textTransform: "uppercase",
              }}>
                ↺ Reset
              </button>
            </div>
          )}

          {/* Print tip */}
          {isGenerated && (
            <div style={{
              background: "rgba(200,169,81,0.07)",
              border: "1px solid rgba(200,169,81,0.25)",
              borderRadius: "8px", padding: "10px 14px", maxWidth: "340px",
            }}>
              <p style={{ color: "#c8a951", fontSize: "10.5px", margin: 0, lineHeight: "1.7", textAlign: "center" }}>
                💡 In print dialog:<br />
                <strong>More settings → Background graphics ✅</strong><br />
                <strong>Margins → None</strong><br />
                <strong>Paper size → 85.6×54mm</strong> (or A4 — card will be small)
              </p>
            </div>
          )}

          {isGenerated && (
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,169,81,0.15)",
              borderRadius: "10px", padding: "14px 18px", maxWidth: "340px",
            }}>
              <p style={{ color: "#8899bb", fontSize: "11px", lineHeight: "1.6", margin: 0 }}>
                <strong style={{ color: "#c8a951" }}>QR Code links to:</strong><br />
                <span style={{ color: "#7ac97a", wordBreak: "break-all" }}>{verifyUrl}</span>
                <br /><br />
                Anyone who scans this card is taken directly to your website where the full
                certificate is displayed and verified from your database.
              </p>
            </div>
          )}
        </div>
      </div>

      <p style={{
        textAlign: "center", color: "#334", fontSize: "11px",
        marginTop: "48px", letterSpacing: "0.5px",
      }}>
        Raja Gems Testing Lab · Aashirwad Swarn Market · Nunhai Sarafa Bazar · Jabalpur (M.P.)
      </p>
    </div>
  );
}