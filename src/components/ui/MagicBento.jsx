"use client";

import { useMemo, useRef, useState } from "react";

function createStars(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    size: 1 + (index % 3),
    left: `${(index * 37) % 100}%`,
    top: `${(index * 19) % 100}%`,
    delay: `${(index % 7) * 0.6}s`,
    duration: `${4 + (index % 5)}s`,
  }));
}

export function MagicBentoItem({
  children,
  className = "",
  style = {},
  textAutoHide = false,
}) {
  return (
    <div
      className={`magic-bento-item ${textAutoHide ? "magic-bento-text-auto-hide" : ""} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}

export default function MagicBento({
  children,
  className = "",
  textAutoHide = true,
  enableStars = false,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = false,
  enableMagnetism = false,
  clickEffect = true,
  spotlightRadius = 400,
  particleCount = 12,
  glowColor = "132, 0, 255",
  disableAnimations = false,
}) {
  const containerRef = useRef(null);
  const [spotlight, setSpotlight] = useState({ x: "50%", y: "50%" });
  const [ripples, setRipples] = useState([]);
  const stars = useMemo(() => createStars(particleCount), [particleCount]);

  function handlePointerMove(event) {
    if (!containerRef.current || !enableSpotlight) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setSpotlight({
      x: `${x}px`,
      y: `${y}px`,
    });

    if (enableTilt) {
      const rotateX = ((y / rect.height) - 0.5) * -6;
      const rotateY = ((x / rect.width) - 0.5) * 6;
      containerRef.current.style.transform = `perspective(1600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    if (enableMagnetism) {
      const offsetX = (x / rect.width - 0.5) * 8;
      const offsetY = (y / rect.height - 0.5) * 8;
      containerRef.current.style.translate = `${offsetX}px ${offsetY}px`;
    }
  }

  function handlePointerLeave() {
    if (!containerRef.current) {
      return;
    }

    containerRef.current.style.transform = "perspective(1600px) rotateX(0deg) rotateY(0deg)";
    containerRef.current.style.translate = "0 0";
  }

  function handleClick(event) {
    if (!clickEffect || !containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const ripple = {
      id: Date.now(),
      left: event.clientX - rect.left,
      top: event.clientY - rect.top,
    };

    setRipples((current) => [...current, ripple]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== ripple.id));
    }, 700);
  }

  return (
    <div
      ref={containerRef}
      className={`magic-bento-shell ${disableAnimations ? "magic-bento-static" : ""} ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      style={{
        "--magic-glow": glowColor,
        "--magic-spotlight-x": spotlight.x,
        "--magic-spotlight-y": spotlight.y,
        "--magic-spotlight-radius": `${spotlightRadius}px`,
      }}
    >
      {enableStars && (
        <div className="magic-bento-stars" aria-hidden="true">
          {stars.map((star) => (
            <span
              key={star.id}
              className="magic-bento-star"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                left: star.left,
                top: star.top,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
        </div>
      )}

      {enableSpotlight && <div className="magic-bento-spotlight" aria-hidden="true" />}
      {enableBorderGlow && <div className="magic-bento-border-glow" aria-hidden="true" />}

      {clickEffect && (
        <div className="magic-bento-ripples" aria-hidden="true">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="magic-bento-ripple"
              style={{ left: ripple.left, top: ripple.top }}
            />
          ))}
        </div>
      )}

      <div className={`magic-bento-grid ${textAutoHide ? "magic-bento-text-auto-hide" : ""}`}>
        {children}
      </div>
    </div>
  );
}
