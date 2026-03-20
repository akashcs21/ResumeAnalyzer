"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

function getColor(score) {
  if (score <= 40) return "#ef4444"; // red
  if (score <= 70) return "#f59e0b"; // yellow/amber
  return "#22c55e"; // green
}

function getLabel(score) {
  if (score <= 40) return "Needs Work";
  if (score <= 70) return "Good";
  return "Excellent";
}

export default function ScoreGauge({ score = 0, size = 200 }) {
  const [mounted, setMounted] = useState(false);

  const springValue = useSpring(0, { stiffness: 50, damping: 20 });
  const displayScore = useTransform(springValue, (v) => Math.round(v));
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    setMounted(true);
    springValue.set(score);
    const unsubscribe = displayScore.on("change", (v) =>
      setCurrentScore(v)
    );
    return unsubscribe;
  }, [score, springValue, displayScore]);

  if (!mounted) return null;

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (currentScore / 100) * circumference;
  const color = getColor(currentScore);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{
              filter: `drop-shadow(0 0 6px ${color}40)`,
              transition: "stroke 0.5s ease",
            }}
          />
        </svg>

        {/* Center text */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <motion.span
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: color,
              lineHeight: 1,
              display: "block",
              transition: "color 0.5s ease",
            }}
          >
            {currentScore}
          </motion.span>
          <span
            style={{
              fontSize: "14px",
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            / 100
          </span>
        </div>
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: color,
          letterSpacing: "0.5px",
          transition: "color 0.5s ease",
        }}
      >
        {getLabel(currentScore)}
      </span>
    </div>
  );
}
