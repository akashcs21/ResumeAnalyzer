"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";

export default function ResumeUpload({ userId }) {
  const router = useRouter();
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setStatus("uploading");
      setErrorMsg("");

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { chatId } = await res.json();
        setStatus("success");

        // Redirect to the chat page after a brief delay
        setTimeout(() => {
          router.push(`/chat/${chatId}`);
        }, 800);
      } catch (error) {
        setStatus("error");
        setErrorMsg(error.message || "Something went wrong");
      }
    },
    [userId, router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: status === "uploading",
  });

  const borderColor =
    status === "error"
      ? "#ef4444"
      : status === "success"
      ? "#22c55e"
      : isDragActive
      ? "#6366f1"
      : "#e2e8f0";

  const bgColor =
    isDragActive
      ? "#eef2ff"
      : status === "success"
      ? "#f0fdf4"
      : status === "error"
      ? "#fef2f2"
      : "#fafafa";

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${borderColor}`,
        borderRadius: "16px",
        padding: "48px 32px",
        textAlign: "center",
        cursor: status === "uploading" ? "wait" : "pointer",
        background: bgColor,
        transition: "all 0.2s ease",
      }}
    >
      <input {...getInputProps()} />

      {status === "idle" && (
        <>
          <Upload
            size={48}
            style={{ margin: "0 auto 16px", color: "#94a3b8" }}
          />
          <p style={{ fontSize: "18px", fontWeight: 600, color: "#334155" }}>
            {isDragActive ? "Drop your resume here" : "Upload your resume"}
          </p>
          <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "8px" }}>
            Drag & drop a PDF file, or click to browse
          </p>
        </>
      )}

      {status === "uploading" && (
        <>
          <Loader2
            size={48}
            style={{
              margin: "0 auto 16px",
              color: "#6366f1",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ fontSize: "18px", fontWeight: 600, color: "#334155" }}>
            Processing {fileName}...
          </p>
          <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "8px" }}>
            Extracting text and creating your chat session
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2
            size={48}
            style={{ margin: "0 auto 16px", color: "#22c55e" }}
          />
          <p style={{ fontSize: "18px", fontWeight: 600, color: "#166534" }}>
            Resume uploaded!
          </p>
          <p style={{ fontSize: "14px", color: "#4ade80", marginTop: "8px" }}>
            Redirecting to your chat session...
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <FileText
            size={48}
            style={{ margin: "0 auto 16px", color: "#ef4444" }}
          />
          <p style={{ fontSize: "18px", fontWeight: 600, color: "#991b1b" }}>
            Upload failed
          </p>
          <p style={{ fontSize: "14px", color: "#f87171", marginTop: "8px" }}>
            {errorMsg || "Try again with a valid PDF file"}
          </p>
        </>
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
