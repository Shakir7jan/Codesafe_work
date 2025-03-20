import React, { useEffect, useRef, useState } from 'react';
import { Shield, Bug, AlertTriangle } from 'lucide-react';

interface ThreatPoint {
  x: number;
  y: number;
  type: 'threat' | 'secure';
}

interface RadarAnimationProps {
  className?: string;
  size?: string;
  width?: string;
  height?: string;
}

const RadarAnimation: React.FC<RadarAnimationProps> = ({ 
  className = "",
  size = "300px",
  width,
  height
}) => {
  const radarRef = useRef<HTMLDivElement>(null);
  const [radarInitialized, setRadarInitialized] = useState(false);

  // Predefined threat points
  const threatPoints: ThreatPoint[] = [
    { x: 0.7, y: 0.2, type: 'threat' },
    { x: 0.2, y: 0.3, type: 'secure' },
    { x: 0.6, y: 0.1, type: 'threat' },
    { x: 0.4, y: 0.6, type: 'secure' },
    { x: 0.9, y: 0.7, type: 'threat' },
    { x: 0.3, y: 0.8, type: 'secure' },
    { x: 0.8, y: 0.4, type: 'threat' },
  ];

  useEffect(() => {
    if (!radarRef.current || radarInitialized) return;
    
    // Initialize radar animation based on provided code
    const radar = radarRef.current;
    const beam = radar.querySelector(".beam") as HTMLElement;
    const dots = radar.querySelectorAll(".dot") as NodeListOf<HTMLElement>;

    const getCSSVal = (e: HTMLElement, v: string) => e.style.getPropertyValue(v);
    const mod = (n: number, m: number) => ((n % m) + m) % m; // Fix negative Modulo
    const PI = Math.PI;
    const TAU = PI * 2;

    const update = () => {
      // Get the beam's current rotation angle
      const beamStyle = getComputedStyle(beam);
      const beamAngleStr = beamStyle.getPropertyValue("rotate") || 
                           beamStyle.getPropertyValue("transform");
      
      // Extract rotation angle from transform string (compatible with more browsers)
      let beamAngle = 0;
      if (beamAngleStr) {
        const match = beamAngleStr.match(/rotate\(([^)]+)deg\)/);
        if (match && match[1]) {
          beamAngle = parseFloat(match[1]) * PI / 180;
        } else if (beamAngleStr.includes('matrix')) {
          // Handle matrix transform
          const values = beamAngleStr.match(/matrix\((.+)\)/)?.[1]?.split(',');
          if (values) {
            beamAngle = Math.atan2(parseFloat(values[1]), parseFloat(values[0]));
          }
        }
      }

      dots.forEach(dot => {
        // Get the dot's coordinates and calculate its angle from center
        const x = parseFloat(getCSSVal(dot, "--x") || "0.5") - 0.5;
        const y = parseFloat(getCSSVal(dot, "--y") || "0.5") - 0.5;
        const dotAngle = mod(Math.atan2(y, x), TAU);
        
        // Calculate relative angle between dot and beam
        const angleOffset = mod(dotAngle - beamAngle, TAU);
        
        // Calculate opacity based on how close the beam is to the dot
        // Invert the value (1 - angleOffset/TAU) so dots are visible when beam passes over them
        const opacity = 1 - (angleOffset / TAU);
        
        // Enhanced glow effect when dot is detected by the radar beam
        const type = dot.getAttribute('data-type');
        const isSecure = type === 'secure';
        const baseColor = isSecure ? 'rgba(34, 197, 94,' : 'rgba(239, 68, 68,';
        
        if (opacity > 0.8) {
          // Stronger glow when the beam is directly over the dot
          const glowIntensity = Math.min(1, (opacity - 0.8) * 5);
          dot.style.boxShadow = `0 0 15px 5px ${baseColor} ${glowIntensity})`;
          dot.style.transform = 'scale(1.4)';
        } else {
          // Normal state
          const dimOpacity = 0.4;
          dot.style.boxShadow = `0 0 8px 3px ${baseColor} ${dimOpacity})`;
          dot.style.transform = 'scale(1)';
        }
        
        // Apply opacity with a quadratic curve for more dramatic effect
        dot.style.opacity = String(opacity * opacity);
      });

      requestAnimationFrame(update);
    };
    
    // Start animation
    const frameId = requestAnimationFrame(update);
    setRadarInitialized(true);
    
    return () => cancelAnimationFrame(frameId);
  }, [radarInitialized]);

  const dimensions = width && height 
    ? { width, height } 
    : { width: size, height: size, aspectRatio: '1' };

  return (
    <div 
      ref={radarRef} 
      className={`radar relative ${className}`}
      style={{ 
        ...dimensions,
        background: 'radial-gradient(circle, rgba(20, 28, 46, 0.9) 0%, rgba(10, 14, 23, 0.95) 70%)',
        borderRadius: '50%',
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1)',
        overflow: 'hidden'
      }}
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%),
              linear-gradient(0deg, transparent 49.9%, rgba(59, 130, 246, 0.1) 50%, transparent 50.1%),
              linear-gradient(90deg, transparent 49.9%, rgba(59, 130, 246, 0.1) 50%, transparent 50.1%)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px'
          }}
        />
      </div>
      
      {/* Radar circles */}
      <div className="absolute inset-0 border border-accent-blue/15 rounded-full"></div>
      <div className="absolute inset-[15%] border border-accent-blue/20 rounded-full"></div>
      <div className="absolute inset-[30%] border border-accent-blue/25 rounded-full"></div>
      <div className="absolute inset-[45%] border border-accent-blue/30 rounded-full"></div>
      <div className="absolute inset-[60%] border border-accent-blue/35 rounded-full"></div>
      <div className="absolute inset-[75%] border border-accent-blue/40 rounded-full"></div>
      
      {/* Crosshairs */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-[1px] bg-accent-blue/30"></div>
      </div>
      <div className="absolute inset-0 flex justify-center">
        <div className="h-full w-[1px] bg-accent-blue/30"></div>
      </div>
      
      {/* Rotating beam */}
      <div 
        className="beam absolute top-0 left-0 w-full h-full" 
        style={{
          background: 'linear-gradient(90deg, transparent 50%, rgba(59, 130, 246, 0.4) 85%, rgba(96, 165, 250, 0.6) 100%)',
          animation: '5s rotate linear infinite',
          transformOrigin: 'center'
        }}
      ></div>
      
      {/* Center point */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-4 h-4 rounded-full bg-accent-blue-light animate-pulse"></div>
      </div>
      
      {/* Shield Icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-blue-light opacity-20 z-0">
        <Shield className="w-16 h-16 sm:w-20 sm:h-20" />
      </div>
      
      {/* Threat & secure dots */}
      {threatPoints.map((point, idx) => (
        <div 
          key={idx}
          className="dot absolute transition-all duration-300" 
          data-type={point.type}
          style={{
            '--x': point.x,
            '--y': point.y,
            left: `calc(${point.x} * 100%)`,
            top: `calc(${point.y} * 100%)`,
            width: '6px',
            height: '6px',
            margin: '-3px',
            borderRadius: '50%',
            background: point.type === 'threat' ? '#ef4444' : '#22c55e',
            boxShadow: point.type === 'threat' 
              ? '0 0 8px 3px rgba(239, 68, 68, 0.5)' 
              : '0 0 8px 3px rgba(34, 197, 94, 0.5)',
            opacity: 0,
            zIndex: 5
          } as React.CSSProperties}
        ></div>
      ))}
      
      {/* Icon indicators that appear with dots */}
      {threatPoints.map((point, idx) => (
        <div 
          key={`icon-${idx}`}
          className="absolute z-10" 
          style={{
            left: `calc(${point.x} * 100%)`,
            top: `calc(${point.y} * 100%)`,
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            animation: `pulse-fade 5s ${idx * 0.7}s infinite`,
          }}
        >
          {point.type === 'threat' ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : (
            <Bug className="w-5 h-5 text-green-500" />
          )}
        </div>
      ))}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes rotate {
            0% {
              transform: rotate(0turn);
            }
            100% {
              transform: rotate(1turn);
            }
          }
          
          @keyframes pulse-fade {
            0%, 20%, 80%, 100% { opacity: 0; }
            40%, 60% { opacity: 0.8; }
          }
        `
      }} />
    </div>
  );
};

export default RadarAnimation;