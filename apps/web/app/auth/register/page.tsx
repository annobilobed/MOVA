import { Suspense } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { RegisterForm } from "@/components/auth-form";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthLayout title="Create your student account" subtitle="You'll need your UCC student ID. It takes about a minute.">
      <Suspense><RegisterForm /></Suspense>
    </AuthLayout>
  );
}
