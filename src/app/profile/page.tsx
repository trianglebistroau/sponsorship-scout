"use client";

import * as React from "react";
import { Sparkles, Target, TrendingUp, Upload, Play } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GeneratorNav } from "@/components/navigation";

import {ThemesCarousel} from "@/components/ThemeCarousel";

const THEMES = [
  {
    title: "Social Awkwardness as Comedy",
    summary: "Everyday interactions made funny by discomfort, pauses, and misreads.",
  },
  {
    title: "Cultural POVs Without Explanation",
    summary: "You don’t teach culture — you show it and let the audience catch up.",
  },
  {
    title: "Group Dynamics > Solo Monologues",
    summary: "Reactions, interruptions, and overlapping energy are part of the joke.",
  },
  {
    title: "POV Skits That Feel Too Real",
    summary: 'Scenarios that make people say: "Why is this exactly my life?"',
  },
];

// Generic reveal item that staggers using index. This version is SIMPLE: visibility is driven by a single `mounted` flag
function RevealItem({ index, animate = true, mounted = true, children }: { index?: number; animate?: boolean; mounted?: boolean; children: React.ReactNode }) {
  const delay = (index ?? 0) * 120; // ms
  const duration = 420; // ms

  const visible = !animate ? true : mounted;

  const style: React.CSSProperties = {
    transition: `opacity ${duration}ms cubic-bezier(.2,.9,.2,1), transform ${duration}ms cubic-bezier(.2,.9,.2,1)`,
    transitionDelay: `${delay}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    willChange: "opacity, transform",
  };

  return <div style={style}>{children}</div>;
}


function CreativeDNA({ mounted = true }: { mounted?: boolean }) {
  return (
    <div className="space-y-4">
      {/* Themes */}
      <div>
        {/* <h4 className="text-sm font-semibold text-foreground mb-3">Core content Themes / Branding</h4> */}

        <div className="space-y-3">
          <ThemesCarousel themes={THEMES} />
          
        </div>
      </div>

      {/* Bubbles area for Audience / Goal / Recipe / Boundary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        <RevealItem index={THEMES.length} mounted={mounted}>
          <div>
            <h5 className="text-xs font-semibold text-foreground mb-2">Who you’re making this for</h5>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">People who live between cultures</Badge>
              <Badge variant="secondary">Millennials watching Gen Z</Badge>
              <Badge variant="secondary">Fans of awkward comedy</Badge>
            </div>
          </div>
        </RevealItem>

        <RevealItem index={THEMES.length + 1} mounted={mounted}>
          <div>
            <h5 className="text-xs font-semibold text-foreground mb-2">Personal goal (north star)</h5>
            <div className="text-xs text-muted-foreground">
              Turn everyday awkwardness into something shared so it feels lighter, not lonely. Build a recognisable comedic POV.
            </div>
          </div>
        </RevealItem>

        <RevealItem index={THEMES.length + 2} mounted={mounted}>
          <div>
            <h5 className="text-xs font-semibold text-foreground mb-2">Your Unique Recipe</h5>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">POV Setup</Badge>
              <Badge variant="outline" className="text-xs">Ensemble Chaos</Badge>
              <Badge variant="outline" className="text-xs">Emotional Button</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              POV scenario + Friends reacting + One emotionally sharp line = Highly shareable comedy
            </div>
          </div>
        </RevealItem>

        <RevealItem index={THEMES.length + 3} mounted={mounted}>
          <div>
            <h5 className="text-xs font-semibold text-foreground mb-2">Boundary (what we avoid)</h5>
            <div className="text-xs text-muted-foreground">
              Over-explaining the joke, moralising the scenario, forcing trends that break realism.
            </div>
          </div>
        </RevealItem>
      </div>
    </div>
  );
}

function CreativeDirectionOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-30 p-4 rounded-tl-lg rounded-tr-lg overflow-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold">Creative Direction — deep view</h3>
          <p className="text-xs text-muted-foreground">Expanded view — scroll inside this panel.</p>
        </div>
        <div>
          <button
            className="text-sm px-2 py-1 rounded hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close expanded creative direction"
          >
            Close
          </button>
        </div>
      </div>

      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          <strong>Core Vision:</strong> Making everyday life feel visually intentional through calm storytelling.
        </p>

        <div>
          <h4 className="font-semibold text-foreground text-sm">Examples & Notes</h4>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>Use short-form POVs with subtle ensemble reactions — keep the camera framing tight and intimate.</li>
            <li>Prioritize scenarios that trigger a small emotional memory (embarrassment, nostalgia).</li>
            <li>Keep language minimal — let actions and reaction beats carry the joke.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm">Tactical checklist</h4>
          <ul className="pl-4 list-disc mt-2 space-y-1">
            <li>3–5 second hook with a promise of a payoff.</li>
            <li>One emotionally sharp line.</li>
            <li>At least one ensemble reaction that changes the mood.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm">Notes for production</h4>
          <p className="mt-2">Record multiple reaction takes. Edit for rhythm — remove anything that explains the joke.</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [dirExpanded, setDirExpanded] = React.useState(false);
  const [dirHover, setDirHover] = React.useState(false);

  // SIMPLE: single mounted flag controls all reveals. Triggers on mount so animations run every time.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 40); // small delay so transitions run
    return () => window.clearTimeout(t);
  }, []);

  const overlayVisible = dirHover || dirExpanded;
  const ENTER_DELAY = 80; // ms – small pause before opening feels calmer
  const [overlayActive, setOverlayActive] = React.useState(overlayVisible);

  React.useEffect(() => {
    if (overlayVisible) {
      const t = window.setTimeout(() => setOverlayActive(true), ENTER_DELAY);
      return () => window.clearTimeout(t);
    } else {
      const t = window.setTimeout(() => setOverlayActive(false), 260);
      return () => window.clearTimeout(t);
    }
  }, [overlayVisible]);

  return (
    <main className="h-screen bg-background overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
        <GeneratorNav />

        <div className="flex h-full flex-col gap-6 overflow-y-auto lg:min-h-0">
          {/* Top Profile Bio Section */}
          <div className="flex flex-col gap-6">
            {/* Cover + Avatar + Bio */}
            <Card>
              <div className="relative">
                <div className="h-32 w-full rounded-t-lg bg-gradient-to-br from-violet-100 via-pink-100 to-amber-100 dark:from-violet-950 dark:via-pink-950 dark:to-amber-950" />

                <CardContent className="relative pt-0">
                  <div className="flex flex-col items-center -mt-12 mb-4">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage src="" alt="Creator Avatar" />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-200 to-pink-200 dark:from-violet-800 dark:to-pink-800">FM</AvatarFallback>
                    </Avatar>
                  </div>

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

                    <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">Turning quiet moments into visual stories. Coffee, runs, design—captured with intention.</p>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Creative DNA Card - themes + bubbles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  Creative DNA
                </CardTitle>
                <CardDescription>What kind of creator you are</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Simple: pass the single mounted flag to control the reveal */}
                <CreativeDNA mounted={mounted} />
              </CardContent>
            </Card>
          </div>

          {/* Profile Insights Section - Three Separate Cards (equal height) */}
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-stretch">
            {/* Creative Direction (this one has hover / expand overlay) */}
            <Card className="flex flex-col h-full relative overflow-hidden" onMouseEnter={() => setDirHover(true)} onMouseLeave={() => setDirHover(false)}>
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Creative Direction
                </CardTitle>
                <CardDescription>Where you're headed</CardDescription>
              </CardHeader>

              <CardContent className="relative flex-1 overflow-hidden min-h-0">
                {/* summary content (short) */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Core Vision</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Making everyday life feel visually intentional through calm storytelling.</p>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-foreground">Current Stage</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Building reach, strong vibes</span>
                      <span className="font-medium text-foreground">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </div>

                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => setDirExpanded(true)} className="w-full justify-start gap-2 text-xs h-8">Open detailed direction</Button>
                </div>

                {overlayActive && (
                  <div className="absolute inset-0 z-30 pointer-events-none" aria-hidden={!overlayVisible}>
                    <div className={`absolute inset-0 transition-opacity duration-200 bg-background/95 ${overlayVisible ? "opacity-100" : "opacity-0"}`}  />

                    <div className={`absolute inset-0 p-4 rounded-tl-lg rounded-tr-lg overflow-auto transition-all 
                    duration-420 ease-[cubic-bezier(.2,.9,.2,1)]`}
                    style={{ transform: overlayVisible ? "translateY(0) scale(1)" : "translateY(12px) scale(.96)",
                    opacity: overlayVisible ? 1 : 0, pointerEvents: overlayVisible ? "auto" : "none", willChange: "transform, opacity" }}>
                      <CreativeDirectionOverlay onClose={() => { setDirExpanded(false); setDirHover(false); }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Superpowers */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Superpowers
                </CardTitle>
                <CardDescription>What you're naturally great at</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 min-h-0">
                <div className="space-y-2">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-amber-900">Visual Storytelling</h4>
                      <span className="text-xs text-amber-700 font-medium">12 videos</span>
                    </div>
                    <p className="text-xs text-amber-700">Eye-catching visuals that stop the scroll. Consistently strong.</p>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-amber-900">Consistent Pacing</h4>
                      <span className="text-xs text-amber-700 font-medium">15 videos</span>
                    </div>
                    <p className="text-xs text-amber-700">Calm, intentional rhythm that keeps viewers engaged.</p>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-amber-900">Authentic Voice</h4>
                      <span className="text-xs text-amber-700 font-medium">All videos</span>
                    </div>
                    <p className="text-xs text-amber-700">Genuine personality that people trust.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Zones */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Growth Zones
                </CardTitle>
                <CardDescription>Areas with untapped potential</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 min-h-0">
                <div className="space-y-2">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-emerald-900">Camera-Facing Content</h4>
                      <span className="text-xs text-emerald-700 font-medium">3 videos</span>
                    </div>
                    <p className="text-xs text-emerald-700">Early experiments show promise. Adding direct presence could deepen connection.</p>
                  </div>

                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-emerald-900">Educational Storytelling</h4>
                      <span className="text-xs text-emerald-700 font-medium">5 videos</span>
                    </div>
                    <p className="text-xs text-emerald-700">Your design insights resonate. More "why" behind visuals could unlock reach.</p>
                  </div>

                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-emerald-900">Community Engagement</h4>
                      <span className="text-xs text-emerald-700 font-medium">Opportunity</span>
                    </div>
                    <p className="text-xs text-emerald-700">Responding to comments and building dialogue could amplify voice.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
