import React, { useMemo } from 'react';
import type { Message } from '../types';
import { User, Bot } from 'lucide-react';

// Using a basic markdown parser for this component
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    const elements = lines.map((line, index) => {
        if (line.startsWith('### ')) {
            return <h3 key={index}>{line.substring(4)}</h3>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={index}><strong>{line.substring(2, line.length - 2)}</strong></p>;
        }
        if (line.startsWith('* ')) {
            return <li key={index}>{line.substring(2)}</li>;
        }
        if (line.startsWith('- ')) {
            return <li key={index}>{line.substring(2)}</li>;
        }
        return <p key={index}>{line}</p>;
    });
    return <>{elements}</>;
};

const EmergencyMessage: React.FC<{ text: string }> = ({ text }) => {
    // Remove the backticks for display
    const cleanedText = text.replace(/```/g, '');
    return (
        <div className="emergency-message" role="alert">
            <div className="emergency-title">🚨 URGENCE MÉDICALE DÉTECTÉE 🚨</div>
            <pre className="emergency-content">{cleanedText.replace('🚨🚨🚨 URGENCE MÉDICALE DÉTECTÉE 🚨🚨🚨', '')}</pre>
        </div>
    );
}

export const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  const urgencyClass = useMemo(() => {
    if (isUser) return '';
    if (message.text.includes('🚨🚨🚨')) return 'emergency';
    if (message.text.includes('🔴')) return 'emergency';
    if (message.text.includes('🟠')) return 'urgent';
    if (message.text.includes('🟡')) return 'semi-urgent';
    if (message.text.includes('🟢')) return 'non-urgent';
    return '';
  }, [message.text, isUser]);

  if (isUser) {
    return (
      <div className="message-container-user">
        <div className="message-content-user">
            <div className="message-bubble-user">
                {message.text}
            </div>
            {message.images && message.images.length > 0 && (
                <div className="message-images-user">
                    {message.images.map((img, idx) => (
                        <img key={idx} src={`data:${img.type};base64,${img.base64}`} alt={`user-upload-${idx}`} className="message-image" />
                    ))}
                </div>
            )}
        </div>
        <div className="avatar-user">
          <User size={18} />
        </div>
      </div>
    );
  }

  // AI Message
  return (
    <div className="message-container-model">
      <div className="avatar-model">
        <Bot size={18} />
      </div>
      <div className={`message-bubble-model ${urgencyClass}`}>
        {message.text.includes('🚨🚨🚨 URGENCE MÉDICALE DÉTECTÉE 🚨🚨🚨') ? (
            <EmergencyMessage text={message.text} />
        ) : (
            <div className="markdown-content">
                <SimpleMarkdown text={message.text} />
            </div>
        )}
      </div>
    </div>
  );
};