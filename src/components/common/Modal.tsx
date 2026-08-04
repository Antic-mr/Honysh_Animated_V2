import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Spring Animated Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative w-full ${maxWidth} my-8 bg-[#FFFDF8] dark:bg-[#251B13] border border-[#EFE4D2] dark:border-[#3D2D21] rounded-2xl shadow-2xl overflow-hidden z-10 text-[#2D1F17] dark:text-[#F5EBE1]`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE4D2] dark:border-[#3D2D21] bg-[#FAF6EE]/80 dark:bg-[#1A120C]/80">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-amber-800/60 dark:text-amber-200/60 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
