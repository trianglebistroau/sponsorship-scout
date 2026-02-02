// Card.tsx
import styled from "@emotion/styled";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// -- Status Theme Mapping with Dark/Light mode support --
const getStatusStyles = (
  status: "ready" | "generating" | "shown" | "committed" | "rejected",
  isDark: boolean
) => {
  const baseStyles = {
    committed: {
      border: isDark ? "rgba(74, 222, 128, 0.5)" : "rgba(34, 197, 94, 0.6)",
      glow: isDark ? "rgba(74, 222, 128, 0.2)" : "rgba(34, 197, 94, 0.15)",
      bg: isDark ? "linear-gradient(145deg, #0d1a12, #142018)" : "linear-gradient(145deg, #f0fdf4, #dcfce7)",
      label: isDark ? "#4ade80" : "#16a34a"
    },
    rejected: {
      border: isDark ? "rgba(248, 113, 113, 0.5)" : "rgba(239, 68, 68, 0.6)",
      glow: isDark ? "rgba(248, 113, 113, 0.2)" : "rgba(239, 68, 68, 0.15)",
      bg: isDark ? "linear-gradient(145deg, #1a1010, #201414)" : "linear-gradient(145deg, #fef2f2, #fee2e2)",
      label: isDark ? "#f87171" : "#dc2626"
    },
    shown: {
      border: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.15)",
      glow: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      bg: isDark ? "rgba(20, 20, 20, 0.95)" : "rgba(255, 255, 255, 0.95)",
      label: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"
    },
    generating: {
      border: isDark ? "rgba(100, 100, 100, 0.2)" : "rgba(150, 150, 150, 0.3)",
      glow: "transparent",
      bg: isDark ? "rgba(30, 30, 30, 0.8)" : "rgba(240, 240, 240, 0.8)",
      label: isDark ? "rgba(150, 150, 150, 0.5)" : "rgba(100, 100, 100, 0.5)"
    },
    ready: {
      border: isDark ? "rgba(150, 150, 255, 0.3)" : "rgba(99, 102, 241, 0.4)",
      glow: isDark ? "rgba(150, 150, 255, 0.1)" : "rgba(99, 102, 241, 0.1)",
      bg: isDark ? "rgba(25, 25, 40, 0.9)" : "rgba(238, 242, 255, 0.9)",
      label: isDark ? "rgba(150, 150, 255, 0.5)" : "rgba(79, 70, 229, 0.7)"
    }
  };
  
  return baseStyles[status];
};

// -- Styled Components --
const Container = styled.div<{
  $uiStatus: "active" | "history" | "future";
  $ideaStatus: "ready" | "generating" | "shown" | "committed" | "rejected";
  $isFlipped: boolean;
  $isDark: boolean;
}>`
  position: relative;
  width: min(560px, 72vw);
  height: min(760px, 66vh);
  border-radius: 20px;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: ${props => props.$isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"};
  box-shadow: 0 20px 50px ${props => props.$isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)"},
              0 0 30px ${props => getStatusStyles(props.$ideaStatus, props.$isDark).glow};
  cursor: ${props => props.$uiStatus === "active" ? "default" : "pointer"};
  pointer-events: ${props => (props.$uiStatus === "active" || props.$uiStatus === "history") ? "all" : "none"};
`;

const MarkdownWrap = styled.div<{ $isDark: boolean }>`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0.9rem;
  border-radius: 12px;
  border: 1px solid ${p => p.$isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};
  background: ${p => p.$isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.6)"};

  /* basic markdown typography */
  & h1, & h2, & h3 { margin: 0.6rem 0 0.3rem; }
  & p { margin: 0.4rem 0; line-height: 1.45; }
  & hr { border: none; border-top: 1px solid rgba(128,128,128,0.25); margin: 0.8rem 0; }

  /* tables */
  & table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  & th, & td { border: 1px solid rgba(128,128,128,0.25); padding: 0.45rem; vertical-align: top; }
  & thead th { position: sticky; top: 0; background: ${p => p.$isDark ? "rgba(20,20,20,0.95)" : "rgba(245,245,245,0.95)"}; }

  /* code blocks */
  & pre { overflow: auto; padding: 0.8rem; border-radius: 10px; }
`;

