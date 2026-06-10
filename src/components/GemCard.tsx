"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { GemCertificate } from "@/types/certificate";

interface GemCardProps {
  data: GemCertificate;
  qrDataUrl: string;
}

const GemCard = forwardRef<HTMLDivElement, GemCardProps>(({ data, qrDataUrl }, ref) => {
  const rows: [string, string, boolean][] = [
    ["Certificate No.", data.certificateNo || "", true],
    ["Variety",         data.variety || "",       false],
    ["Weight",          data.weight ? `${data.weight} CRTs` : "", false],
    ["Color",           data.color || "",         false],
    ["Shape & cut",     data.shapeAndCut || "",   false],
    ["Measurement",     data.measurement || "",   false],
    ["Specific Gravity",data.specificGravity || "","" as unknown as boolean],
    ["Comment",         data.comment || "",       false],
  ];

  return (
    <div
      ref={ref}
      style={{
        width: "370px",
        background: "#ffffff",
        borderRadius: "10px",
        border: "1px solid #d0d0d0",
        fontFamily: "'Arial', sans-serif",
        boxShadow: "0 2px 16px rgba(0,0,0,0.13)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── HEADER ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px 8px 12px",
        borderBottom: "1.5px solid #222",
        background: "#fff",
      }}>
        {/* Logo */}
        <div style={{
          width: "50px", height: "50px", flexShrink: 0,
          borderRadius: "50%",
          overflow: "hidden",
          border: "1.5px solid #c8a951",
        }}>
          <Image src="/rgtl-logo.jpg" alt="RGTL" width={50} height={50}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Title */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "3px", lineHeight: 1 }}>
            <span style={{ fontSize: "21px", fontWeight: 900, color: "#111", letterSpacing: "0.3px" }}>
              RAJA GEMS
            </span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#111", letterSpacing: "1px" }}>
              TESTING LAB
            </span>
          </div>
          <div style={{ fontSize: "6.8px", color: "#666", letterSpacing: "0.5px", marginTop: "3px", textTransform: "uppercase" }}>
            Aashirwad Swarn Market, Nunhai Sarafa Bazar Jabalpur(M.P.)
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: "flex", padding: "10px 14px 12px 12px", gap: "8px" }}>

        {/* Left: data fields */}
        <div style={{ flex: 1 }}>
          {rows.map(([key, val]) => (
            <div key={key} style={{
              display: "flex",
              alignItems: "baseline",
              padding: "2.5px 0",
              borderBottom: "0.5px solid #f0f0f0",
            }}>
              <span style={{
                fontSize: "7.8px", color: "#333", fontWeight: 400,
                minWidth: "90px", flexShrink: 0,
              }}>
                {key}
              </span>
              <span style={{ fontSize: "7.8px", color: "#111", fontWeight: 600 }}>
                {val ? `: ${val}` : ""}
              </span>
            </div>
          ))}
        </div>

        {/* Right: gem photo + QR + signature */}
        <div style={{
          width: "86px", flexShrink: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "4px",
        }}>
          {/* Gem photo */}
          <div style={{
            width: "74px", height: "66px",
            background: "#f0f0f0",
            border: "1px solid #ddd",
            borderRadius: "4px",
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {data.gemImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.gemImageUrl} alt="Gem"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "26px", opacity: 0.35 }}>💎</span>
            )}
          </div>

          {/* QR code */}
          <div style={{
            width: "64px", height: "64px",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "2px",
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR" style={{ width: "62px", height: "62px", display: "block" }} />
            ) : (
              <span style={{ fontSize: "6px", color: "#bbb", textAlign: "center", lineHeight: 1.4 }}>
                QR<br/>Code
              </span>
            )}
          </div>

          {/* Real Signature image */}
          <div style={{ textAlign: "center", width: "100%" }}>
            <div style={{
              width: "74px", height: "32px",
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Image
                src="/signature.png"
                alt="Signature"
                width={74}
                height={32}
                style={{ width: "74px", height: "32px", objectFit: "contain", objectPosition: "center" }}
              />
            </div>
            <div style={{ fontSize: "6.5px", color: "#111", fontWeight: 700, letterSpacing: "0.3px", marginTop: "1px" }}>
              {data.gemmologist || "AKASH SONI"}
            </div>
            <div style={{ fontSize: "6px", color: "#555", letterSpacing: "0.4px" }}>GEMMOLOGIST</div>
          </div>
        </div>
      </div>
    </div>
  );
});

GemCard.displayName = "GemCard";
export default GemCard;
