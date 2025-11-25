import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, TrashType, TrashSeverity } from "../types";

// Initialize Gemini Client Lazily
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    const apiKey = process.env.API_KEY || (import.meta as any).env.VITE_API_KEY;
    if (!apiKey) {
      console.warn("API_KEY is missing. AI features will not work.");
      return null;
    }
    console.log("Initializing Gemini with API Key: ", apiKey.substring(0, 5) + "...");
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isGarbage: {
      type: Type.BOOLEAN,
      description: "Whether the image contains visible garbage, litter, or waste.",
    },
    trashType: {
      type: Type.STRING,
      enum: [
        "Plastic",
        "Paper",
        "Metal",
        "Organic",
        "Electronic",
        "Mixed",
        "Large Item",
        "Unknown"
      ],
      description: "The primary type of garbage detected.",
    },
    severity: {
      type: Type.STRING,
      enum: ["Low", "Medium", "High", "Critical"],
      description: "The severity or amount of the garbage shown.",
    },
    description: {
      type: Type.STRING,
      description: "A short, one-sentence description of the garbage.",
    },
    suggestedLocationType: {
      type: Type.STRING,
      description: "Guess the location type based on visual cues (e.g., Park, Street, Beach, Indoors).",
    }
  },
  required: ["isGarbage", "trashType", "severity", "description", "suggestedLocationType"],
};

export const analyzeImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const client = getAiClient();
    if (!client) throw new Error("API Key missing");

    const response = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          },
          {
            text: "Analyze this image. Does it contain any garbage, trash, litter, or waste? Even if it's a small amount, mark isGarbage as true. Identify the type, severity, and describe it."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    console.log("Gemini Raw Response:", text);
    if (!text) throw new Error("No response from Gemini");

    const result = JSON.parse(text) as AnalysisResult;
    return result;

    } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw error; // Re-throw to let the UI handle the error state
  }
};
