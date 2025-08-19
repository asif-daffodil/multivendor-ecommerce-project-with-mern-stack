import React from 'react';

const Modal = ({ open, title, children, onClose, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="px-5 py-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">✕</button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-auto">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
};

export default Modal;
