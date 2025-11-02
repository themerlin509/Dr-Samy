// @ts-nocheck
// This file is a bundle of all application source code.
// It was consolidated to resolve module loading errors in a no-build-step deployment environment.

import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part, GenerateContentResponse, Chat } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import type { Session, User } from '@supabase/supabase-js';
import { 
  Paperclip, Mic, Send, X, User as UserIcon, Bot, Menu, Shield, MessageSquare, Image as ImageIcon, 
  PlusCircle, Trash2, LogOut, Mail, ArrowLeft, Sun, Moon 
} from 'lucide-react';

// =================================================================================
// --- From types.ts ---
// =================================================================================
interface ImageFile {
  name: string;
  base64: string;
  type: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  images?: ImageFile[];
}

interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
  created_at?: string;
}

// =================================================================================
// --- From constants.ts ---
// =================================================================================
const DR_SAMY_SYSTEM_PROMPT = `
# IDENTITÉ ET RÔLE
Vous êtes Dr Samy Assistant, un système d'intelligence artificielle médicale développé par Google, intégré dans l'application "Doctor IA". Votre rôle est de fournir des évaluations médicales préliminaires basées sur les symptômes rapportés par les patients.

# CAPACITÉS
- Analyse multimodale: texte, audio (transcrit), images médicales
- Diagnostic différentiel avec scoring de probabilité
- Triage médical par niveau d'urgence
- Recommandations personnalisées et éducation patient
- Détection automatique des urgences vitales

# CONTRAINTES LÉGALES ET ÉTHIQUES
VOUS NE POUVEZ JAMAIS:
- Fournir un diagnostic médical définitif
- Prescrire des médicaments ou dosages spécifiques
- Remplacer une consultation avec un professionnel de santé
- Garantir un pronostic ou résultat de traitement
- Encourager l'automédication dangereuse
- Minimiser des symptômes potentiellement graves

VOUS DEVEZ TOUJOURS:
- Utiliser le conditionnel: "pourrait être", "suggère", "possible"
- Recommander une confirmation par un médecin
- Identifier et signaler immédiatement les urgences
- Inclure l'avertissement: "Ceci est une évaluation préliminaire"
- Être empathique tout en restant factuel et précis

# PROTOCOLE D'ANALYSE

## Étape 1: Collecte Structurée
Posez des questions ciblées pour obtenir:
1. Symptôme principal et symptômes associés
2. Début et durée (exacte: heures/jours/semaines)
3. Intensité sur échelle 0-10
4. Facteurs déclencheurs et modificateurs
5. Antécédents médicaux pertinents
6. Médications et allergies
7. Âge, sexe, conditions préexistantes

Adaptez les questions selon les réponses. Soyez efficace: 4-6 questions maximum sauf si complexe.

## Étape 2: Analyse Multimodale

### Pour le Texte:
- Extraction des entités médicales (symptômes, anatomie, temporalité)
- Identification des red flags
- Contextualisation (antécédents, démographie)

### Pour les Images:
- Analyse visuelle fournie par Vision API
- Corrélation avec symptômes décrits
- Évaluation de gravité visuelle
- Demande d'images supplémentaires si nécessaire

## Étape 3: Raisonnement Clinique
Générez 3-5 diagnostics différentiels en utilisant:
- Pattern matching symptomatique
- Données épidémiologiques (prévalence)
- Facteurs de risque individuels
- Principes de parcimonie (Occam's razor)

Pour chaque hypothèse, fournissez:
- Nom de la condition (terme médical + explication simple)
- Probabilité: ÉLEVÉE / MOYENNE / FAIBLE
- Symptômes correspondants (+)
- Symptômes non-expliqués ou contradictoires (-)
- Raisonnement clinique en 2-3 phrases

## Étape 4: Classification d'Urgence
Évaluez selon cette matrice:
🔴 URGENCE VITALE (Action: 911 immédiat)
🟠 URGENT (Action: Urgences dans 2-4h)
🟡 SEMI-URGENT (Action: Consultation 24-48h)
🟢 NON-URGENT (Action: Routine ou auto-soins)

## Étape 5: Génération de Recommandations
Structurez votre réponse ainsi en Markdown:

### 1️⃣ RÉSUMÉ CLINIQUE
[Synthèse des symptômes clés en 2-3 phrases]

### 2️⃣ DIAGNOSTICS POSSIBLES

**[Condition 1] - Probabilité ÉLEVÉE**
✓ Symptômes correspondants: [liste]
⚠️ Points d'attention: [éléments contradictoires]
📖 Explication: [2-3 phrases accessibles]

[Répéter pour 2-4 autres conditions]

### 3️⃣ NIVEAU D'URGENCE
[🔴/🟠/🟡/🟢] [NIVEAU]

**Action recommandée:** [Description claire et directive]
**Délai:** [Immédiat / 2-4h / 24-48h / Routine]
**Justification:** [Explication du niveau choisi]

### 4️⃣ EXAMENS COMPLÉMENTAIRES SUGGÉRÉS
- [Tests de labo pertinents]
- [Imagerie si nécessaire]
- [Examens physiques attendus]

### 5️⃣ RECOMMANDATIONS IMMÉDIATES

**Soins à domicile:**
- [Mesures concrètes et sécuritaires]
- [Médicaments OTC si approprié avec précautions]
- [Hydratation, repos, température, etc.]

**Surveillance:**
- [Symptômes à surveiller]
- [Signaux d'alarme nécessitant réévaluation]
- [Fréquence de monitoring]

**À ÉVITER:**
- [Comportements contre-indiqués]
- [Aliments/activités à éviter]
- [Automédication dangereuse]

### 6️⃣ ORIENTATION MÉDICALE
**Type de médecin:** [Généraliste / Spécialiste spécifique]
**Préparation consultation:**
- [Informations à noter]
- [Questions à poser]
- [Documents à apporter]

### 7️⃣ ÉDUCATION
[Explication accessible de la/les condition(s) probable(s)]
[Évolution naturelle attendue]
[Conseils de prévention future]

### ⚠️ AVERTISSEMENT OBLIGATOIRE
"Cette évaluation est préliminaire et ne remplace pas une consultation médicale. Consultez un professionnel de santé pour un diagnostic précis et un plan de traitement adapté."

# GESTION DES URGENCES
Si QUELCONQUE indicateur d'urgence vitale est détecté:
1. INTERROMPRE immédiatement le flux normal
2. AFFICHER en PREMIER et en GROS:

\`\`\`
🚨🚨🚨 URGENCE MÉDICALE DÉTECTÉE 🚨🚨🚨

VOS SYMPTÔMES NÉCESSITENT UNE ATTENTION IMMÉDIATE

ACTIONS À PRENDRE MAINTENANT:
1. Appelez le 911 ou votre numéro d'urgence local
2. Rendez-vous immédiatement aux urgences les plus proches
3. NE CONDUISEZ PAS vous-même si possible
4. Informez quelqu'un de votre situation

Raison de l'urgence: [Explication claire en 1 phrase]
\`\`\`

3. Ensuite seulement, fournir contexte médical bref
4. NE PAS minimiser, NE PAS proposer d'alternative à l'urgence

`;

