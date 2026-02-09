// src/app/conversation/ConversationUI.tsx
"use client"

import { Check, Plus, Upload, X } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"


export type MessageType = "system" | "user"

export interface Message {
id: string
type: MessageType
content: React.ReactNode
timestamp: Date
}

export interface TasteAnalysis {
tone: string
energy: string
formatBias: string
}

export interface Superpower {
title: string
description: string
}

export interface GrowthZone {
title: string
description: string
}

export type FlowStage =
| "welcome"
| "awaiting-name"
| "awaiting-tiktok-username"
| "awaiting-taste-videos"
| "analyzing-taste"
| "awaiting-taste-validation"
| "taste-clarification"
//   | "taste-optional-more"
| "awaiting-best-videos"
| "analyzing-superpowers"
| "awaiting-superpowers-validation"
| "superpowers-clarification"
//   | "superpowers-optional-more"
| "awaiting-growth-videos"
| "analyzing-growth"
| "awaiting-growth-validation"
| "growth-clarification"
//   | "growth-optional-more"
| "goal-proposal"
| "goal-editing"
| "final-processing"
| "completion"


export function AnalysisBlock({ title, content }: { title: string; content: string }) {
return (
    <div className="rounded-lg bg-violet-600/20 border border-violet-500/40 p-4 space-y-1">
    <h4 className="text-sm font-semibold text-violet-500">{title}</h4>
    <p className="text-sm leading-relaxed">{content}</p>
    </div>
)
}

export function SuperpowerBlock({ title, description }: Superpower) {
return (
    <div className="rounded-lg bg-amber-600/20 border border-amber-500/40 p-4 space-y-2">
    <h4 className="text-sm font-semibold text-amber-500">{title}</h4>
    <p className="text-sm leading-relaxed">{description}</p>
    </div>
)
}

export function GrowthZoneBlock({ title, description }: GrowthZone) {
return (
    <div className="rounded-lg bg-emerald-600/20 border border-emerald-500/40 p-4 space-y-2">
    <h4 className="text-sm font-semibold text-emerald-500">{title}</h4>
    <p className="text-sm leading-relaxed">{description}</p>
    </div>
)
}


export function MessagesList({
messages,
cnWrapper = (s: string) => s,
}: {
messages: Message[]
cnWrapper?: (s: string) => string
}) {
return (
    <>
    {messages.map((message) => (
        <div key={message.id} className={cnWrapper(message.type === "system" ? "justify-start" : "justify-end")}>
        <div
            className={cn(
            "max-w-[85%] rounded-2xl px-5 py-4",
            message.type === "system" ? "bg-muted/50 text-foreground" : "bg-primary text-primary-foreground"
            )}
        >
            {message.content}
        </div>
        </div>
    ))}
    </>
)
}

/* -------------------------- RenderInputArea (presentational) -------------------------- */
/**
 * This presentational component receives a bunch of props from the
 * logic file (ConversationPage). It's intentionally verbose but purely UI.
 */
