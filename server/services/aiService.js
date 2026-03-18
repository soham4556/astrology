import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * generateKundaliAnalysis
 * Uses the advanced Thinking AI (Gemini 3.1 Pro Preview) to analyze planetary data.
 */
export async function generateKundaliAnalysis(planets, birthDetails) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const planetString = planets.map(p => `${p.full_name || p.name}: House ${p.house}, Sign ${p.sign}`).join("\n");

  const promptText = `
    You are a professional Vedic Astrologer (Jyotish). 
    I will provide you with the planetary positions (Planetary Chart data) and birth details of a person.
    
    Birth Details:
    Date/Time: ${birthDetails.datetime}
    Location: Lat ${birthDetails.latitude}, Lon ${birthDetails.longitude}
    
    Planetary Positions:
    ${planetString}
    
    Please provide a comprehensive and professional Kundali analysis in Marathi (मराठी) and English.
    The analysis should cover:
    1. Overall Personality and Characteristic (स्वभाव आणि व्यक्तिमत्व).
    2. Career and Wealth (करिअर आणि संपत्ती) - provide specific future insights.
    3. Health (आरोग्य).
    4. Relationship and Marriage (नातेसंबंध आणि विवाह).
    5. Important Life Remedies (उपाय) if any.
    
    Format the response as a clean JSON object with following structure:
    {
      "personality": { "mr": "...", "en": "..." },
      "career": { "mr": "...", "en": "..." },
      "health": { "mr": "...", "en": "..." },
      "relationships": { "mr": "...", "en": "..." },
      "remedies": { "mr": "...", "en": "..." },
      "summary": { "mr": "...", "en": "..." }
    }
    
    Ensure the Marathi is natural and professional (astrological terminology).
    Return ONLY the JSON object.
  `;

  const config = {
    thinkingConfig: {
      thinkingLevel: "high",
    },
    tools: [
      { googleSearch: {} }
    ]
  };

  const modelName = "google/gemini-2.0-flash-001"; 

  try {
    const requestHeaders = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };

    console.log("Sending Headers (simplified):", JSON.stringify(requestHeaders, null, 2));

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: promptText
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Error Response:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
      } catch (e) {
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    // Extract JSON from potential markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Advanced AI Analysis Error:", error);
    throw new Error("Advanced AI Analysis failed: " + error.message);
  }
}
