import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log("Chat API Request: Messages count", messages.length);
    
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not defined in environment variables");
      return NextResponse.json({ error: "API Configuration Error: Missing Key" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for the Kodnest Learning Management System. You help students with their technical queries, course navigation, and learning path. Keep your tone professional yet encouraging. You are part of the 'Neural Sync' architecture.",
          },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API Error Response:", errorText);
        let errorMessage = "Groq API Error";
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {}
        return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.choices[0].message);
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
