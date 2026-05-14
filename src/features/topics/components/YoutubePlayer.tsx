"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Minimize, Pause, Play, Volume2, VolumeX, Maximize } from "lucide-react";

/* ─── YouTube IFrame API types ───────────────────────────────────────────── */
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
}
interface YTPlayerState { PLAYING: number; PAUSED: number; ENDED: number; }
declare global {
  interface Window {
    YT: { Player: new (el: HTMLElement, opts: object) => YTPlayer; PlayerState: YTPlayerState };
    onYouTubeIframeAPIReady?: () => void;
  }
}

/* ─── Singleton API loader ───────────────────────────────────────────────── */
let apiReady: Promise<void> | null = null;
function loadAPI(): Promise<void> {
  if (apiReady) return apiReady;
  apiReady = new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return apiReady;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export function YoutubePlayer({
  videoId,
  title,
  thumbUrl,
}: {
  videoId: string;
  title: string;
  thumbUrl?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const playerRef    = useRef<YTPlayer | null>(null);
  const tickRef      = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [phase,    setPhase]    = useState<"idle" | "loading" | "ready">("idle");
  const [playing,  setPlaying]  = useState(false);
  const [muted,    setMuted]    = useState(true);
  const [progress, setProgress] = useState(0);
  const [fakeFs,   setFakeFs]   = useState(false);
  const [ctrlsOn,  setCtrlsOn]  = useState(false);

  const thumb = thumbUrl ?? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  useEffect(() => { loadAPI(); }, []);
  useEffect(() => () => { clearInterval(tickRef.current); clearTimeout(hideTimer.current); }, []);

  useEffect(() => {
    const onFsChange = () => { if (!document.fullscreenElement) setFakeFs(false); };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const showControls = useCallback(() => {
    setCtrlsOn(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setCtrlsOn(false), 3000);
  }, []);

  /* ── Build the YT player ────────────────────────────────────────────────── */
  const createPlayer = useCallback(() => {
    if (!wrapperRef.current) return;
    const mount = document.createElement("div");
    mount.style.cssText = "width:100%;height:100%";
    wrapperRef.current.appendChild(mount);

    playerRef.current = new window.YT.Player(mount, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 1, controls: 0, mute: 1, rel: 0,
        modestbranding: 1, showinfo: 0, iv_load_policy: 3,
        playsinline: 1, disablekb: 1, fs: 0,
        origin: window.location.origin,
      },
      events: {
        onReady(e: { target: YTPlayer }) { e.target.playVideo(); setPhase("ready"); setMuted(true); },
        onStateChange(e: { data: number }) {
          const { PLAYING, ENDED } = window.YT.PlayerState;
          const isPlaying = e.data === PLAYING;
          setPlaying(isPlaying);
          if (isPlaying) {
            clearInterval(tickRef.current);
            tickRef.current = setInterval(() => {
              const p = playerRef.current;
              if (!p) return;
              setProgress((p.getCurrentTime() / (p.getDuration() || 1)) * 100);
            }, 250);
          } else {
            clearInterval(tickRef.current);
          }
          if (e.data === ENDED) { setProgress(100); setPlaying(false); }
        },
      },
    });
  }, [videoId]);

  const launch = useCallback(async () => {
    setPhase("loading");
    await loadAPI();
    createPlayer();
  }, [createPlayer]);

  /* ── Controls ────────────────────────────────────────────────────────────── */
  function togglePlay() {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
    showControls();
  }

  function toggleMute() {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) { p.unMute(); setMuted(false); }
    else              { p.mute();   setMuted(true); }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    const p = playerRef.current;
    if (!p) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    p.seekTo(pct * p.getDuration(), true);
    showControls();
  }

  /* ── Container tap: tap once → show controls, tap again → play/pause ──── */
  function handleContainerTap() {
    if (ctrlsOn) togglePlay();
    else showControls();
  }

  /* ── Fullscreen ──────────────────────────────────────────────────────────── */
  function enterFullscreen(e: React.MouseEvent) {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenEnabled && !document.fullscreenElement) {
      el.requestFullscreen().then(() => setFakeFs(true)).catch(() => setFakeFs(true));
    } else {
      setFakeFs(true);
    }
    showControls();
  }

  function exitFullscreen(e: React.MouseEvent) {
    e.stopPropagation();
    if (document.fullscreenElement) {
      document.exitFullscreen().finally(() => setFakeFs(false));
    } else {
      setFakeFs(false);
    }
    showControls();
  }

  /* ── Idle ────────────────────────────────────────────────────────────────── */
  if (phase === "idle") {
    return (
      <button
        type="button"
        aria-label={`Play ${title}`}
        onClick={launch}
        style={{ touchAction: "manipulation" }}
        className="group relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black focus:outline-none"
      >
        <Image src={thumb} alt="" fill priority sizes="(max-width: 1024px) 100vw, calc(100vw - 20rem)" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-black/25 transition-opacity group-hover:bg-black/35" />
        <div className="relative z-10 flex size-[72px] items-center justify-center rounded-full bg-white/90 shadow-elevated backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
          <Play className="size-8 translate-x-0.5 fill-ink text-ink" />
        </div>
      </button>
    );
  }

  /* ── Player ──────────────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      onClick={handleContainerTap}
      style={{ touchAction: "manipulation" }}
      className={
        fakeFs
          ? "fixed inset-0 z-[9999] cursor-pointer bg-black"
          : "relative aspect-video w-full cursor-pointer overflow-hidden bg-black"
      }
    >
      {/* YouTube iframe — pointer-events: none via .yt-wrapper > iframe in globals.css */}
      <div ref={wrapperRef} className="yt-wrapper absolute inset-0" />

      {/* Loading overlay */}
      {phase === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <Image src={thumb} alt="" fill className="object-cover opacity-40" />
          <div className="relative size-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      )}

      {/* Center play/pause indicator */}
      {ctrlsOn && phase === "ready" && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            {playing
              ? <Pause className="size-7 fill-white text-white" />
              : <Play  className="size-7 translate-x-0.5 fill-white text-white" />}
          </div>
        </div>
      )}

      {/* Tap-to-unmute pill — always on top, stopPropagation so it doesn't trigger handleContainerTap */}
      {phase === "ready" && muted && (
        <button
          type="button"
          style={{ touchAction: "manipulation" }}
          onClick={(e) => { e.stopPropagation(); toggleMute(); showControls(); }}
          className="absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-2 text-[12px] font-medium text-white"
        >
          <VolumeX className="size-3.5" />
          Tap to unmute
        </button>
      )}

      {/* Persistent exit button — always visible in fullscreen, no hover needed */}
      {fakeFs && (
        <button
          type="button"
          style={{ touchAction: "manipulation" }}
          onClick={exitFullscreen}
          className="absolute left-3 top-3 z-30 flex size-12 items-center justify-center rounded-full bg-black/70 text-white"
        >
          <Minimize className="size-6" />
        </button>
      )}

      {/* Bottom controls — fade in on tap */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pb-safe-4 pb-4 pt-12 transition-opacity duration-200 ${
          ctrlsOn ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Seek bar */}
        <div
          role="slider"
          aria-label="Seek"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          style={{ touchAction: "manipulation" }}
          className="mb-4 h-2 w-full cursor-pointer rounded-full bg-white/25"
          onClick={seek}
        >
          <div className="pointer-events-none h-full rounded-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center gap-2">
          <button type="button" style={{ touchAction: "manipulation" }} aria-label={playing ? "Pause" : "Play"}
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
          >
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 translate-x-px fill-current" />}
          </button>

          <button type="button" style={{ touchAction: "manipulation" }} aria-label={muted ? "Unmute" : "Mute"}
            onClick={(e) => { e.stopPropagation(); toggleMute(); showControls(); }}
            className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>

          <span className="flex-1" />

          {fakeFs ? (
            <button type="button" style={{ touchAction: "manipulation" }} aria-label="Exit fullscreen"
              onClick={exitFullscreen}
              className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
            >
              <Minimize className="size-5" />
            </button>
          ) : (
            <button type="button" style={{ touchAction: "manipulation" }} aria-label="Fullscreen"
              onClick={enterFullscreen}
              className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
            >
              <Maximize className="size-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
