"use client";

import dynamic from "next/dynamic";
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

  useEffect(() => {
    setAnimate(!matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!canRun3D()) return;
    const start = () => setMode("3d");
    const idle = (window as any).requestIdleCallback?.(start, { timeout: 2000 }) ?? window.setTimeout(start, 900);
    return () => ((window as any).cancelIdleCallback ? (window as any).cancelIdleCallback(idle) : clearTimeout(idle));
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`}>
        <RoadFallback />
      </div>
      {mode === "3d" && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <RoadScene animate={animate} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
