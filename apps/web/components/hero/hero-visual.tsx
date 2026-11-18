"use client";

import dynamic from "next/dynamic";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { RoadFallback } from "./road-fallback";

const RoadScene = dynamic(() => import("./road-scene"), { ssr: false });

function canRun3D() {
  if (typeof window === "undefined") return false;
  const conn = (navigator as any).connection;
  if (conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? "")) return false;
  if ((navigator as any).deviceMemory && (navigator as any).deviceMemory < 3) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Full-bleed hero backdrop. The static night road paints immediately; the 3D highway loads
 * after the page is idle on capable devices, and holds still under reduced motion.
 */
export function HeroVisual() {
  const [mode, setMode] = useState<"static" | "3d">("static");
  const [animate, setAnimate] = useState(true);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    setAnimate(!rm);
    if (!canRun3D()) return;
    const start = () => setMode("3d");
    const idle = (window as any).requestIdleCallback?.(start, { timeout: 2000 }) ?? window.setTimeout(start, 900);
    return () => ((window as any).cancelIdleCallback ? (window as any).cancelIdleCallback(idle) : clearTimeout(idle));
  }, []);

  const moving = animate && !paused;
  return (
    <>
      <div aria-hidden className={`absolute inset-0 -z-10 ${moving ? "" : "motion-paused"}`}>
        <div className={`mova-sky absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`}>
          <RoadFallback />
        </div>
        {mode === "3d" && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
            <RoadScene animate={moving} onReady={() => setReady(true)} />
          </div>
        )}
      </div>
      {/* Moving content lasting more than 5 s needs a way to stop it (WCAG 2.2.2). Hidden when the device already asks for reduced motion. */}
      {!reduced && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="absolute right-4 bottom-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-night/70 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-amber/60 sm:right-6 sm:bottom-6"
        >
          {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
          {paused ? "Play motion" : "Pause motion"}
        </button>
      )}
    </>
  );
}
