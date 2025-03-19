import React from 'react';
import { motion } from 'framer-motion';

interface GridBackgroundProps {
  opacity?: number;
  color?: string;
  gridSize?: number;
}

const GridBackground: React.FC<GridBackgroundProps> = ({ 
  opacity = 0.15, 
  color = 'accent-blue', 
  gridSize = 40 
}) => {
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
            linear-gradient(to right, var(--${color})/10 1px, transparent 1px),
            linear-gradient(to bottom, var(--${color})/10 1px, transparent 1px)
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
            linear-gradient(to right, var(--${color})/20 1px, transparent 1px),
            linear-gradient(to bottom, var(--${color})/20 1px, transparent 1px)
          `,
          opacity: opacity
        }}
      />
      
      {/* Radial gradient for depth effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-background/80 opacity-70" />
    </motion.div>
  );
};

export default GridBackground;