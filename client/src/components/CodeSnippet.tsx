import React from 'react';
import { motion } from 'framer-motion';

interface CodeSnippetProps {
  code: string;
  language?: 'javascript' | 'json' | 'html' | 'css';
  showLineNumbers?: boolean;
  maxHeight?: string;
  title?: string;
  animateTyping?: boolean;
  delay?: number;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({
  code,
  language = 'javascript',
  showLineNumbers = true,
  maxHeight = 'none',
  title,
  animateTyping = false,
  delay = 0
}) => {
  // Simple formatting for demonstration
  const formatCode = (code: string) => {
    // Split by lines
    return code.split('\n').map((line, i) => {
      let formattedLine = line;
      
      // Basic syntax highlighting
      if (language === 'javascript' || language === 'json') {
        // Keywords
        formattedLine = formattedLine.replace(
          /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch)\b/g,
          '<span class="text-accent-blue-light">$1</span>'
        );
        
        // Strings
        formattedLine = formattedLine.replace(
          /(['"])(.*?)\1/g, 
          '<span class="text-green-400">$1$2$1</span>'
        );
        
        // Numbers
        formattedLine = formattedLine.replace(
          /\b(\d+)\b/g, 
          '<span class="text-amber-400">$1</span>'
        );
        
        // Comments
        formattedLine = formattedLine.replace(
          /(\/\/.*)/g, 
          '<span class="text-gray-500">$1</span>'
        );
      }
      
      return (
        <div key={i} className="flex">
          {showLineNumbers && (
            <span className="w-10 text-right pr-4 select-none text-gray-500 border-r border-gray-700 mr-3">
              {i + 1}
            </span>
          )}
          <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
        </div>
      );
    });
  };

  const formattedCode = formatCode(code);
  
  const renderTypingAnimation = () => {
    // For animating code typing effect
    const totalChars = code.length;
    const charDelay = 0.02;  // seconds per character
    
    return (
      <motion.div 
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ 
          duration: totalChars * charDelay, 
          ease: 'linear',
          delay: delay
        }}
        className="h-full bg-primary-dark"
      />
    );
  };

  return (
    <div className="relative rounded-md bg-primary-medium/80 overflow-hidden blue-glow-border">
      {title && (
        <div className="px-4 py-2 bg-accent-blue/20 border-b border-accent-blue/30 flex items-center">
          <div className="flex space-x-2 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
          </div>
          <div className="text-sm text-gray-300 font-mono">{title}</div>
        </div>
      )}
      
      <div className="p-4 font-mono text-sm text-gray-300 overflow-x-auto relative" style={{ maxHeight }}>
        {formattedCode}
        
        {/* Overlay for typing animation */}
        {animateTyping && (
          <div className="absolute top-0 right-0 bottom-0 pointer-events-none">
            {renderTypingAnimation()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeSnippet;