"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Upload, X, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type MessageType = "system" | "user"

interface Message {
  id: string
  type: MessageType
  content: React.ReactNode
  timestamp: Date
}

interface TasteAnalysis {
  tone: string
  energy: string
  formatBias: string
}

interface Superpower {
  title: string
  description: string
}

interface GrowthZone {
  title: string
  description: string
}

type FlowStage = 
  | "welcome"
  | "awaiting-name"
  | "awaiting-taste-videos"
  | "analyzing-taste"
  | "awaiting-taste-validation"
  | "taste-clarification"
  | "taste-optional-more"
  | "awaiting-best-videos"
  | "analyzing-superpowers"
  | "awaiting-superpowers-validation"
  | "superpowers-clarification"
  | "superpowers-optional-more"
  | "awaiting-growth-videos"
  | "analyzing-growth"
  | "awaiting-growth-validation"
  | "growth-clarification"
  | "growth-optional-more"
  | "goal-proposal"
  | "goal-editing"
  | "final-processing"
  | "completion"

export default function ConversationPage() {
  const router = useRouter()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  
  const [messages, setMessages] = React.useState<Message[]>([])
  const [currentStage, setCurrentStage] = React.useState<FlowStage>("welcome")
  const [inputValue, setInputValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  
  // User data
  const [userName, setUserName] = React.useState("")
  const [tasteVideos, setTasteVideos] = React.useState<File[]>([])
  const [tasteAnalysis, setTasteAnalysis] = React.useState<TasteAnalysis | null>(null)
  const [bestVideos, setBestVideos] = React.useState<File[]>([])
  const [superpowers, setSuperpowers] = React.useState<Superpower[]>([])
  const [growthVideos, setGrowthVideos] = React.useState<File[]>([])
  const [growthZones, setGrowthZones] = React.useState<GrowthZone[]>([])
  const [proposedGoals, setProposedGoals] = React.useState<string[]>([])
  const [editableGoals, setEditableGoals] = React.useState<string[]>([])
  const [isEditingGoals, setIsEditingGoals] = React.useState(false)

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize conversation
  React.useEffect(() => {
    if (currentStage === "welcome") {
      setTimeout(() => {
        addSystemMessage(
          <div className="space-y-3">
            <p className="text-base leading-relaxed">Hey — welcome to Solvi.</p>
            <p className="text-base leading-relaxed">Before we make anything, I want to understand you.</p>
            <p className="text-base leading-relaxed font-medium">What should I call you?</p>
          </div>
        )
        setCurrentStage("awaiting-name")
      }, 500)
    }
  }, [])

  // Auto-redirect after completion
  React.useEffect(() => {
    if (currentStage === "completion") {
      const timer = setTimeout(() => {
        router.push("/profile")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [currentStage, router])

  const addSystemMessage = (content: React.ReactNode) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `system-${Date.now()}`,
        type: "system",
        content,
        timestamp: new Date(),
      },
    ])
  }

  const addUserMessage = (content: React.ReactNode) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: "user",
        content,
        timestamp: new Date(),
      },
    ])
  }

  const simulateAnalysis = async (duration: number = 2500) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, duration))
    setIsLoading(false)
  }

  // STEP 1: Name submission
  const handleNameSubmit = () => {
    if (!inputValue.trim()) return
    
    setUserName(inputValue)
    addUserMessage(inputValue)
    setInputValue("")
    
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Your taste says a lot.</h2>
          <p className="text-base leading-relaxed">
            Drop 3 videos that feel <em>most you</em>.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            They can be yours — or creators that really inspire you.
          </p>
        </div>
      )
      setCurrentStage("awaiting-taste-videos")
    }, 800)
  }

  // STEP 2: Taste videos upload
  const handleTasteUpload = (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)
    setTasteVideos(prev => [...prev, ...fileArray])
  }

  const handleTasteAnalyze = async () => {
    if (tasteVideos.length === 0) return
    
    // Show user's upload message
    addUserMessage(
      <div className="flex flex-wrap gap-2">
        {tasteVideos.map((file, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4" />
            <span>{file.name}</span>
          </div>
        ))}
      </div>
    )
    
    setCurrentStage("analyzing-taste")
    
    // Show loading message
    const loadingMessages = [
      "Reading the room 👀",
      "Scanning for main-character energy…",
      "Looking for patterns your audience loves…",
      "Peeking under the hood of your content 🛠️"
    ]
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-3">
          <p className="text-base leading-relaxed">{randomMessage}</p>
        </div>
      )
    }, 600)
    
    // Simulate analysis
    await simulateAnalysis(3000)
    
    // Mock analysis data
    const mockAnalysis: TasteAnalysis = {
      tone: "Playful yet intentional — balances humor with sincerity.",
      energy: "Mid-to-high energy. Quick cuts, upbeat pacing, conversational delivery.",
      formatBias: "Short-form narrative hooks. Visual storytelling over talking heads."
    }
    setTasteAnalysis(mockAnalysis)
    
    // Show analysis
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-4">
          <p className="text-base leading-relaxed">Here's what I'm picking up from your taste:</p>
          <AnalysisBlock title="Tone" content={mockAnalysis.tone} />
          <AnalysisBlock title="Energy" content={mockAnalysis.energy} />
          <AnalysisBlock title="Format Bias" content={mockAnalysis.formatBias} />
          <p className="text-base leading-relaxed font-medium pt-2">Am I reading this right?</p>
        </div>
      )
      setCurrentStage("awaiting-taste-validation")
    }, 800)
  }

  // STEP 3: Taste validation
  const handleTasteValidation = (isCorrect: boolean) => {
    if (isCorrect) {
      addUserMessage("Yes")
      setTimeout(() => {
        addSystemMessage(
          <div className="space-y-3">
            <p className="text-base leading-relaxed">Nice. Want to add more videos to refine this?</p>
            <p className="text-sm text-muted-foreground">(Optional — you can skip)</p>
          </div>
        )
        setCurrentStage("taste-optional-more")
      }, 800)
    } else {
      addUserMessage("Not really")
      setTimeout(() => {
        addSystemMessage(
          <div className="space-y-3">
            <p className="text-base leading-relaxed">Got it. Tell me more about what you're going for.</p>
          </div>
        )
        setCurrentStage("taste-clarification")
      }, 800)
    }
  }

  const handleTasteClarification = () => {
    if (!inputValue.trim()) return
    
    addUserMessage(inputValue)
    setInputValue("")
    
    // Update analysis based on feedback
    const updatedAnalysis: TasteAnalysis = {
      tone: "Updated: " + (tasteAnalysis?.tone || ""),
      energy: "Updated: " + (tasteAnalysis?.energy || ""),
      formatBias: "Updated: " + (tasteAnalysis?.formatBias || "")
    }
    setTasteAnalysis(updatedAnalysis)
    
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-4">
          <p className="text-base leading-relaxed">Got it. Here's the refined read:</p>
          <AnalysisBlock title="Tone" content={updatedAnalysis.tone} />
          <AnalysisBlock title="Energy" content={updatedAnalysis.energy} />
          <AnalysisBlock title="Format Bias" content={updatedAnalysis.formatBias} />
          <p className="text-base leading-relaxed font-medium pt-2">That better?</p>
        </div>
      )
      setCurrentStage("awaiting-taste-validation")
    }, 1200)
  }

  const handleSkipOptionalTaste = () => {
    addUserMessage("Skip")
    proceedToBestVideos()
  }

  const proceedToBestVideos = () => {
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-3">
          <p className="text-base leading-relaxed">Now drop 3 videos that performed best for you.</p>
        </div>
      )
      setCurrentStage("awaiting-best-videos")
    }, 800)
  }

  // STEP 4: Best performing videos
  const handleBestUpload = (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)
    setBestVideos(prev => [...prev, ...fileArray])
  }

  const handleBestAnalyze = async () => {
    if (bestVideos.length === 0) return
    
    addUserMessage(
      <div className="flex flex-wrap gap-2">
        {bestVideos.map((file, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4" />
            <span>{file.name}</span>
          </div>
        ))}
      </div>
    )
    
    setCurrentStage("analyzing-superpowers")
    
    const loadingMessages = [
      "Connecting the dots (and the vibes)…",
      "Reading between the frames…",
      "Scanning for main-character energy…",
      "Looking for patterns that pop…"
    ]
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-3">
          <p className="text-base leading-relaxed">{randomMessage}</p>
        </div>
      )
    }, 600)
    
    await simulateAnalysis(3000)
    
    // Mock superpowers
    const mockSuperpowers: Superpower[] = [
      {
        title: "Strong hooks in the first 2 seconds",
        description: "You grab attention immediately with visual curiosity or a provocative statement."
      },
      {
        title: "Consistent themes viewers return for",
        description: "Clear content pillars around productivity, creativity, and behind-the-scenes insights."
      },
      {
        title: "Clear emotional promise",
        description: "Viewers know what feeling they'll get — whether it's inspiration, validation, or clarity."
      }
    ]
    setSuperpowers(mockSuperpowers)
    
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-4">
          <p className="text-base leading-relaxed">Here's where you naturally shine:</p>
          {mockSuperpowers.map((sp, idx) => (
            <SuperpowerBlock key={idx} {...sp} />
          ))}
          <p className="text-base leading-relaxed font-medium pt-2">Does this feel accurate?</p>
        </div>
      )
      setCurrentStage("awaiting-superpowers-validation")
    }, 800)
  }

  // STEP 5: Superpowers validation
  const handleSuperpowersValidation = (isCorrect: boolean) => {
    if (isCorrect) {
      addUserMessage("Yes")
      setTimeout(() => {
        addSystemMessage(
          <div className="space-y-3">
            <p className="text-base leading-relaxed">Nice. Want to add more videos to refine this?</p>
            <p className="text-sm text-muted-foreground">(Optional — you can skip)</p>
          </div>
        )
        setCurrentStage("superpowers-optional-more")
      }, 800)
    } else {
      addUserMessage("No")
      setTimeout(() => {
        addSystemMessage(
          <div className="space-y-3">
            <p className="text-base leading-relaxed">Tell me more — what am I missing?</p>
          </div>
        )
        setCurrentStage("superpowers-clarification")
      }, 800)
    }
  }

  const handleSuperpowersClarification = () => {
    if (!inputValue.trim()) return
    
    addUserMessage(inputValue)
    setInputValue("")
    
    // Update superpowers
    const updatedSuperpowers: Superpower[] = [
      ...superpowers,
      {
        title: "Updated insight based on your feedback",
        description: inputValue
      }
    ]
    setSuperpowers(updatedSuperpowers)
    
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-4">
          <p className="text-base leading-relaxed">Updated. Here's where you shine:</p>
          {updatedSuperpowers.map((sp, idx) => (
            <SuperpowerBlock key={idx} {...sp} />
          ))}
          <p className="text-base leading-relaxed font-medium pt-2">That track better?</p>
        </div>
      )
      setCurrentStage("awaiting-superpowers-validation")
    }, 1200)
  }

  const handleSkipOptionalSuperpowers = () => {
    addUserMessage("Skip")
    proceedToGrowthVideos()
  }

  const proceedToGrowthVideos = () => {
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-3">
          <p className="text-base leading-relaxed">Want to look at what didn't land?</p>
          <p className="text-base leading-relaxed">Drop 3 videos that felt off or underperformed.</p>
        </div>
      )
      setCurrentStage("awaiting-growth-videos")
    }, 800)
  }

  // STEP 6: Growth videos
  const handleGrowthUpload = (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)
    setGrowthVideos(prev => [...prev, ...fileArray])
  }

  const handleGrowthAnalyze = async () => {
    if (growthVideos.length === 0) return
    
    addUserMessage(
      <div className="flex flex-wrap gap-2">
        {growthVideos.map((file, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4" />
            <span>{file.name}</span>
          </div>
        ))}
      </div>
    )
    
    setCurrentStage("analyzing-growth")
    
    const loadingMessages = [
      "Reading the room 👀",
      "Spotting the gaps…",
      "Looking for unlock potential…",
      "Connecting the dots 🧠"
    ]
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-3">
          <p className="text-base leading-relaxed">{randomMessage}</p>
        </div>
      )
    }, 600)
    
    await simulateAnalysis(3000)
    
    // Mock growth zones
    const mockGrowthZones: GrowthZone[] = [
      {
        title: "Hooks don't match the promise",
        description: "Opening grabs attention, but the payoff doesn't align with expectations."
      },
      {
        title: "Format may not fit audience expectations",
        description: "Experimental formats feel disconnected from your core style."
      },
      {
        title: "Timing or pacing issues",
        description: "Some videos lose momentum midway or rush the conclusion."
      }
    ]
    setGrowthZones(mockGrowthZones)
    
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-4">
          <p className="text-base leading-relaxed">Here's what I'm seeing:</p>
          {mockGrowthZones.map((gz, idx) => (
            <GrowthZoneBlock key={idx} {...gz} />
          ))}
          <p className="text-base leading-relaxed font-medium pt-2">Was I close?</p>
        </div>
      )
      setCurrentStage("awaiting-growth-validation")
    }, 800)
  }

  // STEP 7: Growth validation
  const handleGrowthValidation = (isCorrect: boolean) => {
    if (isCorrect) {
      addUserMessage("Yes")
      setTimeout(() => {
        addSystemMessage(
          <div className="space-y-3">
            <p className="text-base leading-relaxed">Cool. Want me to look at more?</p>
            <p className="text-sm text-muted-foreground">(Optional)</p>
          </div>
        )
        setCurrentStage("growth-optional-more")
      }, 800)
    } else {
      addUserMessage("No")
      setTimeout(() => {
        addSystemMessage(
          <div className="space-y-3">
            <p className="text-base leading-relaxed">Tell me what you're seeing instead.</p>
          </div>
        )
        setCurrentStage("growth-clarification")
      }, 800)
    }
  }

  const handleGrowthClarification = () => {
    if (!inputValue.trim()) return
    
    addUserMessage(inputValue)
    setInputValue("")
    
    const updatedGrowthZones: GrowthZone[] = [
      ...growthZones,
      {
        title: "Your insight",
        description: inputValue
      }
    ]
    setGrowthZones(updatedGrowthZones)
    
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-4">
          <p className="text-base leading-relaxed">Updated growth zones:</p>
          {updatedGrowthZones.map((gz, idx) => (
            <GrowthZoneBlock key={idx} {...gz} />
          ))}
          <p className="text-base leading-relaxed font-medium pt-2">Does this capture it?</p>
        </div>
      )
      setCurrentStage("awaiting-growth-validation")
    }, 1200)
  }

  const handleSkipOptionalGrowth = () => {
    addUserMessage("Skip")
    proceedToGoalProposal()
  }

  const proceedToGoalProposal = () => {
    // Generate goals based on everything
    const goals = [
      "Build a consistent content system that aligns with your natural strengths",
      "Refine hooks and pacing to improve viewer retention",
      "Experiment with formats that feel authentic while expanding reach"
    ]
    setProposedGoals(goals)
    setEditableGoals(goals)
    
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-4" id="goal-proposal-message">
          <p className="text-base leading-relaxed">Based on everything, here's what I think you're working toward:</p>
          <ul className="space-y-2 pl-4">
            {goals.map((goal, idx) => (
              <li key={idx} className="text-base leading-relaxed list-disc">{goal}</li>
            ))}
          </ul>
          <p className="text-base leading-relaxed font-medium pt-2">This track?</p>
        </div>
      )
      setCurrentStage("goal-proposal")
    }, 800)
  }

  // STEP 8: Goal confirmation
  const handleGoalConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      addUserMessage("Confirmed")
      proceedToFinalProcessing()
    } else {
      setIsEditingGoals(true)
      setCurrentStage("goal-editing")
    }
  }

  const handleGoalEditComplete = () => {
    addUserMessage("Updated goals")
    setIsEditingGoals(false)
    
    setTimeout(() => {
      addSystemMessage(
        <div className="space-y-4">
          <p className="text-base leading-relaxed">Updated. Here's what we've got:</p>
          <ul className="space-y-2 pl-4">
            {editableGoals.map((goal, idx) => (
              <li key={idx} className="text-base leading-relaxed list-disc">{goal}</li>
            ))}
          </ul>
          <p className="text-base leading-relaxed font-medium pt-2">That better?</p>
        </div>
      )
      setCurrentStage("goal-proposal")
    }, 800)
  }

  const proceedToFinalProcessing = async () => {
    setCurrentStage("final-processing")
    
    await simulateAnalysis(3500)
    
    setCurrentStage("completion")
  }

  // Helper Components
  function AnalysisBlock({ title, content }: { title: string; content: string }) {
    return (
      <div className="rounded-lg bg-violet-600/20 border border-violet-500/40 p-4 space-y-1">
        <h4 className="text-sm font-semibold text-violet-200">{title}</h4>
        <p className="text-sm leading-relaxed text-violet-50">{content}</p>
      </div>
    )
  }

  function SuperpowerBlock({ title, description }: Superpower) {
    return (
      <div className="rounded-lg bg-amber-600/20 border border-amber-500/40 p-4 space-y-2">
        <h4 className="text-sm font-semibold text-amber-200">{title}</h4>
        <p className="text-sm leading-relaxed text-amber-50">{description}</p>
      </div>
    )
  }

  function GrowthZoneBlock({ title, description }: GrowthZone) {
    return (
      <div className="rounded-lg bg-emerald-600/20 border border-emerald-500/40 p-4 space-y-2">
        <h4 className="text-sm font-semibold text-emerald-200">{title}</h4>
        <p className="text-sm leading-relaxed text-emerald-50">{description}</p>
      </div>
    )
  }

  // Keyboard handler
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      
      switch (currentStage) {
        case "awaiting-name":
          handleNameSubmit()
          break
        case "taste-clarification":
          handleTasteClarification()
          break
        case "superpowers-clarification":
          handleSuperpowersClarification()
          break
        case "growth-clarification":
          handleGrowthClarification()
          break
        case "goal-editing":
          handleGoalEditComplete()
          break
      }
    }
  }

  const renderInputArea = () => {
    switch (currentStage) {
      case "awaiting-name":
        return (
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your name..."
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleNameSubmit} size="icon" className="shrink-0">
              <Check className="w-4 h-4" />
            </Button>
          </div>
        )

      case "awaiting-taste-videos":
        return (
          <div className="space-y-3">
            {tasteVideos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tasteVideos.map((file, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-2">
                    <Check className="w-3 h-3" />
                    {file.name}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => setTasteVideos(prev => prev.filter((_, i) => i !== idx))}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById("taste-upload")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Videos
              </Button>
              <input
                id="taste-upload"
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleTasteUpload(e.target.files)}
                className="hidden"
              />
              {tasteVideos.length > 0 && (
                <Button onClick={handleTasteAnalyze}>
                  Analyze
                </Button>
              )}
            </div>
          </div>
        )

      case "awaiting-taste-validation":
        return (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handleTasteValidation(true)}>
              Yes
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleTasteValidation(false)}>
              Not really
            </Button>
          </div>
        )

      case "taste-clarification":
        return (
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me more..."
              className="flex-1 resize-none"
              rows={3}
              autoFocus
            />
            <Button onClick={handleTasteClarification} size="icon" className="shrink-0 self-end">
              <Check className="w-4 h-4" />
            </Button>
          </div>
        )

      case "taste-optional-more":
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => document.getElementById("taste-more-upload")?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add More
            </Button>
            <input
              id="taste-more-upload"
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => {
                handleTasteUpload(e.target.files)
                if (e.target.files && e.target.files.length > 0) {
                  setTimeout(() => handleTasteAnalyze(), 500)
                }
              }}
              className="hidden"
            />
            <Button onClick={handleSkipOptionalTaste}>
              Skip
            </Button>
          </div>
        )

      case "awaiting-best-videos":
        return (
          <div className="space-y-3">
            {bestVideos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {bestVideos.map((file, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-2">
                    <Check className="w-3 h-3" />
                    {file.name}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => setBestVideos(prev => prev.filter((_, i) => i !== idx))}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById("best-upload")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Videos
              </Button>
              <input
                id="best-upload"
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleBestUpload(e.target.files)}
                className="hidden"
              />
              {bestVideos.length > 0 && (
                <Button onClick={handleBestAnalyze}>
                  Analyze
                </Button>
              )}
            </div>
          </div>
        )

      case "awaiting-superpowers-validation":
        return (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handleSuperpowersValidation(true)}>
              Yes
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleSuperpowersValidation(false)}>
              No
            </Button>
          </div>
        )

      case "superpowers-clarification":
        return (
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What am I missing?..."
              className="flex-1 resize-none"
              rows={3}
              autoFocus
            />
            <Button onClick={handleSuperpowersClarification} size="icon" className="shrink-0 self-end">
              <Check className="w-4 h-4" />
            </Button>
          </div>
        )

      case "superpowers-optional-more":
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => document.getElementById("superpowers-more-upload")?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add More Videos
            </Button>
            <input
              id="superpowers-more-upload"
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => {
                handleBestUpload(e.target.files)
                if (e.target.files && e.target.files.length > 0) {
                  setTimeout(() => handleBestAnalyze(), 500)
                }
              }}
              className="hidden"
            />
            <Button onClick={handleSkipOptionalSuperpowers}>
              Skip
            </Button>
          </div>
        )

      case "awaiting-growth-videos":
        return (
          <div className="space-y-3">
            {growthVideos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {growthVideos.map((file, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-2">
                    <Check className="w-3 h-3" />
                    {file.name}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => setGrowthVideos(prev => prev.filter((_, i) => i !== idx))}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById("growth-upload")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Videos
              </Button>
              <input
                id="growth-upload"
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleGrowthUpload(e.target.files)}
                className="hidden"
              />
              {growthVideos.length > 0 && (
                <Button onClick={handleGrowthAnalyze}>
                  Analyze
                </Button>
              )}
            </div>
          </div>
        )

      case "awaiting-growth-validation":
        return (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handleGrowthValidation(true)}>
              Yes
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleGrowthValidation(false)}>
              No
            </Button>
          </div>
        )

      case "growth-clarification":
        return (
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What are you noticing?..."
              className="flex-1 resize-none"
              rows={3}
              autoFocus
            />
            <Button onClick={handleGrowthClarification} size="icon" className="shrink-0 self-end">
              <Check className="w-4 h-4" />
            </Button>
          </div>
        )

      case "growth-optional-more":
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => document.getElementById("growth-more-upload")?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add More
            </Button>
            <input
              id="growth-more-upload"
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => {
                handleGrowthUpload(e.target.files)
                if (e.target.files && e.target.files.length > 0) {
                  setTimeout(() => handleGrowthAnalyze(), 500)
                }
              }}
              className="hidden"
            />
            <Button onClick={handleSkipOptionalGrowth}>
              Skip
            </Button>
          </div>
        )

      case "goal-proposal":
        return (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handleGoalConfirmation(true)}>
              Confirm
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleGoalConfirmation(false)}>
              Edit
            </Button>
          </div>
        )

      case "goal-editing":
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Edit your goals below:</p>
            {editableGoals.map((goal, idx) => (
              <Textarea
                key={idx}
                value={goal}
                onChange={(e) => {
                  const newGoals = [...editableGoals]
                  newGoals[idx] = e.target.value
                  setEditableGoals(newGoals)
                }}
                className="resize-none"
                rows={2}
              />
            ))}
            <Button onClick={handleGoalEditComplete} className="w-full">
              <Check className="w-4 h-4 mr-2" />
              Done
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Full-Screen Final Processing */}
      {currentStage === "final-processing" && (
        <div className="h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-8">
            <div className="relative inline-block">
              <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-semibold">Connecting the dots 🧠✨</p>
              <p className="text-base text-muted-foreground">Turning chaos into clarity…</p>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Completion */}
      {currentStage === "completion" && (
        <div className="h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">✨</div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">Sorted. You're in.</p>
              <p className="text-lg text-muted-foreground">This is your space now.</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {currentStage !== "final-processing" && currentStage !== "completion" && (
        <div className="h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-2xl h-full max-h-[90vh] flex flex-col py-8">
            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.type === "system" ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-5 py-4",
                      message.type === "system"
                        ? "bg-muted/50 text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {currentStage !== "analyzing-taste" && 
             currentStage !== "analyzing-superpowers" && 
             currentStage !== "analyzing-growth" && (
              <div className="px-2">
                {renderInputArea()}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
