"use client";

import { supabase } from "@/utils/supabase/client";
import { Sparkles, Target, TrendingUp } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";
import ReactMarkdown from "react-markdown";

import { GeneratorNav } from "@/components/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemesCarousel } from "@/components/ThemeCarousel";

interface UserProfile {
  created_at: string;
  username: string;
  likeCount: number | null;
  followerCount: number | null;
  videoCount: number | null;
  viewCount: number | null;
  content_profile: any;
  content_analysis: any;
  profile_analysis: any;
  recommendation: string | null;
  element_strength: any;
}

interface ParsedRecommendation {
  creativeDNA?: {
    archetype?: string;
    personality?: string;
    audienceTags?: string[];
    goals?: string;
  };
  superpowers?: {
    pathway?: string;
    items?: Array<{ title: string; description: string }>;
  };
  growthZone?: {
    missedPotential?: string;
    lowPerformer?: string;
  };
  nextMoves?: {
    tags?: string[];
    brandingStatement?: string;
  };
  ideas?: Array<{
    title: string;
    effort?: string;
    uniqueness?: string;
    format?: string;
    hook?: string;
    examples?: string[];
  }>;
}

function parseRecommendation(text: string | null): ParsedRecommendation {
  if (!text) return {};

  const result: ParsedRecommendation = {};

  // Parse Creative DNA
  const creativeDNAMatch = text.match(/# Creative DNA:([\s\S]*?)(?=\n---|\n# |$)/);
  if (creativeDNAMatch) {
    const section = creativeDNAMatch[1];
    const archetypeMatch = section.match(/Archetype:\s*(.+)/);
    const personalityMatch = section.match(/Personality:\s*(.+)/);
    const audienceMatch = section.match(/Audience Tags:\s*(.+)/);
    const goalsMatch = section.match(/Goals:\s*(.+)/);

    result.creativeDNA = {
      archetype: archetypeMatch?.[1].trim(),
      personality: personalityMatch?.[1].trim(),
      audienceTags: audienceMatch?.[1].split(',').map(tag => tag.trim()),
      goals: goalsMatch?.[1].trim(),
    };
  }

  // Parse Superpowers
  const superpowersMatch = text.match(/# Superpowers:([\s\S]*?)(?=\n---|\n# |$)/);
  if (superpowersMatch) {
    const section = superpowersMatch[1];
    const pathwayMatch = section.match(/Pathway:\s*(.+)/);
    const items: Array<{ title: string; description: string }> = [];
    
    const itemMatches = section.matchAll(/- (.+?):\s*(.+?)(?=\n-|\n\n|$)/gs);
    for (const match of itemMatches) {
      items.push({
        title: match[1].trim(),
        description: match[2].trim(),
      });
    }

    result.superpowers = {
      pathway: pathwayMatch?.[1].trim(),
      items,
    };
  }

  // Parse Growth Zone
  const growthZoneMatch = text.match(/# Growth zone([\s\S]*?)(?=\n---|\n# |$)/);
  if (growthZoneMatch) {
    const section = growthZoneMatch[1];
    const missedMatch = section.match(/Missed Potential:\s*(.+)/);
    const lowPerformerMatch = section.match(/Low Performer:\s*(.+)/);

    result.growthZone = {
      missedPotential: missedMatch?.[1].trim(),
      lowPerformer: lowPerformerMatch?.[1].trim(),
    };
  }

  // Parse Next Moves
  const nextMovesMatch = text.match(/# Next Moves:([\s\S]*?)(?=\n---|\n# |$)/);
  if (nextMovesMatch) {
    const section = nextMovesMatch[1];
    const tagsMatch = section.match(/Tags:\s*(.+)/);
    const brandingMatch = section.match(/Branding Statement:\s*(.+)/);

    result.nextMoves = {
      tags: tagsMatch?.[1].split(',').map(tag => tag.trim()),
      brandingStatement: brandingMatch?.[1].trim(),
    };
  }

  // Parse Ideas
  const ideasMatch = text.match(/# Ideas:([\s\S]*?)$/);
  if (ideasMatch) {
    const section = ideasMatch[1];
    const ideas: Array<{
      title: string;
      effort?: string;
      uniqueness?: string;
      format?: string;
      hook?: string;
      examples?: string[];
    }> = [];

    const ideaBlocks = section.split(/\n- /).slice(1);
    for (const block of ideaBlocks) {
      const titleMatch = block.match(/^(.+?)\s*\(/);
      const effortMatch = block.match(/Effort:\s*(\w+)/);
      const uniquenessMatch = block.match(/Uniqueness:\s*(\w+)/);
      const formatMatch = block.match(/Format:\s*(.+?)(?=\n|$)/);
      const hookMatch = block.match(/Hook:\s*(.+?)(?=\n|$)/);
      
      const examplesMatch = block.match(/Examples:([\s\S]*?)(?=\n-|\n\n|$)/);
      let examples: string[] = [];
      if (examplesMatch) {
        examples = examplesMatch[1]
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^\s*-?\s*/, '').trim());
      }

      ideas.push({
        title: titleMatch?.[1].trim() || '',
        effort: effortMatch?.[1],
        uniqueness: uniquenessMatch?.[1],
        format: formatMatch?.[1].trim(),
        hook: hookMatch?.[1].trim(),
        examples: examples.filter(e => e.length > 0),
      });
    }

    result.ideas = ideas;
  }

  return result;
}

const THEMES = [
  {
    title: "Social Awkwardness as Comedy",
    summary: "Everyday interactions made funny by discomfort, pauses, and misreads.",
  },
  {
    title: "Cultural POVs Without Explanation",
    summary: "You don't teach culture — you show it and let the audience catch up.",
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

// Generic reveal item that staggers using index
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

function CreativeDNA({ mounted = true, data }: { mounted?: boolean; data?: ParsedRecommendation['creativeDNA'] }) {
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
        {data.audienceTags && data.audienceTags.length > 0 && (
          <RevealItem index={2} mounted={mounted}>
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2">Audience Tags</h5>
              <div className="flex flex-wrap gap-2">
                {data.audienceTags.map((tag, idx) => (
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

function CreativeDirectionOverlay({ onClose, data }: { onClose: () => void; data?: ParsedRecommendation['nextMoves'] }) {
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
        {data?.brandingStatement && (
          <p>
            <strong>Branding Statement:</strong> {data.brandingStatement}
          </p>
        )}

        {data?.tags && data.tags.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag, idx) => (
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
  const params = useParams();
  const username = params.id as string;
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [parsedData, setParsedData] = React.useState<ParsedRecommendation>({});
  
  const [dirExpanded, setDirExpanded] = React.useState(false);
  const [dirHover, setDirHover] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [overlayActive, setOverlayActive] = React.useState(false);
  
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('User')
          .select('*')
          .eq('username', username)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setUser(data);
        setParsedData(parseRecommendation(data.recommendation));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user profile');
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);
  
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
          <GeneratorNav />
          <div className="flex items-center justify-center flex-1">
            <p className="text-lg text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="h-screen bg-background overflow-hidden">
        <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
          <GeneratorNav />
          <div className="flex items-center justify-center flex-1">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="h-screen bg-background overflow-hidden">
        <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
          <GeneratorNav />
          <div className="flex items-center justify-center flex-1">
            <p className="text-lg text-muted-foreground">User not found</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-background overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
        <GeneratorNav />

        <div className="flex h-full flex-col gap-6 overflow-y-auto lg:min-h-0">
          <div className="flex flex-col gap-6">
            <Card>
              <div className="relative">
                <div className="h-32 w-full rounded-t-lg bg-gradient-to-br from-violet-100 via-pink-100 to-amber-100 dark:from-violet-950 dark:via-pink-950 dark:to-amber-950" />

                <CardContent className="relative pt-0">
                  <div className="flex flex-col items-center -mt-12 mb-4">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage src="" alt="Creator Avatar" />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-200 to-pink-200 dark:from-violet-800 dark:to-pink-800">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="text-center space-y-3">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">{user.username}</h1>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div>
                        <span className="font-semibold text-foreground">
                          {user.followerCount ? user.followerCount.toLocaleString() : 'N/A'}
                        </span>
                        <span className="text-muted-foreground ml-1">Followers</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">
                          {user.videoCount ? user.videoCount.toLocaleString() : 'N/A'}
                        </span>
                        <span className="text-muted-foreground ml-1">Videos</span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed prose prose-sm dark:prose-invert">
                      <ReactMarkdown>
                        {parsedData.nextMoves?.brandingStatement || "No recommendation available."}
                      </ReactMarkdown>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  Creative DNA
                </CardTitle>
                <CardDescription>What kind of creator you are</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <CreativeDNA mounted={mounted} data={parsedData.creativeDNA} />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-stretch">
            <Card className="flex flex-col h-full relative overflow-hidden" onMouseEnter={() => setDirHover(true)} onMouseLeave={() => setDirHover(false)}>
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
                    {parsedData.nextMoves?.brandingStatement || "Making everyday life feel visually intentional through calm storytelling."}
                  </p>
                </div>

                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => setDirExpanded(true)} className="w-full justify-start gap-2 text-xs h-8">Open detailed direction</Button>
                </div>

                {overlayActive && (
                  <div className="absolute inset-0 z-30 pointer-events-none" aria-hidden={!overlayVisible}>
                    <div className={`absolute inset-0 transition-opacity duration-200 bg-background/95 ${overlayVisible ? "opacity-100" : "opacity-0"}`}  />

                    <div className={`absolute inset-0 p-4 rounded-tl-lg rounded-tr-lg overflow-auto transition-all duration-420 ease-[cubic-bezier(.2,.9,.2,1)]`}
                    style={{ transform: overlayVisible ? "translateY(0) scale(1)" : "translateY(12px) scale(.96)", opacity: overlayVisible ? 1 : 0, pointerEvents: overlayVisible ? "auto" : "none", willChange: "transform, opacity" }}>
                      <CreativeDirectionOverlay onClose={() => { setDirExpanded(false); setDirHover(false); }} data={parsedData.nextMoves} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

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
                  {parsedData.superpowers?.items && parsedData.superpowers.items.length > 0 ? (
                    parsedData.superpowers.items.map((item, idx) => (
                      <div key={idx} className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">{item.title}</h4>
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-300">{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <h4 className="text-sm font-semibold text-amber-900">Visual Storytelling</h4>
                        <p className="text-xs text-amber-700">Eye-catching visuals that stop the scroll.</p>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <h4 className="text-sm font-semibold text-amber-900">Consistent Pacing</h4>
                        <p className="text-xs text-amber-700">Calm, intentional rhythm.</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

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
                  {parsedData.growthZone?.missedPotential && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Missed Potential</h4>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">{parsedData.growthZone.missedPotential}</p>
                    </div>
                  )}

                  {parsedData.growthZone?.lowPerformer && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Format Alignment</h4>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">{parsedData.growthZone.lowPerformer}</p>
                    </div>
                  )}

                  {!parsedData.growthZone && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <h4 className="text-sm font-semibold text-emerald-900">Camera-Facing Content</h4>
                      <p className="text-xs text-emerald-700">Early experiments show promise.</p>
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
