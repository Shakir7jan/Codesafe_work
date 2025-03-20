import React from 'react';
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

  const dimensions = width && height 
    ? { width, height } 
    : { width: size, height: size, aspectRatio: '1' };

  return (
    <div 
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
      
      {/* Rotating beam - with simpler css animation approach */}
      <div 
        className="absolute top-0 left-0 w-full h-full" 
        style={{
          background: 'linear-gradient(90deg, transparent 50%, rgba(59, 130, 246, 0.4) 85%, rgba(96, 165, 250, 0.6) 100%)',
          animation: 'radar-beam-rotate 5s linear infinite',
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
      
      {/* Threat & secure dots with CSS animations instead of JS */}
      {threatPoints.map((point, idx) => (
        <div 
          key={idx}
          className={`absolute rounded-full ${point.type === 'threat' ? 'threat-dot' : 'secure-dot'}`}
          style={{
            left: `calc(${point.x} * 100%)`,
            top: `calc(${point.y} * 100%)`,
            width: '6px',
            height: '6px',
            marginLeft: '-3px',
            marginTop: '-3px',
            background: point.type === 'threat' ? '#ef4444' : '#22c55e',
            animation: `dot-pulse 5s ${idx * 0.7}s infinite`,
            zIndex: 5
          }}
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
            animation: `icon-pulse 5s ${idx * 0.7}s infinite`,
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
          @keyframes radar-beam-rotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          
          @keyframes dot-pulse {
            0%, 40%, 60%, 100% { 
              opacity: 0.3;
              box-shadow: 0 0 5px 2px rgba(59, 130, 246, 0.3);
              transform: scale(1);
            }
            45%, 55% { 
              opacity: 1;
              box-shadow: 0 0 15px 5px rgba(59, 130, 246, 0.6);
              transform: scale(1.5);
            }
          }
          
          .threat-dot {
            background: #ef4444;
          }
          
          .threat-dot:nth-child(odd) {
            animation-delay: 1s !important;
          }
          
          .secure-dot {
            background: #22c55e;
          }
          
          @keyframes icon-pulse {
            0%, 40%, 60%, 100% { opacity: 0; }
            45%, 55% { opacity: 0.9; }
          }
        `
      }} />
    </div>
  );
};

export default RadarAnimation;