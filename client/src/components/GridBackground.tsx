import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface GridBackgroundProps {
  opacity?: number;
  color?: string;
  gridSize?: number;
  showDots?: boolean;
  animated?: boolean;
}

const GridBackground: React.FC<GridBackgroundProps> = ({
  opacity = 0.2,
  color = 'var(--accent-blue)',
  gridSize = 40,
  showDots = true,
  animated = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw background grid with dots at intersections
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawGrid();
    };
    
    const drawGrid = () => {
      const { width, height } = canvas;
      
      // Clear canvas
      context.clearRect(0, 0, width, height);
      
      // Set line style
      context.lineWidth = 1;
      context.strokeStyle = `${color}${Math.floor(opacity * 25).toString(16).padStart(2, '0')}`;
      
      // Calculate grid
      const numCellsX = Math.ceil(width / gridSize);
      const numCellsY = Math.ceil(height / gridSize);
      
      // Draw horizontal lines
      for (let y = 0; y <= numCellsY; y++) {
        context.beginPath();
        context.moveTo(0, y * gridSize);
        context.lineTo(width, y * gridSize);
        context.stroke();
      }
      
      // Draw vertical lines
      for (let x = 0; x <= numCellsX; x++) {
        context.beginPath();
        context.moveTo(x * gridSize, 0);
        context.lineTo(x * gridSize, height);
        context.stroke();
      }
      
      // Draw dots at intersections
      if (showDots) {
        for (let x = 0; x <= numCellsX; x++) {
          for (let y = 0; y <= numCellsY; y++) {
            const distance = Math.sqrt(
              Math.pow((x * gridSize - width / 2) / width * 2, 2) + 
              Math.pow((y * gridSize - height / 2) / height * 2, 2)
            );
            
            // Apply gradient effect based on distance from center
            const dotOpacity = Math.max(0.1, 1 - distance);
            const dotSize = Math.max(1, 3 - distance * 2);
            
            context.fillStyle = `${color}${Math.floor(dotOpacity * 255).toString(16).padStart(2, '0')}`;
            context.beginPath();
            context.arc(x * gridSize, y * gridSize, dotSize / 2, 0, 2 * Math.PI);
            context.fill();
          }
        }
      }
    };
    
    // Initialize
    resizeCanvas();
    
    // Respond to window resize
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [opacity, color, gridSize, showDots]);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Animated focal points (light effects) */}
      {animated && (
        <>
          <motion.div
            className="absolute w-[40vw] h-[40vw] rounded-full"
            style={{
              background: `radial-gradient(circle, ${color}15 0%, ${color}05 40%, transparent 70%)`,
              top: '25%',
              left: '10%',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          <motion.div
            className="absolute w-[30vw] h-[30vw] rounded-full"
            style={{
              background: `radial-gradient(circle, ${color}15 0%, ${color}05 40%, transparent 70%)`,
              bottom: '15%',
              right: '15%',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </>
      )}
    </div>
  );
};

export default GridBackground;