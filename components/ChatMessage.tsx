
import React, { useMemo } from 'react';
import type { Message } from '../types';
import { User, Bot } from 'lucide-react';

// Using a basic markdown parser for this component
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    const elements = lines.map((line, index) => {
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={index} className="font-bold my-1">{line.substring(2, line.length - 2)}</p>;
        }
        if (line.startsWith('* ')) {
            return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        if (line.startsWith('- ')) {
            return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        return <p key={index} className="my-1">{line}</p>;
    });
    return <>{elements}</>;
};

const EmergencyMessage: React.FC<{ text: string }> = ({ text }) => {
    // Remove the backticks for display
    const cleanedText = text.replace(/```/g, '');
    return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4" role="alert">
            <div className="text-xl font-bold animate-pulse">🚨 URGENCE MÉDICALE DÉTECTÉE 🚨</div>
            <pre className="whitespace-pre-wrap font-sans mt-2">{cleanedText.replace('🚨🚨🚨 URGENCE MÉDICALE DÉTECTÉE 🚨🚨🚨', '')}</pre>
        </div>
    );
}

export const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  const urgencyStyles = useMemo(() => {
    if (isUser) return { border: '', background: '' };
    if (message.text.includes('🚨🚨🚨')) return { border: 'border-red-500', background: 'bg-red-50 dark:bg-red-900/20' };
    if (message.text.includes('🔴')) return { border: 'border-red-500', background: 'bg-red-50 dark:bg-red-900/20' };
    if (message.text.includes('🟠')) return { border: 'border-orange-500', background: 'bg-orange-50 dark:bg-orange-900/20' };
    if (message.text.includes('🟡')) return { border: 'border-yellow-500', background: 'bg-yellow-50 dark:bg-yellow-900/20' };
    if (message.text.includes('🟢')) return { border: 'border-green-500', background: 'bg-green-50 dark:bg-green-900/20' };
    return { border: 'border-gray-200 dark:border-gray-700', background: 'bg-white dark:bg-gray-700' };
  }, [message.text, isUser]);

  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="flex flex-col items-end max-w-xl">
            <div className="bg-blue-600 text-white p-3 rounded-xl rounded-br-lg">
                {message.text}
            </div>
            {message.images && message.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {message.images.map((img, idx) => (
                        <img key={idx} src={`data:${img.type};base64,${img.base64}`} alt={`user-upload-${idx}`} className="w-24 h-24 rounded-lg object-cover" />
                    ))}
                </div>
            )}
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
          <User size={18} />
        </div>
      </div>
    );
  }

  // AI Message
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
        <Bot size={18} />
      </div>
      <div className={`flex-1 max-w-xl p-4 rounded-xl rounded-bl-lg border ${urgencyStyles.border} ${urgencyStyles.background}`}>
        {message.text.includes('🚨🚨🚨 URGENCE MÉDICALE DÉTECTÉE 🚨🚨🚨') ? (
            <EmergencyMessage text={message.text} />
        ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <SimpleMarkdown text={message.text} />
            </div>
        )}
      </div>
    </div>
  );
};
