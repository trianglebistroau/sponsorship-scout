"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useUserStore } from "@/store/user-store";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const clearStore = useUserStore((s) => s.clear);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        // Clean up sessionStorage
        sessionStorage.removeItem("onboarding_session_id");
        // Reset Zustand user store
        clearStore();
        // Sign out via auth client
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => router.push("/auth"),
          },
        });
      }}
    >
      Sign out
    </Button>
  );
}
