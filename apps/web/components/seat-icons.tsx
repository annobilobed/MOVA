// Icons used by the seat map (lucide, re-exported so the map has one import site).
export { Ban, Check, Clock } from "lucide-react";

export function SteeringWheel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 14v7M10.2 11.2 3.5 9.5M13.8 11.2l6.7-1.7" />
    </svg>
  );
}
