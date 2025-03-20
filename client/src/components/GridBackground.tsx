import React from 'react';
import { motion } from 'framer-motion';

interface GridBackgroundProps {
  opacity?: number;
  color?: string;
  gridSize?: number;
  showDots?: boolean;
  animated?: boolean;
}

const GridBackground: React.FC<GridBackgroundProps> = ({ 
  opacity = 0.3, 
  color = 'accent-blue', 
  gridSize = 40,
  showDots = true,
  animated = true
}) => {
  // Generate dot positions for the grid
  const dots = React.useMemo(() => {
    if (!showDots) return [];
    
    const dotsArray = [];
    const rows = Math.ceil(window.innerHeight / gridSize) + 5;
    const cols = Math.ceil(window.innerWidth / gridSize) + 5;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if ((i + j) % 4 === 0) { // Only show some dots for a cleaner look
          dotsArray.push({
            id: `${i}-${j}`,
            top: i * gridSize,
            left: j * gridSize,
            delay: (i + j) * 0.05,
            size: Math.random() > 0.9 ? 2 : 1, // Some dots are larger
          });
        }
      }
    }
    
    return dotsArray;
  }, [gridSize, showDots]);

  return (
    <motion.div 
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Main grid pattern */}
      <div 
        className={`absolute inset-0`}
        style={{
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundImage: `
            linear-gradient(to right, var(--${color})/15 1px, transparent 1px),
            linear-gradient(to bottom, var(--${color})/15 1px, transparent 1px)
          `,
          opacity: opacity
        }}
      />
      
      {/* Larger grid overlay for depth */}
      <div 
        className={`absolute inset-0`}
        style={{
          backgroundSize: `${gridSize * 5}px ${gridSize * 5}px`,
          backgroundImage: `
            linear-gradient(to right, var(--${color})/30 1px, transparent 1px),
            linear-gradient(to bottom, var(--${color})/30 1px, transparent 1px)
          `,
          opacity: opacity * 1.2
        }}
      />
      
      {/* Animated dots at grid intersections */}
      {showDots && dots.map(dot => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-accent-blue"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            boxShadow: `0 0 ${dot.size * 4}px ${dot.size}px var(--accent-blue)`
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={animated ? { 
            opacity: [0, 0.7, 0.4], 
            scale: [0, 1.2, 1] 
          } : { opacity: 0.5, scale: 1 }}
          transition={animated ? { 
            duration: 3, 
            delay: dot.delay, 
            repeat: Infinity,
            repeatType: "reverse" 
          } : { duration: 0.5, delay: dot.delay }}
        />
      ))}
      
      {/* Radial gradient for depth effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-background/80 opacity-70" />
    </motion.div>
  );
};

export default GridBackground;