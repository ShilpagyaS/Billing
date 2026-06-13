"use client";

import { forwardRef } from "react";
import { GemCertificate } from "@/types/certificate";

interface GemCardProps {
  data: GemCertificate;
  qrDataUrl: string;
}

/*
 * Card canvas : 600 × 378 px
 * Border      : 5px solid #081238
 * Outline     : 2px solid #c8a030  ← outline instead of boxShadow (prints correctly)
 *
 * LEFT  : 423 px
 *   Header  : 118px  (logo 108px + title block)
 *   Wave    :  26px
 *   Rows    : flex-1 (234px)
 * DIV       :   1 px
 * RIGHT     : 170 px
 *
 * Print-safe changes vs previous version:
 *   ✓ mixBlendMode removed from all imgs (breaks print popup)
 *   ✓ Header has ONE container div — no double height nesting
 *   ✓ Title items all have explicit lineHeight/height — no overlap
 *   ✓ boxShadow replaced with CSS outline — prints without "Background graphics"
 *   ✓ gradient on ornament lines replaced with solid #c8a030 (gradients need bg-graphics)
 *   ✓ All background colors are solid — no gradients anywhere critical
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
        // outline prints; boxShadow does NOT without "Background graphics"
        outline: "2px solid #c8a030",
        outlineOffset: "-1px",
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

        {/* ── HEADER — single container, 118px ── */}
        <div style={{
          height: "118px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "5px 8px 0 4px",
          gap: "6px",
          background: "#ffffff",
          boxSizing: "border-box",
          overflow: "hidden",
        }}>

          {/* Logo — no mixBlendMode (breaks print) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rgtl-logo-new.png"
            alt="RGTL"
            style={{
              width: "108px",
              height: "108px",
              objectFit: "contain",
              flexShrink: 0,
              // No mixBlendMode — it's not supported in print popup windows
            }}
          />

          {/* Title block — flex column, all children have explicit heights */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "2px",
            overflow: "hidden",
          }}>

            {/* RAJA GEMS — 42px, single line */}
            <div style={{
              fontSize: "40px",
              fontWeight: 900,
              color: "#0f2c8c",
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: "2px",
              lineHeight: "42px",
              height: "42px",
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
              gap: "5px",
              height: "16px",
              flexShrink: 0,
            }}>
              <div style={{ flex: 1, height: "1.5px", background: "#0f2c8c" }} />
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#0f2c8c",
                fontFamily: "Georgia, 'Times New Roman', serif",
                letterSpacing: "7px",
                whiteSpace: "nowrap",
                lineHeight: "16px",
                flexShrink: 0,
              }}>
                TESTING LABS
              </span>
              <div style={{ flex: 1, height: "1.5px", background: "#0f2c8c" }} />
            </div>

            {/* Navy badge — solid background, prints without bg-graphics */}
            <div style={{
              background: "#0f2c8c",
              color: "#ffffff",
              fontSize: "6.5px",
              fontWeight: 800,
              letterSpacing: "1.2px",
              padding: "2px 6px",
              textAlign: "center",
              lineHeight: "10px",
              height: "14px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              flexShrink: 0,
            }}>
              CERTIFIED GEMSTONE TESTING &amp; AUTHENTICATION
            </div>

            {/* Gold ornament — solid color, no gradient (gradient needs bg-graphics) */}
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
              fontSize: "7.5px",
              color: "#333",
              letterSpacing: "0.3px",
              fontWeight: 500,
              lineHeight: "10px",
              height: "10px",
              flexShrink: 0,
              overflow: "hidden",
            }}>
              www.rajagemstones.com
            </div>
          </div>
        </div>

        {/* Three-layer wave strip — 26px — SVG fills print fine */}
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
                fontSize: "8.5px",
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
                fontSize: "8.5px",
                color: "#111",
                marginRight: "5px",
                flexShrink: 0,
                fontWeight: 700,
                lineHeight: "16px",
              }}>
                :
              </span>
              <span style={{
                fontSize: "8.5px",
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
          space-between distributes 4 items across full height
      ══════════════════════════════════════════ */}
      <div style={{
        width: "170px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 8px 8px",
        background: "#ffffff",
        boxSizing: "border-box",
      }}>

        {/* ── GEM IMAGE BOX — 148 × 98 ── */}
        <div style={{
          width: "148px",
          height: "98px",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1.5px solid #1a3a8f",
          background: "#f0f3fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          {data.gemImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.gemImageUrl}
              alt="Gem"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/rgtl-logo-new.png"
              alt="RGTL"
              style={{
                width: "86px",
                height: "86px",
                objectFit: "contain",
                // No mixBlendMode
              }}
            />
          )}
        </div>

        {/* ── QR CODE BOX — 148 × 128 ── */}
        <div style={{
          width: "148px",
          height: "128px",
          background: "#ffffff",
          border: "1.5px solid #1a3a8f",
          borderRadius: "8px",
          overflow: "hidden",
          padding: "3px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR Code"
              style={{ width: "140px", height: "120px", display: "block" }}
            />
          ) : (
            <span style={{ fontSize: "7px", color: "#aaa", textAlign: "center" }}>QR Code</span>
          )}
        </div>

        {/* ── Scan to Verify ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          flexShrink: 0,
        }}>
          <span style={{ color: "#b8952a", fontSize: "8px", fontWeight: 900 }}>❯❯</span>
          <span style={{ fontSize: "8px", fontWeight: 700, color: "#111", letterSpacing: "0.5px" }}>
            Scan to Verify
          </span>
          <span style={{ color: "#b8952a", fontSize: "8px", fontWeight: 900 }}>❮❮</span>
        </div>

        {/* ── Signature block ── */}
        <div style={{
          textAlign: "center",
          flexShrink: 0,
          width: "148px",
        }}>
          <div style={{
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "2px",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/signature.png"
              alt="Signature"
              style={{ height: "24px", width: "auto", maxWidth: "80px", objectFit: "contain" }}
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
            fontSize: "11px",
            fontWeight: 900,
            color: "#0d0d0d",
            letterSpacing: "0.8px",
            lineHeight: 1.2,
          }}>
            {data.gemmologist || "AKASH SONI"}
          </div>

          <div style={{
            fontSize: "7px",
            color: "#555",
            letterSpacing: "2px",
            marginTop: "1px",
            fontWeight: 600,
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