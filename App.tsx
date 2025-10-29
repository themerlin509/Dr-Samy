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

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load conversations from localStorage on initial render
  useEffect(() => {
    try {
      const storedConversations = localStorage.getItem('dr-samy-conversations');
      if (storedConversations) {
        const parsedConversations: Conversation[] = JSON.parse(storedConversations);
        setConversations(parsedConversations);
        if (parsedConversations.length > 0) {
          setActiveConversationId(parsedConversations[parsedConversations.length - 1].id);
        }
      }
    } catch (e) {
      console.error("Failed to load conversations from localStorage", e);
      setConversations([]);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('dr-samy-conversations', JSON.stringify(conversations));
    } else {
      localStorage.removeItem('dr-samy-conversations');
    }
  }, [conversations]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversationId, isLoading, conversations]);

  const handleSendMessage = async (prompt: string, images: File[]) => {
    if (!prompt.trim() && images.length === 0) return;

    let currentConvId = activeConversationId;
    
    // If there's no active conversation or the active one is empty, create a new one
    const activeConv = conversations.find(c => c.id === currentConvId);
    if (!currentConvId || (activeConv && activeConv.messages.length === 0 && !prompt && images.length === 0) ) {
        const newConversation = startNewChat();
        currentConvId = newConversation.id;
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
    
    setConversations(prevConvs => 
        prevConvs.map(conv => 
            conv.id === currentConvId 
                ? { ...conv, messages: [...conv.messages, userMessage] } 
                : conv
        )
    );

    try {
      // Use a function for setConversations to get the most recent state
      setConversations(currentConversations => {
        const activeConversation = currentConversations.find(c => c.id === currentConvId);
        const history = activeConversation ? activeConversation.messages.filter(m => m.role === 'user' || m.role === 'model') : [];

        getDrSamyResponse(prompt, imageFiles, history).then(responseText => {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
          };
          
          setConversations(prevConvs => prevConvs.map(conv => {
            if (conv.id === currentConvId) {
              return { ...conv, messages: [...conv.messages, botMessage] };
            }
            return conv;
          }));
        }).catch(e => {
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
        }).finally(() => {
            setIsLoading(false);
        });
        
        return currentConversations;
      });

    } catch (e) {
      // This catch block might be redundant if the promise chain handles everything,
      // but it's good for catching synchronous errors.
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
      setIsLoading(false);
    }
  };
  
  const startNewChat = () => {
    setError(null);
    setIsSidebarOpen(false); // Close sidebar on mobile when starting a new chat
    const newConversation: Conversation = {
        id: Date.now().toString(),
        messages: [],
    };
    setConversations(prev => [...prev, newConversation]);
    setActiveConversationId(newConversation.id);
    return newConversation;
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsSidebarOpen(false); // Close sidebar on mobile when selecting a chat
  };

  const deleteConversation = (id: string) => {
    const remainingConversations = conversations.filter(c => c.id !== id);
    setConversations(remainingConversations);
    if (activeConversationId === id) {
        if (remainingConversations.length > 0) {
            setActiveConversationId(remainingConversations[remainingConversations.length - 1].id);
        } else {
            setActiveConversationId(null);
        }
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation ? activeConversation.messages : [];

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