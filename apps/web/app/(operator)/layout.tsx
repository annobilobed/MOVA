import { AppShell } from "@/components/app-shell";

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return <AppShell roles={["operator", "super_admin"]}>{children}</AppShell>;
}
