import { HfInference } from '@huggingface/inference';
import { env } from '../../config/env';
import { PrismaClient, AssistantType, MessageRole } from '@prisma/client';

const prisma = new PrismaClient();
const hf = new HfInference(env.HUGGINGFACE_API_KEY);

const DEFAULT_MODEL = 'HuggingFaceH4/zephyr-7b-beta';

const SYSTEM_PROMPTS = {
  [AssistantType.LEARNER]: `You are a helpful AI assistant for a Learning Management System called "Learn n Earn". 
Your goal is to help students understand course material, answer their questions, and provide study tips.
Be encouraging, clear, and concise. If a student asks about a specific course, try to provide general educational guidance if you don't have the specific content.`,
  
  [AssistantType.ADMIN]: `You are a powerful AI admin assistant for "Learn n Earn" LMS.
Your task is to help the platform administrator with tasks like summarizing platform performance, managing courses, and answering technical questions about the LMS.
You have access to platform data (when provided in context). Be professional, objective, and efficient.`
};

export class AIService {
  async chat(sessionId: string, userId: string, message: string) {
    // 1. Get or create session
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, user_id: userId },
      include: { messages: { orderBy: { created_at: 'asc' } } }
    });

    if (!session) {
      throw new Error('Chat session not found');
    }

    // 2. Save user message
    await prisma.chatMessage.create({
      data: {
        session_id: sessionId,
        role: MessageRole.USER,
        content: message
      }
    });

    // 3. Prepare messages for HF
    const history = session.messages.map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'assistant',
      content: msg.content
    }));

    const response = await hf.chatCompletion({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[session.type] },
        ...history,
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiContent = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    // 4. Save AI response
    const savedAiMsg = await prisma.chatMessage.create({
      data: {
        session_id: sessionId,
        role: MessageRole.ASSISTANT,
        content: aiContent
      }
    });

    return savedAiMsg;
  }

  async createSession(userId: string, type: AssistantType, title?: string) {
    return prisma.chatSession.create({
      data: {
        user_id: userId,
        type,
        title: title || `New ${type.toLowerCase()} chat`
      }
    });
  }

  async getSessions(userId: string, type?: AssistantType) {
    return prisma.chatSession.findMany({
      where: { 
        user_id: userId,
        ...(type && { type })
      },
      orderBy: { updated_at: 'desc' }
    });
  }

  async getMessages(sessionId: string, userId: string) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, user_id: userId }
    });

    if (!session) {
      throw new Error('Chat session not found');
    }

    return prisma.chatMessage.findMany({
      where: { session_id: sessionId },
      orderBy: { created_at: 'asc' }
    });
  }
}
