"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function SplitText({
  text = "",
  className = "",
  letterClassName = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  repeat = 0,
  repeatDelay = 0,
  yoyo = false,
  onLetterAnimationComplete,
  showCallback,
  style = {},
}) {
  const containerRef = useRef(null);
  const elementsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (typeof showCallback === "function") showCallback();
          
          gsap.fromTo(
            elementsRef.current,
            from,
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              repeat,
              repeatDelay,
              yoyo,
              onComplete: () => {
                if (typeof onLetterAnimationComplete === "function") {
                  onLetterAnimationComplete();
                }
              },
            }
          );
          
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [delay, duration, ease, from, to, threshold, rootMargin, onLetterAnimationComplete, showCallback]);

  const items = splitType === "words" ? text.split(" ") : text.split("");

  return (
    <span
      ref={containerRef}
      className={className}
      style={{ textAlign, display: "inline-block", ...style }}
    >
      {items.map((item, index) => {
        const isSpace = item === " " && splitType === "chars";
        return isSpace ? (
          <span key={index} style={{ display: "inline-block", width: "0.25em" }}>
            &nbsp;
          </span>
        ) : (
          <span
            key={index}
            ref={(el) => (elementsRef.current[index] = el)}
            style={{ display: "inline-block", ...from, whiteSpace: "pre" }}
            className={letterClassName}
          >
            {item}
            {splitType === "words" && index < items.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}
