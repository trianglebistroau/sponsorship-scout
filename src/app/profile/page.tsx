"use client"

import * as React from "react"
import { Sparkles, Target, TrendingUp, Upload, Play } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { GeneratorNav } from "@/components/navigation"

export default function ProfilePage() {
  return (
    <main className="h-screen bg-background overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
        <GeneratorNav />
        
        <div className="flex h-full flex-col gap-6 overflow-y-auto lg:min-h-0">
          {/* Top Profile Bio Section - Always Vertical Stack */}
          <div className="flex flex-col gap-6">
            {/* Cover + Avatar + Bio */}
            <Card>
              <div className="relative">
                {/* Cover Wallpaper */}
                <div className="h-32 w-full rounded-t-lg bg-gradient-to-br from-violet-100 via-pink-100 to-amber-100 dark:from-violet-950 dark:via-pink-950 dark:to-amber-950" />
                
                {/* Avatar & Bio Content */}
                <CardContent className="relative pt-0">
                  {/* Avatar - Overlaps Cover */}
                  <div className="flex flex-col items-center -mt-12 mb-4">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage src="" alt="Creator Avatar" />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-200 to-pink-200 dark:from-violet-800 dark:to-pink-800">
                        FM
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Creator Name & Bio */}
                  <div className="text-center space-y-3">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Fredy Mercury</h1>
                      <p className="text-sm text-muted-foreground">@fredymercury</p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div>
                        <span className="font-semibold text-foreground">1.25k</span>
                        <span className="text-muted-foreground ml-1">Followers</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">455</span>
                        <span className="text-muted-foreground ml-1">Following</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                      Turning quiet moments into visual stories. Coffee, runs, design—captured with intention.
                    </p>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Creative DNA Card - Below Bio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  Creative DNA
                </CardTitle>
                <CardDescription>
                  What kind of creator you are
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Creator Type</h4>
                  <p className="text-base font-bold text-foreground">
                    Calm Visual Storyteller
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Audience Personas</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Lifestyle creators</Badge>
                    <Badge variant="secondary">Routine lovers</Badge>
                    <Badge variant="secondary">Quiet moments seekers</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Content Style/Taste</h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    Clean shots, soft pacing, intentional framing. People follow for the calm visual flow and relatable everyday moments.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Personality</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Warm</Badge>
                    <Badge variant="secondary">Observant</Badge>
                    <Badge variant="secondary">Intentional</Badge>
                    <Badge variant="secondary">Grounded</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Insights Section - Three Separate Cards */}
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-stretch">
            {/* Goals Card */}
            <Card className="flex flex-col h-full">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Creative Direction
                </CardTitle>
                <CardDescription>
                  Where you're headed
                </CardDescription>
              </CardHeader>
              <CardContent className="relative flex-1 overflow-y-auto space-y-4 min-h-0">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-foreground">Core Vision</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Making everyday life feel visually intentional through calm storytelling.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Current Stage</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Building reach, strong vibes</span>
                      <span className="font-medium text-foreground">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-foreground">Core Messages</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                      <span>Routines don't have to feel boring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                      <span>Calm productivity over hustle culture</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                      <span>Visual clarity brings peace</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-foreground">Tone</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs">Calm</Badge>
                    <Badge variant="outline" className="text-xs">Honest</Badge>
                    <Badge variant="outline" className="text-xs">Visual-first</Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-foreground">Next 30–90 Days</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                      <span>More lifestyle moments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                      <span>Start one recurring series</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                      <span>Try camera-facing content</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 pt-3 border-t mt-auto">
                  <h4 className="text-sm font-semibold text-foreground">Your Videos</h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="relative aspect-[9/16] rounded border border-dashed border-muted-foreground/30 bg-muted/30 flex items-center justify-center group hover:border-muted-foreground/50 transition-colors"
                      >
                        <Play className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors" />
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs h-8"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload your content
                  </Button>
                </div>
                
                {/* Scroll Indicator - Desktop Only */}
                <div className="hidden lg:block sticky bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t from-background to-transparent" />
              </CardContent>
            </Card>

            {/* Superpowers Card */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Superpowers
                </CardTitle>
                <CardDescription>
                  What you're naturally great at
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="space-y-2">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Visual Storytelling</h4>
                      <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">12 videos</span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Eye-catching visuals that stop the scroll. Consistently strong.
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Consistent Pacing</h4>
                      <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">15 videos</span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Calm, intentional rhythm that keeps viewers engaged. Signature style.
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Authentic Voice</h4>
                      <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">All videos</span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Genuine personality shines through every frame. People trust you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Zones Card */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Growth Zones
                </CardTitle>
                <CardDescription>
                  Areas with untapped potential
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="space-y-2">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Camera-Facing Content</h4>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">3 videos</span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Early experiments show promise. Adding direct presence could deepen connection.
                    </p>
                  </div>

                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Educational Storytelling</h4>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">5 videos</span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Your design insights resonate. More "why" behind the visuals could unlock new reach.
                    </p>
                  </div>

                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Community Engagement</h4>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Opportunity</span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Responding to comments and building dialogue could amplify your voice.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Validation Section */}
          <Card className="animate-in fade-in duration-500">
            <CardContent className="py-6 space-y-4">
              <div className="space-y-2">
                <p className="text-base font-medium text-foreground">
                  Does this feel accurate?
                </p>
                <p className="text-sm text-muted-foreground">
                  Was I close?
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                >
                  Yes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                >
                  Somewhat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                >
                  Not really
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
