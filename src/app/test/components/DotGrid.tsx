import styled from "@emotion/styled";
import { motion } from "framer-motion";
import React,{ useEffect, useState } from "react";


const SIZE = 50;

const StyledDotGrid = styled(motion.div, {
  shouldForwardProp: (prop) => prop !== '$isDark'
  })<{ $isDark: boolean }>`
  position: absolute;
  width: 200%;
  height: 200%;
  background-size: ${SIZE}px ${SIZE}px;
  background-image: radial-gradient(
    circle at 2px 2px,
    ${props => props.$isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 10)"} 2px,
    transparent 0
  );
  background-position: center;
  transform: translateZ(-500px);
`;

const DotGrid = ({ style }: { style?: React.CSSProperties }) => {
  const [isDark, setIsDark] = useState(true);

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

  return <StyledDotGrid $isDark={isDark} style={style} />;
};

export default DotGrid;
