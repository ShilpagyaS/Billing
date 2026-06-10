"use client";

import Image from "next/image";
import GemCard from "@/components/GemCard";
import { GemCertificate } from "@/types/certificate";

interface DbCert {
  certificate_no: string;
  variety: string;
  weight: string;
  color: string;
  shape_and_cut: string;
  measurement: string;
  specific_gravity: string;
  comment: string;
  gemmologist: string;
  gem_image_url?: string;
  created_at?: string;
}

interface Props {
  cert: DbCert | null;
  certNo: string;
}

function dbToForm(cert: DbCert): GemCertificate {
  return {
    certificateNo: cert.certificate_no,
    variety: cert.variety,
    weight: cert.weight,
    color: cert.color,
    shapeAndCut: cert.shape_and_cut,
    measurement: cert.measurement,
    specificGravity: cert.specific_gravity,
    comment: cert.comment,
    gemmologist: cert.gemmologist,
    gemImageUrl: cert.gem_image_url || "",
  };
}

export default function VerifyClient({ cert, certNo }: Props) {
  if (!cert) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "Arial, sans-serif", padding: "24px", gap: "16px",
      }}>
        <div style={{
          width: "70px", height: "70px", borderRadius: "50%",
          background: "rgba(220,50,50,0.15)", border: "2px solid rgba(220,50,50,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px",
        }}>❌</div>
        <h1 style={{ color: "#ff8888", fontSize: "20px", fontWeight: 700, textAlign: "center" }}>
          Certificate Not Found
        </h1>
        <p style={{ color: "#8899bb", fontSize: "14px", textAlign: "center", maxWidth: "320px" }}>
          No certificate with ID <strong style={{ color: "#e8c97a" }}>{certNo}</strong> exists in Raja Gems Testing Lab records.
        </p>
        <p style={{ color: "#556", fontSize: "12px", textAlign: "center" }}>
          If you believe this is an error, contact the shop directly.
        </p>
      </div>
    );
  }

  const formData = dbToForm(cert);
  const issuedDate = cert.created_at
    ? new Date(cert.created_at).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      fontFamily: "Arial, sans-serif",
      padding: "32px 20px 48px",
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "24px",
    }}>

      {/* Header with real logo */}
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          overflow: "hidden",
          border: "3px solid #c8a951",
          boxShadow: "0 0 20px rgba(200,169,81,0.4)",
          background: "#fff",
        }}>
          <Image src="/rgtl-logo.jpg" alt="RGTL Logo" width={80} height={80}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#e8c97a", letterSpacing: "1px", margin: 0 }}>
            RAJA GEMS
          </h1>
          <p style={{ color: "#8899bb", fontSize: "10px", letterSpacing: "2px", margin: "2px 0 0" }}>
            TESTING LAB · JABALPUR (M.P.)
          </p>
        </div>
      </div>

      {/* Verified badge */}
      <div style={{
        background: "rgba(50,180,100,0.12)",
        border: "1px solid rgba(50,180,100,0.5)",
        borderRadius: "12px",
        padding: "14px 28px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <span style={{ fontSize: "28px" }}>✅</span>
        <div>
          <p style={{ color: "#7ac97a", fontSize: "16px", fontWeight: 800, margin: 0 }}>
            Certificate Verified
          </p>
          <p style={{ color: "#55aa77", fontSize: "12px", margin: "2px 0 0" }}>
            Tested &amp; certified by Raja Gems Testing Lab
          </p>
        </div>
      </div>

      {/* The Card — no QR on verify page (already scanned) */}
      <GemCard ref={null} data={formData} qrDataUrl="" />

      {/* Full data table */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(200,169,81,0.2)",
        borderRadius: "14px",
        padding: "22px 24px",
        width: "100%", maxWidth: "400px",
      }}>
        <h2 style={{
          color: "#e8c97a", fontSize: "12px", fontWeight: 700,
          letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px", marginTop: 0,
        }}>
          ✦ Full Certificate Details
        </h2>

        {[
          ["Certificate No.", cert.certificate_no],
          ["Variety", cert.variety],
          ["Weight", `${cert.weight} CRTs`],
          ["Color", cert.color],
          ["Shape & Cut", cert.shape_and_cut],
          ["Measurement", cert.measurement],
          ["Specific Gravity", cert.specific_gravity],
          ["Comment", cert.comment],
          ["Certified by", cert.gemmologist],
          ...(issuedDate ? [["Issued on", issuedDate]] : []),
        ].map(([label, value]) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", gap: "12px",
            padding: "9px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            <span style={{ color: "#8899bb", fontSize: "13px", flexShrink: 0 }}>{label}</span>
            <span style={{ color: "#e8e8f0", fontSize: "13px", fontWeight: 600, textAlign: "right" }}>
              {value || "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p style={{ color: "#334455", fontSize: "11px", textAlign: "center", letterSpacing: "0.5px" }}>
        Aashirwad Swarn Market · Nunhai Sarafa Bazar · Jabalpur (M.P.)
      </p>
    </div>
  );
}
