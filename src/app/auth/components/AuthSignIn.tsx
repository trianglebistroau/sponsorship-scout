"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AuthSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr(null);

    if (!email || !password) {
      setErr("Please fill email and password.");
      return;
    }

    setBusy(true);
    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });
    setBusy(false);

    if (error) {
      setErr(error.message ?? "Sign in failed");
      return;
    }

    router.push("/profile");
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-xs">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="you@example.com"
      />

      <label className="block text-xs">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="••••••••"
      />

      {err && <div className="text-sm text-red-600">{err}</div>}

      <button
        type="submit"
        disabled={busy}
        className="w-full py-2 rounded text-sm"
      >
        {busy ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
