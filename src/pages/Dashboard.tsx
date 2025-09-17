import { PersonaProfile } from "@/components/PersonaProfile";
import { ProgressionLadder } from "@/components/ProgressionLadder";
import { VideoCarousel } from "@/components/VideoCarousel";
import { SponsorshipRadar } from "@/components/SponsorshipRadar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Your Creator Journey
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your personalized roadmap to brand sponsorships.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <PersonaProfile 
                persona={{
                  type: "The Tastemaker",
                  icon: "✨",
                  strengths: ["Aesthetic vision", "Visual storytelling", "Trend awareness", "Aspirational content"],
                  improvements: ["Posting consistency", "Brand collaboration", "Audience engagement"]
                }}
              />
              <VideoCarousel />
            </div>
            
            <div className="space-y-8">
              <ProgressionLadder 
                progression={{
                  currentStage: "Emerging Creator",
                  currentFollowers: 850,
                  nextStage: "Niche Builder",
                  nextMilestone: 1000,
                  pathways: ["Post consistently", "Use trending sounds", "Engage with community"]
                }}
              />
              <SponsorshipRadar score={65} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;