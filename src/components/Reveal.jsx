import { motion, useReducedMotion } from 'framer-motion';

export default function Reveal({ as: Tag = 'div', className = '', delay = 0, y = 14, children, ...props }) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Comp = Tag;
    return <Comp className={className} {...props}>{children}</Comp>;
  }
  const MotionTag = motion[Tag] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
