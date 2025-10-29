import React from 'react';
import { Bot } from 'lucide-react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
        <Bot size={18} />
      </div>
      <div className="flex-1 max-w-xl p-4 rounded-xl rounded-bl-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Dr Samy analyse vos symptômes...</span>
        </div>
      </div>
    </div>
  );
};