import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motionTransitions } from '../../lib/motion-tokens';

/**
 * Restrained segmented navigation control with a shared-layout pill indicator
 * and optional nested submenu dropdown.
 *
 * Supports controlled usage: pass `value` + `onChange` to drive selection from
 * outside, otherwise it manages its own state seeded by `defaultValue`.
 */
export function PillNavigation({
  items,
  defaultValue,
  defaultSubValue,
  value,
  onChange,
  className,
  ariaLabel = 'Pill navigation',
  ...props
}) {
  const [internalId, setInternalId] = useState(defaultValue || items[0]?.id);
  const [internalSubId, setInternalSubId] = useState(defaultSubValue);
  const [submenuOpen, setSubmenuOpen] = useState(true);
  const containerRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const isControlled = value !== undefined;
  const activeId = isControlled ? value : internalId;
  const activeSubId = internalSubId;

  const activeItem = items.find((item) => item.id === activeId) || items[0];
  const hasSubmenu = Boolean(activeItem?.children && activeItem.children.length > 0);

  const selectMain = (id) => {
    const item = items.find((i) => i.id === id);
    if (id === activeId && item?.children) {
      setSubmenuOpen((prev) => !prev);
      return;
    }

    if (!isControlled) setInternalId(id);
    setSubmenuOpen(true);
    const firstChild = item?.children?.[0]?.id;
    setInternalSubId(firstChild);
    onChange?.(id, firstChild);
  };

  const selectSub = (subId) => {
    setInternalSubId(subId);
    onChange?.(activeId, subId);
  };

  const handleKeyDown = (e) => {
    const currentIndex = items.findIndex((item) => item.id === activeId);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      selectMain(items[(currentIndex + 1) % items.length].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      selectMain(items[(currentIndex - 1 + items.length) % items.length].id);
    } else if (e.key === 'ArrowDown' && hasSubmenu && activeItem?.children) {
      e.preventDefault();
      const currentSubIndex = activeItem.children.findIndex((s) => s.id === activeSubId);
      selectSub(activeItem.children[(currentSubIndex + 1) % activeItem.children.length].id);
    } else if (e.key === 'ArrowUp' && hasSubmenu && activeItem?.children) {
      e.preventDefault();
      const currentSubIndex = activeItem.children.findIndex((s) => s.id === activeSubId);
      selectSub(
        activeItem.children[(currentSubIndex - 1 + activeItem.children.length) % activeItem.children.length]
          .id
      );
    } else if (e.key === 'Escape') {
      setSubmenuOpen(false);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      layout={!reducedMotion}
      transition={motionTransitions.springGentle}
      className={cn('inline-flex select-none flex-col items-center gap-2', className)}
      role="navigation"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...props}
    >
      <div
        role="tablist"
        className="inline-flex max-w-full items-center overflow-x-auto rounded-full border border-[#1f1f1f] bg-[#050505] p-1 shadow-inner"
      >
        {items.map((item) => {
          const active = item.id === activeId;
          const itemHasChildren = Boolean(item.children && item.children.length > 0);

          return (
            <motion.button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-expanded={active && itemHasChildren ? submenuOpen : undefined}
              tabIndex={active ? 0 : -1}
              whileTap={reducedMotion ? undefined : { scale: 0.96 }}
              onClick={() => selectMain(item.id)}
        className={cn(
          'focus-ring relative flex min-h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'font-semibold text-[#050505]'
                  : 'text-[#a1a1a1] hover:text-[#fafafa]'
              )}
            >
              {active && !reducedMotion && (
                <motion.span
                  layoutId="easyui-pill-main-indicator"
                  transition={motionTransitions.springMorph}
                  className="absolute inset-0 rounded-full bg-[#fafafa] shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                />
              )}
              {active && reducedMotion && (
                <span className="absolute inset-0 rounded-full bg-[#fafafa]" />
              )}

              <span className="relative z-10">{item.label}</span>

              {itemHasChildren && (
                <ChevronDown
                  className={cn(
                    'relative z-10 h-3 w-3 transition-transform duration-200',
                    active ? 'text-[#050505]' : 'text-[#6b6b6b]',
                    active && submenuOpen && 'rotate-180'
                  )}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {hasSubmenu && submenuOpen && (
          <motion.div
            key={activeItem.id}
            layout={!reducedMotion}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.96 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 }}
            transition={motionTransitions.springGentle}
            role="menu"
            aria-label={`${activeItem.label} submenu`}
            className="inline-flex items-center gap-1 rounded-full border border-[#171717] bg-[#0b0b0b]/90 p-1 shadow-[0_8px_20px_rgba(0,0,0,0.35)] backdrop-blur-md"
          >
            {(activeItem.children || []).map((subItem) => {
              const isSubActive = subItem.id === activeSubId;

              return (
                <motion.button
                  key={subItem.id}
                  type="button"
                  role="menuitem"
                  aria-checked={isSubActive}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  onClick={() => selectSub(subItem.id)}
                  className={cn(
                    'focus-ring relative flex min-h-7 cursor-pointer items-center rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
                    isSubActive
                      ? 'font-semibold text-[#fafafa]'
                      : 'text-[#525252] hover:text-[#d4d4d4]'
                  )}
                >
                  {isSubActive && !reducedMotion && (
                    <motion.span
                      layoutId="easyui-pill-sub-indicator"
                      transition={motionTransitions.springMorph}
                      className="absolute inset-0 rounded-full border border-[#404040] bg-[#2e2e2e] shadow-xs"
                    />
                  )}
                  {isSubActive && reducedMotion && (
                    <span className="absolute inset-0 rounded-full border border-[#404040] bg-[#2e2e2e]" />
                  )}

                  <span className="relative z-10">{subItem.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default PillNavigation;