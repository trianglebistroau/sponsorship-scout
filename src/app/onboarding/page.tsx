"use client";
import { Hourglass } from "@/components/Hourglass";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Handshake, Tags, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

//Really need to clean this file up later
const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [userTikTokProfile, setUserTikTokProfile] = useState("");
  const [userTopCreators, setUserTopCreators] = useState(["", "", ""]);
  const [userDreamBrands, setUserDreamBrands] = useState(["", "", ""]);

  const router = useRouter();

  const totalSteps = 3; //3 steps shown + 1 loading step but hidden from progress bar
  const progress = (step / totalSteps) * 100;

  const handleVideoLinkChange = (value: string) => {
    setUserTikTokProfile(value);
  };

  const handleTopCreatorChange = (index: number, value: string) => {
    const updatedCreators = [...userTopCreators];
    updatedCreators[index] = value;
    setUserTopCreators(updatedCreators);
  };

  const handleDreamBrandChange = (index: number, value: string) => {
    const updatedBrands = [...userDreamBrands];
    updatedBrands[index] = value;
    setUserDreamBrands(updatedBrands);
  };

  const renderStep1 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <User className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Share Your Site</h2>
      <></>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Paste link to your TikTok profile so we can analyse your style
      </p>

      <div className="space-y-4 max-w-md mx-auto">
        <div>
          <Label htmlFor={`tiktok-profile`}>Your TikTok Profile</Label>
          <Input
            id={`tiktok-profile`}
            placeholder="https://www.tiktok.com/@username/video/..."
            value={userTikTokProfile}
            onChange={(e) => handleVideoLinkChange(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="text-center animate-slideUp">
      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <Handshake className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Drop 3 Creators You Vibe With</h2>
      <></>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We’ll decode your favourite TikTokers’ secret sauce so you can borrow
        their tricks (without copying) and boost your own growth.
      </p>

      <div className="space-y-4 max-w-md mx-auto">
        {userTopCreators.map((creator, index) => (
          <div key={index}>
            <Label htmlFor={`creator-${index}`}>Creator {index + 1}</Label>
            <Input
              id={`creator-${index}`}
              placeholder="https://www.tiktok.com/@username"
              value={creator}
              onChange={(e) => handleTopCreatorChange(index, e.target.value)}
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
        <Tags className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Name 3 Brands You Want</h2>
      <></>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We’ll highlight what content styles they’re into, and how you can align
        your posts so they can’t help but notice you.
      </p>

      <div className="space-y-4 max-w-md mx-auto">
        {userDreamBrands.map((brand, index) => (
          <div key={index}>
            <Label htmlFor={`brand-${index}`}>Brand {index + 1}</Label>
            <Input
              id={`brand-${index}`}
              placeholder="https://www.tiktok.com/@username"
              value={brand}
              onChange={(e) => handleDreamBrandChange(index, e.target.value)}
              className="mt-1"
            />
          </div>
        ))}
      </div>
    </div>
  );

  //This is Loading Page step. Keep this
  const renderStep4 = () => (
    <div className="text-center animate-slideUp">
      <div className="rounded-full flex items-center justify-center mx-auto mb-6">
        {/* For colors, first one is for the hourglass, second is for the sand */}
        <Hourglass wrapperClass="w-16 h-16" colors={["#7a40dd", "#7a40dd"]} />
      </div>
      <p className="text-muted-foreground mb-8">
        We’re crunching the numbers, brewing ideas, and sprinkling a little
        creator fairy dust. Grab a snack, this won’t take long. 🍿
      </p>

      <div className="mt-8">
        {/* This need to somehow reflect the actual model progress */}
        <Progress value={90} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Your Creator Identity is loading...
        </p>
      </div>
    </div>
  );

  //will optimise with rhf + zod later
  const canProceed = () => {
    if (step === 1) return userTikTokProfile.trim() !== "";
    if (step === 2) return userTopCreators.some((creator) => creator.trim());
    if (step === 3) return userDreamBrands.some((creator) => creator.trim());
    return true;
  };

  /* 
    Handle Next Step Logic, best to do this in a separate file
    
    Step 1: Profile Link -> Send profile link to server
    Step 2: Creators You Love -> Send top creators to server
    Step 3: Dream Brands -> Send dream brands to server
    Step 4: Loading -> After some time, redirect to dashboard
  */
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      setStep(4);
    } else {
      router.push("/dashboard");
    }
  };

  const getStepTitle = () => {
    const titles = ["Your Profile Link", "Creators You Love", "Dream Brands"];
    return titles[step - 1];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {step < 4 && (
            <div className="mb-8">
              <Progress value={progress} className="h-3 mb-4" />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Step {step} of {totalSteps}
                </p>
                <p className="text-sm font-medium text-primary">
                  {getStepTitle()}
                </p>
              </div>
            </div>
          )}

          <Card className="p-8 shadow-soft">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* //Loading page */}
            {step === 4 && renderStep4()}
          </Card>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1 || step === 4}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-primary hover:opacity-90"
            >
              {step === 4 ? "Enter Dashboard" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
