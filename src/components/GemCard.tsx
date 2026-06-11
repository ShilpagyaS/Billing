"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { GemCertificate } from "@/types/certificate";

interface GemCardProps {
  data: GemCertificate;
  qrDataUrl: string;
}

/**
 * Debit-card ratio 1.586:1
 * Rendered: 600 × 378 px
 */
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
        border: "1px solid #d4d4d8",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── HEADER ── */}
      <div style={{
        height: "96px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: "12px 18px",
        borderBottom: "1.5px solid #1a237e",
        background: "#fff",
      }}>
        {/* Logo */}
        <div style={{
          width: "72px", height: "72px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Image
            src="/rgtl-logo.jpg"
            alt="RGTL"
            width={72}
            height={72}
            style={{
              width: "72px", height: "72px",
              objectFit: "contain",
              mixBlendMode: "multiply",
            }}
          />
        </div>

        {/* Vertical divider */}
        <div style={{
          width: "2px", height: "56px", background: "#d0d0d0",
          margin: "0 14px", flexShrink: 0,
        }} />

        {/* Title block — same font size, same weight, one line */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "22px",
            fontWeight: 900,
            color: "#1a237e",
            letterSpacing: "1px",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}>
            RAJA GEMS STONE TESTING LABS
          </div>
          <div style={{
            fontSize: "11px",
            color: "#666",
            marginTop: "8px",
            letterSpacing: "0.5px",
          }}>
            www.rajagemstones.com
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* LEFT: data rows */}
        <div style={{
          flex: 1,
          padding: "6px 14px 8px 18px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
        }}>
          {rows.map(([key, val], i) => (
            <div key={key} style={{
              display: "flex", alignItems: "center",
              padding: "2.5px 0",
              borderBottom: i < rows.length - 1 ? "1px solid #ececec" : "none",
            }}>
              <span style={{
                fontSize: "10px", fontWeight: 800, color: "#1a1a1a",
                minWidth: "140px", letterSpacing: "0.6px", flexShrink: 0,
              }}>
                {key}
              </span>
              <span style={{
                fontSize: "10px", color: "#444",
                marginRight: "12px", flexShrink: 0,
              }}>:</span>
              <span style={{
                fontSize: "11.5px", fontWeight: 700, color: "#1a1a1a",
              }}>{val}</span>
            </div>
          ))}
        </div>

        {/* RIGHT panel */}
        <div style={{
          width: "160px", flexShrink: 0,
          borderLeft: "1px solid #e0e0e0",
          background: "#fafafa",
          padding: "8px 10px 10px",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: "5px",
        }}>
          {/* Gem image */}
          <div style={{
            width: "100%", height: "80px",
            borderRadius: "6px", background: "#efefef",
            border: "1px solid #ddd",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            {data.gemImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.gemImageUrl} alt="Gem"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "28px", opacity: 0.4 }}>💎</span>
            )}
          </div>

          {/* QR Code */}
          <div style={{
            width: "110px", height: "110px",
            background: "#fff", border: "1px solid #ddd",
            borderRadius: "4px",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", padding: "3px",
          }}>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR"
                style={{ width: "104px", height: "104px", display: "block" }} />
            ) : (
              <span style={{ fontSize: "10px", color: "#aaa", textAlign: "center" }}>QR Code</span>
            )}
          </div>

          {/* Scan to Verify */}
          <div style={{ fontSize: "9px", color: "#666", letterSpacing: "0.4px" }}>
            Scan to Verify
          </div>

          {/* Signature */}
          <div style={{ textAlign: "center", width: "100%" }}>
            <div style={{
              height: "32px",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "2px",
            }}>
              <Image
                src="/signature.png"
                alt="Signature"
                width={110}
                height={32}
                style={{ height: "32px", width: "auto", objectFit: "contain", maxWidth: "120px" }}
              />
            </div>
            <div style={{ height: "1px", background: "#bbb", margin: "0 10px 3px" }} />
            <div style={{
              fontSize: "10px", fontWeight: 800, color: "#1a1a1a",
              letterSpacing: "0.4px",
            }}>
              {data.gemmologist || "AKASH SONI"}
            </div>
            <div style={{
              fontSize: "8px", color: "#555",
              letterSpacing: "1.2px", marginTop: "1px",
            }}>
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
