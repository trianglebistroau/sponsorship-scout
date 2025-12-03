"use client"

import * as React from "react"

import { GeneratorNav } from "../generate/components/top-nav"

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
        <GeneratorNav />
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          Research workspace coming soon.
        </div>
      </div>
    </main>
  )
}
