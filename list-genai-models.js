import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function list() {
  try {
    const response = await ai.models.list();
    console.log("Full Response Structure:", JSON.stringify(response, null, 2));
    
    // Attempting to see if it's an array directly or has a property
    const models = Array.isArray(response) ? response : (response.models || response.data || []);
    console.log("Available Models:");
    for (const model of models) {
      console.log(`- ${model.name || model.id || model} (${model.displayName || 'No Display Name'})`);
    }
  } catch (e) {
    console.error("List Models Error:", e.message);
  }
}

list();
