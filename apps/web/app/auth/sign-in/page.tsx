import { Suspense } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { SignInForm } from "@/components/auth-form";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to book trips and see your tickets. Drivers and operators sign in here too.">
      <Suspense><SignInForm /></Suspense>
    </AuthLayout>
  );
}
