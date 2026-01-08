"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Upload, Sparkles, ThumbsUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ConversationStep = 
  | "welcome"
  | "taste-discovery"
  | "taste-reflection"
  | "taste-follow-up"
  | "performance-best"
  | "performance-worst"
  | "processing"
  | "completion"

export default function ConversationPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<ConversationStep>("welcome")
  const [name, setName] = React.useState("")
  const [tasteVideos, setTasteVideos] = React.useState<string[]>([])
  const [validationResponse, setValidationResponse] = React.useState<string>("")
  const [additionalMessage, setAdditionalMessage] = React.useState("")
  const [bestVideos, setBestVideos] = React.useState<string[]>([])
  const [worstVideos, setWorstVideos] = React.useState<string[]>([])

  // Auto-redirect after completion
  React.useEffect(() => {
    if (step === "completion") {
      const timer = setTimeout(() => {
        router.push("/profile")
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [step, router])

  const handleNameSubmit = () => {
    if (name.trim()) {
      setStep("taste-discovery")
    }
  }

  const handleTasteVideosSubmit = () => {
    setStep("taste-reflection")
  }

  const handleValidationResponse = (response: string) => {
    setValidationResponse(response)
    if (response === "Yes") {
      setStep("performance-best")
    }
  }

  const handleFollowUpSubmit = () => {
    setStep("performance-best")
  }

  const handleBestVideosSubmit = () => {
    setStep("performance-worst")
  }

  const handleWorstVideosSubmit = () => {
    setStep("processing")
    // Simulate processing
    setTimeout(() => {
      setStep("completion")
    }, 3000)
  }

  return (
    <main className="h-screen bg-gradient-to-br from-violet-950 via-slate-950 to-slate-950 overflow-hidden">
      <div className="h-full flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Welcome + Name */}
          {step === "welcome" && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-4">
                <div className="h-1 w-24 bg-violet-500 rounded-full" />
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Hey! Welcome to Solvi.
                </h1>
                <p className="text-lg text-white/70 leading-relaxed">
                  Before we make anything, I want to understand you.
                </p>
                <p className="text-xl text-white/90 font-medium">
                  What can I call you?
                </p>
              </div>
              
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Your name, nickname, or handle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-base"
                  autoFocus
                />
                <p className="text-sm text-white/50">
                  Nickname, real name, or your TikTok handle
                </p>
              </div>

              <Button
                onClick={handleNameSubmit}
                disabled={!name.trim()}
                className="w-full h-12 bg-white text-slate-950 hover:bg-white/90 text-base font-medium"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Taste Discovery */}
          {step === "taste-discovery" && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-4">
                <div className="h-1 w-24 bg-violet-500 rounded-full" />
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Your taste says everything
                </h1>
                <p className="text-lg text-white/70 leading-relaxed">
                  Drop 3 videos that feel most you. They can be yours or creators that inspire you.
                </p>
              </div>

              <div className="space-y-3">
                <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Upload className="h-8 w-8 text-white/60" />
                    <p className="text-white/80 text-sm font-medium">Upload or paste video links</p>
                    <p className="text-white/50 text-xs">TikTok, Instagram, YouTube</p>
                  </CardContent>
                </Card>

                {tasteVideos.length > 0 && (
                  <div className="space-y-2">
                    {tasteVideos.map((video, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
                        <Sparkles className="h-4 w-4" />
                        <span>Video {i + 1} uploaded</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("welcome")}
                  className="flex-1 h-12 bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  onClick={handleTasteVideosSubmit}
                  className="flex-1 h-12 bg-white text-slate-950 hover:bg-white/90 text-base font-medium"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* AI Reflection + Validation */}
          {step === "taste-reflection" && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-4">
                <div className="h-1 w-24 bg-violet-500 rounded-full" />
                <p className="text-lg text-white/70 leading-relaxed">
                  Here's what I'm picking up from your taste:
                </p>
              </div>

              <Card className="bg-gradient-to-br from-violet-900/40 to-slate-900/40 border-violet-500/30">
                <CardContent className="py-6 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-violet-300">Tone</h4>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Calm, intentional, slightly introspective. You value clarity over chaos.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-violet-300">Energy</h4>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Steady and grounded. Not rushed, not loud—just present.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-violet-300">Format Bias</h4>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Visual-first storytelling. You let images do the talking.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <p className="text-white/90 font-medium">Am I reading this right?</p>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleValidationResponse("Yes")}
                    variant="outline"
                    className="w-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 justify-start"
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => handleValidationResponse("Partially")}
                    variant="outline"
                    className="w-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 justify-start"
                  >
                    Partially
                  </Button>
                  <Button
                    onClick={() => handleValidationResponse("Not really")}
                    variant="outline"
                    className="w-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 justify-start"
                  >
                    Not really
                  </Button>
                </div>
              </div>

              {(validationResponse === "Partially" || validationResponse === "Not really") && (
                <div className="space-y-3 animate-in fade-in duration-500">
                  <Textarea
                    placeholder="Tell me more..."
                    value={additionalMessage}
                    onChange={(e) => setAdditionalMessage(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
                  />
                  <Button
                    onClick={handleFollowUpSubmit}
                    className="w-full h-12 bg-white text-slate-950 hover:bg-white/90"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Performance - Best Videos */}
          {step === "performance-best" && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-4">
                <div className="h-1 w-24 bg-violet-500 rounded-full" />
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Now drop 3 videos that performed best for you
                </h1>
                <p className="text-lg text-white/70 leading-relaxed">
                  The ones that got the most saves, shares, or genuine reactions.
                </p>
              </div>

              <div className="space-y-3">
                <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Upload className="h-8 w-8 text-white/60" />
                    <p className="text-white/80 text-sm font-medium">Upload your best performers</p>
                  </CardContent>
                </Card>

                {bestVideos.length > 0 && (
                  <div className="space-y-2">
                    {bestVideos.map((video, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
                        <Sparkles className="h-4 w-4" />
                        <span>Video {i + 1} uploaded</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("taste-reflection")}
                  className="flex-1 h-12 bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  onClick={handleBestVideosSubmit}
                  className="flex-1 h-12 bg-white text-slate-950 hover:bg-white/90 text-base font-medium"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Performance - Worst Videos */}
          {step === "performance-worst" && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-4">
                <div className="h-1 w-24 bg-violet-500 rounded-full" />
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Want to look at what didn't land?
                </h1>
                <p className="text-lg text-white/70 leading-relaxed">
                  Send me 3 videos you think might be holding you back. No judgment—just learning.
                </p>
              </div>

              <div className="space-y-3">
                <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Upload className="h-8 w-8 text-white/60" />
                    <p className="text-white/80 text-sm font-medium">Upload videos that underperformed</p>
                  </CardContent>
                </Card>

                {worstVideos.length > 0 && (
                  <div className="space-y-2">
                    {worstVideos.map((video, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
                        <Sparkles className="h-4 w-4" />
                        <span>Video {i + 1} uploaded</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("performance-best")}
                  className="flex-1 h-12 bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  onClick={handleWorstVideosSubmit}
                  className="flex-1 h-12 bg-white text-slate-950 hover:bg-white/90 text-base font-medium"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {step === "processing" && (
            <div className="space-y-12 animate-in fade-in duration-700 text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 animate-pulse" />
                  <div className="absolute inset-0 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 blur-xl opacity-50 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-2xl font-semibold text-white">
                  Making sense of your creative chaos ✨
                </p>
                <p className="text-white/60">
                  Building your profile...
                </p>
              </div>
            </div>
          )}

          {/* Completion */}
          {step === "completion" && (
            <div className="space-y-12 animate-in fade-in duration-700 text-center">
              <div className="flex justify-center space-x-4">
                <div className="text-6xl">😊</div>
                <div className="text-6xl">👍</div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-white">
                  Sorted.
                </h1>
                <p className="text-xl text-white/70">
                  Time to explore your own zone.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
