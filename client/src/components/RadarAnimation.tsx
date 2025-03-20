import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Bug, AlertTriangle } from 'lucide-react';

interface Bug {
  id: number;
  top: string;
  left: string;
  animationPath: string;
  size: string;
  color: 'red' | 'green';
}

const RadarAnimation: React.FC = () => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [radarAngle, setRadarAngle] = useState(0);
  
  // Generate random bugs
  useEffect(() => {
    const generateBugs = () => {
      const newBugs: Bug[] = [];
      
      for (let i = 0; i < 5; i++) {
        // Create random position for bugs
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 40; // % from center
        
        const top = `${50 - Math.cos(angle) * distance}%`;
        const left = `${50 + Math.sin(angle) * distance}%`;
        
        // Create random animation paths
        const endAngle = Math.random() * Math.PI * 2;
        const endDistance = 5 + Math.random() * 15;
        const endTop = 50 - Math.cos(endAngle) * endDistance;
        const endLeft = 50 + Math.sin(endAngle) * endDistance;
        
        const animationPath = `M${50 + Math.sin(angle) * distance},${50 - Math.cos(angle) * distance} Q${50},${50} ${endLeft},${endTop}`;
        
        newBugs.push({
          id: i,
          top,
          left,
          animationPath,
          size: `${1 + Math.random() * 1.5}rem`,
          color: Math.random() > 0.5 ? 'red' : 'green'
        });
      }
      
      setBugs(newBugs);
    };
    
    generateBugs();
    
    // Regenerate bugs every 8 seconds
    const interval = setInterval(generateBugs, 8000);
    return () => clearInterval(interval);
  }, []);
  
  // Rotate radar
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 1) % 360);
    }, 40);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-80 w-full max-w-md mx-auto rounded-full overflow-hidden blue-glow-border">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `
              radial-gradient(circle, transparent 0%, transparent 70%, var(--accent-blue) 100%),
              conic-gradient(from 0deg, var(--accent-blue-light) 0%, transparent 5%, transparent 95%, var(--accent-blue-light) 100%),
              conic-gradient(from 90deg, var(--accent-blue-light) 0%, transparent 5%, transparent 95%, var(--accent-blue-light) 100%),
              radial-gradient(circle at center, var(--accent-blue) 0%, transparent 30%)
            `,
            backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%'
          }}
        />
        
        {/* Radar circles */}
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="absolute inset-0 rounded-full border border-accent-blue/30"
            style={{ transform: `scale(${i * 0.25})` }}
          />
        ))}
        
        {/* Radar crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-accent-blue/20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px bg-accent-blue/20" />
        </div>
      </div>
      
      {/* Radar sweep */}
      <div 
        className="absolute inset-0 origin-center" 
        style={{ transform: `rotate(${radarAngle}deg)` }}
      >
        <div className="absolute top-1/2 left-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent to-accent-blue-light opacity-70" />
        
        {/* Pulse effect at the center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div 
            className="w-4 h-4 rounded-full bg-accent-blue-light"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.7, 0.3, 0.7] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
      
      {/* Center Shield Icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-blue-light">
        <Shield className="w-12 h-12 opacity-70" />
      </div>
      
      {/* Animated bugs */}
      {bugs.map((bug) => (
        <motion.div
          key={bug.id}
          className="absolute"
          initial={{ top: bug.top, left: bug.left }}
          animate={{
            top: '50%',
            left: '50%',
            opacity: [1, 0.7, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
          style={{ 
            translateX: '-50%',
            translateY: '-50%'
          }}
        >
          {bug.color === 'red' ? (
            <AlertTriangle className="text-red-500" style={{ width: bug.size, height: bug.size }} />
          ) : (
            <Bug className="text-green-400" style={{ width: bug.size, height: bug.size }} />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default RadarAnimation;