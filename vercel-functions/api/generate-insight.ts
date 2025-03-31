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
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an emotionally intelligent communication coach." },
          { role: "user", content: `Analyze this message and return a short, emotionally intelligent insight:\n\n${userMessage}` }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || "You're doing great — keep practicing empathy.";

    return new Response(JSON.stringify({ insight }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Insight generation failed" }), { status: 500 });
  }

