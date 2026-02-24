export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const prompt = `<s>[INST] Write a 3-sentence professional bio for Caleb Cabrera. He currently works at RWJBarnabas Health as Application Support and Front Desk Admin, previously worked at TRC Companies in energy efficiency program support, and is graduating from Kean University with a B.S. in Computer Science in May 2025. He has 5 years of management experience and is pursuing his CCNA certification. Write in third person, professional tone, suitable for a portfolio website. Keep it under 80 words. [/INST]`;

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
            max_new_tokens: 150,
            temperature: 0.7,
            return_full_text: false,
            wait_for_model: true,
          },
        }),
      }
    );

    const raw = await response.text();
    console.log("HF raw response:", raw);

    const data = JSON.parse(raw);

    let text = null;
    if (Array.isArray(data) && data[0]?.generated_text) {
      text = data[0].generated_text.trim();
    } else if (data?.generated_text) {
      text = data.generated_text.trim();
    } else if (data?.error) {
      console.error("HF error:", data.error);
      text = null;
    }

    if (text && text.length > 20) {
      res.status(200).json({ summary: text });
    } else {
      // Fallback static summary if model fails
      res.status(200).json({
        summary: "Caleb Cabrera is an IT professional and Computer Science graduate from Kean University with over five years of leadership experience. Currently serving as Application Support & Front Desk Admin at RWJBarnabas Health, he specializes in end-user support, EPIC patient management, and clinical IT operations. With a strong foundation in hardware troubleshooting, Active Directory, and ServiceNow, Caleb is actively pursuing his CCNA certification to further expand his networking expertise."
      });
    }
  } catch (err) {
    console.error("Server error:", err);
    res.status(200).json({
      summary: "Caleb Cabrera is an IT professional and Computer Science graduate from Kean University with over five years of leadership experience. Currently serving as Application Support & Front Desk Admin at RWJBarnabas Health, he specializes in end-user support, EPIC patient management, and clinical IT operations. With a strong foundation in hardware troubleshooting, Active Directory, and ServiceNow, Caleb is actively pursuing his CCNA certification to further expand his networking expertise."
    });
  }
}
