// src/app/conversation/ConversationPage.tsx
"use client"

import { useRouter } from "next/navigation"
import React from "react"

import { cn } from "@/lib/utils"
import {
    AnalysisBlock,
    FlowStage,
    GrowthZone,
    GrowthZoneBlock,
    Message,
    MessagesList,
    RenderInputArea,
    Superpower,
    SuperpowerBlock,
    TasteAnalysis,
} from "./conversationUI"

import { Check } from "lucide-react"

export default function ConversationPage() {

    
const router = useRouter()
const messagesEndRef = React.useRef<HTMLDivElement | null>(null)
const inputRef = React.useRef<HTMLInputElement | null>(null)
const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

const [messages, setMessages] = React.useState<Message[]>([])
const [currentStage, setCurrentStage] = React.useState<FlowStage>("welcome")
const [inputValue, setInputValue] = React.useState("")
const [isLoading, setIsLoading] = React.useState(false)

// User data
const [userName, setUserName] = React.useState("")
const [tiktokUsername, setTiktokUsername] = React.useState("")
const [tasteVideos, setTasteVideos] = React.useState<File[]>([])
const [tasteAnalysis, setTasteAnalysis] = React.useState<TasteAnalysis | null>(null)
const [bestVideos, setBestVideos] = React.useState<File[]>([])
const [superpowers, setSuperpowers] = React.useState<Superpower[]>([])
const [growthVideos, setGrowthVideos] = React.useState<File[]>([])
const [growthZones, setGrowthZones] = React.useState<GrowthZone[]>([])
const [proposedGoals, setProposedGoals] = React.useState<string[]>([])
const [editableGoals, setEditableGoals] = React.useState<string[]>([])
const [isEditingGoals, setIsEditingGoals] = React.useState(false);


React.useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}, [messages])

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
    { id: `system-${Date.now()}`, type: "system", content, timestamp: new Date() },
])
}

const addUserMessage = (content: React.ReactNode) => {
setMessages((prev) => [
    ...prev,
    { id: `user-${Date.now()}`, type: "user", content, timestamp: new Date() },
])
}

const simulateAnalysis = async (duration: number = 2500) => {
setIsLoading(true)
await new Promise((resolve) => setTimeout(resolve, duration))
setIsLoading(false)
}

/* --------------------------- STEP HANDLERS -------------------------- */
/* 1: name */
const handleNameSubmit = () => {
if (!inputValue.trim()) return
setUserName(inputValue)
addUserMessage(inputValue)
setInputValue("")
setTimeout(() => {
    addSystemMessage(
    <div className="space-y-3">
        <p className="text-base leading-relaxed">Nice to meet you, {inputValue}.</p>
        <p className="text-base leading-relaxed font-medium">What's your TikTok username?</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
        (We'll use this to analyze your content)
        </p>
    </div>
    )
    setCurrentStage("awaiting-tiktok-username")
}, 67)
}

/* 2: TikTok username */
const handleTiktokUsernameSubmit = () => {
if (!inputValue.trim()) return
setTiktokUsername(inputValue)
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
}, 67)
}


const handleTasteUpload = (files: FileList | null) => {
if (!files) return
const fileArray = Array.from(files)
setTasteVideos((prev) => [...prev, ...fileArray])
}

const handleTasteAnalyze = async () => {
if (tasteVideos.length === 0) return

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

const loadingMessages = [
    "Reading the room 👀",
    "Scanning for main-character energy…",
    "Looking for patterns your audience loves…",
    "Peeking under the hood of your content 🛠️",
]
const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]

setTimeout(() => {
    addSystemMessage(<div className="space-y-3"><p className="text-base leading-relaxed">{randomMessage}</p></div>)
}, 600)

await simulateAnalysis(3000)

// Mock analysis
const mockAnalysis: TasteAnalysis = {
    tone: "Playful yet intentional — balances humor with sincerity.",
    energy: "Mid-to-high energy. Quick cuts, upbeat pacing, conversational delivery.",
    formatBias: "Short-form narrative hooks. Visual storytelling over talking heads.",
}
setTasteAnalysis(mockAnalysis)

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
}, 67)
}

/* 3: taste validation */
const handleTasteValidation = (isCorrect: boolean) => {
if (isCorrect) {
    addUserMessage("Yes")
    setTimeout(() => {
    proceedToBestVideos()
    }, 67)
} else {
    addUserMessage("Not really")
    setTimeout(() => {
    addSystemMessage(
        <div className="space-y-3">
        <p className="text-base leading-relaxed">Got it. Tell me more about what you're going for.</p>
        </div>
    )
    setCurrentStage("taste-clarification")
    }, 67)
}
}

