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
  const [error, setError] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleChange = (key: keyof GemCertificate, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Reset generated state when form changes
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
      // Step 1: Save certificate to Supabase
      const saveRes = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json();
        throw new Error(errData.error || "Failed to save certificate");
      }

      // Step 2: Build verify URL — QR points to your website
      const certNo = form.certificateNo.trim().toUpperCase();
      const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(certNo)}`;

      // Step 3: Generate QR with the URL (short = scannable)
      const qrUrl = await QRCode.toDataURL(verifyUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "L",
      });

      setQrDataUrl(qrUrl);
      setIsGenerated(true);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!cardRef.current) return;

    const cardHtml = cardRef.current.outerHTML;

    const printWindow = window.open("", "_blank", "width=600,height=400");
    if (!printWindow) {
      alert("Please allow popups for this site to print.");
      return;
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Raja Gems Certificate — ${form.certificateNo || "Card"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: Arial, sans-serif;
      padding: 20px;
      gap: 12px;
    }
    .print-label {
      font-size: 10px;
      color: #999;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    @media print {
      .print-label { display: none; }
      body { padding: 0; }
      /* Force white QR background so dots print correctly */
      img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <p class="print-label">Raja Gems Testing Lab — Gemstone Certificate</p>
  ${cardHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 300);
    };
  <\/script>
</body>
</html>
    `);

    printWindow.document.close();
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        padding: "32px 24px 48px",
      }}
    >
      {/* ── PAGE HEADER ── */}
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
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "10px",
          }}
        >
          <div style={{
              width: "64px", height: "64px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2.5px solid #c8a951",
              boxShadow: "0 0 16px rgba(200,169,81,0.5)",
              background: "#fff",
            }}>
            <Image src="/rgtl-logo.jpg" alt="RGTL" width={64} height={64}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: "#e8c97a",
                letterSpacing: "1px",
                lineHeight: 1,
              }}
            >
              RAJA GEMS
            </h1>
            <p
              style={{
                color: "#8899bb",
                fontSize: "11px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              Testing Lab · Certificate Generator
            </p>
          </div>
        </div>

        <p
          style={{
            color: "#556",
            fontSize: "12px",
            letterSpacing: "0.5px",
          }}
        >
          Aashirwad Swarn Market, Nunhai Sarafa Bazar Jabalpur (M.P.)
        </p>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          maxWidth: "1100px",
          margin: "0 auto",
          alignItems: "flex-start",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* LEFT: FORM */}
        <CertificateForm
          form={form}
          onChange={handleChange}
          onGenerate={generateQR}
          onImageUpload={handleImageUpload}
          isGenerating={isGenerating}
        />

        {/* RIGHT: CARD PREVIEW */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            position: "sticky",
            top: "32px",
          }}
        >
          <h2
            style={{
              color: "#e8c97a",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            ✦ Card Preview
          </h2>

          {/* Error message */}
          {error && (
            <div
              style={{
                background: "rgba(220,50,50,0.15)",
                border: "1px solid rgba(220,50,50,0.4)",
                borderRadius: "8px",
                padding: "10px 16px",
                color: "#ff8888",
                fontSize: "12px",
                maxWidth: "340px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* THE CARD */}
          <GemCard ref={cardRef} data={form} qrDataUrl={qrDataUrl} />

          {/* Status label */}
          <p
            style={{
              color: isGenerated ? "#7ac97a" : "#556",
              fontSize: "12px",
              textAlign: "center",
              maxWidth: "320px",
              lineHeight: "1.5",
            }}
          >
            {isGenerated
              ? "✓ Saved to database — scanning QR opens this card on your website"
              : "Fill the form and click Generate to save and preview your certificate"}
          </p>

          {/* Action buttons */}
          {isGenerated && (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={handlePrint}
                style={{
                  background: "linear-gradient(135deg, #c8a951, #e8c97a)",
                  color: "#1a1a2e",
                  fontWeight: 800,
                  fontSize: "12px",
                  letterSpacing: "1px",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                ⎙ Print / Save PDF
              </button>
              <button
                onClick={handleReset}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(200,169,81,0.4)",
                  color: "#e8c97a",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "1px",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                ↺ Reset
              </button>
            </div>
          )}

          {/* QR explanation */}
          {isGenerated && (
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(200,169,81,0.15)",
                borderRadius: "10px",
                padding: "14px 18px",
                maxWidth: "340px",
              }}
            >
              <p
                style={{
                  color: "#8899bb",
                  fontSize: "11px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                <strong style={{ color: "#c8a951" }}>QR Code links to:</strong>
                <br />
                <span style={{ color: "#7ac97a", wordBreak: "break-all" }}>
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/verify/${form.certificateNo.trim().toUpperCase()}`
                    : `/verify/${form.certificateNo}`}
                </span>
                <br />
                <br />
                Anyone who scans this card is taken directly to your website where the full
                certificate is displayed and verified from your database.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          textAlign: "center",
          color: "#334",
          fontSize: "11px",
          marginTop: "48px",
          letterSpacing: "0.5px",
        }}
      >
        Raja Gems Testing Lab · Aashirwad Swarn Market · Nunhai Sarafa Bazar · Jabalpur (M.P.)
      </p>
    </div>
  );
}
