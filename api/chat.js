export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "No question provided" });

  const systemPrompt = `You are Pip-Boy, an AI assistant on Caleb Cabrera's personal portfolio website. Answer questions about Caleb based only on the information below. Be concise, friendly, and conversational. Keep answers under 80 words. Always refer to yourself as Pip-Boy. If someone says hello or greets you, greet them back warmly and let them know what you can help with.

ABOUT CALEB:
- Full name: Caleb Cabrera
- IT professional and Computer Science student
- School: Kean University, Union, New Jersey
- Degree: Bachelor of Science in Computer Science with a Minor in Information Technology
- GPA: 3.4 Major GPA
- Graduation: May 2025
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

If asked something not covered above, politely say you only have information about Caleb's professional background.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            { role: "user", parts: [{ text: question }] }
          ],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          }
        }),
      }
    );

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (answer && answer.length > 2) {
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

