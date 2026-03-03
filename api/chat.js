function safeFallbackReply() {
  return "I can help with Caleb's background, experience, and technical skills. Ask about his roles, tools, or current focus.";
}

const PORTFOLIO_FACTS = [
  "Name: Caleb Cabrera.",
  "Current role: Application Support and Front Desk Admin at RWJBarnabas Health (Oct 2024-Present).",
  "Previous roles: Energy Efficiency Program Support at TRC Companies (Sept 2022-June 2024); Energy Efficiency Intern at TRC Companies (June 2022-Sept 2022).",
  "Education: B.S. in Computer Science with a Minor in Information Technology from Kean University (graduating May 2025).",
  "GPA: 3.4 major GPA.",
  "Experience highlights: front-line IT support for a 40+ person clinical team; EPIC patient workflows; troubleshooting desktops, printers, phones, and network ports; incident escalation support.",
  "Advanced skills: hardware/software troubleshooting, system upgrades, device configurations, remote support, Microsoft Office Suite.",
  "Proficient skills: Active Directory, ServiceNow (ITSM), EPIC/MyChart, networking (CCNA in progress), data validation and reporting.",
  "Certification track: CCNA in progress.",
  "Availability: open to IT roles, networking opportunities, and new collaborations.",
  "Contact email: caleb@email.com.",
  "GitHub: https://github.com/OUTERHEAVN",
  "LinkedIn: https://www.linkedin.com/in/calebjoshc/",
  "Resume download path: /caleb-cabrera-resume.pdf",
].join("\n");

function getRuleBasedAnswer(userMessage) {
  const q = userMessage.toLowerCase();

  if (q.includes("current role") || q.includes("what does caleb do now") || q.includes("current job")) {
    return "Caleb currently works as Application Support and Front Desk Admin at RWJBarnabas Health (since October 2024).";
  }

  if (q.includes("experience") || q.includes("work history") || q.includes("previous role")) {
    return "Caleb's recent experience includes Application Support and Front Desk Admin at RWJBarnabas Health (Oct 2024-Present), Energy Efficiency Program Support at TRC Companies (Sept 2022-June 2024), and Energy Efficiency Intern at TRC Companies (June 2022-Sept 2022).";
  }

  if (q.includes("education") || q.includes("degree") || q.includes("graduate") || q.includes("university")) {
    return "Caleb is completing a B.S. in Computer Science at Kean University, with graduation in May 2025.";
  }

  if (q.includes("certification") || q.includes("ccna") || q.includes("certified") || q.includes("cert")) {
    return "Caleb is currently pursuing his CCNA certification.";
  }

  if (q.includes("skills") || q.includes("tech stack") || q.includes("tools")) {
    return "Caleb's skills include troubleshooting, system upgrades, device configuration, remote support, Active Directory, ServiceNow, EPIC/MyChart, networking fundamentals, and data validation/reporting.";
  }

  if (q.includes("contact") || q.includes("email") || q.includes("reach") || q.includes("get in touch")) {
    return "You can contact Caleb at caleb@email.com. You can also connect on LinkedIn (https://www.linkedin.com/in/calebjoshc/) or GitHub (https://github.com/OUTERHEAVN).";
  }

  if (q.includes("linkedin")) {
    return "Caleb's LinkedIn: https://www.linkedin.com/in/calebjoshc/";
  }

  if (q.includes("github")) {
    return "Caleb's GitHub: https://github.com/OUTERHEAVN";
  }

  if (q.includes("resume") || q.includes("cv")) {
    return "You can download Caleb's resume from /caleb-cabrera-resume.pdf on this portfolio site.";
  }

  if (q.includes("available") || q.includes("availability") || q.includes("open to")) {
    return "Caleb is open to IT roles, networking opportunities, and new collaborations.";
  }

  if (q.includes("gpa")) {
    return "Caleb's listed major GPA is 3.4.";
  }

  if (q.includes("location") || q.includes("where are") || q.includes("located") || q.includes("based")) {
    return "Caleb's portfolio does not list a specific location. I can share his role, experience, skills, and contact links.";
  }

  return null;
}

function buildSystemPrompt(userMessage) {
  return [
    "You are Pip-Boy, an assistant for Caleb Cabrera's portfolio site.",
    "You must only use the facts below. Do not invent employers, titles, schools, certifications, or dates.",
    "If the question is outside these facts, say you only answer based on Caleb's portfolio and ask a follow-up question.",
    "Answer briefly and professionally.",
    "Facts:",
    PORTFOLIO_FACTS,
    `User question: ${userMessage}`,
  ].join("\n");
}

async function getHuggingFaceResponse(userMessage) {
  const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.VITE_HF_TOKEN;
  if (!hfToken) return null;

  const model = process.env.HF_CHAT_MODEL || "Qwen/Qwen2.5-7B-Instruct";
  const url = "https://router.huggingface.co/v1/chat/completions";
  const system = "You are Pip-Boy, an assistant for Caleb Cabrera's portfolio site. Answer briefly and professionally. If asked unrelated questions, steer back to Caleb's background, experience, and skills.";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hfToken}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMessage },
        ],
        max_tokens: 180,
        temperature: 0.6,
      }),
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

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

  const directAnswer = getRuleBasedAnswer(question);
  if (directAnswer) return res.status(200).json({ answer: directAnswer });

  const answer =
    (await getHuggingFaceResponse(question)) ||
    (await getGeminiResponse(question)) ||
    safeFallbackReply();

  return res.status(200).json({ answer });
}
