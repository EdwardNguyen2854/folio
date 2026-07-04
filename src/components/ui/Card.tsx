import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';
import { staggerItemVariants } from '../motion/StaggerReveal';
import type { ReactNode, MouseEvent } from 'react';

type CardProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  tilt?: boolean;
};

export function Card({ children, onClick, className = '', tilt = false }: CardProps) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(springY, [0, 1], [4, -4]);
  const rotateY = useTransform(springX, [0, 1], [-4, 4]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width);
    y.set((event.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    if (!tilt) return;
    x.set(0.5);
    y.set(0.5);
  };

  const Tag = onClick ? 'button' : 'div';

  return (
    <motion.div
      variants={staggerItemVariants()}
      style={tilt ? { rotateX, rotateY, perspective: 800 } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={tilt ? { z: 10 } : { y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={className}
    >
      <Tag
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={`w-full h-full text-left bg-surface border border-border rounded-[2.5rem] p-5 shadow-sm transition-colors duration-150 ${
          onClick ? 'cursor-pointer hover:border-accent' : ''
        } ${className || ''}`}
      >
        {children}
      </Tag>
    </motion.div>
  );
}
