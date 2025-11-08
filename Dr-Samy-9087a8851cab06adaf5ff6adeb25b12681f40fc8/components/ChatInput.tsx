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
    <div className="chat-input-container">
       {images.length > 0 && (
        <div className="image-previews">
          {images.map((file, index) => (
            <div key={index} className="image-preview-item">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="image-preview-img"
              />
              <button
                onClick={() => removeImage(index)}
                className="remove-image-button"
                aria-label={`Supprimer l'image ${file.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="input-bar">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="input-button"
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
            className="hidden-file-input"
          />
        </button>
        <button 
          onClick={toggleRecording}
          className={`input-button ${isRecording ? 'recording' : ''}`}
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
          className="prompt-textarea"
          rows={1}
          disabled={isLoading}
          aria-label="Zone de saisie des symptômes"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || (!prompt.trim() && images.length === 0)}
          className="send-button"
          aria-label="Envoyer le message"
        >
          <Send size={20} />
        </button>
      </div>
      {!isSpeechApiSupported && (
        <p className="speech-support-error">La reconnaissance vocale n'est pas supportée par votre navigateur.</p>
      )}
    </div>
  );
};