// =================================================================================
// --- From services/supabaseClient.ts ---
// =================================================================================
const supabaseUrl = 'https://dqpzhpcglfbydcwgqdsu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxcHpocGNnbGZieWRjd2dxZHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Njc3MTksImV4cCI6MjA3NzQ0MzcxOX0.XMH8J8QzayRL48TCThYBtPweeDPSOw_IuFWxPJfrK9g';

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is not defined.");
}
const supabase = createClient(supabaseUrl, supabaseKey);


// =================================================================================
// --- From services/geminiService.ts ---
// =================================================================================
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const getDrSamyResponse = async (
  prompt: string,
  images: ImageFile[],
  history: Message[]
): Promise<string> => {
  try {
    const chatHistory = history.slice(0, -1);

    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-pro',
      history: chatHistory.map(msg => {
        const parts: Part[] = [];
        if (msg.text) {
          parts.push({ text: msg.text });
        }
        if (msg.role === 'user' && msg.images) {
          for (const image of msg.images) {
            parts.push({
              inlineData: {
                mimeType: image.type,
                data: image.base64,
              }
            });
          }
        }
        return { role: msg.role, parts };
      }),
      config: {
        systemInstruction: DR_SAMY_SYSTEM_PROMPT,
        safetySettings,
      }
    });

    const imageParts: Part[] = images.map(image => ({
      inlineData: {
        mimeType: image.type,
        data: image.base64,
      },
    }));

    const contentParts: Part[] = [];
    if (prompt) {
      contentParts.push({ text: prompt });
    }
    contentParts.push(...imageParts);

    const result: GenerateContentResponse = await chat.sendMessage({ message: contentParts });
    
    return result.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        return `An error occurred while communicating with the AI model: ${error.message}`;
    }
    return "An unknown error occurred while communicating with the AI model.";
  }
};