const OutlinePreview = styled(MarkdownWrap)`
  position: relative;
  max-height: 220px;
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 60px;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0),
      ${p => p.$isDark ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)"}
    );
    pointer-events: none;
  }
`;

const OutlineActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const Face = styled.div<{ 
  $variant: "front" | "back"; 
  $ideaStatus: "ready" | "generating" | "shown" | "committed" | "rejected";
  $isDark: boolean;
}>`
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  min-height: 0;
  min-width: 0;
  backface-visibility: hidden;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow: auto;
  scrollbar-gutter: stable;
  border: 1px solid ${props => getStatusStyles(props.$ideaStatus, props.$isDark).border};
  background: ${props => props.$variant === "back" 
    ? (props.$isDark ? "linear-gradient(145deg, #1a1a1a, #2a2a2a)" : "linear-gradient(145deg, #f5f5f5, #e5e5e5)")
    : getStatusStyles(props.$ideaStatus, props.$isDark).bg};
  color: ${props => props.$isDark ? "#fff" : "#000"};
  transform: ${props => props.$variant === "back" ? "rotateY(180deg)" : "none"};
`;

const StatusBadge = styled.div<{ color: string; $isDark: boolean }>`
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
  color: ${props => props.$isDark ? "#000" : "#fff"};
  z-index: 5;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0;
`;

const Label = styled.h4<{ color?: string }>`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: ${props => props.color || "rgba(128,128,128,0.7)"};
  margin: 0;
`;

const EditableInput = styled.textarea<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)"};
  border: 1px solid ${props => props.$isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)"};
  color: ${props => props.$isDark ? "white" : "black"};
  padding: 0.8rem;
  border-radius: 8px;
  width: 100%;
  font-family: inherit;
  resize: none;
`;

const EditableText = styled.input<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)"};
  border: 1px solid ${props => props.$isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)"};
  color: ${props => props.$isDark ? "white" : "black"};
  padding: 0.7rem 0.8rem;
  border-radius: 8px;
  width: 100%;
  font-family: inherit;
`;

const BeatRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  align-items: center;
`;

const MiniButton = styled.button<{ $isDark: boolean }>`
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid ${p => p.$isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"};
  background: ${p => p.$isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"};
  color: inherit;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  margin-top: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
`;

const Button = styled.button<{ variant?: "primary" | "ghost"; $isDark: boolean }>`
  padding: 0.8rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  background: ${props => props.variant === "primary" 
    ? (props.$isDark ? "#fff" : "#000")
    : (props.$isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")};
  color: ${props => props.variant === "primary" 
    ? (props.$isDark ? "#000" : "#fff")
    : (props.$isDark ? "#fff" : "#000")};
  transition: 0.2s;
  &:hover { opacity: 0.8; }
`;

const LoadingOverlay = styled(motion.div, {
  shouldForwardProp: (prop) => prop !== '$isDark'
  })<{ $isDark: boolean }>`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10;
  background: ${props => props.$isDark 
    ? "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.05) 40%, transparent 60%)"
    : "linear-gradient(110deg, transparent 20%, rgba(0,0,0,0.05) 40%, transparent 60%)"};
  background-size: 200% 100%;
  pointer-events: none;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

const Pill = styled.span<{ $isDark: boolean; $tone?: "neutral" | "accent" }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid ${(p) => (p.$isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)")};
  background: ${(p) =>
    p.$tone === "accent"
      ? p.$isDark
        ? "rgba(99,102,241,0.18)"
        : "rgba(99,102,241,0.12)"
      : p.$isDark
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.06)"};
`;

const HookBox = styled.div<{ $isDark: boolean }>`
  padding: 0.9rem;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)")};
  background: ${(p) => (p.$isDark ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.55)")};
  line-height: 1.5;
  position: relative;
  &::before {
    content: "“";
    position: absolute;
    top: -10px;
    left: 10px;
    font-size: 2.4rem;
    opacity: 0.18;
  }
`;


export interface IdeaData {
  id: number;
  title: string;
  hook: string;
  beats: string[];
  rationale: string;
  contentMd?: string;

  tags?: string[];
  estimatedLength?: string;

  status: "ready" | "generating" | "shown" | "committed" | "rejected";
  planId?: string;
}


interface CardProps {
  data: IdeaData;
  uiStatus: "active" | "history" | "future";
  onUpdate: (updated: IdeaData) => void;
  onCommit: (index: number) => void;
  onReject: (index: number) => void;
  onNext: () => void;
  id: number;
}

const Card: React.FC<CardProps> = ({ data, uiStatus, onUpdate, onCommit, onReject, onNext, id }) => {
  const [isFlipped, setisFlipped] = useState(false);
  const [editState, setEditState] = useState(data);
  const [isDark, setIsDark] = useState(true);
  const [showFullOutline, setShowFullOutline] = useState(false);
  const isPlaceholder = data.status === "ready" || data.id === -1;


  // Detect theme from document
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setEditState(data);
    setisFlipped(false);
    setShowFullOutline(false);
  }, [data]);

  const handleSave = () => {
    onUpdate(editState);
    setisFlipped(false);
  };

  const handleBeatChange = (index: number, val: string) => {
    const newBeats = [...(editState.beats ?? [])];
    newBeats[index] = val;
    setEditState({...editState, beats: newBeats});
  };

  const handleAddBeat = () => {
    setEditState({
      ...editState,
      beats: [...(editState.beats ?? []), ""],
    });
  };

  const handleRemoveBeat = (index: number) => {
    const next = [...(editState.beats ?? [])];
    next.splice(index, 1);
    setEditState({ ...editState, beats: next });
  };

  const isGenerating = data.status === "generating";
  const styles = getStatusStyles(data.status, isDark);
  const outlinePreview = (data.contentMd ?? "*No details available.*")
    .split("\n")
    .slice(0, 12)
    .join("\n");

  if (isGenerating) {
    return (
      <Container $uiStatus={uiStatus} $ideaStatus="generating" $isFlipped={false} $isDark={isDark}>
        <Face $variant="front" $ideaStatus="generating" $isDark={isDark} style={{ opacity: 0.5 }}>
          <LoadingOverlay 
            $isDark={isDark}
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
    <Container $uiStatus={uiStatus} $ideaStatus={data.status} $isFlipped={isFlipped} $isDark={isDark}>
      <Face $variant="front" $ideaStatus={data.status} $isDark={isDark}>
        {data.status === "committed" && <StatusBadge color="#4ade80" $isDark={isDark}>Committed</StatusBadge>}
        {data.status === "rejected" && <StatusBadge color="#f87171" $isDark={isDark}>Rejected</StatusBadge>}

        <div>
          <Label color={styles.label}>Concept</Label>
          <h2 style={{ margin: "0.25rem 0 0.35rem", fontSize: "1.55rem", lineHeight: 1.15 }}>
            {data.title}
          </h2>

          <MetaRow>
            {data.estimatedLength ? (
              <Pill $isDark={isDark} $tone="accent"> {data.estimatedLength}</Pill>
            ) : null}

            {Array.isArray(data.tags) && data.tags.length ? (
              data.tags.slice(0, 8).map((t) => <Pill key={t} $isDark={isDark}>#{t}</Pill>)
            ) : (
              <Pill $isDark={isDark}>No tags</Pill>
            )}
          </MetaRow>
        

        <Section>
          <Label color={styles.label}>Hook</Label>
          <HookBox $isDark={isDark}>{data.hook}</HookBox>
        </Section>

        {data.beats?.length ? (
          <Section>
            <Label color={styles.label}>Beats</Label>
            <MetaRow>
              {data.beats.slice(0, 6).map((b, i) => (
                <Pill key={`${b}-${i}`} $isDark={isDark}>{b}</Pill>
              ))}
            </MetaRow>
          </Section>
        ) : null}

        <Section>
          <Label color={styles.label}>Script outline</Label>

          {showFullOutline ? (
            <>
              <MarkdownWrap $isDark={isDark}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {data.contentMd ?? "*No details available.*"}
                </ReactMarkdown>
              </MarkdownWrap>
              <OutlineActions>
                <Button $isDark={isDark} onClick={() => setShowFullOutline(false)}>
                  Hide full outline
                </Button>
              </OutlineActions>
            </>
          ) : (
            <>
              <OutlinePreview $isDark={isDark}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {outlinePreview}
                </ReactMarkdown>
              </OutlinePreview>
              <OutlineActions>
                <Button variant="ghost" $isDark={isDark} onClick={() => setShowFullOutline(true)}>
                  View full outline
                </Button>
              </OutlineActions>
            </>
          )}
        </Section>
        </div>

        {uiStatus === "active" && (
          <ButtonGroup>
            <Button variant="primary" $isDark={isDark} onClick={() => onCommit(id)}>Commit</Button>
            <Button $isDark={isDark} onClick={() => setisFlipped(true)}>Edit</Button>
            <Button $isDark={isDark} onClick={() => onReject(id)}>Reject</Button>
            <Button $isDark={isDark} onClick={onNext}>Next</Button>
          </ButtonGroup>
        )}

        {uiStatus === "history" && (
          <div style={{ marginTop: 'auto', textAlign: 'center', opacity: 0.6, fontSize: '0.8rem' }}>
            Click to restore this idea
          </div>
        )}
      </Face>

      <Face $variant="back" $ideaStatus={data.status} $isDark={isDark}>
        <Label>Refine Idea</Label>
    
        <Section style={{ flex: 1 , overflowY: 'auto' }}>
          <Label>Title</Label>
          <EditableText
            $isDark={isDark}
            value={editState.title || ""}
            onChange={e => setEditState({ ...editState, title: e.target.value })}
            placeholder="Idea title"
          />

          <Label>Hook</Label>
          <EditableInput
            $isDark={isDark}
            value={editState.hook || ""}
            onChange={e => setEditState({ ...editState, hook: e.target.value })}
            rows={3}
            placeholder="Short hook that grabs attention"
          />

          <Label>Beats</Label>
          <Section>
            {(editState.beats ?? []).map((beat, i) => (
              <BeatRow key={`beat-${i}`}>
                <EditableText
                  $isDark={isDark}
                  value={beat}
                  onChange={e => handleBeatChange(i, e.target.value)}
                  placeholder={`Beat ${i + 1}`}
                />
                <MiniButton $isDark={isDark} onClick={() => handleRemoveBeat(i)}>Remove</MiniButton>
              </BeatRow>
            ))}
            <MiniButton $isDark={isDark} onClick={handleAddBeat}>Add beat</MiniButton>
          </Section>

          <Label>Tags</Label>
          <EditableText
            $isDark={isDark}
            value={(editState.tags ?? []).join(", ")}
            onChange={e =>
              setEditState({
                ...editState,
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="comma,separated,tags"
          />

          <Label>Estimated length</Label>
          <EditableText
            $isDark={isDark}
            value={editState.estimatedLength || ""}
            onChange={e => setEditState({ ...editState, estimatedLength: e.target.value })}
            placeholder="e.g. 60s, 2 min"
          />

          <Label>Full Script (Markdown)</Label>
          <EditableInput
            $isDark={isDark}
            value={editState.contentMd || ""}
            onChange={e => setEditState({...editState, contentMd: e.target.value})}
            style={{ minHeight: "240px" }}
          />
        </Section>
        
        <ButtonGroup>
          <Button variant="primary" $isDark={isDark} onClick={handleSave}>Apply Changes</Button>
          <Button $isDark={isDark} onClick={() => setisFlipped(false)}>Cancel</Button>
        </ButtonGroup>
      </Face>
    </Container>
  );
};

export default Card;
