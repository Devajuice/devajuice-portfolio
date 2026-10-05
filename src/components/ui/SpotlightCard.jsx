import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Elevated surface that illuminates its border and inner surface dynamically
 * based on pointer position.
 */
export function SpotlightCard({
  children,
  spotlightColor = 'rgba(242, 242, 243, 0.06)',
  spotlightSize = 350,
  className,
  as: Comp = 'div',
  ...props
}) {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const backgroundGradient = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;
  const borderGradient = useMotionTemplate`radial-gradient(220px circle at ${mouseX}px ${mouseY}px, var(--color-accent-ring), transparent 80%)`;

  return (
    <Comp
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(-1000);
        mouseY.set(-1000);
      }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-surface p-6 text-inherit no-underline shadow-subtle transition-colors duration-300 hover:border-border-hover',
        className
      )}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: borderGradient }}
        aria-hidden="true"
      />

      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: backgroundGradient }}
        aria-hidden="true"
      />

      <div className="relative z-10">{children}</div>
    </Comp>
  );
}

export default SpotlightCard;