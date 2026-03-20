"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, User } from "lucide-react";

export default function ChatWindow({ chatId, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSubmit(event) {
    event.preventDefault();

    const content = input.trim();
    if (!content || isLoading) {
      return;
    }

    const userMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch (submitError) {
      setError(submitError.message || "Failed to send message");
      setMessages((current) =>
        current.filter((message) => message.id !== userMessage.id)
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        borderRadius: "28px",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        overflow: "hidden",
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.72))",
        backdropFilter: "blur(18px)",
      }}
    >
      <div
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
          color: "#e2e8f0",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Resume Copilot
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "22px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              borderRadius: "18px",
              border: "1px dashed rgba(148, 163, 184, 0.3)",
              padding: "24px",
              color: "#94a3b8",
              textAlign: "center",
            }}
          >
            Ask about ATS score, missing keywords, bullet rewrites, or role fit.
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              flexDirection: message.role === "user" ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background:
                  message.role === "user"
                    ? "linear-gradient(135deg, #f97316, #ef4444)"
                    : "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                color: "#fff",
              }}
            >
              {message.role === "user" ? <User size={18} /> : <Bot size={18} />}
            </div>

            <div
              style={{
                maxWidth: "82%",
                padding: "14px 18px",
                borderRadius: "20px",
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
                color: message.role === "user" ? "#fff" : "#e2e8f0",
                background:
                  message.role === "user"
                    ? "linear-gradient(135deg, #f97316, #ef4444)"
                    : "rgba(30, 41, 59, 0.95)",
                border:
                  message.role === "user"
                    ? "none"
                    : "1px solid rgba(148, 163, 184, 0.12)",
              }}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                color: "#fff",
              }}
            >
              <Bot size={18} />
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                color: "#94a3b8",
              }}
            >
              <Loader2 size={16} className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(148, 163, 184, 0.1)",
          background: "rgba(15, 23, 42, 0.9)",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom: "12px",
              color: "#fca5a5",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question about your resume..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: "14px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(30, 41, 59, 0.8)",
              color: "#f8fafc",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              border: "none",
              borderRadius: "14px",
              padding: "0 18px",
              background:
                isLoading || !input.trim()
                  ? "rgba(100, 116, 139, 0.45)"
                  : "linear-gradient(135deg, #f97316, #ef4444)",
              color: "#fff",
              cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
