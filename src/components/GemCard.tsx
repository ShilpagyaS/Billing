"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { GemCertificate } from "@/types/certificate";

interface GemCardProps {
  data: GemCertificate;
  qrDataUrl: string;
}

const GemCard = forwardRef<HTMLDivElement, GemCardProps>(({ data, qrDataUrl }, ref) => {
  const rows: [string, string][] = [
    ["CERTIFICATE NO.", data.certificateNo || ""],
    ["VARIETY",         data.variety || ""],
    ["WEIGHT",          data.weight ? `${data.weight} CRTs` : ""],
    ["COLOR",           data.color || ""],
    ["SHAPE & CUT",     data.shapeAndCut || ""],
    ["MEASUREMENT",     data.measurement || ""],
    ["SPECIFIC GRAVITY",data.specificGravity || ""],
    ["COMMENT",         data.comment || ""],
  ];

  return (
    <div
      ref={ref}
      style={{
        width: "600px",
        height: "378px",
        background: "#ffffff",
        borderRadius: "12px",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        border: "1px solid #d0d0d0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      }}
    >
      {/* HEADER — 110px (bigger to fit bigger logo) */}
      <div style={{
        height: "110px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        background: "#ffffff",
        borderBottom: "1.5px solid #1a237e",
      }}>
        {/* Logo — bigger: 100px */}
        <div style={{ width: "100px", height: "100px", flexShrink: 0 }}>
          <Image
            src="/rgtl-logo-new.png"
            alt="RGTL"
            width={100}
            height={100}
            style={{
              width: "100px", height: "100px",
              objectFit: "contain",
              mixBlendMode: "multiply",
            }}
          />
        </div>

        {/* Vertical divider */}
        <div style={{ width: "1.5px", height: "72px", background: "#ccc", margin: "0 14px", flexShrink: 0 }} />

        {/* Title — bigger fonts */}
        <div style={{ flex: 1 }}>
          <div style={{ whiteSpace: "nowrap", lineHeight: 1 }}>
            <span style={{
              fontSize: "38px", fontWeight: 900, color: "#1a237e",
              fontFamily: "Georgia, serif",
            }}>
              RAJA GEMS
            </span>
            <span style={{
              fontSize: "22px", fontWeight: 400, color: "#1a237e",
              marginLeft: "10px", fontFamily: "Georgia, serif", letterSpacing: "1.5px",
            }}>
              TESTING LAB
            </span>
          </div>
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#666", letterSpacing: "0.5px", textAlign: "center" }}>
            www.rajagemstones.com
          </div>
        </div>
      </div>

      {/* BODY — 268px (378-110) */}
      <div style={{ display: "flex", height: "268px" }}>

        {/* LEFT — 415px */}
        <div style={{
          width: "415px", flexShrink: 0,
          padding: "6px 12px 6px 18px",
          display: "flex", flexDirection: "column",
          justifyContent: "space-around",
        }}>
          {rows.map(([key, val], i) => (
            <div key={key} style={{
              display: "flex", alignItems: "center",
              borderBottom: i < rows.length - 1 ? "1px solid #ebebeb" : "none",
              padding: "3px 0",
            }}>
              <span style={{
                fontSize: "10px", fontWeight: 800, color: "#1a237e",
                width: "135px", flexShrink: 0, letterSpacing: "0.6px",
              }}>{key}</span>
              <span style={{ fontSize: "10px", color: "#555", marginRight: "10px", flexShrink: 0 }}>:</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#111" }}>{val}</span>
            </div>
          ))}
        </div>

        {/* RIGHT — 185px
            Gem:70 + gap:5 + QR:110 + gap:4 + scan:13 + gap:4 + sig:54 = 260 fits in 268 ✓ */}
        <div style={{
          width: "185px", flexShrink: 0,
          borderLeft: "1px solid #d0d0d0",
          background: "#f5f5f5",
          display: "flex", flexDirection: "column",
          alignItems: "center",
          padding: "6px 10px 6px",
          overflow: "hidden",
        }}>
          {/* Gem image */}
          <div style={{
            width: "163px", height: "70px",
            borderRadius: "8px", overflow: "hidden",
            border: "1px solid #ccc", background: "#e8e8e8",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginBottom: "5px",
          }}>
            {data.gemImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.gemImageUrl} alt="Gem"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "24px", opacity: 0.3 }}>💎</span>
            )}
          </div>

          {/* QR */}
          <div style={{
            width: "110px", height: "110px",
            background: "#fff", border: "1px solid #ccc",
            borderRadius: "5px", overflow: "hidden", padding: "3px",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginBottom: "4px",
          }}>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR"
                style={{ width: "104px", height: "104px", display: "block" }} />
            ) : (
              <span style={{ fontSize: "9px", color: "#aaa", textAlign: "center" }}>QR Code</span>
            )}
          </div>

          {/* Scan to Verify */}
          <div style={{ fontSize: "9px", color: "#666", letterSpacing: "0.3px", flexShrink: 0, marginBottom: "4px" }}>
            Scan to Verify
          </div>

          {/* Signature block */}
          <div style={{ textAlign: "center", width: "163px", flexShrink: 0 }}>
            <div style={{ height: "22px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "3px" }}>
              <Image
                src="/signature.png"
                alt="Signature"
                width={90}
                height={22}
                style={{ height: "22px", width: "auto", maxWidth: "90px", objectFit: "contain" }}
              />
            </div>
            <div style={{ height: "1px", background: "#aaa", margin: "0 16px 4px" }} />
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#111", letterSpacing: "0.5px", lineHeight: 1.2 }}>
              {data.gemmologist || "AKASH SONI"}
            </div>
            <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1.2px", marginTop: "2px" }}>
              GEMMOLOGIST
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

GemCard.displayName = "GemCard";
export default GemCard;