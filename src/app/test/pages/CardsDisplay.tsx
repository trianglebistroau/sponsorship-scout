"use client";
import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import DotGrid from "../components/DotGrid";
import Card, { IdeaData } from "../components/Card";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

const Container = styled.div<{ $isDark: boolean }>`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  perspective: 1200px;
  background-color: ${props => props.$isDark ? "#0a0a0a" : "#e5e5e5"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
`;

const DeckWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  backdrop-filter: blur(3px) brightness(120%);
`;

const INITIAL_IDEAS: IdeaData[] = [
  { id: 0, title: "Idea 1: The 'Secret Sauce'", hook: "Everyone thinks X is hard...", beats: ["Struggle", "Secret", "Result"], rationale: "Validates struggle.", status: "shown" },
  { id: 1, title: "Idea 2: Chaos Edition", hook: "Stop trying to be perfect...", beats: ["Mistake", "Messy work", "Happy end"], rationale: "Authenticity.", status: "shown" },
  { id: 2, title: "Idea 3: The Contrarian", hook: "Why popular advice is wrong...", beats: ["Myth", "Truth", "Proof"], rationale: "Shock value.", status: "ready" },
  { id: 3, title: "Idea 4: ASMR Style", hook: "Quiet luxury vibes...", beats: ["Sound", "Texture", "Calm"], rationale: "Sensory appeal.", status: "ready" },
  { id: 4, title: "Idea 5: The Underdog", hook: "From zero to hero...", beats: ["Low point", "Climb", "Victory"], rationale: "Relatable journey.", status: "ready" },
  { id: 5, title: "Idea 6: The Visionary", hook: "Imagine a world where...", beats: ["Vision", "Action", "Impact"], rationale: "Inspires imagination.", status: "hidden" },
];

export default function DeckPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ideas, setIdeas] = useState(INITIAL_IDEAS);
  const [isDark, setIsDark] = useState(true);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseXSpring = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 40, damping: 20 });

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    mouseX.set(e.clientX - innerWidth / 2);
    mouseY.set(e.clientY - innerHeight / 2);
  };

  const rotateX = useTransform(mouseYSpring, [-500, 500], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-500, 500], [-10, 10]);
  const bgX = useTransform(mouseXSpring, [-500, 500], [40, -40]);
  const bgY = useTransform(mouseYSpring, [-500, 500], [40, -40]);

  const handleNext = () => {
    if (currentIndex < ideas.length - 1) {
      setCurrentIndex(prev => prev + 1);
      if (ideas[currentIndex].status === "ready") {
        ideas[currentIndex].status = "shown";
        setIdeas([...ideas]);
      }
    }
  };

  const handlePrev = (index: number) => {
    setCurrentIndex(index);
  };

  const handleReject = (index: number) => {
    ideas[index].status = "rejected";
    setIdeas([...ideas]);
  };

  const handleUpdate = (updated: IdeaData) => {
    const newIdeas = [...ideas];
    newIdeas[currentIndex] = updated;
    setIdeas(newIdeas);
  };

  const onCommit = (index: number) => {
    ideas[index].status = "committed";
    setIdeas([...ideas]);
  };

  return (
    <Container $isDark={isDark} onMouseMove={handleMouseMove}>
      <DotGrid style={{ x: bgX, y: bgY }}  />

      <DeckWrapper>
        {ideas.map((idea, index) => {
          const isHistory = index < currentIndex;
          const isActive = index === currentIndex;
          const isFuture = index > currentIndex;
          const offset = index - currentIndex;

          return (
            <motion.div
              key={idea.id}
              onClick={() => isHistory && handlePrev(index)}
              style={{
                position: "absolute",
                zIndex: isActive ? 10 : 10 - Math.abs(offset),
                transformStyle: "preserve-3d",
                rotateX: isActive ? rotateX : 0,
                rotateY: isActive ? rotateY : 0,
                cursor: isHistory ? "pointer" : "default"
              }}
              initial={false}
              animate={{
                x: isHistory ? -550 + (offset * 40) :
                   isFuture ? 550 + (offset * 40) : 0,
                scale: isActive ? 1 : 0.85,
                opacity: isActive ? 1 : isHistory ? 0.6 : 0.3,
                rotateZ: isHistory ? -10 + (offset * 2) : isFuture ? 5 : 0,
              }}
              whileHover={isHistory ? {
                x: -480 + (offset * 40),
                opacity: 1,
                scale: 0.9,
                rotateZ: -5 + (offset * 2)
              } : {}}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Card
                data={idea}
                uiStatus={isActive ? "active" : isHistory ? "history" : "future"}
                onUpdate={handleUpdate}
                onCommit={onCommit}
                onReject={handleReject}
                onNext={handleNext}
                id={idea.id}
              />
            </motion.div>
          );
        })}
      </DeckWrapper>
    </Container>
  );
}