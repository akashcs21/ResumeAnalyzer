"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function TextType({
  text = [],
  texts = [],
  typingSpeed = 75,
  deletingSpeed = 50,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = "_",
  variableSpeedEnabled = false,
  variableSpeedMin = 60,
  variableSpeedMax = 120,
  cursorBlinkDuration = 0.5,
  className = "",
  style = {},
}) {
  const combinedTexts = text.length > 0 ? text : texts;
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!combinedTexts || combinedTexts.length === 0) return;

    let timeout;
    const currentFullText = combinedTexts[currentIndex];

    let speed = isDeleting ? deletingSpeed : typingSpeed;
    if (variableSpeedEnabled && !isDeleting) {
      speed = Math.random() * (variableSpeedMax - variableSpeedMin) + variableSpeedMin;
    }

    if (!isDeleting && displayText === currentFullText) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % combinedTexts.length);
      timeout = setTimeout(() => {}, 400);
    } else {
      const nextText = isDeleting
        ? currentFullText.substring(0, displayText.length - 1)
        : currentFullText.substring(0, displayText.length + 1);

      timeout = setTimeout(() => {
        setDisplayText(nextText);
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [
    displayText,
    isDeleting,
    currentIndex,
    combinedTexts,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    variableSpeedEnabled,
    variableSpeedMin,
    variableSpeedMax,
  ]);

  return (
    <span className={className} style={{ display: "inline-block", ...style }}>
      {displayText}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: cursorBlinkDuration,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ display: "inline-block", marginLeft: "2px", fontWeight: "normal", color: "#818cf8" }}
        >
          {cursorCharacter}
        </motion.span>
      )}
    </span>
  );
}
