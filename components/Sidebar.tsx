import React from 'react';
import { PlusCircle, MessageSquare, Trash2, X, LogOut } from 'lucide-react';
import type { Conversation } from '../types';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';


interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onClose,
  user,
}) => {
  const sidebarClasses = `
    w-64 bg-gray-100 dark:bg-gray-900 flex flex-col p-2 border-r border-gray-200 dark:border-gray-700
    fixed md:relative inset-y-0 left-0 z-40
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0
  `;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className={sidebarClasses}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold px-2 text-gray-800 dark:text-gray-100">Consultations</h2>
        <button onClick={onClose} className="md:hidden p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <X size={20} />
        </button>
      </div>
      <button
        onClick={onNewChat}
        className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors mb-4"
      >
        <PlusCircle size={16} />
        Nouvelle Consultation
      </button>
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {conversations.length === 0 && (
            <li className="text-center text-xs text-gray-500 dark:text-gray-400 p-4">
              Aucune consultation pour le moment.
            </li>
          )}
          {conversations.map((convo) => (
            <li key={convo.id} className="group">
              <button
                onClick={() => onSelectConversation(convo.id)}
                className={`w-full flex items-center justify-between gap-2 p-2 text-sm rounded-md text-left transition-colors ${
                  convo.id === activeConversationId
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="truncate">
                    {convo.title || (convo.messages.length > 0 ? convo.messages[0].text : 'Nouvelle discussion')}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(convo.id);
                  }}
                  className="p-1 rounded-md text-gray-500 hover:text-red-500 hover:bg-gray-300 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Supprimer la conversation"
                >
                  <Trash2 size={14} />
                </button>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-2 mt-auto">
        <div className="flex items-center justify-between gap-2 p-1">
          <div className="flex items-center gap-2 overflow-hidden">
            {user.user_metadata.avatar_url && (
                <img 
                    src={user.user_metadata.avatar_url} 
                    alt="User avatar" 
                    className="w-7 h-7 rounded-full"
                />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={user.email}>
                {user.user_metadata.full_name || user.email}
            </span>
          </div>
          <button 
              onClick={handleLogout} 
              className="p-2 text-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400"
              aria-label="Déconnexion"
              title="Déconnexion"
          >
              <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
