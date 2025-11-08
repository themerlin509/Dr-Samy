import React from 'react';
import { Bot } from 'lucide-react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="loading-indicator">
      <div className="avatar-model">
        <Bot size={18} />
      </div>
      <div className="loading-content">
        <div className="loading-dots-container">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <span className="loading-text">Dr Samy analyse vos symptômes...</span>
        </div>
      </div>
    </div>
  );
};