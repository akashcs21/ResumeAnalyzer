"use client";

import { useState, useRef, useCallback } from "react";

/**
 * useRecordVoice — Custom hook for voice recording
 * Uses the Web Audio API / MediaRecorder
 */
export function useRecordVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [errorMSG, setErrorMSG] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      setErrorMSG("");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Microphone access is not supported by your browser or requires HTTPS.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        alert("No microphone found on your system. Please connect a microphone to use this feature.");
      } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        alert("Microphone permission was absolutely denied. Please allow access in your browser settings.");
      } else {
        console.warn("Recording error:", error.message || error);
        alert("Could not start recording: " + (error.message || "Unknown error"));
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return { isRecording, audioBlob, startRecording, stopRecording };
}
