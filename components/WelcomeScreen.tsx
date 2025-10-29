import React from 'react';
import { Shield, MessageSquare, Image, Mic } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
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
          <Image className="w-8 h-8 text-purple-500 mb-2" />
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