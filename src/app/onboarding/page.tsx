'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Brain, Sparkles, CheckCircle, Camera, Mic, Palette, Heart, Trophy, Users, Lightbulb, Star, Zap, Clock, Target, Video, Gamepad2 } from "lucide-react";
import { useRouter } from "next/navigation";

const creatorArchetypes = {
  entertainer: { 
    name: "The Entertainer", 
    icon: "🎭", 
    emoji: Zap, 
    color: "text-orange-500",
    description: "You bring energy and laughter to everything you create. Your chaotic, fun personality draws people in and keeps them engaged.",
    strengths: ["Natural comedic timing", "High energy content", "Viral potential", "Engaging personality"],
    path: "Viral-first → brand collabs in lifestyle, gaming, entertainment"
  },
  teacher: { 
    name: "The Teacher", 
    icon: "📚", 
    emoji: Lightbulb, 
    color: "text-blue-500",
    description: "You have a gift for breaking down complex topics and helping others learn. Your authority and expertise shine through.",
    strengths: ["Clear communication", "Educational value", "Authority building", "Problem-solving focus"],
    path: "Build trust → sponsors in education, tech, productivity, tools"
  },
  tastemaker: { 
    name: "The Tastemaker", 
    icon: "✨", 
    emoji: Star, 
    color: "text-purple-500",
    description: "You have an eye for beauty and style. Your aesthetic sense and curation skills inspire others to elevate their lives.",
    strengths: ["Aesthetic vision", "Trendsetting ability", "Visual storytelling", "Aspirational content"],
    path: "Build aspirational following → brand collabs in beauty, luxury, F&B"
  },
  friend: { 
    name: "The Relatable Friend", 
    icon: "🤝", 
    emoji: Heart, 
    color: "text-pink-500",
    description: "You're the creator people feel like they know personally. Your authenticity and relatability build deep connections.",
    strengths: ["Authentic storytelling", "Emotional connection", "Community building", "Trustworthy presence"],
    path: "Community-first → sponsors in consumer goods, relatable lifestyle brands"
  },
  challenger: { 
    name: "The Challenger", 
    icon: "⚡", 
    emoji: Trophy, 
    color: "text-green-500",
    description: "You motivate others to push their limits and achieve more. Your drive and determination are infectious.",
    strengths: ["Motivational content", "Achievement-focused", "Transformation stories", "High engagement"],
    path: "Achievement-driven → sportswear, wellness, health sponsors"
  }
};

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [videoLinks, setVideoLinks] = useState(["", "", ""]);
  const [surveyAnswers, setSurveyAnswers] = useState({
    motivation: "",
    success: "",
    onCamera: "",
    editingStyle: "",
    personality: "",
    audience: "",
    postingFreq: "",
    aiHelp: ""
  });
  const [creatorType, setCreatorType] = useState("");
  const router = useRouter();
  // const navigate = useNavigate();

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  const handleVideoLinkChange = (index: number, value: string) => {
    const newLinks = [...videoLinks];
    newLinks[index] = value;
    setVideoLinks(newLinks);
  };

  const handleSurveyAnswer = (key: string, value: string) => {
    setSurveyAnswers({ ...surveyAnswers, [key]: value });
  };

  const calculateCreatorType = () => {
    const answers = surveyAnswers;
    let scores = {
      entertainer: 0,
      teacher: 0,
      tastemaker: 0,
      friend: 0,
      challenger: 0
    };

    // Score based on motivation
    if (answers.motivation === "entertainment") scores.entertainer += 2;
    if (answers.motivation === "education") scores.teacher += 2;
    if (answers.motivation === "community") scores.friend += 2;
    if (answers.motivation === "income") scores.tastemaker += 1;

    // Score based on personality
    if (answers.personality === "funny") scores.entertainer += 2;
    if (answers.personality === "informative") scores.teacher += 2;
    if (answers.personality === "aesthetic") scores.tastemaker += 2;
    if (answers.personality === "relatable") scores.friend += 2;
    if (answers.personality === "inspiring") scores.challenger += 2;

    // Score based on editing style
    if (answers.editingStyle === "high-energy") scores.entertainer += 1;
    if (answers.editingStyle === "cinematic") scores.tastemaker += 1;
    if (answers.editingStyle === "raw") scores.friend += 1;

    // Find the highest scoring archetype
    const topType = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    setCreatorType(topType);
  };

  const renderStep1 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <Upload className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Share Your Best Content</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Paste links to 3-5 of your recent TikTok or Instagram videos so we can analyze your style
      </p>
      
      <div className="space-y-4 max-w-md mx-auto">
        {videoLinks.map((link, index) => (
          <div key={index}>
            <Label htmlFor={`video-${index}`}>Video {index + 1}</Label>
            <Input
              id={`video-${index}`}
              placeholder="https://www.tiktok.com/@username/video/..."
              value={link}
              onChange={(e) => handleVideoLinkChange(index, e.target.value)}
              className="mt-1"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <Target className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">What Drives You?</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Understanding your motivation helps us craft the perfect creator path
      </p>
      
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {[
          { key: "community", label: "Build Community", icon: Users },
          { key: "income", label: "Earn Income", icon: Target },
          { key: "education", label: "Share Knowledge", icon: Lightbulb },
          { key: "entertainment", label: "Entertainment/Fun", icon: Heart }
        ].map((option) => (
          <Button
            key={option.key}
            variant={surveyAnswers.motivation === option.key ? "default" : "outline"}
            onClick={() => handleSurveyAnswer("motivation", option.key)}
            className="h-20 flex flex-col gap-2 hover-scale"
          >
            <option.icon className="w-6 h-6" />
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-6">
        <Trophy className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Define Success</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        What would success look like in 6 months?
      </p>
      
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {[
          { key: "followers", label: "10k Followers", icon: Users },
          { key: "collab", label: "First Brand Collab", icon: Sparkles },
          { key: "community", label: "Loyal Fan Community", icon: Heart },
          { key: "viral", label: "Viral Video Moment", icon: Zap }
        ].map((option) => (
          <Button
            key={option.key}
            variant={surveyAnswers.success === option.key ? "default" : "outline"}
            onClick={() => handleSurveyAnswer("success", option.key)}
            className="h-20 flex flex-col gap-2 hover-scale"
          >
            <option.icon className="w-6 h-6" />
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <Camera className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Camera Comfort</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        How comfortable are you being on camera?
      </p>
      
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {[
          { key: "love-camera", label: "Love being on camera", icon: Camera },
          { key: "voiceover", label: "Prefer voiceover only", icon: Mic },
          { key: "product", label: "Product/aesthetic focused", icon: Palette }
        ].map((option) => (
          <Button
            key={option.key}
            variant={surveyAnswers.onCamera === option.key ? "default" : "outline"}
            onClick={() => handleSurveyAnswer("onCamera", option.key)}
            className="h-16 flex items-center justify-start gap-4 hover-scale"
          >
            <option.icon className="w-5 h-5" />
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-6">
        <Video className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Editing Vibe</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        What's your preferred editing style?
      </p>
      
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {[
          { key: "cinematic", label: "Polished & Cinematic", icon: Star },
          { key: "high-energy", label: "Fast Cuts, High Energy", icon: Zap },
          { key: "raw", label: "Raw & Authentic", icon: Heart },
          { key: "playful", label: "Playful & Meme-y", icon: Gamepad2 }
        ].map((option) => (
          <Button
            key={option.key}
            variant={surveyAnswers.editingStyle === option.key ? "default" : "outline"}
            onClick={() => handleSurveyAnswer("editingStyle", option.key)}
            className="h-20 flex flex-col gap-2 hover-scale"
          >
            <option.icon className="w-6 h-6" />
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <Brain className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Your Vibe Check</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        How would your friends describe you?
      </p>
      
      <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
        {[
          { key: "funny", label: "Funny & Entertaining", icon: Zap },
          { key: "inspiring", label: "Inspiring & Motivational", icon: Trophy },
          { key: "informative", label: "Informative & Helpful", icon: Lightbulb },
          { key: "aesthetic", label: "Aesthetic & Stylish", icon: Star },
          { key: "relatable", label: "Relatable & Down-to-earth", icon: Heart }
        ].map((option) => (
          <Button
            key={option.key}
            variant={surveyAnswers.personality === option.key ? "default" : "outline"}
            onClick={() => handleSurveyAnswer("personality", option.key)}
            className="h-16 flex items-center justify-start gap-4 hover-scale"
          >
            <option.icon className="w-5 h-5" />
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-white animate-glow" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Analyzing Your Creator Identity</h2>
      <p className="text-muted-foreground mb-8">
        We're analyzing your responses and building your personalized creator profile...
      </p>
      
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-success" />
          <span>Processing personality traits</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-success" />
          <span>Matching creator archetype</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Building your roadmap</span>
        </div>
      </div>
      
      <div className="mt-8">
        <Progress value={90} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">Your Creator Identity is loading...</p>
      </div>
    </div>
  );

  const renderStep8 = () => {
    const archetype = creatorArchetypes[creatorType as keyof typeof creatorArchetypes];
    if (!archetype) return null;

    return (
      <div className="text-center animate-slideUp">
        <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
          <span className="text-4xl">{archetype.icon}</span>
        </div>
        <h2 className="text-4xl font-bold mb-4">
          You are: <span className={archetype.color}>{archetype.name}</span>
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
          {archetype.description}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
          <div className="bg-success/10 p-6 rounded-lg">
            <h3 className="font-semibold mb-4 text-success flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Your Superpowers
            </h3>
            <ul className="space-y-2 text-sm">
              {archetype.strengths.map((strength, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/10 p-6 rounded-lg">
            <h3 className="font-semibold mb-4 text-primary flex items-center gap-2">
              <Target className="w-4 h-4" />
              Your Path to Success
            </h3>
            <p className="text-sm">{archetype.path}</p>
          </div>
        </div>

        <div className="bg-gradient-card p-6 rounded-lg border">
          <h4 className="font-semibold mb-2">🎯 Ready to unlock your creator potential?</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Let's build your personalized roadmap to brand sponsorships
          </p>
        </div>
      </div>
    );
  };

  const canProceed = () => {
    if (step === 1) return videoLinks.some(link => link.trim());
    if (step === 2) return surveyAnswers.motivation;
    if (step === 3) return surveyAnswers.success;
    if (step === 4) return surveyAnswers.onCamera;
    if (step === 5) return surveyAnswers.editingStyle;
    if (step === 6) return surveyAnswers.personality;
    return true;
  };

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1);
    } else if (step === 7) {
      calculateCreatorType();
      setStep(8);
    } else {
      setTimeout(() => router.push('/dashboard'), 1500);
    }
  };

  const getStepTitle = () => {
    const titles = [
      "Share Content", "Your Drive", "Success Goals", "Camera Style", 
      "Editing Vibe", "Personality", "Analysis", "Your Identity"
    ];
    return titles[step - 1] || "Creator Quiz";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Progress value={progress} className="h-3 mb-4" />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
              <p className="text-sm font-medium text-primary">{getStepTitle()}</p>
            </div>
          </div>

          <Card className="p-8 shadow-soft">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
            {step === 6 && renderStep6()}
            {step === 7 && renderStep7()}
            {step === 8 && renderStep8()}
          </Card>

          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1 || step === 7}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-primary hover:opacity-90"
            >
              {step === 7 ? "Reveal My Identity!" : step === 8 ? "Enter Dashboard" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;