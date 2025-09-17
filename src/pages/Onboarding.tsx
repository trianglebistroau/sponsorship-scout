'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { User, Users, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [profileLink, setProfileLink] = useState("");
  const [creatorLinks, setCreatorLinks] = useState(["", "", ""]);
  const [brandLinks, setBrandLinks] = useState(["", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleCreatorLinkChange = (index: number, value: string) => {
    const newLinks = [...creatorLinks];
    newLinks[index] = value;
    setCreatorLinks(newLinks);
  };

  const handleBrandLinkChange = (index: number, value: string) => {
    const newLinks = [...brandLinks];
    newLinks[index] = value;
    setBrandLinks(newLinks);
  };

  const renderStep1 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <User className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Paste your TikTok profile</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We'll spot what's working (and what's not) so you can double down on the good stuff. Think of it as a vibe check
      </p>
      
      <div className="max-w-md mx-auto">
        <Label htmlFor="profile-link">TikTok Profile Link</Label>
        <Input
          id="profile-link"
          placeholder="https://www.tiktok.com/@username"
          value={profileLink}
          onChange={(e) => setProfileLink(e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <Users className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Drop 3 Creators You Vibe With</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We'll decode your favourite TikTokers' secret sauce so you can borrow their tricks (without copying) and boost your own growth
      </p>
      
      <div className="space-y-4 max-w-md mx-auto">
        {creatorLinks.map((link, index) => (
          <div key={index}>
            <Label htmlFor={`creator-${index}`}>Creator {index + 1}</Label>
            <Input
              id={`creator-${index}`}
              placeholder="https://www.tiktok.com/@creator"
              value={link}
              onChange={(e) => handleCreatorLinkChange(index, e.target.value)}
              className="mt-1"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <Tag className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Name 3 Brands You Want</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We'll highlight what content styles they're into, and how you can align your posts so they can't help but notice you.
      </p>
      
      <div className="space-y-4 max-w-md mx-auto">
        {brandLinks.map((link, index) => (
          <div key={index}>
            <Label htmlFor={`brand-${index}`}>Brand {index + 1}</Label>
            <Input
              id={`brand-${index}`}
              placeholder="Brand name or website"
              value={link}
              onChange={(e) => handleBrandLinkChange(index, e.target.value)}
              className="mt-1"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderLoadingPage = () => (
    <div className="text-center animate-slideUp">
      <div className="w-24 h-24 mx-auto mb-8">
        <div className="text-6xl animate-spin">⏳</div>
      </div>
      <p className="text-xl text-muted-foreground max-w-lg mx-auto">
        We're crunching the numbers, brewing ideas, and sprinkling a little creator fairy dust. Grab a snack, this won't take long. 🍿
      </p>
    </div>
  );

  const canProceed = () => {
    if (step === 1) return profileLink.trim();
    if (step === 2) return creatorLinks.some(link => link.trim());
    if (step === 3) return brandLinks.some(link => link.trim());
    return true;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      // Simulate loading for 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
  };

  const getStepTitle = () => {
    const titles = ["Your Profile Link", "Creators You Love", "Dream Brands"];
    return titles[step - 1] || "Loading";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6">
          <Card className="p-12 shadow-soft">
            {renderLoadingPage()}
          </Card>
        </div>
      </div>
    );
  }

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
          </Card>

          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-primary hover:opacity-90"
            >
              {step === 3 ? "Analyze My Profile" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;