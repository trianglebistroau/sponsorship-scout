import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");
  return <>{children}</>;
}
