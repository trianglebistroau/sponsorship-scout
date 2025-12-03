"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const handleToggle = React.useCallback(() => {
    setTheme(isDark ? "light" : "dark")
  }, [isDark, setTheme])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("relative h-10 w-10", className)}
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
      <Sun
        className={cn(
          "h-5 w-5 transition-all",
          !mounted || !isDark ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
        )}
        aria-hidden={mounted ? isDark : false}
      />
      <Moon
        className={cn(
          "absolute h-5 w-5 transition-all",
          mounted && isDark ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
        )}
        aria-hidden={mounted ? !isDark : true}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
