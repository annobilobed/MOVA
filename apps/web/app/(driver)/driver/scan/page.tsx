import { Suspense } from "react";
import { Scanner } from "./scanner";

export const metadata = { title: "Scan tickets" };

export default function ScanPage() {
  return <Suspense><Scanner /></Suspense>;
}
