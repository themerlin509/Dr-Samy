// FIX: Per coding guidelines, the API key must be sourced from `process.env.API_KEY`.
// This change also resolves the TypeScript error "Property 'env' does not exist on type 'ImportMeta'"
// by removing the usage of `import.meta.env`. A declaration for `process` is added to prevent
// a new TypeScript error.
declare const process: {
  env: {
    API_KEY: string;
  };
};

import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part, GenerateContentResponse, Chat } from "@google/genai";
import { DR_SAMY_SYSTEM_PROMPT } from '../constants';
import type { ImageFile, Message } from '../types';

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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // FIX: The history passed to `ai.chats.create` should not include the current user message.
    // The current user message is sent via `chat.sendMessage`.
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
      // FIX: `safetySettings` must be a property of the `config` object.
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