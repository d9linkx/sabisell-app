import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it in your Vercel project settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// World-Class Business Analyst Endpoints
// -------------------------------------------------------------

/**
 * Strategic Business Report Generator
 * Performs complex P&L analysis and identifies margin optimizations.
 */
app.post("/api/generate-weekly-report", async (req, res) => {
  try {
    const { inventory, sales, customerPayments } = req.body;
    const ai = getAiClient();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const statsPrompt = `You are a World-Class Business Analyst and SME Strategist specialized in the Nigerian retail and trade market.
    Analyze this merchant's data:
    - Inventory: ${JSON.stringify(inventory || [])}
    - Sales: ${JSON.stringify(sales || [])}
    - Customer Repayments: ${JSON.stringify(customerPayments || [])}

    Your task is to provide a strategic, high-fidelity business report in JSON format.
    Translate all logic elements to actual Nigerian cash contexts (e.g., impact of fuel prices on transport, Naira fluctuations, market competition).
    Use a professional yet relatable tone, infused with local Pidgin markers for rapport.

    Identify:
    1. Capital Efficiency: Where is money tied up (slow-moving stock)?
    2. Margin Analysis: Which items have high costs but low returns?
    3. Debt Risk: Analysis of customer credit vs cash flow.
    4. 3 Concrete Action Points for immediate growth.`;

    const generationConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveOverview: { type: Type.STRING },
          profitMarginAnalysis: { type: Type.STRING },
          estimatedWeeklyTrend: { type: Type.STRING },
          marginOptimizations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["executiveOverview", "profitMarginAnalysis", "estimatedWeeklyTrend", "marginOptimizations"]
      },
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: statsPrompt }] }],
      generationConfig
    });

    res.json(JSON.parse(result.response.text()));
  } catch (err: any) {
    console.error("Analyst Report Error:", err);
    res.status(500).json({ error: "Chai! Our analyst get temporary network issue. Try again or check your API key." });
  }
});

/**
 * Strategic Trade Strategist Chat
 * Back-and-forth conversation for business growth and automation.
 */
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, businessContext } = req.body;
    const ai = getAiClient();
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are 'Sabi AI', Oga's most loyal and brilliant business strategist and shop manager. 
      You address the user as 'Oga' or 'Oga Boss' with deep respect and commitment to their success.
      Your tone is professional yet warmly infused with Nigerian Pidgin markers (e.g., 'Oga, I don look your books...', 'Chai, this stock dey low o').

      Intelligence Context: ${JSON.stringify(businessContext)}

      Your Responsibilities:
      1. LOYAL ADVISOR: Use the context (topProducts, recentSales, lowStockItems) to give Oga sharp advice. Point out what is moving fast or who owes too much money.
      2. ANALYST: Analyze margins and suggest growth.
      3. BOOKKEEPER: Detect if Oga wants to RECORD_SALE, ADD_INVENTORY, RECORD_PAYMENT, or DELETE_PRODUCT. 
      4. CLEANER: Automatically fix stuttering or repeating words in shorthand inputs (e.g., 'I I want to sell' -> 'I want to sell') for the 'cleanPrompt'.

      Always prioritize Oga's profit. When Oga records a sale, map it to the 'inventory' provided in the context to ensure product names match exactly.`
    });

    const generationConfig = {
      temperature: 0.5,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "Friendly conversational response" },
          cleanPrompt: { type: Type.STRING, description: "Input text without stutters" },
          actionDetected: { type: Type.BOOLEAN },
          action: { 
            type: Type.STRING, 
            enum: ["ADD_INVENTORY", "RECORD_SALE", "RECORD_PAYMENT", "DELETE_PRODUCT", "NONE"] 
          },
          actionData: { type: Type.OBJECT }
        },
        required: ["text", "actionDetected", "action"]
      }
    };

    const lastUserMsg = messages[messages.length - 1].text;
    const result = await model.generateContent({
      contents: messages.map((m: any) => ({
        role: m.sender === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }]
      })),
      generationConfig
    });

    res.json(JSON.parse(result.response.text()));
  } catch (err: any) {
    res.status(500).json({ error: "Strategic chat failed", details: err.message });
  }
});

/**
 * Shorthand Voice/Text Command Parser
 * Rapidly converts natural speech into structured ledger entries.
 */
app.post("/api/voice-command", async (req, res) => {
  try {
    const { text, context } = req.body;
    const ai = getAiClient();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are a high-speed ledger parser. Convert spoken commands into structured transaction data.
    Context: ${JSON.stringify(context)}
    
    Actions to detect:
    - RECORD_SALE: e.g., "Sold 2 cement to Amaka for 10k"
    - ADD_INVENTORY: e.g., "Bring 5 cartons indomie cost 4k sell 6k"
    - RECORD_PAYMENT: e.g., "Tunde pay 5000 debt"

    Respond ONLY in JSON. Use Naira integers for amounts.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Parse: "${text}"` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recognized: { type: Type.BOOLEAN },
            explanation: { type: Type.STRING },
            action: { type: Type.STRING },
            data: { type: Type.OBJECT }
          },
          required: ["recognized", "explanation", "action", "data"]
        }
      }
    });

    res.json(JSON.parse(result.response.text()));
  } catch (err: any) {
    res.status(500).json({ error: "Voice parsing failed" });
  }
});

/**
 * Native Audio Voice Command Parser
 * Uses Gemini's Multimodal capabilities to listen to audio directly.
 */
app.post("/api/audio-command", async (req, res) => {
  try {
    const { audio, mimeType, context } = req.body;
    const ai = getAiClient();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: audio,
          mimeType: mimeType
        }
      },
      { text: `Listen to this merchant's voice. Convert the instruction into a structured transaction. Context: ${JSON.stringify(context)}` }
    ]);

    // For audio, we sometimes get back text that needs JSON extraction
    const rawText = result.response.text();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { recognized: false, explanation: "Could not parse audio directly." };
    
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: "Multimodal audio parsing failed" });
  }
});

/**
 * Bank Alert SMS Deconstructor
 * Extracts transaction details from messy bank SMS notifications.
 */
app.post("/api/bank/parse-alert", async (req, res) => {
  try {
    const { alertText } = req.body;
    const ai = getAiClient();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Parse this bank alert: "${alertText}"` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            senderName: { type: Type.STRING },
            bankName: { type: Type.STRING },
            desc: { type: Type.STRING },
            parsedSuccess: { type: Type.BOOLEAN }
          },
          required: ["amount", "senderName", "bankName", "parsedSuccess"]
        }
      }
    });

    res.json(JSON.parse(result.response.text()));
  } catch (err: any) {
    res.status(500).json({ error: "Bank alert parsing failed" });
  }
});
export default app; // Correct export for Vercel