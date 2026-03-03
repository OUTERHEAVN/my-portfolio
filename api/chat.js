function safeFallbackReply() {
  return "I can help with Caleb's background, experience, and technical skills. Ask about his roles, tools, or current focus.";
}

async function getGeminiResponse(userMessage) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return safeFallbackReply();
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = [
    "You are Pip-Boy, an assistant for Caleb Cabrera's portfolio site.",
    "Answer briefly and professionally.",
    "If asked unrelated questions, steer back to Caleb's background, experience, and skills.",
    `User question: ${userMessage}`,
  ].join("\n");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!response.ok || !text) return safeFallbackReply();
    return text;
  } catch {
    return safeFallbackReply();
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const question = req.body?.question?.trim();
  if (!question) return res.status(400).json({ error: "Missing question" });

  const answer = await getGeminiResponse(question);
  return res.status(200).json({ answer });
}
