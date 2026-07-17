import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, ChevronLeft } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950 hidden sm:block"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
            className="relative w-full h-full sm:h-auto max-h-screen sm:max-h-[90vh] sm:max-w-lg bg-white rounded-none sm:rounded-xl shadow-xl border-none sm:border border-slate-200 z-10 flex flex-col overflow-hidden animate-scale-in"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 justify-start sm:justify-between shrink-0">
              <button
                onClick={onClose}
                className="sm:hidden text-slate-700 hover:text-slate-900 p-1 -ml-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h3 className="font-display font-semibold text-lg text-slate-900 flex-1 sm:flex-initial">{title}</h3>
              <button
                onClick={onClose}
                className="hidden sm:block text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
