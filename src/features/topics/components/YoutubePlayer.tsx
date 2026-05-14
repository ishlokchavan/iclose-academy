"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";

/* ─── YouTube IFrame API types (minimal) ─────────────────────────────────── */
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

/* ─── Singleton API loader — preloaded on mount so it's ready on first tap ── */
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

  const [phase,      setPhase]      = useState<"idle" | "loading" | "ready">("idle");
  const [playing,    setPlaying]    = useState(false);
  // Start muted — iOS Safari requires a user gesture for audio.
  // Autoplay works fine muted; user taps the unmute button for sound.
  const [muted,      setMuted]      = useState(true);
  const [progress,   setProgress]   = useState(0);
  const [fakeFs,     setFakeFs]     = useState(false); // CSS fullscreen for iOS

  const thumb = thumbUrl ?? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  // Preload the YouTube API while the user is reading the page so it's
  // already resolved when they tap play (avoids an async gap that iOS uses
  // to block autoplay).
  useEffect(() => { loadAPI(); }, []);

  useEffect(() => () => clearInterval(tickRef.current), []);

  // Keep fakeFs in sync with native fullscreen (desktop/Android).
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setFakeFs(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  /* ── Create the YT player ───────────────────────────────────────────────── */
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
        autoplay:      1,
        controls:      0,  // hide all YouTube UI
        mute:          1,  // muted start → iOS allows autoplay
        rel:           0,
        modestbranding:1,
        showinfo:      0,
        iv_load_policy:3,
        playsinline:   1,
        disablekb:     1,
        fs:            0,  // we handle fullscreen ourselves
        origin:        window.location.origin,
      },
      events: {
        onReady(e: { target: YTPlayer }) {
          e.target.playVideo();
          setPhase("ready");
          setMuted(true);
        },
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
    await loadAPI(); // resolves instantly if preloaded on mount
    createPlayer();
  }, [createPlayer]);

  /* ── Playback controls ───────────────────────────────────────────────────── */
  function togglePlay() {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
  }

  function toggleMute() {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) { p.unMute(); setMuted(false); }
    else              { p.mute();   setMuted(true);  }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const p = playerRef.current;
    if (!p) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    p.seekTo(pct * p.getDuration(), true);
  }

  /* ── Fullscreen — native where available, CSS fake-fullscreen on iOS ────── */
  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;

    // Native fullscreen (works on Android Chrome + desktop)
    if (document.fullscreenEnabled) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen();
        setFakeFs(true);
      }
      return;
    }

    // iOS PWA fallback: CSS-based full-viewport overlay
    setFakeFs((prev) => !prev);
  }

  /* ── Idle: thumbnail + play button ─────────────────────────────────────── */
  if (phase === "idle") {
    return (
      <button
        type="button"
        aria-label={`Play ${title}`}
        onClick={launch}
        className="group relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black focus:outline-none"
      >
        <Image
          src={thumb}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, calc(100vw - 20rem)"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/25 transition-opacity group-hover:bg-black/35" />
        <div className="relative z-10 flex size-[72px] items-center justify-center rounded-full bg-white/90 shadow-elevated backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
          <Play className="size-8 translate-x-0.5 fill-ink text-ink" />
        </div>
      </button>
    );
  }

  /* ── Loading + ready ────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      // fakeFs: fixed overlay that fills the entire viewport on iOS
      className={
        fakeFs
          ? "fixed inset-0 z-[9999] bg-black"
          : "player-root group/player relative aspect-video w-full overflow-hidden bg-black"
      }
    >
      {/* YouTube iframe mounts here */}
      <div ref={wrapperRef} className="yt-wrapper absolute inset-0" />

      {/* Loading overlay — thumbnail + spinner until player is ready */}
      {phase === "loading" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
          <Image src={thumb} alt="" fill className="object-cover opacity-40" />
          <div className="relative size-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      )}

      {/* Full-cover transparent zone: every tap goes through our handlers,
          nothing reaches the YouTube iframe. */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Tap-to-unmute prompt — shown until user explicitly unmutes.
          Positioned top-right so it's obvious without blocking content. */}
      {phase === "ready" && muted && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          className="absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm transition-opacity hover:bg-black/80"
          aria-label="Tap to unmute"
        >
          <VolumeX className="size-3.5" />
          Tap to unmute
        </button>
      )}

      {/* Custom controls */}
      <div className="absolute inset-x-0 bottom-0 z-30 translate-y-1 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pb-3 pt-12 opacity-0 transition-all duration-200 group-hover/player:translate-y-0 group-hover/player:opacity-100">
        {/* Seek bar */}
        <div
          role="slider"
          aria-label="Seek"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          className="mb-3 h-1 w-full cursor-pointer rounded-full bg-white/25 hover:h-[5px] transition-all"
          onClick={seek}
        >
          <div
            className="pointer-events-none h-full rounded-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="flex size-9 items-center justify-center rounded-md text-white/80 transition-colors hover:text-white"
          >
            {playing
              ? <Pause className="size-5 fill-current" />
              : <Play  className="size-5 translate-x-px fill-current" />}
          </button>

          <button
            type="button"
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            className="flex size-9 items-center justify-center rounded-md text-white/80 transition-colors hover:text-white"
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>

          <span className="flex-1" />

          <button
            type="button"
            aria-label={fakeFs ? "Exit fullscreen" : "Fullscreen"}
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="flex size-9 items-center justify-center rounded-md text-white/80 transition-colors hover:text-white"
          >
            {fakeFs
              ? <Minimize className="size-5" />
              : <Maximize className="size-5" />}
          </button>
        </div>
      </div>

      {/* iOS fake-fullscreen needs always-visible exit since controls require hover */}
      {fakeFs && !document.fullscreenElement && (
        <button
          type="button"
          aria-label="Exit fullscreen"
          onClick={(e) => { e.stopPropagation(); setFakeFs(false); }}
          className="absolute left-3 top-3 z-40 flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm"
        >
          <Minimize className="size-5" />
        </button>
      )}
    </div>
  );
}
