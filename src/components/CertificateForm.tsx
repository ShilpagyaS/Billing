"use client";

import { ChangeEvent } from "react";
import { GemCertificate, FormField } from "@/types/certificate";

interface CertificateFormProps {
  form: GemCertificate;
  onChange: (key: keyof GemCertificate, value: string) => void;
  onGenerate: () => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  isGenerating: boolean;
}

const FIELDS: FormField[] = [
  { key: "certificateNo", label: "Certificate No.", placeholder: "e.g. RG119903", required: true },
  { key: "variety", label: "Variety", placeholder: "e.g. NATURAL QUARTZ", required: true },
  { key: "weight", label: "Weight (CRTs)", placeholder: "e.g. 20.70", required: true },
  { key: "color", label: "Color", placeholder: "e.g. WHITE" },
  { key: "shapeAndCut", label: "Shape & Cut", placeholder: "e.g. UNPOLISHED ROUGH" },
  { key: "measurement", label: "Measurement", placeholder: "e.g. 17.35 * 12.70" },
  { key: "specificGravity", label: "Specific Gravity", placeholder: "e.g. 2.65" },
  { key: "comment", label: "Comment", placeholder: "e.g. NATURAL INCLUSIONS FOUND" },
  { key: "gemmologist", label: "Gemmologist Name", placeholder: "e.g. AKASH SONI" },
];

export default function CertificateForm({
  form,
  onChange,
  onGenerate,
  onImageUpload,
  isGenerating,
}: CertificateFormProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(200,169,81,0.2)",
        borderRadius: "16px",
        padding: "28px",
        flex: "1",
        minWidth: "300px",
        maxWidth: "420px",
      }}
    >
      <h2
        style={{
          color: "#e8c97a",
          fontSize: "13px",
          fontWeight: 700,
          marginBottom: "22px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        ✦ Enter Gem Details
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
        {FIELDS.map(({ key, label, placeholder, required }) => (
          <div key={key}>
            <label
              htmlFor={`field-${key}`}
              style={{
                display: "block",
                color: "#8899bb",
                fontSize: "11px",
                fontWeight: 600,
                marginBottom: "5px",
                letterSpacing: "0.7px",
                textTransform: "uppercase",
              }}
            >
              {label}
              {required && (
                <span style={{ color: "#e8c97a", marginLeft: "3px" }}>*</span>
              )}
            </label>
            <input
              id={`field-${key}`}
              type="text"
              value={form[key] as string}
              placeholder={placeholder}
              onChange={(e) => onChange(key, e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(200,169,81,0.25)",
                borderRadius: "8px",
                padding: "9px 12px",
                color: "#e8e8f0",
                fontSize: "13px",
                outline: "none",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#c8a951";
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(200,169,81,0.25)";
                e.target.style.background = "rgba(255,255,255,0.07)";
              }}
            />
          </div>
        ))}

        {/* Gem Image Upload */}
        <div>
          <label
            htmlFor="gem-image"
            style={{
              display: "block",
              color: "#8899bb",
              fontSize: "11px",
              fontWeight: 600,
              marginBottom: "5px",
              letterSpacing: "0.7px",
              textTransform: "uppercase",
            }}
          >
            Gem Photo (optional)
          </label>
          <label
            htmlFor="gem-image"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px dashed rgba(200,169,81,0.35)",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
              color: "#8899bb",
              fontSize: "12px",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLLabelElement).style.borderColor =
                "rgba(200,169,81,0.7)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLLabelElement).style.borderColor =
                "rgba(200,169,81,0.35)";
            }}
          >
            <span style={{ fontSize: "18px" }}>📷</span>
            <span>
              {form.gemImageUrl ? "✓ Image uploaded" : "Click to upload gem image"}
            </span>
          </label>
          <input
            id="gem-image"
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        style={{
          marginTop: "22px",
          width: "100%",
          background: isGenerating
            ? "rgba(200,169,81,0.5)"
            : "linear-gradient(135deg, #c8a951, #e8c97a)",
          color: "#1a1a2e",
          fontWeight: 800,
          fontSize: "13px",
          letterSpacing: "1px",
          padding: "13px",
          borderRadius: "10px",
          border: "none",
          cursor: isGenerating ? "not-allowed" : "pointer",
          textTransform: "uppercase",
          transition: "opacity 0.2s, transform 0.1s",
        }}
        onMouseEnter={(e) => {
          if (!isGenerating)
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        }}
      >
        {isGenerating ? "⟳ Generating..." : "⬡ Generate Certificate Card"}
      </button>

      <p
        style={{
          marginTop: "10px",
          color: "#556677",
          fontSize: "11px",
          textAlign: "center",
        }}
      >
        * Required fields
      </p>
    </div>
  );
}
