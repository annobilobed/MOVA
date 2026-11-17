import { AppShell } from "@/components/app-shell";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <AppShell roles={["driver"]}>{children}</AppShell>;
}
