
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
      </section>
    </main>
  )
}
