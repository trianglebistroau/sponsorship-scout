"use client";

import { ThemesCarousel } from "@/components/ThemeCarousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUserByUsername } from "@/lib/user-data";
import { Sparkles, Target, TrendingUp } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";

type CreativeDNA = {
  goals: string;
  archetype: string;
  personality: string;
  audience_tags: string[];
};

type Superpowers = {
  pathway: string;
  superpowers: Record<string, string>;
};

type GrowthZone = {
  low_performers: string;
  missed_potential: string;
};

type ProfileData = {
  username: string;
  creative_dna: CreativeDNA;
  superpowers: Superpowers;
  growth_zone: GrowthZone;
  themes?: { title: string; summary: string }[];
  follower_count?: number;
  video_count?: number;
};

// Fallback themes if none exist in profile
const FALLBACK_THEMES = [
  { title: "Creative DNA", summary: "Your unique creative identity" },
  { title: "Superpowers", summary: "What makes your content shine" },
  { title: "Growth Zones", summary: "Areas for exploration and growth" },
];

// Generic reveal item that staggers using index
function RevealItem({ 
  index, 
  animate = true, 
  mounted = true, 
  children 
}: { 
  index?: number; 
  animate?: boolean; 
  mounted?: boolean; 
  children: React.ReactNode 
}) {
  const delay = (index ?? 0) * 120;
  const duration = 420;
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

function CreativeDNASection({ 
  mounted = true, 
  data 
}: { 
  mounted?: boolean; 
  data?: CreativeDNA 
}) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      {data.archetype && (
        <RevealItem index={0} mounted={mounted}>
          <div>
            <h5 className="text-xs font-semibold text-foreground mb-2">Archetype</h5>
            <p className="text-sm text-muted-foreground">{data.archetype}</p>
          </div>
        </RevealItem>
      )}

      {data.personality && (
        <RevealItem index={1} mounted={mounted}>
          <div>
            <h5 className="text-xs font-semibold text-foreground mb-2">Personality</h5>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.personality}</p>
          </div>
        </RevealItem>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        {data.audience_tags && data.audience_tags.length > 0 && (
          <RevealItem index={2} mounted={mounted}>
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2">Audience Tags</h5>
              <div className="flex flex-wrap gap-2">
                {data.audience_tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </RevealItem>
        )}

        {data.goals && (
          <RevealItem index={3} mounted={mounted}>
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2">Goals</h5>
              <p className="text-xs text-muted-foreground">{data.goals}</p>
            </div>
          </RevealItem>
        )}
      </div>
    </div>
  );
}

function CreativeDirectionOverlay({ 
  onClose, 
  data 
}: { 
  onClose: () => void; 
  data?: CreativeDNA 
}) {
  return (
    <div
      className="absolute inset-0 z-30 p-4 rounded-tl-lg rounded-tr-lg overflow-auto bg-background"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold">Creative Direction — deep view</h3>
          <p className="text-xs text-muted-foreground">Expanded view — scroll inside this panel.</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close expanded creative direction"
        >
          Close
        </Button>
      </div>

      <div className="space-y-4 text-sm text-muted-foreground">
        {data?.goals && (
          <p>
            <strong>Goals:</strong> {data.goals}
          </p>
        )}

        {data?.audience_tags && data.audience_tags.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-2">Audience Tags</h4>
            <div className="flex flex-wrap gap-2">
              {data.audience_tags.map((tag, idx) => (
                <Badge key={idx} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dirExpanded, setDirExpanded] = React.useState(false);
  const [dirHover, setDirHover] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [overlayActive, setOverlayActive] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const username = decodeURIComponent(params.username);
        const user = await fetchUserByUsername(username);
        const data = user.recommendation_json?.data ?? user.recommendation_json;
        setProfile(data as ProfileData);
      } catch (e: any) {
        console.error("Failed to load profile:", e);
        setError("Could not load profile data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.username]);

  React.useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  const overlayVisible = dirHover || dirExpanded;
  const ENTER_DELAY = 80;

  React.useEffect(() => {
    if (overlayVisible) {
      const t = window.setTimeout(() => setOverlayActive(true), ENTER_DELAY);
      return () => window.clearTimeout(t);
    } else {
      const t = window.setTimeout(() => setOverlayActive(false), 260);
      return () => window.clearTimeout(t);
    }
  }, [overlayVisible]);

  if (loading) {
    return (
      <main className="h-screen bg-background overflow-hidden">
        <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
          <div className="flex items-center justify-center flex-1">
            <p className="text-lg text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="h-screen bg-background overflow-hidden">
        <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
          <div className="flex items-center justify-center flex-1">
            <p className="text-red-500">{error ?? "Profile not found"}</p>
          </div>
        </div>
      </main>
    );
  }

  const { creative_dna, superpowers, growth_zone, themes } = profile;
  const displayThemes = themes && themes.length > 0 ? themes : FALLBACK_THEMES;
  const displayName = profile.username ?? "Creator";

  return (
    <main className="h-screen bg-background overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
        <div className="flex h-full flex-col gap-6 overflow-y-auto lg:min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex flex-col gap-6">
            {/* Profile Header Card */}
            <Card>
              <div className="relative">
                <div className="h-32 w-full rounded-t-lg bg-gradient-to-br from-violet-100 via-pink-100 to-amber-100 dark:from-violet-950 dark:via-pink-950 dark:to-amber-950" />

                <CardContent className="relative pt-0">
                  <div className="flex flex-col items-center -mt-12 mb-4">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage src="" alt="Creator Avatar" />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-200 to-pink-200 dark:from-violet-800 dark:to-pink-800">
                        {displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="text-center space-y-3">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
                      <p className="text-sm text-muted-foreground">@{displayName}</p>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div>
                        <span className="font-semibold text-foreground">
                          {profile.follower_count?.toLocaleString() ?? 'N/A'}
                        </span>
                        <span className="text-muted-foreground ml-1">Followers</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">
                          {profile.video_count?.toLocaleString() ?? 'N/A'}
                        </span>
                        <span className="text-muted-foreground ml-1">Videos</span>
                      </div>
                    </div>

                    {creative_dna?.archetype && (
                      <div className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        {creative_dna.archetype}
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Themes Carousel - moved closer to Creative DNA */}

            {/* Creative DNA Card */}
            <Card>
            <ThemesCarousel themes={displayThemes} />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  Creative DNA
                </CardTitle>
                <CardDescription>What kind of creator you are</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <CreativeDNASection mounted={mounted} data={creative_dna} />
              </CardContent>
            </Card>
          </div>

          {/* Three Column Grid */}
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-stretch">
            {/* Creative Direction Card */}
            <Card 
              className="flex flex-col h-full relative overflow-hidden" 
              onMouseEnter={() => setDirHover(true)} 
              onMouseLeave={() => setDirHover(false)}
            >
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Creative Direction
                </CardTitle>
                <CardDescription>Where you're headed</CardDescription>
              </CardHeader>

              <CardContent className="relative flex-1 overflow-hidden min-h-0">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Core Vision</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {creative_dna?.goals || "Crafting content that resonates with your unique audience."}
                  </p>
                </div>

                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDirExpanded(true)} 
                    className="w-full justify-start gap-2 text-xs h-8"
                  >
                    Open detailed direction
                  </Button>
                </div>

                {overlayActive && (
                  <div className="absolute inset-0 z-30 pointer-events-none" aria-hidden={!overlayVisible}>
                    <div 
                      className={`absolute inset-0 transition-opacity duration-200 bg-background/95 ${
                        overlayVisible ? "opacity-100" : "opacity-0"
                      }`} 
                    />

                    <div 
                      className="absolute inset-0 p-4 rounded-tl-lg rounded-tr-lg overflow-auto transition-all duration-420 ease-[cubic-bezier(.2,.9,.2,1)]"
                      style={{ 
                        transform: overlayVisible ? "translateY(0) scale(1)" : "translateY(12px) scale(.96)", 
                        opacity: overlayVisible ? 1 : 0, 
                        pointerEvents: overlayVisible ? "auto" : "none", 
                        willChange: "transform, opacity" 
                      }}
                    >
                      <CreativeDirectionOverlay 
                        onClose={() => { 
                          setDirExpanded(false); 
                          setDirHover(false); 
                        }} 
                        data={creative_dna} 
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Superpowers Card */}
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
                  {superpowers?.superpowers && Object.keys(superpowers.superpowers).length > 0 ? (
                    Object.entries(superpowers.superpowers).map(([title, description]) => (
                      <div 
                        key={title} 
                        className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-3"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">{title}</h4>
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-300">{description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-3">
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Creative Excellence</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300">Your unique creative strengths</p>
                    </div>
                  )}
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
                <CardDescription>Areas with untapped potential</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 min-h-0">
                <div className="space-y-2">
                  {growth_zone?.missed_potential && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Missed Potential</h4>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">{growth_zone.missed_potential}</p>
                    </div>
                  )}

                  {growth_zone?.low_performers && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Format Alignment</h4>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">{growth_zone.low_performers}</p>
                    </div>
                  )}

                  {!growth_zone?.missed_potential && !growth_zone?.low_performers && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 p-3">
                      <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Exploration Areas</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">New formats and content styles to explore</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
