import React from 'react';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button 
          onClick={onToggleSidebar} 
          className="menu-button"
          aria-label="Ouvrir le menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="header-title">
          Dr Samy
        </h1>
      </div>
      <ThemeToggle />
    </header>
  );
};