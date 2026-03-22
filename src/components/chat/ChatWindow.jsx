"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, User, Mic, SwitchCamera, Flame } from "lucide-react";

export default function ChatWindow({ chatId, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [isRoastMode, setIsRoastMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Track exclusively the voice input chunk for auto-sending
  const voiceTranscriptRef = useRef("");

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge on a Desktop.");
      return;
    }
    
    // If already listening, stop it manually
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    voiceTranscriptRef.current = ""; // Reset transcript each time mic is clicked
    
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        voiceTranscriptRef.current += (voiceTranscriptRef.current ? " " : "") + finalTranscript;
        // Also update the input box visibly to the user
        setInput((prev) => prev ? prev + " " + finalTranscript : finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Auto-submit the voice text if they successfully spoke something
      const spokenText = voiceTranscriptRef.current.trim();
      if (spokenText.length > 0) {
        // Send whatever is currently in the input box, prioritizing the full message
        // (This incorporates any typos they corrected manually while it was listening + the spoken text)
        // But since state is async, we pass a callback-based or ref-based submission.
        
        // Wait a tiny bit to make sure React states catch up
        setTimeout(() => {
          document.getElementById('hidden-voice-submit-btn')?.click();
        }, 300);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        alert("Microphone permission denied. Please allow it in the address bar.");
      }
      setIsListening(false);
    };
    
    try {
      recognition.start();
    } catch (e) {
      console.warn("Failed to start recognition", e);
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSubmit(event) {
    if (event) event.preventDefault();

    const content = input.trim();
    if (!content || isLoading) {
      return;
    }

    const userMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content,
    };
    const assistantMessageId = `assistant-${Date.now()}`;

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setIsLoading(true);
    
    // Stop recording if active when submitting manually
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, content, isInterviewMode, isRoastMode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
        },
      ]);

      if (!response.body) {
        throw new Error("No response stream received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantContent = "";

      while (!done) {
        const result = await reader.read();
        done = result.done;

        if (result.value) {
          const chunk = decoder.decode(result.value, { stream: !done });
          assistantContent += chunk;

          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? { ...message, content: assistantContent }
                : message
            )
          );
        }
      }
    } catch (submitError) {
      setError(submitError.message || "Failed to send message");
      // Optionally comment out if you want to keep the error message in the thread
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !== userMessage.id &&
            message.id !== assistantMessageId
        )
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{isRoastMode ? "Brutal Recruiter 🔥" : isInterviewMode ? "Mock Interviewer" : "Resume Copilot"}</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              setIsRoastMode(!isRoastMode);
              if (!isRoastMode) setIsInterviewMode(false);
            }}
            style={{
              background: isRoastMode ? "rgba(239, 68, 68, 0.2)" : "rgba(148, 163, 184, 0.1)",
              color: isRoastMode ? "#f87171" : "#94a3b8",
              border: "1px solid",
              borderColor: isRoastMode ? "rgba(239, 68, 68, 0.5)" : "transparent",
              padding: "6px 12px",
              borderRadius: "99px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              transition: "all 0.2s"
            }}
            title="Toggle Roast Mode"
          >
            <Flame size={14} className={isRoastMode ? "animate-pulse" : ""} />
            {isRoastMode ? "Roast Mode" : "Roast Mode"}
          </button>
          
          <button
            onClick={() => {
              setIsInterviewMode(!isInterviewMode);
              if (!isInterviewMode) setIsRoastMode(false);
            }}
            style={{
              background: isInterviewMode ? "rgba(249, 115, 22, 0.2)" : "rgba(148, 163, 184, 0.1)",
              color: isInterviewMode ? "#fdba74" : "#94a3b8",
              border: "1px solid",
              borderColor: isInterviewMode ? "rgba(249, 115, 22, 0.4)" : "transparent",
              padding: "6px 12px",
              borderRadius: "99px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              transition: "all 0.2s"
            }}
            title="Toggle strict Interview Mode"
          >
            <SwitchCamera size={14} />
            {isInterviewMode ? "Interview Mode" : "Copilot Mode"}
          </button>
        </div>
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

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="button"
            onClick={startListening}
            title={isListening ? "Stop Listening (Auto-Sends)" : "Start Voice Typing"}
            style={{
              background: isListening ? "rgba(239, 68, 68, 0.2)" : "transparent",
              color: isListening ? "#ef4444" : "#94a3b8",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              borderRadius: "14px",
              padding: "0 14px",
              height: "46px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
          >
            <Mic size={18} className={isListening ? "animate-pulse" : ""} />
          </button>

          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question about your resume..."
            disabled={isLoading || isListening}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: "14px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: isListening ? "rgba(30, 41, 59, 0.5)" : "rgba(30, 41, 59, 0.8)",
              color: "#f8fafc",
              outline: "none",
            }}
          />
          {/* Hidden button to trick React into triggering handleSubmit from a timeout */}
          <button 
            id="hidden-voice-submit-btn" 
            type="submit" 
            style={{ display: "none" }} 
            disabled={isLoading || !input.trim()}
          />
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              border: "none",
              borderRadius: "14px",
              padding: "0 18px",
              height: "46px",
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
