export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "No question provided" });

  const context = `
You are an AI assistant for Caleb Cabrera's personal portfolio website. Answer questions about Caleb based only on the information below. Be concise, friendly, and professional. Keep answers under 80 words.

ABOUT CALEB:
- IT professional and Computer Science student at Kean University (B.S. CS, Minor in IT, 3.4 GPA, graduating May 2025)
- Currently pursuing CCNA certification
- 5+ years of management and leadership experience
- Strong communicator with a user-focused approach

CURRENT ROLE:
- RWJBarnabas Health — Application Support & Front Desk Admin (Oct 2024–Present)
- Provides front-line IT support for a 40+ person clinical team
- Supports desktops, printers, phones, and network ports
- Registers and schedules 100–200 patients daily in EPIC
- Partners with IT field officers to resolve escalated incidents

PREVIOUS EXPERIENCE:
- TRC Companies — Energy Efficiency Program Support (Sept 2022–June 2024)
- Conducted compliance reviews and managed large datasets
- TRC Companies — Energy Efficiency Intern (June 2022–Sept 2022)

SKILLS:
- Advanced: Hardware/Software Troubleshooting, System Upgrades, Device Configurations, Remote Support, Microsoft Office Suite
- Proficient: Active Directory, ServiceNow (ITSM), EPIC/MyChart, Networking (CCNA in progress), Data Validation & Reporting

CONTACT:
- GitHub: https://github.com/OUTERHEAVN
- LinkedIn: https://www.linkedin.com/in/calebjoshc/

If asked something not covered above, politely say you only have information about Caleb's professional background.
`;

  const prompt = `<s>[INST] ${context}\n\nQuestion: ${question} [/INST]`;

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
            temperature: 0.6,
            return_full_text: false,
            wait_for_model: true,
          },
        }),
      }
    );

    const raw = await response.text();
    const data = JSON.parse(raw);

    let answer = null;
    if (Array.isArray(data) && data[0]?.generated_text) {
      answer = data[0].generated_text.trim();
    } else if (data?.generated_text) {
      answer = data.generated_text.trim();
    }

    if (answer && answer.length > 5) {
      res.status(200).json({ answer });
    } else {
      res.status(200).json({
        answer: "I'm not sure about that — try asking about Caleb's work experience, skills, or education!"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(200).json({
      answer: "I'm having trouble connecting right now. Please try again in a moment!"
    });
  }
}
