import api from './api';

export enum AssistantType {
  LEARNER = 'LEARNER',
  ADMIN = 'ADMIN',
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  type: AssistantType;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export const aiApi = {
  createSession: async (type: AssistantType, title?: string) => {
    const response = await api.post<ChatSession>('/ai/sessions', { type, title });
    return response.data;
  },

  getSessions: async (type?: AssistantType) => {
    const response = await api.get<ChatSession[]>('/ai/sessions', { params: { type } });
    return response.data;
  },

  getMessages: async (sessionId: string) => {
    const response = await api.get<ChatMessage[]>(`/ai/sessions/${sessionId}/messages`);
    return response.data;
  },

  sendMessage: async (sessionId: string, message: string) => {
    const response = await api.post<ChatMessage>('/ai/chat', { sessionId, message });
    return response.data;
  },
};
