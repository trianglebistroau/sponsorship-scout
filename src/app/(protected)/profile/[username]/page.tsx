"use client";

import { ThemesCarousel } from "@/components/ThemeCarousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Creative DNA Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  Creative DNA
                </CardTitle>
                <CardDescription>Your creative identity layers</CardDescription>
              </CardHeader>

              <CardContent>
                {/* Dynamic Identity Cards - primary content */}
                <div className="flex justify-center items-center py-2">
                  <div className="w-full max-w-2xl mx-auto px-2">
                    <ThemesCarousel themes={displayThemes} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Three Column Grid */}
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-stretch">
            {/* Creative Direction Card */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Creative Direction
                </CardTitle>
                <CardDescription>Where you're headed</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-3 min-h-0">
                {creative_dna?.goals && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 p-3">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Core Vision</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">{creative_dna.goals}</p>
                  </div>
                )}

                {creative_dna?.audience_tags && creative_dna.audience_tags.length > 0 && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 p-3">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Target Audience</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {creative_dna.audience_tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {!creative_dna?.goals && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 p-3">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Strategic Focus</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Crafting content that resonates with your unique audience.</p>
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
