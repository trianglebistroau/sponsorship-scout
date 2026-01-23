import styled from "@emotion/styled";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// -- Status Theme Mapping --
const getStatusStyles = (status: "ready" | "hidden" | "shown" | "committed" | "rejected") => {
switch (status) {
    case "committed":
    return {
        border: "rgba(74, 222, 128, 0.5)", // Green
        glow: "rgba(74, 222, 128, 0.2)",
        bg: "linear-gradient(145deg, #0d1a12, #142018)",
        label: "#4ade80"
    };
    case "rejected":
    return {
        border: "rgba(248, 113, 113, 0.3)", // Red
        glow: "transparent",
        bg: "linear-gradient(145deg, #1a1010, #201414)",
        label: "#f87171"
    };
    case "shown":
    default:
    return {
        border: "rgba(255, 255, 255, 0.1)",
        glow: "rgba(255, 255, 255, 0.05)",
        bg: "rgba(20, 20, 20, 0.95)",
        label: "rgba(255, 255, 255, 0.5)"
    };
    case "hidden":
        return {
            border: "rgba(100, 100, 100, 0.2)",
            glow: "transparent",
            bg: "rgba(30, 30, 30, 0.8)",
            label: "rgba(150, 150, 150, 0.5)"
        };
    case "ready":
        return {
            border: "rgba(150, 150, 255, 0.3)",
            glow: "rgba(150, 150, 255, 0.1)",
            bg: "rgba(25, 25, 40, 0.9)",
            label: "rgba(150, 150, 255, 0.5)"
        };

}
};

// -- Styled Components --

const Container = styled.div<{
$uiStatus: "active" | "history" | "future";
$ideaStatus: "ready" | "hidden" | "shown" | "committed" | "rejected";
$isFlipped: boolean
}>`
position: relative;
width: 400px;
height: 600px;
border-radius: 20px;
transform-style: preserve-3d;
transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
transform: ${props => props.$isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"};

/* Visual Feedback based on Idea Status */
box-shadow: 0 20px 50px rgba(0,0,0,0.5), 
            0 0 30px ${props => getStatusStyles(props.$ideaStatus).glow};

cursor: ${props => props.$uiStatus === "active" ? "default" : "pointer"};
pointer-events: ${props => (props.$uiStatus === "active" || props.$uiStatus === "history") ? "all" : "none"};

/* Dim rejected cards */
opacity: ${props => props.$ideaStatus === "rejected" ? 0.6 : 1};
`;

const Face = styled.div<{ 
    $variant: "front" | "back"; 
    $ideaStatus: "ready" | "hidden" | "shown" | "committed" | "rejected" 
}>`
position: absolute;
top: 0; left: 0;
width: 100%; height: 100%;
backface-visibility: hidden;
border-radius: 20px;
padding: 2rem;
display: flex;
flex-direction: column;
gap: 1.5rem;
overflow: hidden;

/* Dynamic Border and Background from Status */
border: 1px solid ${props => getStatusStyles(props.$ideaStatus).border};
background: ${props => props.$variant === "back" 
    ? "linear-gradient(145deg, #1a1a1a, #2a2a2a)" 
    : getStatusStyles(props.$ideaStatus).bg};

transform: ${props => props.$variant === "back" ? "rotateY(180deg)" : "none"};
`;

const StatusBadge = styled.div<{ color: string }>`
position: absolute;
top: 1rem;
right: 1.5rem;
font-size: 0.65rem;
font-weight: 800;
text-transform: uppercase;
letter-spacing: 1px;
padding: 4px 10px;
border-radius: 20px;
background: ${props => props.color};
color: #000;
z-index: 5;
`;

const Section = styled.div` display: flex; flex-direction: column; gap: 0.5rem; `;
const Label = styled.h4<{ color?: string }>` 
font-size: 0.75rem; 
text-transform: uppercase; 
color: ${props => props.color || "rgba(255,255,255,0.5)"}; 
margin: 0; 
`;

const EditableInput = styled.textarea`
background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
color: white; padding: 0.8rem; border-radius: 8px; width: 100%; font-family: inherit; resize: none;
`;

const ButtonGroup = styled.div` margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; `;

const Button = styled.button<{ variant?: "primary" | "ghost" }>`
padding: 0.8rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;
background: ${props => props.variant === "primary" ? "#fff" : "rgba(255,255,255,0.1)"};
color: ${props => props.variant === "primary" ? "#000" : "#fff"};
transition: 0.2s;
&:hover { opacity: 0.8; }
`;

