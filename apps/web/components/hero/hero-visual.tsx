"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BusFallback } from "./bus-fallback";

const BusScene = dynamic(() => import("./bus-scene"), { ssr: false });

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
 * The static illustration renders immediately (fast first paint); the 3D coach loads
 * after the page is idle, only on capable devices, and stays still under reduced motion.
 */
export function HeroVisual() {
  const [mode, setMode] = useState<"static" | "3d">("static");
  const [animate, setAnimate] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    setAnimate(!reduce.matches);
    if (!canRun3D()) return;
    const start = () => setMode("3d");
    const idle = (window as any).requestIdleCallback?.(start, { timeout: 2500 }) ?? window.setTimeout(start, 1200);
    return () => ((window as any).cancelIdleCallback ? (window as any).cancelIdleCallback(idle) : clearTimeout(idle));
  }, []);

  return (
    <div className="relative aspect-[16/11] w-full">
      <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}>
        <BusFallback />
      </div>
      {mode === "3d" && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <BusScene animate={animate} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
