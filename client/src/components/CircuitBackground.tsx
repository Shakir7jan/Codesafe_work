import React from 'react';
import { motion } from 'framer-motion';

interface CircuitLineProps {
  width: string;
  height: string;
  top: string;
  left: string;
  delay?: number;
}

const CircuitLine: React.FC<CircuitLineProps> = ({ width, height, top, left, delay = 0 }) => {
  return (
    <motion.div
      className="circuit-line absolute bg-accent-blue/20"
      style={{ width, height, top, left }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay }}
    />
  );
};

interface CircuitBackgroundProps {
  density?: 'low' | 'medium' | 'high';
}

const CircuitBackground: React.FC<CircuitBackgroundProps> = ({ density = 'medium' }) => {
  // Determine how many circuit lines to render based on density
  const getLineCount = () => {
    switch(density) {
      case 'low': return 6;
      case 'high': return 16;
      default: return 10; // medium
    }
  };
  
  const lineCount = getLineCount();
  
  // Generate random circuit lines
  const generateLines = () => {
    const lines = [];
    for (let i = 0; i < lineCount; i++) {
      // Randomly decide if this is a horizontal or vertical line
      const isHorizontal = Math.random() > 0.5;
      
      const width = isHorizontal ? `${20 + Math.random() * 150}px` : '2px';
      const height = isHorizontal ? '2px' : `${20 + Math.random() * 100}px`;
      const top = `${Math.random() * 100}%`;
      const left = `${Math.random() * 100}%`;
      const delay = Math.random() * 2;
      
      lines.push(
        <CircuitLine 
          key={i}
          width={width}
          height={height}
          top={top}
          left={left}
          delay={delay}
        />
      );
    }
    return lines;
  };
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {generateLines()}
    </div>
  );
};

export default CircuitBackground;
