
import { GeneratorNav } from "@/components/navigation"
import React, { ReactNode } from "react"

export default function TestLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <main className="h-screen bg-background flex flex-col overflow-hidden">

      <section className="flex-1 overflow-y-auto">
        {children}
      {/* <div className="mx-auto w-full max-w-[1600px] px-4 py-6 lg:px-8">
        <GeneratorNav />
      </div> */}

      </section>
    </main>
  )
}