const LoadingOverlay = styled(motion.div)`
position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 10;
background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.05) 40%, transparent 60%);
background-size: 200% 100%;
pointer-events: none;
`;

// -- Types --
export interface IdeaData {
id: number;
title: string; 
hook: string; 
beats: string[]; 
rationale: string;
status: "ready" | "hidden" | "shown" | "committed" | "rejected";
}

interface CardProps {
    data: IdeaData;
    uiStatus: "active" | "history" | "future";
    onUpdate: (updated: IdeaData) => void;
    onCommit: (index: number) => void;
    onReject: () => void;
    id: number;
}

const Card: React.FC<CardProps> = ({ data, uiStatus, onUpdate, onCommit, onReject, id }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState(data);
    useEffect(() => {
        setEditState(data);
        setIsEditing(false);
    }, [data]);

    const handleSave = () => {
        onUpdate(editState);
        setIsEditing(false);
    };

        const handleBeatChange = (index: number, val: string) => {
        const newBeats = [...editState.beats];
        newBeats[index] = val;
        setEditState({...editState, beats: newBeats});

    };

    const isGenerating = data.status === "hidden";
    const styles = getStatusStyles(data.status);

    const handleCommit = () => {
        onCommit(id);
    };


    if (isGenerating) {
        return (
        <Container $uiStatus={uiStatus} $ideaStatus="hidden" $isFlipped={false}>
            <Face $variant="front" $ideaStatus="hidden" style={{ opacity: 0.5 }}>
                <LoadingOverlay 
                    animate={{ backgroundPosition: ["100% 0", "-100% 0"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} 
                />
                <Label>AI Engine Processing...</Label>
                <h2 style={{ opacity: 0.3 }}>Synthesizing Idea...</h2>
            </Face>
        </Container>
        );
    }

    return (
        <Container $uiStatus={uiStatus} $ideaStatus={data.status} $isFlipped={isEditing}>
        
        {/* Visual Indicator of the domain status */}
        {data.status === "committed" && <StatusBadge color="#4ade80">Committed</StatusBadge>}
        {data.status === "rejected" && <StatusBadge color="#f87171">Rejected</StatusBadge>}

        <Face $variant="front" $ideaStatus={data.status}>
            <div>
                <Label color={styles.label}>Concept</Label>
                <h2 style={{margin: "0.2rem 0"}}>{data.title}</h2>
            </div>
            
            <Section><Label color={styles.label}>The Hook</Label><p>{data.hook}</p></Section>
            
            <Section>
                <Label color={styles.label}>Story Beats</Label>
                <ul style={{paddingLeft: '1.2rem', margin: 0, opacity: 0.9}}>
                    {data.beats.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
            </Section>

            {/* Buttons only visible if the card is active and not already rejected/committed */}
            {uiStatus === "active" && (
                <ButtonGroup>
                    <Button variant="primary" onClick={handleCommit}>Commit</Button>
                    <Button onClick={() => setIsEditing(true)}>Edit</Button>
                    <Button onClick={onReject}>Reject</Button>
                </ButtonGroup>
            )}

            {/* Restore button if looking at history */}
            {uiStatus === "history" && (
                <div style={{ marginTop: 'auto', textAlign: 'center', opacity: 0.6, fontSize: '0.8rem' }}>
                    Click to restore this idea
                </div>
            )}
        </Face>

        <Face $variant="back" $ideaStatus={data.status}>
            <Label>Refine Idea</Label>
            <Section>
                <Label>Title</Label>
                <EditableInput value={editState.title} onChange={e => setEditState({...editState, title: e.target.value})} />
            </Section>
            <Section>
                <Label>Hook</Label>
                <EditableInput value={editState.hook} onChange={e => setEditState({...editState, hook: e.target.value})} rows={3} />
            </Section>

            <Section style={{ flex: 1, overflowY: 'auto' }}>
                <Label>Beats</Label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {editState.beats.map((beat, idx) => (
                        <EditableInput
                        key={idx}
                        value={beat}
                        rows={2}
                        onChange={(e) => handleBeatChange(idx, e.target.value)}
                        />
                    ))}
                    </div>
            </Section>


            
            <ButtonGroup>
                <Button variant="primary" onClick={handleSave}>Apply Changes</Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            </ButtonGroup>
        </Face>

        </Container>
    );
};

export default Card;