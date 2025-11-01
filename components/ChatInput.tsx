
import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Send, X } from 'lucide-react';
import type { ImageFile } from '../types';

interface ChatInputProps {
  onSendMessage: (prompt: string, images: File[]) => void;
  isLoading: boolean;
}

// Add SpeechRecognition to the window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isSpeechApiSupported, setIsSpeechApiSupported] = useState(true);
  const originalPromptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported by this browser.');
      setIsSpeechApiSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setPrompt(originalPromptRef.current + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert("L'accès au microphone a été refusé. Veuillez l'activer dans les paramètres de votre navigateur.");
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = () => {
    if (isLoading || (!prompt.trim() && images.length === 0)) return;
    if (isRecording) {
      recognitionRef.current?.stop();
    }
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
    if (isLoading || !isSpeechApiSupported) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      originalPromptRef.current = prompt.trim() ? prompt.trim() + ' ' : '';
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Could not start recording:", e);
      }
    }
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
                aria-label={`Supprimer l'image ${file.name}`}
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
          aria-label="Joindre des fichiers"
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
          disabled={isLoading || !isSpeechApiSupported}
          aria-label={isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
          title={!isSpeechApiSupported ? "La reconnaissance vocale n'est pas supportée par ce navigateur" : (isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement")}
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
          aria-label="Zone de saisie des symptômes"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || (!prompt.trim() && images.length === 0)}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          aria-label="Envoyer le message"
        >
          <Send size={20} />
        </button>
      </div>
      {!isSpeechApiSupported && (
        <p className="text-xs text-red-500 text-center mt-1">La reconnaissance vocale n'est pas supportée par votre navigateur.</p>
      )}
    </div>
  );
};
