"use client";

import { useState } from "react";
import { Wand2, Copy, Check, Loader2, X } from "lucide-react";
import { fixBulletPoint } from "@/lib/actions/fix-bullet";

export default function MagicWandButton({ bulletText }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [variations, setVariations] = useState([]);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setError("");

    const result = await fixBulletPoint(bulletText);

    if (result.success) {
      setVariations(result.data.variations);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const handleCopy = async (text, idx) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Wand Button */}
      <button
        onClick={handleClick}
        title="Fix this bullet point with AI"
        style={{
          background: isOpen
            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
            : "transparent",
          border: isOpen ? "none" : "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "6px 8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          color: isOpen ? "#fff" : "#6366f1",
          fontSize: "12px",
          fontWeight: 500,
          transition: "all 0.2s ease",
        }}
      >
        <Wand2 size={14} />
        Fix it
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 50,
            width: "400px",
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            padding: "16px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#6366f1",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Wand2 size={14} />
              AI-Improved Variations
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                padding: "2px",
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Original */}
          <div
            style={{
              padding: "8px 12px",
              background: "#fef2f2",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#991b1b",
              marginBottom: "12px",
              borderLeft: "3px solid #ef4444",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "11px", display: "block", marginBottom: "4px" }}>
              ORIGINAL
            </span>
            {bulletText}
          </div>

          {/* Loading */}
          {isLoading && (
            <div
              style={{
                textAlign: "center",
                padding: "24px",
                color: "#94a3b8",
                fontSize: "13px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Loader2
                size={20}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Generating quantified variations...
            </div>
          )}

          {/* Error */}
          {error && (
            <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center", padding: "12px" }}>
              {error}
            </p>
          )}

          {/* Variations */}
          {!isLoading &&
            variations.map((variation, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 12px",
                  background: "#f0fdf4",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#166534",
                  marginBottom: idx < variations.length - 1 ? "8px" : 0,
                  borderLeft: "3px solid #22c55e",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "11px",
                      display: "block",
                      marginBottom: "4px",
                      color: "#16a34a",
                    }}
                  >
                    VARIATION {idx + 1}
                  </span>
                  {variation}
                </div>
                <button
                  onClick={() => handleCopy(variation, idx)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: copiedIdx === idx ? "#22c55e" : "#94a3b8",
                    flexShrink: 0,
                    padding: "2px",
                  }}
                  title="Copy to clipboard"
                >
                  {copiedIdx === idx ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
