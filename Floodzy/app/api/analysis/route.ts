import { NextRequest, NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

// Define TypeScript interfaces for input data validation and clarity
interface FloodEvent {
  id: string;
  location: string;
  timestamp: string;
  severity: 'Ringan' | 'Sedang' | 'Parah';
  durationHours: number;
  affectedAreaSqKm: number;
  causes: string[];
  damageEstimateUSD?: number;
  reportsCount: number;
  status: 'Selesai' | 'Berlangsung';
}

interface WeatherData {
  location: string;
  timestamp: string;
  temperatureC: number;
  humidity: number;
  precipitationMm: number;
  windSpeedKph: number;
  airQualityIndex?: number;
  pressureHpa?: number;
}

interface InfrastructureData {
  location: string;
  type: 'Stasiun Pompa' | 'Sungai' | 'Saluran Drainase';
  name: string;
  capacityCubicMeter?: number;
  lastMaintenanceDate?: string;
  condition: 'Baik' | 'Perlu Perbaikan' | 'Rusak';
  historicalWaterLevelsMeters?: { timestamp: string; level: number }[];
  floodProneAreas?: string[];
}

// Define the structure of the incoming request body
interface AnalysisPayload {
  floodEvents: FloodEvent[];
  weatherData: WeatherData[];
  infrastructureData: InfrastructureData[];
  userPrompt: string;
}

// Define the expected structure of the JSON response from the AI
interface AnalysisResponse {
  summary: string;
  keyTrends: string[];
  riskFactors: string[];
  recommendations: string[];
}

const MODEL_NAME = "gemini-1.5-flash-latest";
// Ensure you have GOOGLE_API_KEY in your .env.local file
const API_KEY = process.env.GOOGLE_API_KEY || '';

/**
 * POST handler for the flood analysis API route.
 * Receives historical data and a user prompt, then returns a comprehensive analysis.
 */
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'Google API key is not configured.' },
      { status: 500 },
    );
  }

  try {
    const body: AnalysisPayload = await req.json();
    const { floodEvents, weatherData, infrastructureData, userPrompt } = body;

    // Basic validation
    if (!floodEvents || !weatherData || !infrastructureData || !userPrompt) {
      return NextResponse.json(
        { error: 'Missing required data fields in the request.' },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.3,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
      // This tells the model to respond with a JSON object.
      response_mime_type: 'application/json',
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // --- PERBAIKAN UTAMA ADA DI SINI ---
    // Pastikan seluruh string ini dibungkus oleh satu pasang backtick (`).
    const prompt = `You are an expert flood data analyst for Indonesia. Your task is to perform a comprehensive historical analysis based on the provided data and a specific user request.

**User's Request:**
"${userPrompt}"

**Provided Data:**

1.  **Historical Flood Events:**
    \`\`\`json
    ${JSON.stringify(floodEvents, null, 2)}
    \`\`\`

2.  **Historical Weather Data:**
    \`\`\`json
    ${JSON.stringify(weatherData, null, 2)}
    \`\`\`

3.  **Infrastructure & Geospatial Data:**
    \`\`\`json
    ${JSON.stringify(infrastructureData, null, 2)}
    \`\`\`

**Analysis Instructions:**

1.  **Integrate Data:** Holistically correlate information from all three datasets (flood, weather, infrastructure).
2.  **Identify Trends:** Find recurring patterns in flood frequency, severity, duration, and causes over time. Correlate these with historical weather data (e.g., rising extreme precipitation).
3.  **Analyze Risk Factors:** Identify the most significant contributing factors to flooding in the relevant location(s), considering geography, infrastructure conditions, and weather patterns.
4.  **Formulate Mitigation Recommendations:** Provide practical, actionable, and data-driven recommendations to reduce future flood risks and impacts. Recommendations must be specific (e.g., "upgrade pump station X due to its poor condition and correlation with severe floods," not "improve infrastructure").

**Output Format:**
You MUST respond with ONLY a valid JSON object that strictly adheres to the following schema. Do not include any text or markdown formatting before or after the JSON object.

{
  "summary": "A brief executive summary of the key findings.",
  "keyTrends": [
    "A key trend identified from the data.",
    "Another significant pattern observed over time."
  ],
  "riskFactors": [
    "A primary risk factor contributing to floods.",
    "An infrastructure or weather-related risk factor."
  ],
  "recommendations": [
    "A specific, actionable mitigation recommendation.",
    "Another concrete suggestion based on the analysis."
  ]
}
`;

    const result = await model.generateContent(prompt);
    const jsonResponseText = result.response.text();

    // Parse the JSON string to ensure it's valid before sending.
    // This is a crucial step to prevent sending malformed JSON to the client.
    const analysisResult: AnalysisResponse = JSON.parse(jsonResponseText);

    return NextResponse.json(analysisResult, { status: 200 });
  } catch (error) {
    console.error('Error in analysis API:', error);
    // Check if the error is a JSON parsing error from the AI's response
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error:
            'Failed to parse the JSON analysis response from the AI model. The model might have returned plain text instead of valid JSON.',
        },
        { status: 500 },
      );
    }
    // Handle other potential errors (e.g., from the Google AI API itself)
    return NextResponse.json(
      { error: 'An internal server error occurred during analysis.' },
      { status: 500 },
    );
  }
}
