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
      <div className="login-container">
        <div className="check-email-card">
           <Mail size={48} className="login-icon" />
           <h1 className="login-title">
            Vérifiez vos e-mails
          </h1>
          <p className="login-subtitle">
            Un lien de confirmation a été envoyé à <strong>{email}</strong>. Veuillez cliquer sur ce lien pour finaliser votre inscription.
          </p>
        </div>
      </div>
    );
  }
  
  if (view === 'checkEmailForReset') {
    return (
      <div className="login-container">
        <div className="check-email-card">
           <Mail size={48} className="login-icon" />
           <h1 className="login-title">
            Vérifiez vos e-mails
          </h1>
          <p className="login-subtitle">
            Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation de mot de passe a été envoyé.
          </p>
           <button
              onClick={() => setView('signIn')}
              className="check-email-back-link"
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
            <Bot size={48} className="login-icon" />
            <h1 className="login-title">
              {getTitle()}
            </h1>
            <p className="login-subtitle">
              {getSubtitle()}
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
            <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Adresse e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                />
            </div>
             {view === 'signUp' && (
                <div>
                    <label htmlFor="fullName" className="sr-only">Nom complet</label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Nom complet"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="login-input"
                    />
                </div>
            )}
            { (view === 'signIn' || view === 'signUp') && (
              <div>
                  <label htmlFor="password" className="sr-only">Mot de passe</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="login-input"
                  />
              </div>
            )}
            { view === 'signIn' && (
              <div style={{textAlign: 'right'}}>
                <button 
                  type="button" 
                  onClick={() => { setView('forgotPassword'); setError(null); }} 
                  className="forgot-password-link"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? 'Chargement...' : (view === 'signIn' ? 'Se connecter' : (view === 'signUp' ? 'S\'inscrire' : 'Envoyer le lien'))}
            </button>
        </form>

        <p className="login-footer-text">
            {view === 'signIn' ? 'Pas encore de compte ?' : (view === 'signUp' ? 'Vous avez déjà un compte ?' : '')}
            { view !== 'forgotPassword' ? (
              <button
                onClick={() => {
                  setView(view === 'signIn' ? 'signUp' : 'signIn');
                  setError(null);
                }}
                className="login-footer-link"
              >
                {view === 'signIn' ? 'Inscrivez-vous' : 'Connectez-vous'}
              </button>
            ) : (
               <button
                  onClick={() => { setView('signIn'); setError(null); }}
                  className="login-footer-link"
                >
                  Retour à la connexion
                </button>
            )}
        </p>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
};