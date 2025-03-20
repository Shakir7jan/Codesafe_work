import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalLine {
  text: string;
  type?: 'command' | 'output' | 'error' | 'success';
}

interface TerminalWindowProps {
  lines: TerminalLine[];
  title?: string;
  autoType?: boolean;
  typingSpeed?: number;
  initialDelay?: number;
  prompt?: string;
  height?: string;
  blinkCursor?: boolean;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({
  lines,
  title = 'Terminal',
  autoType = false,
  typingSpeed = 30,
  initialDelay = 500,
  prompt = '$ ',
  height = '300px',
  blinkCursor = true
}) => {
  const [visibleLines, setVisibleLines] = useState<TerminalLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Handle cursor blinking
  useEffect(() => {
    if (!blinkCursor) return;
    
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    
    return () => clearInterval(cursorInterval);
  }, [blinkCursor]);

  // Handle typing animation
  useEffect(() => {
    if (!autoType || currentLineIndex >= lines.length) return;

    const timeout = setTimeout(() => {
      const currentLine = lines[currentLineIndex];
      
      if (currentCharIndex === 0) {
        // Start a new line
        setVisibleLines(prev => [
          ...prev, 
          { ...currentLine, text: currentLine.type === 'command' ? prompt : '' }
        ]);
      }

      if (currentCharIndex < currentLine.text.length) {
        // Continue typing current line
        setVisibleLines(prev => {
          const updatedLines = [...prev];
          const lastIndex = updatedLines.length - 1;
          
          if (currentLine.type === 'command') {
            updatedLines[lastIndex] = {
              ...currentLine,
              text: prompt + currentLine.text.substring(0, currentCharIndex + 1)
            };
          } else {
            updatedLines[lastIndex] = {
              ...currentLine,
              text: currentLine.text.substring(0, currentCharIndex + 1)
            };
          }
          
          return updatedLines;
        });
        
        setCurrentCharIndex(prev => prev + 1);
      } else {
        // Move to next line
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, currentCharIndex === 0 ? initialDelay : typingSpeed);

    return () => clearTimeout(timeout);
  }, [autoType, currentLineIndex, currentCharIndex, lines, initialDelay, typingSpeed, prompt]);

  // Display all lines at once if not auto-typing
  useEffect(() => {
    if (!autoType) {
      setVisibleLines(lines.map(line => ({
        ...line,
        text: line.type === 'command' ? `${prompt}${line.text}` : line.text
      })));
    }
  }, [autoType, lines, prompt]);

  return (
    <div className="rounded-md overflow-hidden blue-glow-border bg-primary-dark/90">
      {/* Terminal header */}
      <div className="px-4 py-2 bg-primary-medium flex items-center justify-between border-b border-accent-blue/20">
        <div className="flex items-center">
          <div className="flex space-x-2 mr-3">
            <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
          </div>
          <div className="text-sm font-mono text-gray-300">{title}</div>
        </div>
      </div>
      
      {/* Terminal content */}
      <div 
        className="p-4 font-mono text-sm overflow-y-auto"
        style={{ height }}
      >
        <AnimatePresence>
          {visibleLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`whitespace-pre-wrap mb-1 ${
                line.type === 'error' ? 'text-red-400' :
                line.type === 'success' ? 'text-green-400' :
                line.type === 'command' ? 'text-accent-blue-light' :
                'text-gray-300'
              }`}
            >
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Blinking cursor */}
        {autoType && currentLineIndex < lines.length && showCursor && (
          <span className="inline-block w-2.5 h-4 bg-accent-blue animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default TerminalWindow;