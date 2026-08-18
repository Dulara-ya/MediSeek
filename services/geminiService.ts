
import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";
import { HealthFormData, HealthPrediction, ChatMessage, GroundingChunk } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please set the API_KEY environment variable.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! }); 

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };
};

export const getHealthPrediction = async (formData: HealthFormData): Promise<HealthPrediction | null> => {
  if (!API_KEY) return null;
  const prompt = `
    Analyze the following health data for a person:
    Age: ${formData.age} years
    Height: ${formData.height} cm
    Weight: ${formData.weight} kg
    Blood Glucose: ${formData.glucose} mg/dL
    Hemoglobin: ${formData.hemoglobin} g/dL
    LDL Cholesterol: ${formData.ldlCholesterol} mg/dL
    
    Based on this, provide a health score, potential diseases, and prevention tips.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: {
              type: Type.NUMBER,
              description: "A health score from 0 to 100 based on the provided data."
            },
            potentialDiseases: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 2-3 potential diseases the user might be at risk for in the next 3 months."
            },
            preventionTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3 concise, actionable tips to prevent potential diseases and improve health."
            }
          },
          required: ["healthScore", "potentialDiseases", "preventionTips"]
        }
      },
    });

    const jsonStr = response.text.trim();
    const parsedData = JSON.parse(jsonStr);
    return parsedData as HealthPrediction;

  } catch (error) {
    console.error("Error getting health prediction from Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            console.error("Gemini API key is invalid. Please check your API_KEY environment variable.");
        }
    }
    return null;
  }
};

let chatInstance: Chat | null = null;

export const getChatbotResponse = async (userMessage: ChatMessage): Promise<ChatMessage | null> => {
  if (!API_KEY) return null;

  if (!chatInstance) {
    chatInstance = ai.chats.create({
      model: GEMINI_TEXT_MODEL,
      config: {
        systemInstruction: `You are MediSeek AI, a compassionate and supportive AI chatbot for users in Sri Lanka. 
        Your primary goal is to help users who are feeling depressed or lonely by providing a safe space to share their feelings, offering empathetic responses, and suggesting coping strategies. 
        You can converse in Sinhala, English, or Tamil, based on the user's language.
        You can also analyze images provided by the user. If they upload an image, respond to their query about it. For example, if they send a picture of a meal, you can provide general nutritional insights, but always remind them you are not a doctor.
        If the user expresses severe distress or suicidal thoughts, gently advise them to seek professional help immediately and provide the Sri Lankan emergency number 1990 (Suwa Seriya ambulance service).
        Be concise and helpful. Use markdown for formatting if it enhances readability (e.g., lists).`,
      },
    });
  }

  try {
    const parts: any[] = [{ text: userMessage.text }];

    if (userMessage.image) {
      const [meta, base64Data] = userMessage.image.split(',');
      const mimeType = meta.split(';')[0].split(':')[1];
      if (base64Data && mimeType) {
        parts.unshift(fileToGenerativePart(base64Data, mimeType));
      }
    }
    
    const stream = await chatInstance.sendMessageStream({ message: parts });
    let botResponseText = "";
    let finalResponse: GenerateContentResponse | undefined;

    for await (const chunk of stream) {
      botResponseText += chunk.text;
      finalResponse = chunk;
    }

    if (!botResponseText && finalResponse?.candidates?.[0]?.finishReason === 'SAFETY') {
       botResponseText = "I'm sorry, I cannot respond to that query due to safety guidelines. Is there something else I can help you with?";
    } else if (!botResponseText) {
       botResponseText = "I'm sorry, I couldn't generate a response at this time. Please try again.";
    }
    
    return {
      id: Date.now().toString(),
      text: botResponseText,
      sender: 'bot',
      timestamp: new Date(),
    };

  } catch (error) {
    console.error("Error getting chatbot response from Gemini:", error);
    return {
      id: Date.now().toString(),
      text: "Sorry, I encountered an error. Please try again later.",
      sender: 'bot',
      timestamp: new Date(),
    };
  }
};

export const getChatSummary = async (transcript: string): Promise<string | null> => {
  if (!API_KEY) return null;
  if (!transcript.trim()) return "No conversation to summarize.";

  const prompt = `Please provide a concise, one-paragraph summary of the following user-AI conversation. Focus on the user's main concerns, feelings, or questions. The conversation is between a user and a supportive AI named MediSeek AI.\n\nCONVERSATION:\n${transcript}\n\nSUMMARY:`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error getting chat summary from Gemini:", error);
    return null;
  }
};

export const getGroundedResponse = async (query: string): Promise<{ text: string; sources: GroundingChunk[] }> => {
  if (!API_KEY) return { text: "API Key not configured.", sources: [] };
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text, sources };
  } catch (error) {
    console.error("Error getting grounded response from Gemini:", error);
    return { text: "Error fetching grounded response.", sources: [] };
  }
};
