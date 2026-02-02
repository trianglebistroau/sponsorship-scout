"use client";

import React from "react";

export default function AuthToggleButtons({
  mode,
  onChange,
}: {
  mode: "signin" | "signup";
  onChange: (m: "signin" | "signup") => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-gray-100 p-1 gap-1">
      <button
        onClick={() => onChange("signin")}
        className={`px-3 py-1.5 rounded-full text-sm ${mode === "signin" ? "text-purple-600 shadow" : "text-gray-600"}`}
      >
        Sign in
      </button>
      <button
        onClick={() => onChange("signup")}
        className={`px-3 py-1.5 rounded-full text-sm ${mode === "signup" ? "text-purple-600 shadow" : "text-gray-600"}`}
      >
        Sign up
      </button>
    </div>
  );
}
