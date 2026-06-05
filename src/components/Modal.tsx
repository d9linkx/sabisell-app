import React, { useEffect, useState } from 'react';
import { AlertCircle, X, Check, Trash } from 'lucide-react';
import { motion } from 'motion/react';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  onClose: () => void;
}

export function CustomAlertModal({ isOpen, title, message, type = 'info', onClose }: AlertModalProps) {
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

  if (!isOpen) return null;

  const bgHeader = {
    success: 'bg-emerald-50 text-emerald-700 border-b border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-b border-amber-100',
    error: 'bg-red-50 text-red-700 border-b border-red-100',
    info: 'bg-mint-50 text-mint-750 border-b border-mint-100'
  }[type];

  const themeColor = {
    success: 'bg-emerald-500 text-white',
    warning: 'bg-amber-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-mint-450 text-white'
  }[type];

  return (
    <div className="fixed inset-0 bg-ash-950/45 backdrop-blur-xs flex items-center justify-center p-4 z-[150] animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-white rounded-2xl border border-ash-200 shadow-2xl max-w-sm w-full overflow-hidden"
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between ${bgHeader}`}>
          <div className="flex items-center gap-2 font-display font-medium text-xs sm:text-sm">
            <div className={`p-1 rounded-lg ${themeColor}`}>
              <AlertCircle className="h-4 w-4" />
            </div>
            <span>{title}</span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-ash-400 hover:text-ash-700 p-1 rounded-lg hover:bg-ash-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-left text-xs sm:text-sm text-ash-600 leading-relaxed font-light">
          {message}
        </div>

        {/* Action Button */}
        <div className="p-4 bg-ash-fb border-t border-ash-150/45 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-ash-900 hover:bg-ash-950 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors text-center"
          >
            Okay, dismiss
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CustomConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Yes, confirm', 
  cancelText = 'Cancel', 
  isDanger = false, 
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ash-950/45 backdrop-blur-xs flex items-center justify-center p-4 z-[150] animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-white rounded-2xl border border-ash-200 shadow-2xl max-w-sm w-full overflow-hidden"
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between ${isDanger ? 'bg-red-50 text-red-750 border-b border-red-100' : 'bg-mint-50 text-mint-750 border-b border-mint-100'}`}>
          <div className="flex items-center gap-2 font-display font-medium text-xs sm:text-sm">
            <div className={`p-1 rounded-lg ${isDanger ? 'bg-red-500' : 'bg-mint-450'} text-white`}>
              {isDanger ? <Trash className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            </div>
            <span>{title}</span>
          </div>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-ash-400 hover:text-ash-700 p-1 rounded-lg hover:bg-ash-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-left text-xs sm:text-sm text-ash-600 leading-relaxed font-light">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-ash-fb border-t border-ash-150/45 flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-ash-50 border border-ash-200 text-ash-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors text-center py-2.5"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full sm:w-auto px-5 py-2.5 font-semibold text-xs rounded-xl cursor-pointer text-center text-white ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-mint-450 hover:bg-mint-500'}`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface PromptModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  inputType?: 'number' | 'text';
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function CustomPromptModal({
  isOpen,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Update',
  cancelText = 'Cancel',
  inputType = 'text',
  onConfirm,
  onCancel
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(value);
  };

  return (
    <div className="fixed inset-0 bg-ash-950/45 backdrop-blur-xs flex items-center justify-center p-4 z-[150] animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-white rounded-2xl border border-ash-200 shadow-2xl max-w-sm w-full overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between bg-mint-50 text-mint-750 border-b border-mint-100">
          <div className="flex items-center gap-2 font-display font-medium text-xs sm:text-sm">
            <div className="p-1 rounded-lg bg-mint-450 text-white">
              <Check className="h-4 w-4" />
            </div>
            <span>{title}</span>
          </div>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-ash-400 hover:text-ash-700 p-1 rounded-lg hover:bg-ash-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSub}>
          <div className="p-5 text-left space-y-3.5">
            <p className="text-xs sm:text-sm text-ash-600 leading-relaxed font-light">
              {message}
            </p>
            
            <input
              type={inputType}
              required
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-ash-50 hover:bg-ash-100/30 border border-ash-200 text-xs sm:text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light"
            />
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-ash-fb border-t border-ash-150/45 flex flex-col sm:flex-row items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 border border-ash-200 hover:bg-ash-50 text-ash-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors text-center"
            >
              {cancelText}
            </button>
            
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-mint-400 hover:bg-mint-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors text-center"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
