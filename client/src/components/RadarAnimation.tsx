import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface Bug {
  id: number;
  top: string;
  left: string;
  animationPath: string;
  size: string;
  color: 'red' | 'green';
}

const RadarAnimation: React.FC = () => {
  const radarControls = useAnimation();
  const bugsControls = useAnimation();
  
  // Generate random bugs
  const generateBugs = (): Bug[] => {
    const bugs: Bug[] = [];
    const colors: ('red' | 'green')[] = ['red', 'red', 'green']; // More red bugs than green
    
    for (let i = 0; i < 3; i++) {
      const top = `${20 + Math.random() * 60}%`;
      const left = `${20 + Math.random() * 60}%`;
      const size = `${12 + Math.random() * 6}px`;
      
      bugs.push({
        id: i,
        top,
        left,
        size,
        color: colors[i],
        animationPath: getRandomPath(),
      });
    }
    
    return bugs;
  };
  
  const getRandomPath = () => {
    // Generate a random bezier curve path for bugs
    return `
      M 0 0
      C ${Math.random() * 50 + 10} ${Math.random() * 20},
        ${Math.random() * 20} ${Math.random() * 50 + 10},
        ${Math.random() * 70 - 35} ${Math.random() * 70 - 35}
    `;
  };
  
  useEffect(() => {
    // Start the radar scan animation
    radarControls.start({
      rotate: 360,
      transition: {
        duration: 4,
        ease: "linear",
        repeat: Infinity
      }
    });

    // Sequence to animate bugs detection
    const sequence = async () => {
      await bugsControls.start({
        opacity: 1,
        scale: [0, 1.2, 1],
        transition: { duration: 0.5, delay: 1 }
      });
      
      await bugsControls.start({
        x: (custom) => custom * 10,
        y: (custom) => custom * 15,
        transition: {
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }
      });
    };
    
    sequence();
  }, [radarControls, bugsControls]);
  
  const bugs = generateBugs();
  
  return (
    <div className="radar-container w-[400px] h-[400px] relative max-w-full mx-auto">
      {/* Radar base */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-accent-blue/30"
        initial={{ boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)" }}
        animate={{ 
          boxShadow: ["0 0 10px rgba(56, 189, 248, 0.3)", "0 0 20px rgba(56, 189, 248, 0.4)", "0 0 10px rgba(56, 189, 248, 0.3)"]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Radar grid */}
      <div className="radar-grid absolute top-0 left-0 w-full h-full rounded-full">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-accent-blue/30" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-accent-blue/30" />
        
        {/* Radar circles */}
        <div className="absolute top-1/2 left-1/2 w-1/3 h-1/3 rounded-full border border-accent-blue/20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-2/3 h-2/3 rounded-full border border-accent-blue/20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-accent-blue/20 -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Radar scan animation */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full rounded-full"
        style={{
          clipPath: "polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0)",
          background: "linear-gradient(90deg, rgba(56, 189, 248, 0) 0%, rgba(56, 189, 248, 0.4) 100%)",
          transformOrigin: "center"
        }}
        animate={radarControls}
      />
      
      {/* Bugs */}
      {bugs.map((bug) => (
        <motion.div
          key={bug.id}
          className={`absolute rounded-full ${bug.color === 'red' ? 'bg-accent-red/80' : 'bg-accent-green/80'}`}
          style={{ 
            top: bug.top, 
            left: bug.left, 
            width: bug.size, 
            height: bug.size 
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={bugsControls}
          custom={bug.id + 1}
        >
          <motion.div 
            className="absolute inset-0 rounded-full"
            animate={{ 
              boxShadow: [
                `0 0 5px ${bug.color === 'red' ? 'rgba(244, 63, 94, 0.8)' : 'rgba(74, 222, 128, 0.8)'}`,
                `0 0 10px ${bug.color === 'red' ? 'rgba(244, 63, 94, 0.8)' : 'rgba(74, 222, 128, 0.8)'}`,
                `0 0 5px ${bug.color === 'red' ? 'rgba(244, 63, 94, 0.8)' : 'rgba(74, 222, 128, 0.8)'}`
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default RadarAnimation;