const handleTasteClarification = () => {
if (!inputValue.trim()) return

addUserMessage(inputValue)
setInputValue("")

const updatedAnalysis: TasteAnalysis = {
    tone: "Updated: " + (tasteAnalysis?.tone || ""),
    energy: "Updated: " + (tasteAnalysis?.energy || ""),
    formatBias: "Updated: " + (tasteAnalysis?.formatBias || ""),
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
}, 67)
}

const proceedToBestVideos = () => {
setTimeout(() => {
    addSystemMessage(
    <div className="space-y-3">
        <p className="text-base leading-relaxed">Now drop 3 videos that performed best for you.</p>
    </div>
    )
    setCurrentStage("awaiting-best-videos")
}, 67)
}

/* 4: best performing videos */
const handleBestUpload = (files: FileList | null) => {
if (!files) return
const fileArray = Array.from(files)
setBestVideos((prev) => [...prev, ...fileArray])
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
    "Looking for patterns that pop…",
]
const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]

setTimeout(() => {
    addSystemMessage(<div className="space-y-3"><p className="text-base leading-relaxed">{randomMessage}</p></div>)
}, 600)

await simulateAnalysis(3000)

const mockSuperpowers: Superpower[] = [
    {
    title: "Strong hooks in the first 2 seconds",
    description: "You grab attention immediately with visual curiosity or a provocative statement.",
    },
    {
    title: "Consistent themes viewers return for",
    description: "Clear content pillars around productivity, creativity, and behind-the-scenes insights.",
    },
    {
    title: "Clear emotional promise",
    description: "Viewers know what feeling they'll get — whether it's inspiration, validation, or clarity.",
    },
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
}, 67)
}

/* 5: superpowers validation */
const handleSuperpowersValidation = (isCorrect: boolean) => {
if (isCorrect) {
    addUserMessage("Yes")
    proceedToGrowthVideos()

} else {
    addUserMessage("No")
    setTimeout(() => {
    addSystemMessage(
        <div className="space-y-3">
        <p className="text-base leading-relaxed">Tell me more — what am I missing?</p>
        </div>
    )
    setCurrentStage("superpowers-clarification")
    }, 67)
}
}

const handleSuperpowersClarification = () => {
if (!inputValue.trim()) return

addUserMessage(inputValue)
setInputValue("")

const updatedSuperpowers: Superpower[] = superpowers.map((sp, _) => {
    return { ...sp, title: "Updated: " + sp.title }
})

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
}, 67)
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
}, 67)
}

/* 6: growth videos */
const handleGrowthUpload = (files: FileList | null) => {
if (!files) return
const fileArray = Array.from(files)
setGrowthVideos((prev) => [...prev, ...fileArray])
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

const loadingMessages = ["Reading the room 👀", "Spotting the gaps…", "Looking for unlock potential…", "Connecting the dots 🧠"]
const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]

setTimeout(() => {
    addSystemMessage(<div className="space-y-3"><p className="text-base leading-relaxed">{randomMessage}</p></div>)
}, 600)

await simulateAnalysis(3000)

const mockGrowthZones: GrowthZone[] = [
    {
    title: "Hooks don't match the promise",
    description: "Opening grabs attention, but the payoff doesn't align with expectations.",
    },
    {
    title: "Format may not fit audience expectations",
    description: "Experimental formats feel disconnected from your core style.",
    },
    {
    title: "Timing or pacing issues",
    description: "Some videos lose momentum midway or rush the conclusion.",
    },
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
}, 67)
}

/* 7: growth validation */
const handleGrowthValidation = (isCorrect: boolean) => {
if (isCorrect) {
    addUserMessage("Yes")
    proceedToGoalProposal()
} else {
    addUserMessage("No")
    setTimeout(() => {
    addSystemMessage(
        <div className="space-y-3">
        <p className="text-base leading-relaxed">Tell me what you're seeing instead.</p>
        </div>
    )
    setCurrentStage("growth-clarification")
    }, 67)
}
}

const handleGrowthClarification = () => {
if (!inputValue.trim()) return

addUserMessage(inputValue)
setInputValue("")

const updatedGrowthZones: GrowthZone[] = growthZones.map((gz,_) => {
    return ({...gz, title: "Updated: " + gz.title})
})
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
}, 67)
}

