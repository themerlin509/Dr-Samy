import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar} 
          className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300"
          aria-label="Ouvrir le menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Dr Samy
        </h1>
      </div>
    </header>
  );
};