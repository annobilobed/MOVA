import { MapPinOff } from "lucide-react";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { EmptyState } from "@/components/ui";
import { buttonClass } from "@/lib/styles";

export default function NotFound() {
  return (
    <PublicShell>
      <div className="container-page max-w-xl py-20">
        <EmptyState icon={<MapPinOff />} title="This stop doesn't exist" action={<Link href="/" className={buttonClass()}>Back to MOVA home</Link>}>
          The page you're looking for has moved or never existed.
        </EmptyState>
      </div>
    </PublicShell>
  );
}
