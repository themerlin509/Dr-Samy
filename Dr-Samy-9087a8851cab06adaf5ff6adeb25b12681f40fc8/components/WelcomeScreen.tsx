import React from 'react';
import { Shield, MessageSquare, Image, Mic } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="welcome-screen">
      <h2 className="welcome-title">
        Bienvenue sur Dr Samy
      </h2>
      <p className="welcome-subtitle">
        Votre assistant de pré-diagnostic médical. Décrivez vos symptômes par texte, audio ou image pour recevoir une évaluation préliminaire et des recommandations.
      </p>
      <div className="features-grid">
        <div className="feature-card">
          <MessageSquare className="feature-icon" style={{ color: '#3b82f6' }} />
          <h3 className="feature-title">Chat Textuel</h3>
          <p className="feature-description">Décrivez vos symptômes.</p>
        </div>
        <div className="feature-card">
          <Mic className="feature-icon" style={{ color: '#22c55e' }} />
          <h3 className="feature-title">Analyse Audio</h3>
          <p className="feature-description">Enregistrez vos symptômes.</p>
        </div>
        <div className="feature-card">
          <Image className="feature-icon" style={{ color: '#a855f7' }} />
          <h3 className="feature-title">Analyse d'Image</h3>
          <p className="feature-description">Envoyez des photos.</p>
        </div>
        <div className="feature-card">
          <Shield className="feature-icon" style={{ color: '#ef4444' }} />
          <h3 className="feature-title">Sécurité</h3>
          <p className="feature-description">Détection des urgences.</p>
        </div>
      </div>
    </div>
  );
};