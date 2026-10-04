import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { cn } from '../../lib/utils';
import { motionTransitions } from '../../lib/motion-tokens';

const variantStyles = {
  primary:
    'bg-[#fafafa] text-[#050505] hover:bg-[#ffffff] shadow-xs font-medium cursor-pointer',
  secondary:
    'bg-[#0e0e0e] text-[#fafafa] border border-[#1f1f1f] hover:border-[#4a4a4a] hover:bg-[#141414] cursor-pointer',
  outline:
    'bg-transparent text-[#fafafa] border border-[#1f1f1f] hover:border-[#4a4a4a] hover:bg-[#0e0e0e] cursor-pointer',
  ghost: 'bg-transparent text-[#a1a1a1] hover:text-[#fafafa] hover:bg-[#0e0e0e] cursor-pointer',
};

const sizeStyles = {
  sm: 'px-3.5 py-1.5 text-xs rounded-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-[8px] gap-2',
  lg: 'px-7 py-3.5 text-base rounded-[10px] gap-2.5',
};

/**
 * Button with proximity-based magnetic physics that pulls toward the cursor on
 * hover and springs back on departure.
 */
export function MagneticButton({
  children,
  strength = 0.35,
  variant = 'primary',
  size = 'md',
  className,
  glow = true,
  as = 'button',
  onClick,
  ...props
}) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const springX = useSpring(0, { stiffness: 280, damping: 20 });
  const springY = useSpring(0, { stiffness: 280, damping: 20 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    springX.set(middleX * strength);
    springY.set(middleY * strength);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    springX.set(0);
    springY.set(0);
  };

  const Comp = as === 'a' ? motion.a : motion.button;

  return (
    <Comp
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={motionTransitions.springSnappy}
      className={cn(
        'focus-ring relative inline-flex select-none items-center justify-center no-underline transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {glow && isHovered && (
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 blur-sm"
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Comp>
  );
}

export default MagneticButton;