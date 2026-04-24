import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, context } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ explanation: "GROQ_API_KEY is missing in Vercel environment variables." }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are a highly intelligent tutor. Explain the highlighted text simply, using the provided article context. Be concise and direct."
          },
          {
            role: "user",
            content: `Article Context: ${context}

Highlighted Text: "${text}"

Explain this concept:`
          }
        ],
        temperature: 0.3,
        max_tokens: 250
      })
    });

    const data = await response.json();
    return NextResponse.json({ explanation: data.choices[0].message.content });

  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: "Failed to connect to AI engine." }, { status: 500 });
  }
}
