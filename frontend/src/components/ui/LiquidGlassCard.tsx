"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  status?: "ongoing" | "completed";
}

export function LiquidGlassCard({ children, className = "", onClick, status }: LiquidGlassCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl shadow-lg dark:shadow-2xl transition-all duration-300 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, var(--hover-glow, rgba(99, 102, 241, 0.1)), transparent 40%)`,
        }}
      />
      
      {/* Liquid overlay effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 dark:from-white/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      
      {status === "completed" && (
        <div className="absolute top-4 right-4 z-10 px-4 py-1.5 rounded-full bg-black/5 dark:bg-black/40 backdrop-blur-md border border-black/10 dark:border-white/10 text-[var(--text-primary)] text-[10px] uppercase tracking-widest font-medium shadow-sm dark:shadow-lg">
          Already Finished
        </div>
      )}

      {children}
    </motion.div>
  );
}
