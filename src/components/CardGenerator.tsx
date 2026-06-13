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
   * PRINT APPROACH — No html2canvas, no external deps.
   *
   * Steps:
   * 1. Find all <img> elements inside the card
   * 2. Convert every /public path img to a base64 data URL via canvas
   *    (QR is already a data URL, gem upload is already a data URL)
   * 3. Clone the card HTML, swap all src= to data URLs
   * 4. Open print window with the cloned HTML
   * 5. Use CSS transform scale to fit exactly onto 85.6×54mm page
   * 6. Force all colors with print-color-adjust:exact
   *
   * Why this works without html2canvas:
   * - All images become inline data URLs → no cross-origin or path issues
   * - All colors are forced exact → no stripping
   * - Card is a fixed 600×378 div → scale is predictable
   */
  const handlePrint = async () => {
    if (!cardRef.current || isPrinting) return;
    setIsPrinting(true);

    try {
      const cardEl = cardRef.current;
      const imgs = Array.from(cardEl.querySelectorAll("img")) as HTMLImageElement[];

      // Convert a URL-based image to base64 data URL via canvas
      const toDataURL = (img: HTMLImageElement): Promise<string> => {
        return new Promise((resolve) => {
          // Already a data URL (QR code, uploaded gem photo)
          if (img.src.startsWith("data:")) {
            resolve(img.src);
            return;
          }
          // Use a fresh Image with crossOrigin to avoid taint
          const freshImg = new window.Image();
          freshImg.crossOrigin = "anonymous";
          freshImg.onload = () => {
            const c = document.createElement("canvas");
            c.width = freshImg.naturalWidth;
            c.height = freshImg.naturalHeight;
            const ctx = c.getContext("2d");
            if (ctx) {
              ctx.drawImage(freshImg, 0, 0);
              try {
                resolve(c.toDataURL("image/png"));
              } catch {
                resolve(img.src); // fallback to original if tainted
              }
            } else {
              resolve(img.src);
            }
          };
          freshImg.onerror = () => resolve(img.src);
          // Add cache-bust to avoid CORS cached responses
          freshImg.src = img.src + (img.src.includes("?") ? "&" : "?") + "_cb=" + Date.now();
        });
      };

      // Convert all images in parallel
      const dataUrls = await Promise.all(imgs.map(toDataURL));

      // Deep-clone the card and replace all img srcs
      const clone = cardEl.cloneNode(true) as HTMLElement;
      const cloneImgs = Array.from(clone.querySelectorAll("img")) as HTMLImageElement[];
      cloneImgs.forEach((img, i) => {
        img.src = dataUrls[i];
        // Remove mixBlendMode — causes issues in print popup context
        img.style.mixBlendMode = "normal";
      });

      // Remove box-shadow from the card root (gold glow) — use outline instead
      // The clone's root div is the card itself
      const cardRoot = clone as HTMLElement;
      cardRoot.style.boxShadow = "none";
      cardRoot.style.outline = "2px solid #c8a030";

      const cardHtml = clone.outerHTML;

      // Open print window
      const pw = window.open("", "_blank");
      if (!pw) {
        alert("Please allow popups to print.");
        setIsPrinting(false);
        return;
      }

      /*
       * Scale math (no dependencies):
       * Card = 600 × 378 px (screen pixels)
       * Page = 85.6 × 53.98 mm
       * At 96 dpi: 1mm = 3.7795px
       * Page in px = 85.6mm × 3.7795 = 323.5px wide
       * Scale = 323.5 / 600 = 0.5392
       *
       * We use position:fixed + transform-origin:0 0 + scale(0.5392)
       * The card stays at 600px natural width, scaled down to fit the page.
       */
      const lines = [
        "<!DOCTYPE html>",
        "<html lang='en'><head>",
        "<meta charset='UTF-8'/>",
        "<style>",
        // ── Force ALL colors/backgrounds in print ──
        "*,*::before,*::after{",
        "  margin:0;padding:0;box-sizing:border-box;",
        "  -webkit-print-color-adjust:exact!important;",
        "  print-color-adjust:exact!important;",
        "  color-adjust:exact!important;",
        "}",
        // ── Screen preview ──
        "body{",
        "  background:#1a1a2e;",
        "  display:flex;align-items:center;justify-content:center;",
        "  min-height:100vh;",
        "}",
        ".pw{",
        "  display:inline-block;",
        "  width:600px;height:378px;",
        "  overflow:hidden;line-height:0;",
        "}",
        // ── Exact debit card page ──
        "@page{size:85.6mm 53.98mm;margin:0mm;}",
        // ── Print ──
        "@media print{",
        "  body{",
        "    background:#fff!important;",
        "    width:85.6mm!important;height:53.98mm!important;",
        "    margin:0!important;padding:0!important;",
        "    display:block!important;overflow:hidden!important;",
        "  }",
        "  .pw{",
        "    position:fixed!important;",
        "    top:0!important;left:0!important;",
        "    width:600px!important;height:378px!important;",
        "    transform:scale(0.5392)!important;",
        "    transform-origin:0 0!important;",
        "    overflow:hidden!important;",
        "  }",
        // Force all background colors to print
        "  div,span{",
        "    -webkit-print-color-adjust:exact!important;",
        "    print-color-adjust:exact!important;",
        "  }",
        "}",
        "</style></head>",
        "<body>",
        "<div class='pw'>" + cardHtml + "</div>",
        "<script>",
        // Wait for all images to load, then print
        "window.onload=function(){",
        "  var imgs=document.querySelectorAll('img');",
        "  var total=imgs.length,loaded=0;",
        "  function tryPrint(){",
        "    loaded++;",
        "    if(loaded>=total) setTimeout(function(){window.print();},600);",
        "  }",
        "  if(!total){ setTimeout(function(){window.print();},600); return; }",
        "  imgs.forEach(function(img){",
        "    if(img.complete && img.naturalHeight>0){ tryPrint(); }",
        "    else{ img.onload=tryPrint; img.onerror=tryPrint; }",
        "  });",
        "};",
        "<\/script>",
        "</body></html>",
      ];

      pw.document.write(lines.join("\n"));
      pw.document.close();

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