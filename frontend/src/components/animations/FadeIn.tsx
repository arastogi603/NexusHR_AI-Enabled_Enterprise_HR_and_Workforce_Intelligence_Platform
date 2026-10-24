"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  staggerChildren?: number;
}

export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.6,
  yOffset = 30,
  className = "",
  staggerChildren,
}: FadeInProps) => {
  const baseVariants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
        ...(staggerChildren && { staggerChildren }),
      },
    },
  };

  return (
    <motion.div
      variants={baseVariants as any}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const FadeInStaggerItem = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
  };

  return (
    <motion.div variants={itemVariants as any} className={className}>
      {children}
    </motion.div>
  );
};
