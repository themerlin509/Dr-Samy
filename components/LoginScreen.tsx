import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, Supabase redirects the user, so no need to setLoading(false) here.
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-50 dark:bg-gray-800">
      <div className="text-center p-8 max-w-md w-full">
        <Bot size={48} className="mx-auto text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Bienvenue sur Dr Samy
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Votre assistant de pré-diagnostic médical. Connectez-vous pour commencer.
        </p>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,36.218,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          <span>Continuer avec Google</span>
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-8">
          Connectez-vous avec votre compte Google pour accéder à votre historique de consultation sécurisé.
        </p>
      </div>
    </div>
  );
};