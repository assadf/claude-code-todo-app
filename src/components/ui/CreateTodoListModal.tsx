'use client';

import { useEffect, useRef } from 'react';
import { TodoListForm } from '../forms/TodoListForm';

interface CreateTodoListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTodoListModal({
  isOpen,
  onClose,
}: CreateTodoListModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the modal
      modalRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        // Restore body scroll
        document.body.style.overflow = 'unset';

        // Restore focus to the previously focused element
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-testid="create-todo-list-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
        data-testid="modal-backdrop"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="card animate-in fade-in-0 zoom-in-95 relative max-h-[90vh] w-full max-w-md overflow-y-auto p-6 duration-200"
        onClick={handleContentClick}
        tabIndex={-1}
        data-testid="modal-content"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-semibold text-white">
            Create New TODO List
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            aria-label="Close modal"
            data-testid="close-modal-button"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <TodoListForm onSuccess={onClose} onCancel={onClose} />
      </div>
    </div>
  );
}
