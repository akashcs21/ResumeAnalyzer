"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalysisBootstrapper({ chatId, shouldAnalyze }) {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shouldAnalyze) {
      return;
    }

    let cancelled = false;

    async function runAnalysis() {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to analyze resume");
        }

        if (!cancelled) {
          router.refresh();
        }
      } catch (analysisError) {
        if (!cancelled) {
          setError(analysisError.message || "Failed to analyze resume");
        }
      }
    }

    runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [chatId, router, shouldAnalyze]);

  if (!shouldAnalyze || !error) {
    return null;
  }

  return (
    <div
      style={{
        borderRadius: "18px",
        border: "1px solid rgba(248, 113, 113, 0.18)",
        background: "rgba(127, 29, 29, 0.16)",
        color: "#fecaca",
        padding: "12px 14px",
        fontSize: "14px",
      }}
    >
      {error}
    </div>
  );
}
