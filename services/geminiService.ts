import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, TrashType, TrashSeverity } from "../types";

// Initialize Gemini Client Lazily
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API_KEY is missing. AI features will not work.");
      return null;
    }
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
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          },
          {
            text: "Analyze this image for garbage tracking purposes. Identify if there is garbage, what kind, how severe it is, and describe it."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const result = JSON.parse(text) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    // Fallback/Error state
    return {
      isGarbage: false,
      trashType: TrashType.UNKNOWN,
      severity: TrashSeverity.LOW,
      description: "Failed to analyze image. Please try again.",
      suggestedLocationType: "Unknown"
    };
  }
};
