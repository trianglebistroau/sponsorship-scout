"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, Target, Lightbulb, Calendar, Check } from "lucide-react"

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
              <Button variant="ghost" asChild>
                <Link href="/auth">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth">Sign up</Link>
              </Button>
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
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/auth">
                Start with Solvi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="#how-it-works">
                See how it works
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pain to Relief Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              You're not stuck. You're just guessing.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Creating content shouldn't feel like throwing darts in the dark.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <PainReliefCard
              pain="Ideas running dry"
              relief="Solvi spots patterns you didn't know existed"
            />
            <PainReliefCard
              pain="Analytics but no answers"
              relief="Solvi translates numbers into direction"
            />
            <PainReliefCard
              pain="Posting without direction"
              relief="Solvi gives you a creative compass"
            />
            <PainReliefCard
              pain="Feeling behind the algorithm"
              relief="Solvi helps you work with it, not against it"
            />
            <PainReliefCard
              pain="Not sure what brands want"
              relief="Solvi highlights your natural strengths"
            />
            <PainReliefCard
              pain="Guessing what'll hit"
              relief="Solvi shows you what already works"
            />
          </div>
        </div>
      </section>

      {/* What Solvi Does */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              We watch patterns so you don't have to
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Solvi helps you see what your audience already loves — and build on it.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <BenefitCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Understand your creator profile"
              description="Your tone, energy, format style — decoded without spreadsheets."
            />
            <BenefitCard
              icon={<Check className="h-6 w-6" />}
              title="Reveal your content superpowers"
              description="What you're naturally great at, backed by what actually performs."
            />
            <BenefitCard
              icon={<Target className="h-6 w-6" />}
              title="Spot what's holding you back"
              description="See weak hooks, format mismatches, and timing issues."
            />
            <BenefitCard
              icon={<Lightbulb className="h-6 w-6" />}
              title="Turn insights into ideas"
              description="Concepts that fit your style, not copy-paste templates."
            />
            <BenefitCard
              icon={<Calendar className="h-6 w-6" />}
              title="Plan content with intention"
              description="Build a rhythm that works with your life, not against it."
            />
            <BenefitCard
              icon={<ArrowRight className="h-6 w-6" />}
              title="Create with confidence"
              description="Know what to post, when, and why — before you hit record."
            />
          </div>
        </div>
      </section>

      {/* The Solvi Flow */}
      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              From guessing to knowing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A creative process that actually makes sense.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FlowStep
              number="1"
              title="Understand you"
              description="We learn your style, taste, and patterns"
              color="violet"
            />
            <FlowStep
              number="2"
              title="Brainstorm ideas"
              description="Concepts that fit you, not templates"
              color="pink"
            />
            <FlowStep
              number="3"
              title="Create together"
              description="Refine hooks, formats, and direction"
              color="amber"
            />
            <FlowStep
              number="4"
              title="Plan ahead"
              description="Turn ideas into an actual posting rhythm"
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* Trust & Positioning */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">
            Built for creators, not dashboards
          </h2>
          
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <TrustPill text="No guessing" />
            <TrustPill text="No spreadsheets" />
            <TrustPill text="No burnout" />
          </div>

          <p className="text-xl text-muted-foreground mb-8">
            Your creative partner, not another tool.
          </p>
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

          <Button size="lg" className="text-lg px-12 py-6" asChild>
            <Link href="/auth">
              Sign up free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
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
function PainReliefCard({ pain, relief }: { pain: string; relief: string }) {
  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-6 space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground line-through">
            {pain}
          </p>
          <p className="text-base font-semibold leading-relaxed">
            {relief}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function BenefitCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

function FlowStep({ 
  number, 
  title, 
  description, 
  color 
}: { 
  number: string
  title: string
  description: string
  color: "violet" | "pink" | "amber" | "emerald"
}) {
  const colorClasses = {
    violet: "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400",
    pink: "bg-pink-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
  }

  return (
    <div className="relative">
      <Card className={cn("border-2", colorClasses[color])}>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-current/10 font-bold text-lg">
            {number}
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TrustPill({ text }: { text: string }) {
  return (
    <div className="rounded-full border-2 border-primary/20 bg-primary/5 px-6 py-3">
      <p className="font-semibold">{text}</p>
    </div>
  )
}
