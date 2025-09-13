import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PersonaProfile } from "@/components/PersonaProfile";
import { ProgressionLadder } from "@/components/ProgressionLadder";
import { VideoCarousel } from "@/components/VideoCarousel";
import { SponsorshipRadar } from "@/components/SponsorshipRadar";
import { Sparkles, TrendingUp, Users, Award } from "lucide-react";

const Dashboard = () => {
  const creatorData = {
    persona: {
      type: "The Wholesome Teacher",
      icon: "👩‍🏫",
      strengths: ["Engaging hooks", "Clear explanations", "Authentic personality"],
      improvements: ["Trend adoption", "Brand integration", "Call-to-actions"]
    },
    progression: {
      currentStage: "Emerging Creator",
      currentFollowers: 850,
      nextStage: "Niche Builder",
      nextMilestone: 1000,
      pathways: [
        "Post consistently for 2 weeks",
        "Try 3 trending sounds",
        "Create mini brand-style ads"
      ]
    },
    sponsorshipScore: 42,
    badges: ["First Trend Collab", "Consistency Streak"]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Creator! 🌟</h1>
              <p className="text-white/80">Let's continue building your path to brand partnerships</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{creatorData.sponsorshipScore}%</div>
              <div className="text-sm text-white/80">Brand Ready</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center bg-gradient-card shadow-soft">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{creatorData.progression.currentFollowers}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-card shadow-soft">
            <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold">+12%</div>
            <div className="text-sm text-muted-foreground">Growth Rate</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-card shadow-soft">
            <Award className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold">{creatorData.badges.length}</div>
            <div className="text-sm text-muted-foreground">Badges Earned</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-card shadow-soft">
            <Sparkles className="w-8 h-8 text-primary-glow mx-auto mb-2" />
            <div className="text-2xl font-bold">7</div>
            <div className="text-sm text-muted-foreground">Days Streak</div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <PersonaProfile persona={creatorData.persona} />
            <VideoCarousel />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ProgressionLadder progression={creatorData.progression} />
            <SponsorshipRadar score={creatorData.sponsorshipScore} />
            
            {/* Badges */}
            <Card className="p-6 shadow-soft">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-warning" />
                Your Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {creatorData.badges.map((badge, index) => (
                  <Badge key={index} variant="outline" className="bg-success/10 text-success border-success/30">
                    {badge}
                  </Badge>
                ))}
                <Badge variant="outline" className="border-dashed border-muted-foreground/30 text-muted-foreground">
                  Brand Ready 50% +
                </Badge>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 p-6 bg-gradient-primary rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-1">Ready for your next video?</h3>
              <p className="text-white/80">You're on track to hit 1K followers this month!</p>
            </div>
            <Button className="bg-white text-primary hover:bg-white/90 font-semibold">
              Create Next Video
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;