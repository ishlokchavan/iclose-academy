"use client";

import { useEffect, useRef, useCallback } from "react";
import { savePositionAction } from "../server/actions";

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayer = {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  destroy: () => void;
};

type Props = {
  youtubeId: string;
  lessonId: string;
  startSeconds?: number;
  onSeekRef?: React.MutableRefObject<((seconds: number) => void) | null>;
};

export function LessonPlayer({ youtubeId, lessonId, startSeconds = 0, onSeekRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initPlayer = useCallback(() => {
    if (!containerRef.current || !window.YT) return;
    playerRef.current?.destroy();

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: youtubeId,
      playerVars: {
        start: startSeconds,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onStateChange: (e) => {
          const { PLAYING, PAUSED, ENDED } = window.YT.PlayerState;
          if (e.data === PLAYING) {
            saveTimerRef.current = setInterval(() => {
              const pos = playerRef.current?.getCurrentTime() ?? 0;
              savePositionAction(lessonId, Math.floor(pos));
            }, 30_000);
          }
          if (e.data === PAUSED || e.data === ENDED) {
            if (saveTimerRef.current) {
              clearInterval(saveTimerRef.current);
              saveTimerRef.current = null;
            }
            const pos = playerRef.current?.getCurrentTime() ?? 0;
            savePositionAction(lessonId, Math.floor(pos));
          }
        },
      },
    });

    if (onSeekRef) {
      onSeekRef.current = (seconds: number) => {
        playerRef.current?.seekTo(seconds, true);
      };
    }
  }, [youtubeId, lessonId, startSeconds, onSeekRef]);

  useEffect(() => {
    if (window.YT?.Player) {
      initPlayer();
      return;
    }
    // Load YT IFrame API script once
    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = initPlayer;
    return () => {
      if (window.onYouTubeIframeAPIReady === initPlayer) {
        window.onYouTubeIframeAPIReady = undefined;
      }
    };
  }, [initPlayer]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      playerRef.current?.destroy();
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "16/9" }}>
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
