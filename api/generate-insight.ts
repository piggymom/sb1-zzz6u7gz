const generateInsight = async (message: string): Promise<string> => {
  try {
    const response = await fetch("/api/generate-insight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    return data.insight || "You're doing great — keep practicing empathy.";
  } catch (error) {
    console.error("Insight fetch failed:", error);
    return "You're doing great — keep practicing empathy.";
  }
};
Add OpenAI serverless function for insight generation
