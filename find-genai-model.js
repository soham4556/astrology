import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function findModel() {
    const candidates = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-001"
    ];

    for (const m of candidates) {
        try {
            console.log(`Testing model: ${m}...`);
            const result = await ai.models.generateContent({
                model: m,
                contents: [{ role: "user", parts: [{ text: "hi" }] }]
            });
            console.log(`✅ Model ${m} is available (or quota hit). Result: ${JSON.stringify(result.response)}`);
        } catch (e) {
            console.log(`❌ Model ${m} failed: ${e.message}`);
        }
    }
}

findModel();
