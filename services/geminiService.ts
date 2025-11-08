import type { ImageFile, Message } from '../types';

export const getDrSamyResponse = async (
  prompt: string,
  images: ImageFile[],
  history: Message[]
): Promise<string> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, images, history }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.text;
    
  } catch (error) {
    console.error("API call via proxy failed:", error);
    if (error instanceof Error) {
        return `An error occurred while communicating with the AI model: ${error.message}`;
    }
    return "An unknown error occurred while communicating with the AI model.";
  }
};