// =================================================================================
// --- Components ---
// =================================================================================

// --- From components/ThemeToggle.tsx ---
const ThemeToggle: React.FC = () => {
  type Theme = 'light' | 'dark';
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};


// --- From components/ChatInput.tsx ---
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
interface ChatInputProps {
  onSendMessage: (prompt: string, images: File[]) => void;
  isLoading: boolean;
}
const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
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

// --- From components/ChatMessage.tsx ---
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
    const cleanedText = text.replace(/```/g, '');
    return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4" role="alert">
            <div className="text-xl font-bold animate-pulse">🚨 URGENCE MÉDICALE DÉTECTÉE 🚨</div>
            <pre className="whitespace-pre-wrap font-sans mt-2">{cleanedText.replace('🚨🚨🚨 URGENCE MÉDICALE DÉTECTÉE 🚨🚨🚨', '')}</pre>
        </div>
    );
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
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
          <UserIcon size={18} />
        </div>
      </div>
    );
  }

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

// --- From components/Header.tsx ---
interface HeaderProps {
  onToggleSidebar: () => void;
}
const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar} 
          className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300"
          aria-label="Ouvrir le menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Dr Samy
        </h1>
      </div>
      <ThemeToggle />
    </header>
  );
};

// --- From components/WelcomeScreen.tsx ---
const WelcomeScreen: React.FC = () => {
  return (
    <div className="text-center p-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Bienvenue sur Dr Samy
      </h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
        Votre assistant de pré-diagnostic médical. Décrivez vos symptômes par texte, audio ou image pour recevoir une évaluation préliminaire et des recommandations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm flex flex-col items-center">
          <MessageSquare className="w-8 h-8 text-blue-500 mb-2" />
          <h3 className="font-semibold">Chat Textuel</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Décrivez vos symptômes.</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm flex flex-col items-center">
          <Mic className="w-8 h-8 text-green-500 mb-2" />
          <h3 className="font-semibold">Analyse Audio</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Enregistrez vos symptômes.</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm flex flex-col items-center">
          <ImageIcon className="w-8 h-8 text-purple-500 mb-2" />
          <h3 className="font-semibold">Analyse d'Image</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Envoyez des photos.</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm flex flex-col items-center">
          <Shield className="w-8 h-8 text-red-500 mb-2" />
          <h3 className="font-semibold">Sécurité</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Détection des urgences.</p>
        </div>
      </div>
    </div>
  );
};

// --- From components/LoadingIndicator.tsx ---
const LoadingIndicator: React.FC = () => {
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

// --- From components/Disclaimer.tsx ---
const Disclaimer: React.FC = () => {
  return (
    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
      ⚠️ Avertissement: Dr Samy fournit une évaluation préliminaire et ne remplace pas une consultation médicale. Consultez un professionnel de santé pour un diagnostic précis.
    </p>
  );
};

// --- From components/Sidebar.tsx ---
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
const Sidebar: React.FC<SidebarProps> = ({
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

// --- From components/LoginScreen.tsx ---
const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [view, setView] = useState<'signIn' | 'signUp' | 'checkEmail' | 'forgotPassword' | 'checkEmailForReset'>('signIn');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (view === 'signUp') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (signUpError) throw signUpError;
        setView('checkEmail');
      } else if (view === 'signIn') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else if (view === 'forgotPassword') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (resetError) throw resetError;
        setView('checkEmailForReset');
      }
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'checkEmail') {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-50 dark:bg-gray-800 p-4">
        <div className="text-center p-8 max-w-md w-full bg-white dark:bg-gray-900 shadow-xl rounded-lg">
           <Mail size={48} className="mx-auto text-blue-600 mb-4" />
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Vérifiez vos e-mails
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Un lien de confirmation a été envoyé à <strong>{email}</strong>. Veuillez cliquer sur ce lien pour finaliser votre inscription.
          </p>
        </div>
      </div>
    );
  }
  
  if (view === 'checkEmailForReset') {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-50 dark:bg-gray-800 p-4">
        <div className="text-center p-8 max-w-md w-full bg-white dark:bg-gray-900 shadow-xl rounded-lg">
           <Mail size={48} className="mx-auto text-blue-600 mb-4" />
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Vérifiez vos e-mails
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation de mot de passe a été envoyé.
          </p>
           <button
              onClick={() => setView('signIn')}
              className="font-medium text-blue-600 hover:underline mt-4 inline-flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              Retour à la connexion
            </button>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    switch(view) {
      case 'signIn': return 'Connexion à Dr Samy';
      case 'signUp': return 'Créer un compte';
      case 'forgotPassword': return 'Réinitialiser le mot de passe';
      default: return '';
    }
  }
  
  const getSubtitle = () => {
    switch(view) {
      case 'signIn':
      case 'signUp':
        return 'Accédez à votre assistant de pré-diagnostic.';
      case 'forgotPassword':
        return 'Entrez votre e-mail pour recevoir un lien de réinitialisation.';
      default: return '';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-50 dark:bg-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 shadow-xl rounded-lg p-8 space-y-6">
        <div className="text-center">
            <Bot size={48} className="mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {getTitle()}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {getSubtitle()}
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Adresse e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800"
                />
            </div>
             {view === 'signUp' && (
                <div>
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">Nom complet</label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Nom complet"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800"
                    />
                </div>
            )}
            { (view === 'signIn' || view === 'signUp') && (
              <div>
                  <label htmlFor="password"className="text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">Mot de passe</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800"
                  />
              </div>
            )}
            { view === 'signIn' && (
              <div className="text-right">
                <button 
                  type="button" 
                  onClick={() => { setView('forgotPassword'); setError(null); }} 
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Chargement...' : (view === 'signIn' ? 'Se connecter' : (view === 'signUp' ? 'S\'inscrire' : 'Envoyer le lien'))}
            </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {view === 'signIn' ? 'Pas encore de compte ?' : (view === 'signUp' ? 'Vous avez déjà un compte ?' : '')}
            { view !== 'forgotPassword' ? (
              <button
                onClick={() => {
                  setView(view === 'signIn' ? 'signUp' : 'signIn');
                  setError(null);
                }}
                className="font-medium text-blue-600 hover:underline ml-1"
              >
                {view === 'signIn' ? 'Inscrivez-vous' : 'Connectez-vous'}
              </button>
            ) : (
               <button
                  onClick={() => { setView('signIn'); setError(null); }}
                  className="font-medium text-blue-600 hover:underline ml-1"
                >
                  Retour à la connexion
                </button>
            )}
        </p>

        {error && <p className="text-red-500 text-sm mt-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-md text-center">{error}</p>}
      </div>
    </div>
  );
};

// =================================================================================
// --- From App.tsx ---
// =================================================================================
const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setConversations([]);
      setActiveConversationId(null);
      return;
    }
    try {
      const key = `dr-samy-conversations-${session.user.id}`;
      const storedConversations = localStorage.getItem(key);
      if (storedConversations) {
        const parsedConversations: Conversation[] = JSON.parse(storedConversations);
        setConversations(parsedConversations);
        if (parsedConversations.length > 0) {
          setActiveConversationId(parsedConversations[0].id);
        } else {
          setActiveConversationId(null);
        }
      } else {
        setConversations([]);
        setActiveConversationId(null);
      }
    } catch (e) {
      console.error("Failed to parse conversations from localStorage", e);
      setConversations([]);
      setActiveConversationId(null);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const key = `dr-samy-conversations-${session.user.id}`;
    if (conversations.length > 0 || localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(conversations));
    }
  }, [conversations, session]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversationId, isLoading, conversations]);

  const handleSendMessage = async (prompt: string, images: File[]) => {
    if (!prompt.trim() && images.length === 0) return;
    let currentConvId = activeConversationId;
    let isFirstMessage = false;
    if (!currentConvId) {
        const newConversation = startNewChat();
        currentConvId = newConversation.id;
        isFirstMessage = true;
    }
    setIsLoading(true);
    setError(null);
    const imageFiles: ImageFile[] = await Promise.all(
      images.map(async (file) => {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = (error) => reject(error);
        });
        return { name: file.name, base64, type: file.type };
      })
    );
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: prompt,
      images: imageFiles.length > 0 ? imageFiles : undefined,
    };
    
    let updatedMessages: Message[] = [];
    setConversations(prevConvs => 
        prevConvs.map(conv => {
            if (conv.id === currentConvId) {
                updatedMessages = [...conv.messages, userMessage];
                return { ...conv, messages: updatedMessages };
            }
            return conv;
        })
    );
    
    try {
      const responseText = await getDrSamyResponse(prompt, imageFiles, updatedMessages);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
      };
      
      setConversations(prevConvs => prevConvs.map(conv => {
        if (conv.id === currentConvId) {
          const finalMessages = [...conv.messages, botMessage];
          const newTitle = isFirstMessage ? prompt.substring(0, 50) : conv.title;
          return { ...conv, messages: finalMessages, title: newTitle };
        }
        return conv;
      }));

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Error: Could not get a response. ${errorMessage}`);
      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `Désolé, une erreur est survenue. Veuillez réessayer. (${errorMessage})`,
      };
      setConversations(prevConvs => prevConvs.map(conv => {
        if (conv.id === currentConvId) {
          return { ...conv, messages: [...conv.messages, errorBotMessage] };
        }
        return conv;
      }));
    } finally {
        setIsLoading(false);
    }
  };
  
  const startNewChat = () => {
    setError(null);
    setIsSidebarOpen(false); 
    const newConversation: Conversation = {
        id: Date.now().toString(),
        messages: [],
        title: 'Nouvelle Consultation',
        created_at: new Date().toISOString(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation;
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsSidebarOpen(false);
  };

  const deleteConversation = (id: string) => {
    const remainingConversations = conversations.filter(c => c.id !== id);
    setConversations(remainingConversations);
    if (activeConversationId === id) {
        if (remainingConversations.length > 0) {
            setActiveConversationId(remainingConversations[0].id);
        } else {
            setActiveConversationId(null);
        }
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation ? activeConversation.messages : [];
  
  if (!session) {
    return <LoginScreen />;
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-sans">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <Sidebar 
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={startNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={session.user}
      />
      <div className="flex flex-col flex-1">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !isLoading ? (
              <WelcomeScreen />
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
            {isLoading && <LoadingIndicator />}
            {error && <div className="text-red-500 text-center p-4">{error}</div>}
          </div>
        </main>
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            <Disclaimer />
          </div>
        </footer>
      </div>
    </div>
  );
};


// =================================================================================
// --- Root Application Render ---
// =================================================================================
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
