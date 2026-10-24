"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export const Parallax = ({ children, speed = 0.5, className = "" }: ParallaxProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // A speed of 1 means it scrolls exactly at page speed (no parallax).
  // A speed < 1 means it moves slower than the page.
  // We'll move it upward (negative y) to make it move faster/slower relative to scroll.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <div ref={ref} className={className} style={{ position: 'relative' }}>
      <motion.div style={{ y, width: '100%', height: '100%' }}>
        {children}
      </motion.div>
    </div>
  );
};
