import React, { useState } from 'react';
import { Bot, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export const LoginScreen: React.FC = () => {
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
          redirectTo: window.location.origin, // Optional: where to redirect user after password reset
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