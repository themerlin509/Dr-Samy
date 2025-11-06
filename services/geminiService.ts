import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { DR_SAMY_SYSTEM_PROMPT } from '../constants';
import type { ImageFile, Message } from '../types';

// Récupération de la clé API depuis les variables d'environnement
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_API_KEY environment variable is not set.");
}

// Initialisation de l'API Gemini
const genAI = new GoogleGenerativeAI(API_KEY);

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

export const getDrSamyResponse = async (
  prompt: string,
  images: ImageFile[],
  history: Message[]
): Promise<string> => {
  try {
    // Configuration du modèle
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      safetySettings,
      systemInstruction: DR_SAMY_SYSTEM_PROMPT,
    });

    // Préparation de l'historique de conversation
    // Exclure le dernier message (message actuel)
    const chatHistory = history.slice(0, -1).map(msg => {
      const parts: any[] = [];
      
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
      
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    // Créer une session de chat
    const chat = model.startChat({
      history: chatHistory,
    });

    // Préparation du message actuel avec images
    const contentParts: any[] = [];
    
    if (prompt) {
      contentParts.push({ text: prompt });
    }
    
    if (images && images.length > 0) {
      images.forEach(image => {
        contentParts.push({
          inlineData: {
            mimeType: image.type,
            data: image.base64,
          },
        });
      });
    }

    // Envoi du message
    const result = await chat.sendMessage(contentParts);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Gemini API call failed:", error);
    
    if (error instanceof Error) {
      return `Une erreur s'est produite lors de la communication avec le modèle IA : ${error.message}`;
    }
    
    return "Une erreur inconnue s'est produite lors de la communication avec le modèle IA.";
  }
};
