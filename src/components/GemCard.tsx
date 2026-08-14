"use client";

import { forwardRef } from "react";
import { GemCertificate } from "@/types/certificate";

interface GemCardProps {
  data: GemCertificate;
  qrDataUrl: string;
}

/*
 * Card canvas : 600 × 378 px  (standard CR80 debit-card ratio, scaled)
 * Border      : 5px solid #081238
 * Outline     : 2px solid #c8a030  (outline prints; boxShadow does NOT)
 *
 * RIGHT PANEL layout (170 px wide, space-between):
 *   ┌─────────────────┐  ← gem image box  128 × 128px, blue border, 4px white padding, rounded
 *   │   gem image     │
 *   └─────────────────┘
 *   ┌─────────────────┐  ← QR code box    128 × 128px, blue border, 4px white padding, rounded
 *   │    QR code      │
 *   └─────────────────┘
 *      ❯❯ Scan to Verify ❮❮
 *   ──◆──  signature  ──◆──
 *
 * Print-safe rules applied:
 *   ✓ No mixBlendMode anywhere (breaks print popup)
 *   ✓ No boxShadow on card root (use outline instead)
 *   ✓ No CSS gradients on critical elements (need "Background graphics" checked)
 *   ✓ SVG wave fills solid colours — prints fine
 *   ✓ All img srcs are converted to data URLs by CardGenerator before printing
 */