const proceedToGoalProposal = () => {
const goals = [
    "Build a consistent content system that aligns with your natural strengths",
    "Refine hooks and pacing to improve viewer retention",
    "Experiment with formats that feel authentic while expanding reach",
]
setProposedGoals(goals)
setEditableGoals(goals)

setTimeout(() => {
    addSystemMessage(
    <div className="space-y-4" id="goal-proposal-message">
        <p className="text-base leading-relaxed">Based on everything, here's what I think you're working toward:</p>
        <ul className="space-y-2 pl-4">
        {goals.map((goal, idx) => (
            <li key={idx} className="text-base leading-relaxed list-disc">
            {goal}
            </li>
        ))}
        </ul>
        <p className="text-base leading-relaxed font-medium pt-2">This track?</p>
    </div>
    )
    setCurrentStage("goal-proposal")
}, 67)
}

/* 8: goals */
const handleGoalConfirmation = (confirmed: boolean) => {
if (confirmed) {
    addUserMessage("Confirmed")
    setTimeout(() => {
    addSystemMessage(
        <div className="space-y-3">
        <p className="text-base leading-relaxed">Great — I've saved the goals (static demo).</p>
        <p className="text-sm text-muted-foreground">You can still add more goals directly here if you'd like.</p>
        </div>
    );
    }, 600);
} else {
    setIsEditingGoals(true)
    setCurrentStage("goal-editing")
}
}

const addEditableGoal = () => {
    setEditableGoals((prev) => [...prev, ""]);
};

const removeEditableGoal = (index) => {
    setEditableGoals((prev) => prev.filter((_, i) => i !== index));
};

const handleGoalEditComplete = () => {
    const cleaned = editableGoals.map((g) => g.trim()).filter(Boolean);
    setProposedGoals(cleaned);
    addUserMessage("Updated goals");
    setIsEditingGoals(false);
    setTimeout(() => {
        addSystemMessage(
            <div className="space-y-4">
            <p className="text-base leading-relaxed">Updated. Here's what we've got:</p>
            <ul className="space-y-2 pl-4">
                {cleaned.map((goal, idx) => (
                <li key={idx} className="text-base leading-relaxed list-disc">
                    {goal}
                </li>
                ))}
            </ul>
            <p className="text-base leading-relaxed font-medium pt-2">That better?</p>
            </div>
        );
    setCurrentStage("goal-proposal");
    }, 67);
};


/* ------------------------- keyboard handling ------------------------ */
const handleKeyPress = (e: React.KeyboardEvent) => {
if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    switch (currentStage) {
    case "awaiting-name":
        handleNameSubmit()
        break
    case "awaiting-tiktok-username":
        handleTiktokUsernameSubmit()
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

/* ---------------------------- rendering ---------------------------- */
return (
<main className="min-h-screen bg-background">
    {/* <div className="flex w-full justify-end lg:flex-1">
        <ThemeToggle />
    </div> */}
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
            <MessagesList
            messages={messages}
            cnWrapper={(pos) => cn("flex", pos)}
            />
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {currentStage !== "analyzing-taste" &&
            currentStage !== "analyzing-superpowers" &&
            currentStage !== "analyzing-growth" && (
            <div className="px-2">
                <RenderInputArea
                // ... (rest of your props remain exactly the same)
                currentStage={currentStage}
                inputValue={inputValue}
                setInputValue={setInputValue}
                inputRef={inputRef}
                textareaRef={textareaRef}
                tasteVideos={tasteVideos}
                bestVideos={bestVideos}
                growthVideos={growthVideos}
                editableGoals={editableGoals}
                isEditingGoals={isEditingGoals}
                isLoading={isLoading}
                handleNameSubmit={handleNameSubmit}
                handleTiktokUsernameSubmit={handleTiktokUsernameSubmit}
                handleTasteUpload={handleTasteUpload}
                handleTasteAnalyze={handleTasteAnalyze}
                handleTasteValidation={handleTasteValidation}
                handleTasteClarification={handleTasteClarification}
                handleBestUpload={handleBestUpload}
                handleBestAnalyze={handleBestAnalyze}
                handleSuperpowersValidation={handleSuperpowersValidation}
                handleSuperpowersClarification={handleSuperpowersClarification}
                handleGrowthUpload={handleGrowthUpload}
                handleGrowthAnalyze={handleGrowthAnalyze}
                handleGrowthValidation={handleGrowthValidation}
                handleGrowthClarification={handleGrowthClarification}
                handleGoalConfirmation={handleGoalConfirmation}
                setEditableGoals={setEditableGoals}
                handleGoalEditComplete={handleGoalEditComplete}
                handleKeyPress={handleKeyPress}
                addEditableGoal={addEditableGoal}
                removeEditableGoal={removeEditableGoal}
                />
            </div>
            )}
        </div>
    </div>
    )}
</main>
)
}
