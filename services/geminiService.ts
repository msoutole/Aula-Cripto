
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

export const getGeminiChat = (apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'Você é o CryptoExpert, um tutor divertido e didático especializado em segurança cibernética para estudantes. Explique conceitos como Cifra de César, RSA, HTTPS e Privacidade de dados de forma simples, usando analogias do mundo real (como bilhetes de escola, cadeados e cofres). Mantenha as respostas curtas e encorajadoras.',
    },
  });
};
