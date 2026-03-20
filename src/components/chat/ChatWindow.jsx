"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { Bot, User, Loader2, Send } from "lucide-react";

export default function ChatWindow({ chatId }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      body: { chatId },
    });

  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "calc(100vh - 80px)",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      {/* Messages Area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#94a3b8",
              marginTop: "60px",
            }}
          >
            <Bot size={48} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
            <p style={{ fontSize: "18px", fontWeight: 600 }}>
              ATS Resume Analyzer
            </p>
            <p style={{ fontSize: "14px", marginTop: "4px" }}>
              Ask me anything about your resume. I&apos;ll help you optimize it
              for ATS systems.
            </p>
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
            {/* Avatar */}
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
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                color: "#fff",
              }}
            >
              {message.role === "user" ? (
                <User size={18} />
              ) : (
                <Bot size={18} />
              )}
            </div>

            {/* Message Bubble */}
            <div
              style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                background:
                  message.role === "user" ? "#6366f1" : "#f1f5f9",
                color: message.role === "user" ? "#fff" : "#1e293b",
              }}
            >
              {message.content}
            </div>
          </div>
        ))}

        {/* Loading Skeleton */}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <Bot size={18} />
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "#f1f5f9",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Analyzing...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "8px",
          padding: "16px 24px",
          borderTop: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your resume..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "14px",
            outline: "none",
            background: "#fff",
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            background:
              isLoading || !input.trim() ? "#cbd5e1" : "#6366f1",
            color: "#fff",
            cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <Send size={16} />
        </button>
      </form>

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
