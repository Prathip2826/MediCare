import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const getGeminiModel = (modelName: string = 'gemini-pro') => {
  return genAI.getGenerativeModel({ model: modelName });
};

export const getGeminiVisionModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
};
