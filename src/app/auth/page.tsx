"use client";

import React, { useState } from "react";
import AuthSignIn from "./components/AuthSignIn";
import AuthSignUp from "./components/AuthSignUp";
import AuthToggleButtons from "@/components/AuthToggleButtons";
import Image from 'next/image';


import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{mode === "signin" ? "Welcome back" : "Create account"}</h2>
            <AuthToggleButtons mode={mode} onChange={(m) => setMode(m)} />
          </div>

          <div className="mb-4">
            <Button variant='outline' className='!border-[#e84133] !text-[#e84133]'>
                <Image
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png?width=20&height=20&format=auto'
                alt='Google Icon'
                className='size-5'
                width={20}
                height={20}
                />
                <span className='flex flex-1 justify-center'>Continue with Google</span>
            </Button>
          </div>

          <div>
            {mode === "signin" ? (
              <AuthSignIn onSuccess={(u) => setUser(u)} />
            ) : (
              <AuthSignUp onSuccess={(u) => setUser(u)} />
            )}
          </div>

          {user && (
            <div className="mt-4 p-3 bg-green-50 rounded text-sm">
              Signed in (mock): <strong>{user.email ?? user.id}</strong>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
