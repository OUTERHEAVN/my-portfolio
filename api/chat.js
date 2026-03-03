function safeFallbackReply() {
  return "I can help with Caleb's background, experience, and technical skills. Ask about his roles, tools, or current focus.";
}

function buildSystemPrompt(userMessage) {
  return [
    "You are Pip-Boy, an assistant for Caleb Cabrera's portfolio site.",
    "Answer briefly and professionally.",
    "If asked unrelated questions, steer back to Caleb's background, experience, and skills.",
    `User question: ${userMessage}`,
  ].join("\n");
}

async function getHuggingFaceResponse(userMessage) {
  const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.VITE_HF_TOKEN;
  if (!hfToken) return null;

  const model = process.env.HF_CHAT_MODEL || "mistralai/Mistral-7B-Instruct-v0.3";
  const url = `https://router.huggingface.co/hf-inference/models/${model}`;
  const prompt = `<s>[INST] ${buildSystemPrompt(userMessage)} [/INST]`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hfToken}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 180,
          temperature: 0.6,
          return_full_text: false,
          wait_for_model: true,
        },
      }),
    });

    const data = await response.json();
    const text = Array.isArray(data)
      ? data?.[0]?.generated_text?.trim()
      : data?.generated_text?.trim();

    if (!response.ok || !text) return null;
    return text;
  } catch {
    return null;
  }
}

async function getGeminiResponse(userMessage) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = buildSystemPrompt(userMessage);

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
    if (!response.ok || !text) return null;
    return text;
  } catch {
    return null;
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

  const answer =
    (await getHuggingFaceResponse(question)) ||
    (await getGeminiResponse(question)) ||
    safeFallbackReply();

  return res.status(200).json({ answer });
}
