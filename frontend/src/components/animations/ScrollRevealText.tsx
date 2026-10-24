"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

export const ScrollRevealText = ({ text, className = "" }: ScrollRevealTextProps) => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.25"],
  });

  const words = text.split(" ");

  return (
    <p ref={container} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};

const Word = ({ children, progress, range }: any) => {
  const opacity = useTransform(progress, range, [0.75, 1]);
  return (
    <span className="relative mr-2 mt-2">
      <span className="absolute text-[var(--text-primary)] opacity-100 select-none">{children}</span>
      <motion.span style={{ opacity: opacity }}>
        {children}
      </motion.span>
    </span>
  );
};
