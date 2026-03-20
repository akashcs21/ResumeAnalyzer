"use client";

import { useState, useCallback } from "react";

/**
 * useChat — Custom hook for chat functionality
 * Wraps Vercel AI SDK's useChat or custom chat logic
 */
export function useChat(sessionId) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content) => {
    setIsLoading(true);
    const userMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, sessionId]);

  return { messages, sendMessage, isLoading };
}
