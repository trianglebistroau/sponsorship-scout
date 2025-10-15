import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase } from "@/utils/supabase/client"
import { Clock, Eye, Sparkles, TrendingUp, Video } from "lucide-react"

const videoIdeas = [
  {
    id: 1,
    title: "POV: First time trying viral ramen hack",
    hook: "Everyone's doing this wrong...",
    description:
      "Show the trending butter-sizzle technique with cinematic close-ups",
    category: "Food Trend",
    estimatedViews: "50K-100K",
    difficulty: "Easy",
    trendScore: 95,
  },
  {
    id: 2,
    title: "Teaching math with everyday objects",
    hook: "Why math teachers don't show you this",
    description: "Use household items to explain complex concepts simply",
    category: "Educational",
    estimatedViews: "25K-75K",
    difficulty: "Medium",
    trendScore: 78,
  },
  {
    id: 3,
    title: "Rating student excuses (teacher POV)",
    hook: "As a teacher, here's what we really think",
    description: "React to common student excuses with humor and honesty",
    category: "Comedy",
    estimatedViews: "75K-150K",
    difficulty: "Easy",
    trendScore: 88,
  },
  {
    id: 4,
    title: "Brand collab: Organizing supplies aesthetic",
    hook: "How I organize 200+ students' work",
    description:
      "Partner with organization brand to showcase classroom systems",
    category: "Brand Ready",
    estimatedViews: "30K-60K",
    difficulty: "Medium",
    trendScore: 82,
    brandReady: true,
  },
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "text-success bg-success/10 border-success/30"
    case "Medium":
      return "text-warning bg-warning/10 border-warning/30"
    case "Hard":
      return "text-destructive bg-destructive/10 border-destructive/30"
    default:
      return "text-muted-foreground bg-muted/10 border-muted/30"
  }
}

export function VideoCarousel(){
  return (
    <Card className="p-6 shadow-soft bg-gradient-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Your Next 10 Videos
        </h2>
        <Button variant="outline" size="sm">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate More Ideas
        </Button>
      </div>

      <div className="grid gap-4">
        {videoIdeas.map((video, index) => (
          <Card
            key={video.id}
            className="p-4 bg-background border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-soft"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold">{index + 1}.</span>
                  <h3 className="font-semibold text-foreground">
                    {video.title}
                  </h3>
                  {video.brandReady && (
                    <Badge className="bg-gradient-success text-white text-xs">
                      Brand Ready
                    </Badge>
                  )}
                </div>
                <p className="text-primary font-medium text-sm mb-2">
                  "{video.hook}"
                </p>
                <p className="text-muted-foreground text-sm">
                  {video.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-warning ml-4">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">{video.trendScore}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{video.estimatedViews}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{video.category}</span>
                </div>
                <Badge
                  variant="outline"
                  className={getDifficultyColor(video.difficulty)}
                >
                  {video.difficulty}
                </Badge>
              </div>

              <Button
                size="sm"
                className="bg-gradient-primary hover:opacity-90"
              >
                Generate in Veo
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary animate-glow" />
          <div>
            <p className="font-medium text-sm">Pro Tip</p>
            <p className="text-xs text-muted-foreground">
              Videos marked "Brand Ready" are perfect for showcasing to
              potential sponsors
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
