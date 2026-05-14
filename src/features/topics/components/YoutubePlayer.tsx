"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Looks and feels like a native video player.
 * - Shows a clean thumbnail + custom play button before the user interacts (no YouTube UI at all)
 * - On play: swaps in the restricted iframe with autoplay (user doesn't see the unstarted YouTube overlay)
 * - youtube-nocookie.com: no tracking cookies, removes most YouTube branding
 * - Overlays block the YouTube logo link and top info bar so the player stays opaque
 * - Share / picture-in-picture removed from allow list
 */
export function YoutubePlayer({
  videoId,
  title,
  thumbUrl,
}: {
  videoId: string;
  title: string;
  thumbUrl?: string | null;
}) {
  const [playing, setPlaying] = useState(false);

  const thumb =
    thumbUrl ?? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  const embedSrc = [
    `https://www.youtube-nocookie.com/embed/${videoId}`,
    "?autoplay=1",
    "&rel=0",
    "&modestbranding=1",
    "&color=white",
    "&iv_load_policy=3",
    "&playsinline=1",
    "&fs=1",
    "&disablekb=0",
  ].join("");

  if (!playing) {
    return (
      <button
        type="button"
        aria-label={`Play ${title}`}
        onClick={() => setPlaying(true)}
        className="group relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden bg-black focus:outline-none"
      >
        <Image
          src={thumb}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, calc(100vw - 20rem)"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {/* Subtle dark vignette */}
        <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/30" />
        {/* Play button */}
        <div className="relative z-10 flex size-[72px] items-center justify-center rounded-full bg-white/90 shadow-elevated backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
          <Play className="size-8 translate-x-0.5 fill-ink text-ink" />
        </div>
      </button>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <iframe
        src={embedSrc}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; fullscreen"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />

      {/*
        Transparent overlay zones that block the YouTube logo link and
        top-right info button — the two main "escape hatches" to YouTube.
        These do NOT cover the playback controls or center click area.

        YouTube control bar height ≈ 48px
        YouTube top gradient ≈ 44px (only visible on hover, fades in)

        We block:
          • Top strip (title link + channel logo shown on hover)
          • Bottom-right corner (~80×48 px, the YouTube "Y" logo)
      */}
      <div
        aria-hidden
        className="pointer-events-auto absolute inset-x-0 top-0 h-11"
      />
      <div
        aria-hidden
        className="pointer-events-auto absolute bottom-0 right-0 h-12 w-24"
      />
    </div>
  );
}
