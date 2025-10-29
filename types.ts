
export interface ImageFile {
  name: string;
  base64: string;
  type: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  images?: ImageFile[];
}

export interface Conversation {
  id: string;
  messages: Message[];
}