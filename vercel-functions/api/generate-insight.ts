// vercel-functions/api/generate-insight.ts

export const config = {
  runtime: 'edge',
};

export default async function generateInsightHandler(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    const openAIKey = process.env.OPENAI_API_KEY;

    if (!openAIKey) {
      return new Response(JSON.stringify({ error: "Missing OpenAI API key" }), { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer
