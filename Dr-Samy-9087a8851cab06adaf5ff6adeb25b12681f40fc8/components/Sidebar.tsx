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
  const sidebarClasses = `sidebar ${isOpen ? 'open' : ''}`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className={sidebarClasses}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Consultations</h2>
        <button onClick={onClose} className="sidebar-close-button">
            <X size={20} />
        </button>
      </div>
      <button
        onClick={onNewChat}
        className="new-chat-button"
      >
        <PlusCircle size={16} />
        Nouvelle Consultation
      </button>
      <ul className="conversations-list">
        {conversations.length === 0 && (
          <li className="no-conversations">
            Aucune consultation pour le moment.
          </li>
        )}
        {conversations.map((convo) => (
          <li key={convo.id} className="conversation-item">
            <button
              onClick={() => onSelectConversation(convo.id)}
              className={`conversation-button ${convo.id === activeConversationId ? 'active' : ''}`}
            >
              <div className="conversation-info">
                <MessageSquare size={16} />
                <span className="conversation-title">
                  {convo.title || (convo.messages.length > 0 ? convo.messages[0].text : 'Nouvelle discussion')}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(convo.id);
                }}
                className="delete-conversation-button"
                aria-label="Supprimer la conversation"
              >
                <Trash2 size={14} />
              </button>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-info">
            {user.user_metadata.avatar_url && (
                <img 
                    src={user.user_metadata.avatar_url} 
                    alt="User avatar" 
                    className="user-avatar"
                />
            )}
            <span className="user-email" title={user.email}>
                {user.user_metadata.full_name || user.email}
            </span>
          </div>
          <button 
              onClick={handleLogout} 
              className="logout-button"
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