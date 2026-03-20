"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import TextType from "@/components/ui/TextType";

// ─── Dot Pattern Background ──────────────────────────────────────────────────
function DotPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dot-grid"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="2"
              cy="2"
              r="1"
              className="fill-indigo-300/30 animate-dot-pulse"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
      {/* Radial fade overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-950/80" />
    </div>
  );
}

// ─── Border Beam Effect ──────────────────────────────────────────────────────
function BorderBeam({ active }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
      <div
        className="absolute inset-[-2px] rounded-2xl animate-border-beam"
        style={{
          background:
            "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1, #a855f7)",
          backgroundSize: "300% 100%",
        }}
      />
      <div className="absolute inset-[2px] rounded-2xl bg-slate-900/95" />
    </div>
  );
}

// ─── Floating Paper 3D ───────────────────────────────────────────────────────
function FloatingPaper({ mouseX, mouseY }) {
  const rotateX = useTransform(mouseY, [0, 1], [15, -15]);
  const rotateY = useTransform(mouseX, [0, 1], [-15, 15]);

  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="absolute -right-4 top-8 z-20 hidden lg:block"
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        perspective: 800,
        transformStyle: "preserve-3d",
      }}
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="w-48 h-64 rounded-xl shadow-2xl relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #1e1b4b, #312e81)",
          border: "1px solid rgba(129, 140, 248, 0.2)",
          transformStyle: "preserve-3d",
          transform: "translateZ(20px)",
        }}
      >
        {/* Paper content lines */}
        <div className="p-5 space-y-3">
          <div className="h-3 w-24 bg-indigo-400/30 rounded" />
          <div className="h-2 w-36 bg-indigo-400/15 rounded" />
          <div className="h-2 w-32 bg-indigo-400/15 rounded" />
          <div className="h-2 w-28 bg-indigo-400/15 rounded" />
          <div className="mt-4 h-2 w-20 bg-indigo-400/30 rounded" />
          <div className="h-2 w-36 bg-indigo-400/15 rounded" />
          <div className="h-2 w-30 bg-indigo-400/15 rounded" />
          <div className="mt-4 h-2 w-16 bg-indigo-400/30 rounded" />
          <div className="h-2 w-34 bg-indigo-400/15 rounded" />
          <div className="h-2 w-28 bg-indigo-400/15 rounded" />
        </div>
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
      </div>
    </motion.div>
  );
}

// ─── Scanning Animation ──────────────────────────────────────────────────────
function ScanningOverlay({ progress, fileName }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative z-20 flex flex-col items-center gap-6 py-4"
    >
      {/* Pulsing icon */}
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full bg-indigo-500/20"
          animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500/20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className="text-lg font-semibold text-white mb-1">
          Scanning Resume...
        </p>
        <p className="text-sm text-slate-400">{fileName}</p>
      </div>

      {/* Progress bar */}
      <div className="w-72 h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)",
            backgroundSize: "200% 100%",
          }}
          initial={{ width: "0%" }}
          animate={{
            width: `${progress}%`,
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            width: { duration: 0.5, ease: "easeOut" },
            backgroundPosition: { duration: 2, repeat: Infinity },
          }}
        />
      </div>

      {/* Progress percentage */}
      <p className="text-xs text-slate-500 font-mono">
        {progress}% — AI reading your resume
      </p>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ResumeUploadHero({ userId }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | scanning | success | error
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAnimationComplete = () => {
    // console.log("Animation complete");
  };

  // Mouse tracking for parallax
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY],
  );

  // Simulate scanning progress
  const simulateScan = useCallback(() => {
    setProgress(0);
    const steps = [10, 25, 40, 55, 65, 78, 88, 95, 100];
    steps.forEach((step, i) => {
      setTimeout(() => setProgress(step), (i + 1) * 350);
    });
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setStatus("scanning");
      setErrorMsg("");
      simulateScan();

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId || "demo-user-id");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { chatId } = await res.json();

        // Wait for progress to finish, then show success
        setTimeout(() => {
          setStatus("success");
          setTimeout(() => router.push(`/chat/${chatId}`), 1200);
        }, 3200);
      } catch (error) {
        setStatus("error");
        setErrorMsg(error.message || "Something went wrong");
      }
    },
    [userId, router, simulateScan],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: status === "scanning",
  });

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-slate-950 px-6 py-20"
    >
      {/* Dot Pattern Background */}
      <DotPattern />

      {/* Ambient glow blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Copy + Upload Zone */}
          <div className="flex-1 text-center lg:text-left">
            {/* Gradient Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <TextType
                texts={[
                  "Optimize Your Career",
                  "Beat the ATS Systems",
                  "Land More Interviews",
                ]}
                className="bg-clip-text text-transparent bg-[linear-gradient(135deg,#818cf8,#a78bfa,#f472b6,#818cf8)] bg-[length:200%_auto] animate-border-beam pb-3"
                typingSpeed={130}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="_"
                deletingSpeed={120}
                variableSpeedEnabled={false}
                variableSpeedMin={60}
                variableSpeedMax={120}
                cursorBlinkDuration={0.8}
              />
              <br className="hidden md:block" />
              <span className="text-white">In Seconds</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-lg text-slate-400 mb-10 max-w-lg mx-auto lg:mx-0"
            >
              Drop your resume and let our AI score it against real ATS systems.
              Get instant, actionable feedback to land more interviews.
            </motion.p>

            {/* Upload Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <BorderBeam active={isDragActive} />

              <div
                {...getRootProps()}
                className={`
                  relative z-20 rounded-2xl border-2 border-dashed p-10
                  transition-all duration-300 cursor-pointer
                  ${
                    isDragActive
                      ? "border-transparent bg-indigo-500/10 scale-[1.02]"
                      : status === "success"
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : status === "error"
                          ? "border-red-500/50 bg-red-500/5"
                          : "border-slate-700 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-800/50"
                  }
                `}
              >
                <input {...getInputProps()} />

                {/* Idle State */}
                {status === "idle" && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-lg">
                        {isDragActive ? "Drop it here!" : "Upload your resume"}
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        Drag & drop a PDF, or click to browse
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <FileText className="w-3 h-3" />
                      PDF only • Max 10MB
                    </div>
                  </div>
                )}

                {/* Scanning State */}
                {status === "scanning" && (
                  <ScanningOverlay progress={progress} fileName={fileName} />
                )}

                {/* Success State */}
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-lg font-semibold text-emerald-400">
                      Resume analyzed!
                    </p>
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      Opening your results <ArrowRight className="w-3 h-3" />
                    </p>
                  </motion.div>
                )}

                {/* Error State */}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 py-4"
                  >
                    <p className="text-red-400 font-semibold">Upload failed</p>
                    <p className="text-sm text-red-400/60">
                      {errorMsg || "Try again with a valid PDF"}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center lg:justify-start gap-6 mt-6 text-xs text-slate-600"
            >
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ATS-Optimized
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                AI-Powered
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                STAR Method
              </span>
            </motion.div>
          </div>

          {/* Right: Floating Paper 3D */}
          <FloatingPaper mouseX={mouseX} mouseY={mouseY} />
        </div>
      </div>
    </section>
  );
}
