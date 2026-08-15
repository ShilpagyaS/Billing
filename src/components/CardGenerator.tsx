"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
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
   * Export the currently rendered certificate at exact CR80 card size.
   * Uses html-to-image because it preserves the browser-rendered CSS layout
   * more faithfully than html2canvas for this card.
   */
  const handlePrint = async () => {
    if (!cardRef.current || isPrinting) return;

    setIsPrinting(true);

    try {
      const card = cardRef.current;

      // Wait until fonts and images used by the visible card are ready.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const images = Array.from(card.querySelectorAll("img"));
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }
            })
        )
      );

      // Capture the exact 600 × 378 card without changing its visible design.
      const imageData = await toPng(card, {
        width: 600,
        height: 378,
        canvasWidth: 1200,
        canvasHeight: 756,
        pixelRatio: 1,
        backgroundColor: "#ffffff",
        cacheBust: true,
        skipFonts: false,
      });

      // Exact CR80 card size — no A4 page.
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 53.98],
        compress: true,
      });

      pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        85.6,
        53.98,
        undefined,
        "FAST"
      );

      const certNo =
        form.certificateNo.trim().toUpperCase() || "CERTIFICATE";
      const filename = `Raja-Gems-${certNo}.pdf`;
      const blob = pdf.output("blob");
      const file = new File([blob], filename, { type: "application/pdf" });

      // iPhone/iPad: use the native Share sheet so the user can Save to Files.
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      if (
        isIOS &&
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: filename,
        });
        return;
      }

      // Android + desktop: normal PDF download.
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      console.error("PDF export failed:", err);
      alert("PDF export failed. Please try again.");
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
                {isPrinting ? "⏳ Creating PDF..." : "⬇ Download PDF"}
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
                💡 PDF exports at exact card size:<br />
                <strong>85.6 × 53.98 mm</strong><br />
                No A4 page or print settings required.
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