const GemCard = forwardRef<HTMLDivElement, GemCardProps>(({ data, qrDataUrl }, ref) => {
  const rows: [string, string][] = [
    ["CERTIFICATE NO.", data.certificateNo   || ""],
    ["VARIETY",         data.variety         || ""],
    ["WEIGHT",          data.weight ? `${data.weight} CRTs` : ""],
    ["COLOR",           data.color           || ""],
    ["SHAPE & CUT",     data.shapeAndCut     || ""],
    ["MEASUREMENT",     data.measurement     || ""],
    ["SPECIFIC GRAVITY",data.specificGravity || ""],
    ["COMMENT",         data.comment         || ""],
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
        flexDirection: "row",
        border: "5px solid #081238",
        outline: "2px solid #c8a030",
        outlineOffset: "-1px",
        boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
        boxSizing: "border-box",
      }}
    >

      {/* ══════════════════════════════════════════
          LEFT PANEL — 423 px
      ══════════════════════════════════════════ */}
      <div style={{
        width: "423px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        overflow: "hidden",
      }}>

        {/* ── HEADER — 128px ── */}
        <div style={{
          height: "128px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "5px 8px 0 4px",
          gap: "0px",
          background: "#ffffff",
          boxSizing: "border-box",
          overflow: "hidden",
        }}>

          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
         <img
  src="/rgtl-logo-new.png"
  alt="RGTL"
  style={{
    width: "120px",
    height: "120px",
    objectFit: "contain",
    flexShrink: 0,
    marginLeft: "-8px",
  }}
/>

          {/* Title block */}
          <div style={{
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "2px",
  marginLeft: "-10px",
  overflow: "hidden",
}}>

            {/* RAJA GEMS */}
            <div style={{
              fontSize: "48px",
              fontWeight: 900,
              color: "#0f2c8c",
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: "2px",
              lineHeight: "50px",
              height: "50px",
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}>
              RAJA GEMS
            </div>

            {/* — TESTING LABS — */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0px",
              height: "20px",
              flexShrink: 0,
            }}>
              <div style={{ flex: 1, height: "1.5px", background: "#0f2c8c" }} />
              <span style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#0f2c8c",
                fontFamily: "Georgia, 'Times New Roman', serif",
                letterSpacing: "6px",
                whiteSpace: "nowrap",
                lineHeight: "20px",
                flexShrink: 0,
              }}>
                TESTING LABS
              </span>
              <div style={{ flex: 1, height: "1.5px", background: "#0f2c8c" }} />
            </div>

            {/* Navy badge */}
            <div style={{
              background: "#0f2c8c",
              color: "#ffffff",
              fontSize: "8.5px",
              fontWeight: 800,
              letterSpacing: "1.2px",
              padding: "2px 6px",
              textAlign: "center",
              lineHeight: "11px",
              height: "17px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              flexShrink: 0,
            }}>
              CERTIFIED GEMSTONE TESTING &amp; AUTHENTICATION
            </div>

            {/* Gold ornament — solid, no gradient */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              height: "10px",
              flexShrink: 0,
            }}>
              <div style={{ flex: 1, height: "1px", background: "#c8a030" }} />
              <span style={{ color: "#c8a030", fontSize: "7px", lineHeight: 1, flexShrink: 0 }}>❖</span>
              <div style={{ flex: 1, height: "1px", background: "#c8a030" }} />
            </div>

            {/* Website */}
            <div style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#333",
              letterSpacing: "0.3px",
              fontWeight: 500,
              lineHeight: "12px",
              height: "12px",
              flexShrink: 0,
              overflow: "hidden",
            }}>
              www.rajagemstones.com
            </div>
          </div>
        </div>

        {/* Three-layer wave strip — 26px */}
        <div style={{ width: "423px", height: "26px", flexShrink: 0, overflow: "hidden" }}>
          <svg viewBox="0 0 423 26" preserveAspectRatio="none"
            style={{ width: "423px", height: "26px", display: "block" }}>
            <path d="M0,8 Q106,0 212,7 Q318,14 423,1 L423,26 L0,26 Z" fill="#d0daf5" />
            <path d="M0,13 Q106,3 212,11 Q318,19 423,4 L423,26 L0,26 Z" fill="#1a3a8f" />
            <path d="M0,20 Q106,11 212,18 Q318,25 423,11 L423,26 L0,26 Z" fill="#b8952a" />
          </svg>
        </div>

        {/* ── DATA ROWS ── */}
        <div style={{
          flex: 1,
          padding: "2px 14px 4px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          background: "#ffffff",
        }}>
          {rows.map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "flex-end" }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#0d0d0d",
                width: "132px",
                flexShrink: 0,
                letterSpacing: "0.3px",
                lineHeight: "16px",
              }}>
                {key}
              </span>
              <span style={{
                fontSize: "11px",
                color: "#111",
                marginRight: "5px",
                flexShrink: 0,
                fontWeight: 700,
                lineHeight: "16px",
              }}>
                :
              </span>
              <span style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#1a1a1a",
                flex: 1,
                borderBottom: "1px solid #bbb",
                lineHeight: "16px",
                minHeight: "16px",
                display: "block",
                paddingLeft: "3px",
              }}>
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ VERTICAL DIVIDER ══ */}
      <div style={{ width: "1px", flexShrink: 0, background: "#0f2c8c" }} />

      {/* ══════════════════════════════════════════
          RIGHT PANEL — 170 px
          gem box → QR box → scan text → signature
          space-between distributes across full 368px usable height
      ══════════════════════════════════════════ */}
      <div style={{
        width: "165px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 8px 6px",
        background: "#ffffff",
        boxSizing: "border-box",
      }}>

        {/* ── GEM IMAGE BOX — 128 × 128px (matches QR box exactly: same size, border, 4px white padding) ── */}
        <div style={{
          width: "128px",
          height: "128px",
          background: "#ffffff",
          border: "2px solid #1a3a8f",
          borderRadius: "10px",
          overflow: "hidden",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxSizing: "border-box",
        }}>
          {data.gemImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.gemImageUrl}
              alt="Gem"
              style={{
                width: "96px",
                height: "96px",
                objectFit: "cover",
                borderRadius: "6px",
                display: "block",
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/rgtl-logo-new.png"
              alt="RGTL"
              style={{
                width: "78px",
                height: "78px",
                objectFit: "contain",
              }}
            />
          )}
        </div>

        {/* ── QR CODE BOX — 128 × 128px ── */}
        <div style={{
          width: "128px",
          height: "128px",
          background: "#ffffff",
          border: "2px solid #1a3a8f",
          borderRadius: "10px",
          overflow: "hidden",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxSizing: "border-box",
        }}>
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR Code"
              style={{
                width: "118px",
                height: "118px",
                display: "block",
                imageRendering: "pixelated",
              }}
            />
          ) : (
            <span style={{ fontSize: "7px", color: "#aaa", textAlign: "center" }}>QR Code</span>
          )}
        </div>

        {/* ── Signature block ── */}
        <div style={{
          textAlign: "center",
          flexShrink: 0,
          width: "148px",
        }}>
          <div style={{
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "2px",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/signature.png"
              alt="Signature"
              style={{ height: "32px", width: "auto", maxWidth: "100px", objectFit: "contain" }}
            />
          </div>

          {/* Gold line + navy diamond — solid colors, no gradient */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            margin: "0 10px 3px",
          }}>
            <div style={{ flex: 1, height: "1.5px", background: "#b8952a" }} />
            <div style={{
              width: "7px", height: "7px",
              background: "#1a3a8f",
              borderRadius: "1px",
              border: "1.5px solid #b8952a",
              flexShrink: 0,
              transform: "rotate(45deg)",
            }} />
            <div style={{ flex: 1, height: "1.5px", background: "#b8952a" }} />
          </div>

          <div style={{
            fontSize: "12px",
            fontWeight: 900,
            color: "#0d0d0d",
            letterSpacing: "1px",
            lineHeight: 1.2,
          }}>
            {data.gemmologist || "AKASH SONI"}
          </div>

          <div style={{
            fontSize: "7.5px",
            fontWeight: 700,
            color: "#555",
            letterSpacing: "1.5px",
            lineHeight: 1.2,
            marginTop: "1px",
          }}>
            GEMMOLOGIST
          </div>

        </div>

      </div>
    </div>
  );
});

GemCard.displayName = "GemCard";
export default GemCard;