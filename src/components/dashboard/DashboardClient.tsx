'use client';

import { useState } from 'react';
import { CreateTodoListModal } from '../ui/CreateTodoListModal';

interface DashboardClientProps {
  children: React.ReactNode;
}

export function DashboardClient({ children }: DashboardClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateListClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <div
        onClick={e => {
          // Check if the clicked element is the "Create Your First List" button
          const target = e.target as HTMLElement;
          if (target.matches('.create-list-button, .create-list-button *')) {
            e.preventDefault();
            handleCreateListClick();
          }
        }}
      >
        {children}
      </div>

      <CreateTodoListModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
