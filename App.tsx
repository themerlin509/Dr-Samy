import React, { useState, useRef, useEffect } from 'react';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Sidebar } from './components/Sidebar';
import type { Message, ImageFile, Conversation } from './types';
import { getDrSamyResponse } from './services/geminiService';
import { LoadingIndicator } from './components/LoadingIndicator';
import { Disclaimer } from './components/Disclaimer';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { LoginScreen } from './components/LoginScreen';

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

  // Load conversations from localStorage on session change
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

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (!session) return;
    const key = `dr-samy-conversations-${session.user.id}`;
    // We check for conversations length to avoid overwriting existing storage with an empty array on initial load
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

    // If there's no active conversation, start a new one
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
    
    // Update local state immediately for better UX
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
          // Revert adding user message if API fails, or keep it and add error.
          // Let's add the error message for clarity.
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

export default App;
