"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";

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
interface YTPlayerState {
  PLAYING: number;
  PAUSED: number;
  ENDED: number;
}
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
    // YouTube calls this global when the script is ready
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const [phase, setPhase] = useState<"idle" | "loading" | "ready">("idle");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const thumb = thumbUrl ?? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  useEffect(() => () => clearInterval(tickRef.current), []);

  const launch = useCallback(async () => {
    setPhase("loading");
    await loadAPI();
    if (!wrapperRef.current) return;

    const mount = document.createElement("div");
    mount.style.width = "100%";
    mount.style.height = "100%";
    wrapperRef.current.appendChild(mount);

    playerRef.current = new window.YT.Player(mount, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 1,
        controls: 0,       // ← hides all YouTube UI including logo & watermark
        rel: 0,
        modestbranding: 1,
        showinfo: 0,
        iv_load_policy: 3,
        playsinline: 1,
        disablekb: 1,
        fs: 0,             // disable YT fullscreen (we handle it ourselves)
        origin: window.location.origin,
      },
      events: {
        onReady(e: { target: YTPlayer }) {
          e.target.playVideo();
          setPhase("ready");
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
              const dur = p.getDuration() || 1;
              setProgress((p.getCurrentTime() / dur) * 100);
            }, 250);
          } else {
            clearInterval(tickRef.current);
          }
          if (e.data === ENDED) setProgress(100);
        },
      },
    });
  }, [videoId]);

  /* ── Controls ─────────────────────────────────────────────────────────── */
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

  function fullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.();
    }
  }

  /* ── Idle state: thumbnail + play button ─────────────────────────────── */
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
        <div className="absolute inset-0 bg-black/25 transition-opacity duration-300 group-hover:bg-black/35" />
        <div className="relative z-10 flex size-[72px] items-center justify-center rounded-full bg-white/90 shadow-elevated backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
          <Play className="size-8 translate-x-0.5 fill-ink text-ink" />
        </div>
      </button>
    );
  }

  /* ── Loading + ready states ──────────────────────────────────────────── */
  return (
    <div ref={containerRef} className="player-root group/player relative aspect-video w-full overflow-hidden bg-black">
      {/* YouTube iframe mounts here via IFrame API */}
      <div ref={wrapperRef} className="yt-wrapper absolute inset-0" />

      {/* Thumbnail shown while API boots — prevents any YouTube splash frame */}
      {phase === "loading" && (
        <div className="absolute inset-0 z-20 bg-black">
          <Image src={thumb} alt="" fill className="object-cover opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        </div>
      )}

      {/* Transparent overlay covers the entire iframe — blocks all native YouTube
          interactions and routes every click through our handlers instead. */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={fullscreen}
      />

      {/* Custom controls — fade in on hover */}
      <div className="absolute inset-x-0 bottom-0 z-30 translate-y-1 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pb-3 pt-12 opacity-0 transition-all duration-200 group-hover/player:translate-y-0 group-hover/player:opacity-100">
        {/* Seek bar */}
        <div
          role="slider"
          aria-label="Seek"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          className="mb-3 h-1 w-full cursor-pointer rounded-full bg-white/25 transition-all hover:h-[5px]"
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
            aria-label="Fullscreen"
            onClick={(e) => { e.stopPropagation(); fullscreen(); }}
            className="flex size-9 items-center justify-center rounded-md text-white/80 transition-colors hover:text-white"
          >
            <Maximize className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
