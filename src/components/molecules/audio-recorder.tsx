"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, RotateCcw, Square } from "lucide-react";
import { Button, Icon } from "@/components/atoms";
import { Banner } from "./banner";

export interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onClear?: () => void;
  maxDurationMs?: number;
  disabled?: boolean;
  className?: string;
}

type RecorderState = "idle" | "recording" | "recorded" | "error";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function AudioRecorder({
  onRecordingComplete,
  onClear,
  maxDurationMs = 3 * 60 * 1000,
  disabled = false,
  className = "",
}: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recordedMs, setRecordedMs] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  // Keep a ref alongside the state so the unmount cleanup below can revoke
  // whatever URL is current without re-subscribing the effect on every change.
  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function startRecording() {
    setErrorMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        stopStream();
        setRecordedMs(Date.now() - startTimeRef.current);
        setAudioUrl(URL.createObjectURL(blob));
        setState("recorded");
        onRecordingComplete(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      startTimeRef.current = Date.now();
      setElapsedMs(0);
      setState("recording");

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedMs(elapsed);
        if (elapsed >= maxDurationMs) stopRecording();
      }, 200);
    } catch {
      setErrorMessage(
        "Microphone access denied. Allow mic permission in your browser and try again.",
      );
      setState("error");
    }
  }

  function stopRecording() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    mediaRecorderRef.current?.stop();
  }

  function reRecord() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setIsPlaying(false);
    onClear?.();
    void startRecording();
  }

  function togglePlayback() {
    const audio = audioElRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {state === "idle" && (
        <Button
          type="button"
          variant="outline"
          onClick={startRecording}
          disabled={disabled}
        >
          <Icon icon={Mic} size="sm" />
          Record Audio
        </Button>
      )}

      {state === "recording" && (
        <div className="border-border-light bg-surface-light flex flex-wrap items-center gap-3 rounded-md border p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="bg-danger size-2.5 shrink-0 animate-pulse rounded-full"
              aria-hidden
            />
            <span className="text-body text-text-primary font-medium tabular-nums">
              {formatElapsed(elapsedMs)}
            </span>
            <span className="text-small text-text-secondary">Recording…</span>
          </div>
          <Button
            type="button"
            variant="danger"
            size="sm"
            className="ml-auto"
            onClick={stopRecording}
          >
            <Icon icon={Square} size="sm" />
            Stop
          </Button>
        </div>
      )}

      {state === "recorded" && audioUrl && (
        <div className="border-border-light bg-surface-light flex flex-wrap items-center gap-3 rounded-md border p-4">
          <audio
            ref={audioElRef}
            src={audioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={togglePlayback}
            >
              <Icon icon={isPlaying ? Pause : Play} size="sm" />
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <span className="text-small text-text-secondary">
              {formatElapsed(recordedMs)} recorded
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={reRecord}
            disabled={disabled}
          >
            <Icon icon={RotateCcw} size="sm" />
            Re-record
          </Button>
        </div>
      )}

      {state === "error" && (
        <div className="space-y-2">
          <Banner tone="danger">{errorMessage}</Banner>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startRecording}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