export function RenderInputArea(props: {
currentStage: FlowStage
inputValue: string
setInputValue: (v: string) => void
inputRef: React.RefObject<HTMLInputElement>
textareaRef: React.RefObject<HTMLTextAreaElement>
tasteVideos: File[]
bestVideos: File[]
growthVideos: File[]
editableGoals: string[]
isEditingGoals: boolean
isLoading: boolean

tasteGcsUris: string[]
bestGcsUris: string[]
growthGcsUris: string[]

tasteUrisText: string
setTasteUrisText: (v: string) => void
bestUrisText: string
setBestUrisText: (v: string) => void
growthUrisText: string
setGrowthUrisText: (v: string) => void

addTasteUrisFromText: () => void
addBestUrisFromText: () => void
addGrowthUrisFromText: () => void


// handlers (from ConversationPage)
handleNameSubmit: () => void
handleTiktokUsernameSubmit: () => void
handleTasteUpload: (files: FileList | null) => void
handleTasteAnalyze: () => void
handleTasteValidation: (isCorrect: boolean) => void
handleTasteClarification: () => void


handleBestUpload: (files: FileList | null) => void
handleBestAnalyze: () => void
handleSuperpowersValidation: (isCorrect: boolean) => void
handleSuperpowersClarification: () => void


handleGrowthUpload: (files: FileList | null) => void
handleGrowthAnalyze: () => void
handleGrowthValidation: (isCorrect: boolean) => void
handleGrowthClarification: () => void


handleGoalConfirmation: (confirmed: boolean) => void
setEditableGoals: (g: string[]) => void
handleGoalEditComplete: () => void

addEditableGoal: () => void;

removeEditableGoal: (index: number) => void;

handleKeyPress: (e: React.KeyboardEvent) => void
}) {
const {
    currentStage,
    inputValue,
    setInputValue,
    inputRef,
    textareaRef,
    tasteVideos,
    bestVideos,
    growthVideos,
    editableGoals,
    isEditingGoals,
    isLoading,

    handleNameSubmit,
    handleTiktokUsernameSubmit,
    handleTasteUpload,
    handleTasteAnalyze,
    handleTasteValidation,
    handleTasteClarification,

    handleBestUpload,
    handleBestAnalyze,
    handleSuperpowersValidation,
    handleSuperpowersClarification,

    handleGrowthUpload,
    handleGrowthAnalyze,
    handleGrowthValidation,
    handleGrowthClarification,

    handleGoalConfirmation,
    setEditableGoals,
    handleGoalEditComplete,

    addEditableGoal,
    removeEditableGoal,

    handleKeyPress,
} = props

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

    case "awaiting-tiktok-username":
    return (
        <div className="flex gap-2">
        <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="@username"
            className="flex-1"
            autoFocus
        />
        <Button onClick={handleTiktokUsernameSubmit} size="icon" className="shrink-0">
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
                    onClick={() => {
                    const next = tasteVideos.filter((_, i) => i !== idx)
                    // caller will call setTasteVideos via handleTasteUpload / outer state
                    // here we call handleTasteUpload with a synthetic FileList is complicated
                    // so the outer logic should support removing individual files if desired.
                    }}
                />
                </Badge>
            ))}
            </div>
        )}
        <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => document.getElementById("taste-upload")?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Videos
            </Button>
            <input id="taste-upload" type="file" accept="video/*" multiple onChange={(e) => handleTasteUpload(e.target.files)} className="hidden" />
            {tasteVideos.length > 0 && 
                <Button onClick={handleTasteAnalyze}>Analyze</Button>
            }
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

    /* BEST VIDEOS */
    case "awaiting-best-videos":
    return (
        <div className="space-y-3">
        {bestVideos.length > 0 && (
            <div className="flex flex-wrap gap-2">
            {bestVideos.map((file, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-2">
                <Check className="w-3 h-3" />
                {file.name}
                <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => {}} />
                </Badge>
            ))}
            </div>
        )}
        <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => document.getElementById("best-upload")?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Videos
            </Button>
            <input id="best-upload" type="file" accept="video/*" multiple onChange={(e) => handleBestUpload(e.target.files)} className="hidden" />
            {bestVideos.length > 0 && <Button onClick={handleBestAnalyze}>Analyze</Button>}
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

    case "awaiting-growth-videos":
    return (
        <div className="space-y-3">
        {growthVideos.length > 0 && (
            <div className="flex flex-wrap gap-2">
            {growthVideos.map((file, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-2">
                <Check className="w-3 h-3" />
                {file.name}
                <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => {}} />
                </Badge>
            ))}
            </div>
        )}
        <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => document.getElementById("growth-upload")?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Videos
            </Button>
            <input id="growth-upload" type="file" accept="video/*" multiple onChange={(e) => handleGrowthUpload(e.target.files)} className="hidden" />
            {growthVideos.length > 0 && <Button onClick={handleGrowthAnalyze}>Analyze</Button>}
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
        <div className="space-y-2 card card-background p-4 border overflow-y-auto max-h-60">
            {editableGoals.map((goal, idx) => (
            <div key={idx} className="flex items-center gap-2">
                <Input
                value={goal}
                onChange={(e) => {
                    const newGoals = [...editableGoals];
                    newGoals[idx] = e.target.value;
                    setEditableGoals(newGoals);
                }}
                className="flex-1"
                placeholder={`Goal ${idx + 1}`}
                />
                <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEditableGoal(idx)}
                title="Remove goal"
                >
                <X className="w-4 h-4" />
                </Button>
            </div>
            ))}
        </div>

        <div className="flex gap-2">
            <Button onClick={addEditableGoal} variant="outline" className="flex-1 items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
            </Button>
            <Button onClick={handleGoalEditComplete} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            Done
            </Button>
        </div>
        </div>
    )

    default:
    return null
}
}
