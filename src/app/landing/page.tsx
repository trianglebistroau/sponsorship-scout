"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, Target, Lightbulb, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/landing" className="text-2xl font-bold">
                Solvi
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/auth">
                <Button>Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-50 via-background to-pink-50 dark:from-violet-950/20 dark:via-background dark:to-pink-950/20" />
        
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
            Stop guessing.
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              Start knowing.
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl mb-10">
            Solvi helps you understand your style, spot what works, and turn ideas into content you actually want to post.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                Start with Solvi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                See how it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How Solvi Works - Merged Section */}
      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              How Solvi Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A creative flow that actually makes sense.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FlowStep
              icon={<Sparkles className="h-6 w-6" />}
              title="Understand You"
              description="Learn your style, taste, patterns, and natural strengths."
              color="violet"
            />
            <FlowStep
              icon={<Lightbulb className="h-6 w-6" />}
              title="Spark Ideas"
              description="Concepts that fit your vibe. Not templates. Just you."
              color="pink"
            />
            <FlowStep
              icon={<Target className="h-6 w-6" />}
              title="Create with Direction"
              description="Refine hooks, formats, and angles together."
              color="amber"
            />
            <FlowStep
              icon={<Calendar className="h-6 w-6" />}
              title="Plan Ahead"
              description="Build momentum with clarity and confidence."
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Ready to build content that actually feels like you?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop guessing what works. Start knowing.
          </p>

          <Link href="/auth">
            <Button size="lg" className="text-lg px-12 py-6">
              Sign up free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Solvi. Built for creators.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

// Helper Components
function FlowStep({ 
  icon,
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  color: "violet" | "pink" | "amber" | "emerald"
}) {
  const iconColorClasses = {
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  }

  return (
    <Card className="border h-full hover:border-primary/30 transition-colors">
      <CardContent className="p-6 flex flex-col items-start space-y-4 h-full">
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-lg",
          iconColorClasses[color]
        )}>
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
