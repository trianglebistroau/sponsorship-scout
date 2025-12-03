import type { Metadata } from "next"
import type { ReactNode } from "react"
import "../index.css"

import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Creator Coach - From 0 to Brand Sponsorships",
  description:
    "AI-powered mentorship platform helping creators build their path to brand partnerships with personalized insights and content strategies.",
  authors: { name: "Lovable" },
  openGraph: {
    title: "Creator Coach - From 0 to Brand Sponsorships",
    description:
      "AI-powered mentorship platform helping creators build their path to brand partnerships with personalized insights and content strategies.",
    type: "website",
    images: "https://lovable.dev/opengraph-image-p98pqg.png",
  },
  twitter: {
    card: "summary_large_image",
    site: "@lovable_dev",
    images: "https://lovable.dev/opengraph-image-p98pqg.png",
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>
          <div id="root">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
