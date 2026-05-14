"use client";

import { useEffect, useRef, useState } from "react";
import { Share, X } from "lucide-react";

type Platform = "android" | "ios" | "other";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed-at";
const INSTALLED_KEY = "pwa-installed";
const SUPPRESS_DAYS = 90;

function isAlreadyInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  );
}

function shouldShow(): boolean {
  if (typeof localStorage === "undefined") return false;
  if (localStorage.getItem(INSTALLED_KEY)) return false;
  const dismissedAt = localStorage.getItem(DISMISSED_KEY);
  if (dismissedAt) {
    const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / 86_400_000;
    if (daysSince < SUPPRESS_DAYS) return false;
  }
  return true;
}

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)) return "ios";
  return "other";
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isAlreadyInstalled() || !shouldShow()) return;

    const p = detectPlatform();
    setPlatform(p);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      // Show our custom prompt after a 4-second delay
      setTimeout(() => {
        if (shouldShow() && !isAlreadyInstalled()) setVisible(true);
      }, 4000);
    };

    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "1");
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS: no native prompt event — show after delay if on iOS Safari
    let iosTimer: ReturnType<typeof setTimeout> | null = null;
    if (p === "ios") {
      iosTimer = setTimeout(() => {
        if (shouldShow() && !isAlreadyInstalled()) setVisible(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  }

  async function install() {
    if (!deferredRef.current) return;
    await deferredRef.current.prompt();
    const { outcome } = await deferredRef.current.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "1");
    } else {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }
    deferredRef.current = null;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Add to Home Screen"
      className="fixed bottom-0 inset-x-0 z-50"
    >
      {/* Backdrop tap to dismiss */}
      <div className="absolute inset-0 -top-full" onClick={dismiss} aria-hidden />

      <div
        className="relative mx-auto max-w-lg rounded-t-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-hairline border-b-0 px-5 pt-5"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />

        <button
          onClick={dismiss}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-ink/5 text-ink-muted hover:bg-ink/10 transition-colors"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-4 pb-5">
          {/* App icon */}
          <div className="size-14 shrink-0 rounded-2xl bg-gradient-to-br from-accent to-[#0051a3] flex items-center justify-center shadow-card">
            <span className="text-white text-[18px] font-bold tracking-tight">iC</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-ink">Add to Home Screen</p>
            <p className="text-[13px] text-ink-muted mt-0.5">
              iClose Academy — instant access, no browser needed.
            </p>

            {platform === "ios" ? (
              <p className="mt-3 text-[13px] text-ink-muted flex items-center gap-1.5">
                Tap{" "}
                <Share className="size-4 text-accent inline-block" />{" "}
                then{" "}
                <span className="font-medium text-ink">Add to Home Screen</span>
              </p>
            ) : (
              <button
                onClick={install}
                className="mt-3 inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-accent/90 transition-colors"
              >
                Install
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
