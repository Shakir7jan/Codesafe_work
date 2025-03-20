import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RadarScanProps {
  className?: string;
  size?: number;
  dotColor?: string;
  beamColor?: string;
  backgroundColor?: string;
  dots?: Array<{ x: number; y: number }>;
  scanSpeed?: number;
}

export function RadarScan({
  className,
  size = 300,
  dotColor = '#3b82f6', // Blue color from Tailwind
  beamColor = 'rgba(59, 130, 246, 0.5)', // Semi-transparent blue
  backgroundColor = '#0f172a', // Dark blue background
  dots = [
    { x: 0.7, y: 0.2 },
    { x: 0.2, y: 0.3 },
    { x: 0.6, y: 0.1 },
    { x: 0.4, y: 0.6 },
    { x: 0.9, y: 0.7 },
    { x: 0.5, y: 0.5 },
    { x: 0.3, y: 0.8 },
    { x: 0.8, y: 0.4 },
  ],
  scanSpeed = 5,
}: RadarScanProps) {
  const radarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const elRadar = radarRef.current;
    if (!elRadar) return;

    const elBeam = elRadar.querySelector('.beam') as HTMLElement;
    const elsDot = elRadar.querySelectorAll('.dot') as NodeListOf<HTMLElement>;
    
    const getCSSVal = (e: HTMLElement, v: string) => parseFloat(e.style.getPropertyValue(v));
    const mod = (n: number, m: number) => ((n % m) + m) % m; // Fix negative Modulo
    const PI = Math.PI;
    const TAU = PI * 2;
    
    const update = () => {
      const beamAngle = parseFloat(getComputedStyle(elBeam).getPropertyValue('rotate')) * PI / 180 || 0;

      elsDot.forEach(elDot => {
        const x = getCSSVal(elDot, '--x') - 0.5;
        const y = getCSSVal(elDot, '--y') - 0.5;
        const dotAngle = mod(Math.atan2(y, x), TAU);
        const opacity = mod(dotAngle - beamAngle, TAU) / TAU;
        elDot.style.opacity = opacity.toString();
      });

      requestAnimationFrame(update);
    };
    
    update();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div 
      ref={radarRef} 
      className={cn('relative overflow-hidden rounded-full', className)}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        background: backgroundColor,
      }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 w-full h-full" 
        style={{
          backgroundImage: `
            radial-gradient(circle, transparent 0%, transparent 70%, ${beamColor} 100%),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: `100% 100%, ${size/10}px ${size/10}px, ${size/10}px ${size/10}px`,
          backgroundPosition: 'center',
        }}
      />
      
      {/* Radar beam */}
      <div 
        className="beam absolute top-0 left-0 w-full h-full origin-center"
        style={{
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            ${beamColor} 10deg,
            transparent 50deg
          )`,
          animation: `${scanSpeed}s radar-rotate linear infinite`,
        }}
      />
      
      {/* Dots */}
      {dots.map((dot, index) => (
        <div 
          key={index}
          className="dot absolute rounded-full"
          style={{
            '--x': dot.x,
            '--y': dot.y,
            left: `calc(var(--x) * 100%)`,
            top: `calc(var(--y) * 100%)`,
            width: `${size / 50}px`,
            height: `${size / 50}px`,
            margin: `-${size / 100}px`,
            background: dotColor,
            boxShadow: `0 0 ${size / 30}px ${size / 60}px ${dotColor}`,
            opacity: 0,
          } as React.CSSProperties}
        />
      ))}
      
      {/* Center point */}
      <div 
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: '50%',
          width: `${size / 30}px`,
          height: `${size / 30}px`,
          margin: `-${size / 60}px`,
          background: dotColor,
          boxShadow: `0 0 ${size / 30}px ${size / 60}px ${dotColor}`,
          opacity: 0.7,
        }}
      />
    </div>
  );
} 