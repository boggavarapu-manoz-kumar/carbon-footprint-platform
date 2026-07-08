import React from 'react';
import { motion } from 'framer-motion';

export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  direction = 'up',
  distance = 20,
  className = '',
  viewAmount = 0.2
}) => {
  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 }
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction]
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      viewport={{ once: true, amount: viewAmount }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98] // Custom ease-out cubic for premium feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
