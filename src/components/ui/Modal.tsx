import { AnimatePresence, motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, eyebrow, children, className = '' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/44 p-7"
          onClick={(event_) => { if (event_.target === event_.currentTarget) onClose(); }}
        >
          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`w-full max-w-[1100px] max-h-[calc(100vh-56px)] overflow-auto rounded-[22px] border border-border bg-surface p-6 shadow-lg ${className}`}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                {eyebrow && <p className="m-0 text-xs font-[750] tracking-[0.1em] uppercase text-accent mb-1">{eyebrow}</p>}
                <h2 className="m-0 text-xl font-[700] tracking-tight text-text">{title}</h2>
              </div>
              <button type="button" onClick={onClose} className="border-0 bg-transparent text-muted hover:text-text cursor-pointer p-1 transition-colors duration-150">
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
