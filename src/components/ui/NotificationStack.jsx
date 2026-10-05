import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motionTransitions } from '../../lib/motion-tokens';

/**
 * EasyUI · Notification Stack
 *
 * A stacked notification system with physical spring stacking elevation and
 * swipe-to-dismiss drag. The newest notification sits on top and the ones
 * behind recede by scale and vertical offset, so a burst of messages reads as a
 * physical pile rather than a flat list.
 *
 * Controlled: `notifications` in (newest first), `onDismiss` out. The upstream
 * demo owns the list internally and ships a header with sample-data triggers;
 * this port drops that demo chrome so the same physics can back a real surface
 * (see Toast.jsx). It also renders nothing when empty — a notification stack
 * that has nothing to say should be invisible, not show an empty-state panel.
 */

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: TriangleAlert,
};

const TONE = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-text-secondary',
  warning: 'text-amber-500',
};

// How far a card must be dragged before the gesture counts as a dismissal.
const DISMISS_DISTANCE = 60;

// How far each successive card recedes down the pile.
const STACK_OFFSET = 12;

export function NotificationStack({ notifications = [], onDismiss, maxVisible = 3, className }) {
  if (notifications.length === 0) return null;

  const visible = notifications.slice(0, maxVisible);

  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {visible.map((item, index) => {
          const Icon = ICONS[item.type] ?? ICONS.info;

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: index * STACK_OFFSET,
                scale: 1 - index * 0.04,
                zIndex: visible.length - index,
              }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={motionTransitions.springResponsive}
              drag="x"
              dragConstraints={{ left: 0, right: 100 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x > DISMISS_DISTANCE) onDismiss?.(item.id);
              }}
              // The top card sits in normal flow and gives the pile its height;
              // the ones behind it are lifted out of flow so they can overlap it.
              // Either way `y` below is what actually separates them.
              style={{ position: index === 0 ? 'relative' : 'absolute', top: 0, left: 0, right: 0 }}
              className="pointer-events-auto cursor-grab rounded-xl border border-border bg-surface px-3.5 py-3 shadow-elevated transition-colors hover:border-border-hover active:cursor-grabbing"
            >
              <div className="flex items-start gap-2.5">
                <Icon
                  className={cn('mt-0.5 h-4 w-4 shrink-0', TONE[item.type] ?? TONE.info)}
                  aria-hidden="true"
                />
                <span
                  className="min-w-0 flex-1 text-sm leading-snug break-words text-text-primary"
                  dangerouslySetInnerHTML={{ __html: item.message }}
                />
                <button
                  className="focus-ring -mt-0.5 shrink-0 cursor-pointer rounded p-0.5 text-text-subtle transition-colors hover:text-text-primary"
                  aria-label="Dismiss notification"
                  onClick={() => onDismiss?.(item.id)}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default NotificationStack;