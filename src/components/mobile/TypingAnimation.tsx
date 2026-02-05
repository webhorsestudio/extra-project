'use client'

import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  pauseDuration?: number;
}

export default function TypingAnimation({ 
  text, 
  speed = 100, 
  className = '',
  pauseDuration = 2000 
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (isTyping && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentIndex >= text.length) {
      // Pause at the end before restarting
      const pauseTimer = setTimeout(() => {
        setDisplayText('');
        setCurrentIndex(0);
        setIsTyping(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }
  }, [currentIndex, text, speed, isTyping, pauseDuration]);

  useEffect(() => {
    // Reset animation when text changes
    setDisplayText('');
    setCurrentIndex(0);
    setIsTyping(true);
  }, [text]);

  return (
    <span className={`text-sm font-medium text-gray-900 leading-tight ${className}`}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
} 