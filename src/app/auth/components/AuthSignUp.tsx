"use client";

import React, { useState } from "react";

type User = { id: string; email?: string } | null;

export default function AuthSignUp({ onSuccess }: { onSuccess?: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr(null);
    if (!email || !password) {
      setErr("Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      // const r = await apiPost("/auth/signup", { email, password }, { mock: true });
      // onSuccess?.(r.user ?? { id: r.user?.id ?? "mock", email: r.user?.email ?? email });
    } catch (e: any) {
      // setErr(e?.message ?? "Sign up failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-xs text-gray-600">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="you@example.com"
        aria-label="Email"
      />

      <label className="block text-xs text-gray-600">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="At least 6 characters"
        aria-label="Password"
      />

      {err && <div className="text-sm text-red-600">{err}</div>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="flex-1 py-2 rounded bg-green-600 text-white text-sm">
          {busy ? "Creating…" : "Create account"}
        </button>
      </div>
    </form>
  );
}
