"use client";

import { useState } from "react";

const tabs = [
  { id: "softskills", label: "Soft Skills" },
  { id: "keywords", label: "Keywords" },
  { id: "issues", label: "Issues" },
  { id: "rewrites", label: "Rewrites" },
  { id: "transition", label: "Transition" },
];

function TabButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "1px solid rgba(148, 163, 184, 0.14)",
        borderRadius: "999px",
        padding: "8px 14px",
        background: active ? "rgba(248, 113, 113, 0.14)" : "rgba(15, 23, 42, 0.55)",
        color: active ? "#f8fafc" : "#94a3b8",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export default function InsightsPanel({
  missingKeywords = [],
  formattingIssues = [],
  suggestedBulletPoints = [],
  softSkills = [],
  careerTransitionAdvice = "",
  isPending = false,
}) {
  const [activeTab, setActiveTab] = useState("keywords");

  const uniqueKeywords = [...new Set(missingKeywords)];
  const uniqueSoftSkills = [...new Set(softSkills)];

  const counts = {
    softskills: uniqueSoftSkills.length,
    keywords: uniqueKeywords.length,
    issues: formattingIssues.length,
    rewrites: suggestedBulletPoints.length,
    transition: careerTransitionAdvice ? 1 : 0,
  };

  return (
    <section
      style={{
        height: "100%",
        minHeight: 0,
        borderRadius: "28px",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.72))",
        backdropFilter: "blur(18px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          padding: "18px 20px 12px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
        }}
      >
        <div
          style={{
            color: "#f8fafc",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          Resume Insights
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={tab.id === activeTab}
              label={`${tab.label} ${counts[tab.id]}`}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          height: "380px", // Fixed height to prevent layout shift
          overflowY: "auto",
          padding: "18px 20px 20px",
        }}
      >
        {isPending ? (
          <div
            style={{
              borderRadius: "18px",
              border: "1px dashed rgba(148, 163, 184, 0.2)",
              background: "rgba(15, 23, 42, 0.35)",
              color: "#94a3b8",
              padding: "18px",
              lineHeight: 1.6,
            }}
          >
            AI analysis is running now. You can start chatting immediately, and the keyword gaps,
            formatting issues, and rewrite suggestions will appear here when processing finishes.
          </div>
        ) : null}

        {!isPending && activeTab === "softskills" && (
          uniqueSoftSkills.length ? (
            <div className="flex flex-wrap gap-2">
              {uniqueSoftSkills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "999px",
                    background: "rgba(167, 139, 250, 0.15)",
                    border: "1px solid rgba(167, 139, 250, 0.3)",
                    color: "#c4b5fd",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: "#94a3b8", margin: 0 }}>No soft skills detected.</p>
          )
        )}

        {!isPending && activeTab === "transition" && (
          careerTransitionAdvice ? (
            <div
              style={{
                borderRadius: "18px",
                padding: "16px",
                background: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(14, 165, 233, 0.2)",
                color: "#bae6fd",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              {careerTransitionAdvice}
            </div>
          ) : (
            <p style={{ color: "#94a3b8", margin: 0 }}>
              No transition advice requested or provided. Make sure to specify a Target Role.
            </p>
          )
        )}

        {!isPending && activeTab === "keywords" && (
          uniqueKeywords.length ? (
            <div className="flex flex-wrap gap-2">
              {uniqueKeywords.map((keyword) => (
                <span
                  key={keyword}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "999px",
                    background: "rgba(249, 115, 22, 0.14)",
                    border: "1px solid rgba(249, 115, 22, 0.2)",
                    color: "#fdba74",
                    fontSize: "13px",
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: "#94a3b8", margin: 0 }}>No major keyword gaps were detected.</p>
          )
        )}

        {!isPending && activeTab === "issues" && (
          formattingIssues.length ? (
            <div className="flex flex-col gap-3">
              {formattingIssues.map((issue, index) => (
                <div
                  key={`${issue}-${index}`}
                  style={{
                    borderRadius: "18px",
                    padding: "14px 16px",
                    background: "rgba(30, 41, 59, 0.8)",
                    border: "1px solid rgba(248, 113, 113, 0.18)",
                    color: "#e2e8f0",
                    lineHeight: 1.6,
                    fontSize: "14px",
                  }}
                >
                  {issue}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#94a3b8", margin: 0 }}>No major formatting issues were detected.</p>
          )
        )}

        {!isPending && activeTab === "rewrites" && (
          suggestedBulletPoints.length ? (
            <div className="flex flex-col gap-3">
              {suggestedBulletPoints.map((item, index) => (
                <div
                  key={`${item.original}-${index}`}
                  style={{
                    borderRadius: "18px",
                    padding: "16px",
                    background: "rgba(30, 41, 59, 0.84)",
                    border: "1px solid rgba(74, 222, 128, 0.16)",
                  }}
                >
                  <p style={{ margin: "0 0 8px", color: "#fda4af", lineHeight: 1.5 }}>
                    Before: {item.original}
                  </p>
                  <p style={{ margin: 0, color: "#86efac", lineHeight: 1.6 }}>
                    After: {item.improved}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#94a3b8", margin: 0 }}>No bullet rewrites available yet.</p>
          )
        )}
      </div>
    </section>
  );
}
