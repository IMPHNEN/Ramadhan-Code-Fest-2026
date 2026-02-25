import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ''); // Ensure API key is provided
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set.');
      return NextResponse.json(
        { error: 'Kunci API Gemini tidak ditemukan. Harap atur variabel lingkungan GEMINI_API_KEY.' },
        { status: 500 }
      );
    }

    // Send the prompt to the Gemini model
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: [
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
      ],
    });

    const responseText = result.response.text();

    // No need for simulated delay anymore as it's a real API call
    return NextResponse.json({ response: responseText });

  } catch (error: any) {
    console.error('Error in Gemini Analysis API:', error);
    // Check for specific error types from Gemini API
    if (error.response && error.response.status) {
      return NextResponse.json(
        { error: `Kesalahan dari Gemini API: ${error.response.status} - ${error.response.statusText || error.message}` },
        { status: error.response.status }
      );
    } else if (error.message.includes('API key not valid')) {
      return NextResponse.json(
        { error: 'Kunci API Gemini tidak valid. Harap periksa kembali GEMINI_API_KEY Anda.' },
        { status: 401 }
      );
    } else {
      return NextResponse.json(
        { error: `Terjadi kesalahan pada server analisis: ${error.message}. Detail: ${JSON.stringify(error)}` },
        { status: 500 }
      );
    }
  }
}
