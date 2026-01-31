"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Profile", href: "/profile" },
  { label: "Chat", href: "/chat" },
  { label: "Generate", href: "/test" },
  { label: "Plan", href: "/plan" },
]

export function GeneratorNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card/60 p-6 shadow-sm lg:flex-row lg:items-center lg:gap-6">
      <div className="flex-1 text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Solvi
        </p>
        <h1 className="text-2xl font-semibold">Creative Workspace</h1>
      </div>
      <NavigationMenu className="flex-1 justify-center">
        <NavigationMenuList className="gap-3">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href)

            return (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex w-full justify-end lg:flex-1">
        <ThemeToggle />
      </div>
    </div>
  )
}
