import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motionTransitions } from '../../lib/motion-tokens';

/**
 * Accordion with physics-based height transitions and rotating chevron
 * indicators.
 */
export function SmoothAccordion({ items, allowMultiple = false, defaultOpen = [], className }) {
  const [openIds, setOpenIds] = useState(defaultOpen);

  const toggle = (id) => {
    if (allowMultiple) {
      setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-subtle',
        className
      )}
    >
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="transition-colors">
            <button
              onClick={() => toggle(item.id)}
              className="focus-ring flex w-full cursor-pointer items-center justify-between p-5 text-left font-medium text-text-primary transition-colors hover:bg-surface-hover"
              aria-expanded={isOpen}
            >
              <div>
                <div className="text-sm font-medium text-text-primary">{item.title}</div>
                {item.subtitle && (
                  <div className="mt-0.5 text-xs text-text-subtle">{item.subtitle}</div>
                )}
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={motionTransitions.springSnappy}
                className="ml-2 shrink-0 text-text-muted"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={motionTransitions.springGentle}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-text-secondary">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default SmoothAccordion;