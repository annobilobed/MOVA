"use client";

import { RotateCw, WifiOff } from "lucide-react";
import type { ApiError } from "@/lib/api";
import { Button, EmptyState, RouteLoader } from "./ui";

/** Shared loading / error presentation for data screens. Returns null when content can render. */
export function LoadState({ loading, error, reload, label }: { loading: boolean; error: ApiError | null; reload: () => void; label: string }) {
  if (error) {
    return (
      <EmptyState icon={error.offline ? <WifiOff /> : <RotateCw />} title={error.offline ? "Connection interrupted" : "Something went wrong"} action={<Button onClick={reload}><RotateCw className="size-4" />Try again</Button>}>
        {error.message}
      </EmptyState>
    );
  }
  if (loading) return <RouteLoader label={label} />;
  return null;
}
