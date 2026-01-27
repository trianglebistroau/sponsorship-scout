import styled from "@emotion/styled";
import { motion, MotionStyle } from "framer-motion";
import { useEffect, useState } from "react";


const SIZE = 50;

const DotGrid = styled(motion.div)`
  position: absolute;
  width: 200%;
  height: 200%;
  background-size: ${SIZE}px ${SIZE}px;
  background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 2px, transparent 0);
  background-position: center;
  /* translateZ creates the physical depth in the 3D space */
  transform: translateZ(-500px);
`;

const DotGrid = ({ style }: { style?: MotionStyle }) => {
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