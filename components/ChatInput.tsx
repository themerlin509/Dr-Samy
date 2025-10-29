
import React, { useState, useRef } from 'react';
import { Paperclip, Mic, Send, X, Film } from 'lucide-react';
import type { ImageFile } from '../types';

interface ChatInputProps {
  onSendMessage: (prompt: string, images: File[]) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (isLoading || (!prompt.trim() && images.length === 0)) return;
    onSendMessage(prompt, images);
    setPrompt('');
    setImages([]);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - images.length);
      setImages((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, you would start/stop microphone access here.
  };

  return (
    <div className="flex flex-col gap-2">
       {images.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
          {images.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-16 h-16 rounded-md object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-gray-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
          disabled={isLoading || images.length >= 5}
        >
          <Paperclip size={20} />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
        </button>
        <button 
          onClick={toggleRecording}
          className={`p-2 disabled:opacity-50 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'}`}
          disabled={isLoading}
        >
          <Mic size={20} />
        </button>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isRecording ? "Enregistrement en cours... Parlez maintenant." : "Décrivez vos symptômes ici..."}
          className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={1}
          style={{ maxHeight: '100px' }}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || (!prompt.trim() && images.length === 0)}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
