export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const prompt = `Write a 3-sentence professional bio for Caleb Cabrera. He works at RWJBarnabas Health in IT support, previously worked at TRC Companies in energy efficiency, and is graduating from Kean University with a B.S. in Computer Science in May 2025. He has 5 years of management experience and is pursuing his CCNA. Write in third person, professional tone. Bio:`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.VITE_HF_TOKEN}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 120,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      }
    );

    const data = await response.json();
    const raw = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    const text = raw?.trim() || "Could not generate summary.";
    res.status(200).json({ summary: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate summary." });
  }
}
