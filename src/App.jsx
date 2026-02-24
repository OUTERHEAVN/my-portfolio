import { useState, useEffect } from "react";
import "./App.css";

// ── tiny helpers ────────────────────────────────────────────────
const NAV_LINKS = ["About", "Experience", "Skills", "Contact"];

const SKILLS = {
  Advanced: [
    "Hardware/Software Troubleshooting",
    "System Upgrades",
    "Device Configurations",
    "Remote Support",
    "Microsoft Office Suite",
  ],
  Proficient: [
    "Active Directory",
    "ServiceNow (ITSM)",
    "EPIC / MyChart",
    "Networking (CCNA in progress)",
    "Data Validation & Reporting",
  ],
};

const EXPERIENCE = [
  {
    company: "RWJBarnabas Health",
    role: "Application Support & Front Desk Admin",
    period: "Oct 2024 – Present",
    bullets: [
      "Front-line IT support for a 40+ person clinical team across desktops, printers, phones, and network ports.",
      "Registered, checked-in, and scheduled 100–200 patients daily in EPIC with strict accuracy and compliance.",
      "Partnered with IT field officers to resolve escalated incidents and documented recurring issues to improve workflows.",
    ],
    accent: "#a8b400",
  },
  {
    company: "TRC Companies, Inc.",
    role: "Energy Efficiency Program Support",
    period: "Sept 2022 – June 2024",
    bullets: [
      "Conducted infrastructure & system compliance reviews, verifying technical documentation accuracy.",
      "Managed large datasets and enhanced tracking systems, improving validation speed and reporting accuracy.",
      "Collaborated with engineers to resolve data discrepancies across system reports and field documentation.",
    ],
    accent: "#c8d400",
  },
  {
    company: "TRC Companies, Inc.",
    role: "Energy Efficiency Intern",
    period: "June 2022 – Sept 2022",
    bullets: [
      "Managed recruiting events to increase student sign-ups and distribute promotional materials.",
      "Processed digital submissions and resolved data-related errors for ongoing projects.",
      "Assisted compliance teams with documentation updates to improve project readiness for audits.",
    ],
    accent: "#8a9600",
  },
];

// ── Floating Chat component ──────────────────────────────────────
function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hey! I'm Caleb's AI assistant. Ask me anything about his background, skills, or experience! 👋",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer || "Sorry, I couldn't find an answer." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-wrapper">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header__info">
              <span className="pulse-dot" />
              <span>Ask Caleb's AI</span>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg--${m.role}`}>
                <span className="chat-msg__label">{m.role === "assistant" ? "AI" : "You"}</span>
                <p>{m.text}</p>
              </div>
            ))}
            {loading && (
              <div className="chat-msg chat-msg--assistant">
                <span className="chat-msg__label">AI</span>
                <p className="chat-typing">
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </p>
              </div>
            )}
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button className="chat-send" onClick={send} disabled={loading || !input.trim()}>
              ▶
            </button>
          </div>
        </div>
      )}
      <button className="chat-bubble" onClick={() => setOpen(!open)}>
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}

// ── AI Summary component ─────────────────────────────────────────
function AISummary() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const generate = async () => {
    if (loading || done) return;
    setLoading(true);
    setSummary("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      const text = data.summary || "Could not generate summary.";
      setSummary(text);
      setDone(true);
    } catch {
      setSummary("Error generating summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-box">
      <div className="ai-label">
        <span className="ai-badge">AI</span>
        <span>Powered Bio Generator</span>
      </div>
      <p className="ai-description">
        Click below to generate an AI-written professional summary about Caleb.
      </p>
      <button className="ai-btn" onClick={generate} disabled={loading || done}>
        {loading ? (
          <span className="ai-loading">
            <span className="dot" /> Generating
          </span>
        ) : done ? (
          "✓ Generated"
        ) : (
          "Generate Professional Summary"
        )}
      </button>
      {summary && (
        <div className="ai-result">
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState("About");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
    setActiveSection(id);
  };

  return (
    <div className="app">
      {/* ── NAV ── */}
      <nav className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
        <div className="nav__brand">
          <span className="brand-slash">/</span>caleb
        </div>
        <ul className={`nav__links ${menuOpen ? "nav__links--open" : ""}`}>
          {NAV_LINKS.map((l) => (
            <li key={l}>
              <button
                className={`nav__link ${activeSection === l ? "nav__link--active" : ""}`}
                onClick={() => scrollTo(l)}
              >
                {l}
              </button>
            </li>
          ))}
        </ul>
        <button className="nav__burger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </nav>

      {/* ── HERO ── */}
      <section id="about" className="hero">
        <div className="hero__bg-grid" />
        <div className="hero__glow hero__glow--1" />
        <div className="hero__glow hero__glow--2" />
        <div className="hero__content">
          <div className="hero__eyebrow">
            <span className="pulse-dot" />
            Available for opportunities
          </div>
          <h1 className="hero__name">
            Caleb<br />
            <span className="hero__name--accent">Cabrera</span>
          </h1>
          <p className="hero__title">
            IT Professional & CS Graduate
            <span className="hero__title-line" />
            Kean University '25
          </p>
          <p className="hero__bio">
            Bridging the gap between healthcare operations and technology.
            Five years of leadership experience, currently supporting clinical
            IT at RWJBarnabas Health while pursuing CCNA certification.
          </p>
          <div className="hero__cta">
            <button className="btn btn--primary" onClick={() => scrollTo("Experience")}>
              View My Work
            </button>
            <a
              href="https://github.com/OUTERHEAVN"
              target="_blank"
              rel="noreferrer"
              className="btn btn--ghost"
            >
              GitHub ↗
            </a>
          </div>
        </div>
        <div className="hero__card">
          <div className="stat-card">
            <div className="stat">
              <span className="stat__num">5+</span>
              <span className="stat__label">Years Leadership</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat__num">200</span>
              <span className="stat__label">Patients / Day</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat__num">3.4</span>
              <span className="stat__label">Major GPA</span>
            </div>
          </div>
          <AISummary />
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section id="experience" className="section">
        <div className="section__inner">
          <h2 className="section__title">
            <span className="section__title-num">01.</span> Experience
          </h2>
          <div className="timeline">
            {EXPERIENCE.map((job, i) => (
              <div key={i} className="timeline__item">
                <div
                  className="timeline__dot"
                  style={{ background: job.accent, boxShadow: `0 0 12px ${job.accent}` }}
                />
                <div className="timeline__card">
                  <div className="timeline__header">
                    <div>
                      <h3 className="timeline__role">{job.role}</h3>
                      <p className="timeline__company" style={{ color: job.accent }}>
                        {job.company}
                      </p>
                    </div>
                    <span className="timeline__period">{job.period}</span>
                  </div>
                  <ul className="timeline__bullets">
                    {job.bullets.map((b, j) => (
                      <li key={j}>
                        <span className="bullet-arrow" style={{ color: job.accent }}>▸</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Education card */}
          <div className="edu-card">
            <div className="edu-card__left">
              <span className="edu-badge">Education</span>
              <h3>Kean University</h3>
              <p>B.S. Computer Science · Minor in Information Technology</p>
            </div>
            <div className="edu-card__right">
              <span className="edu-gpa">3.4 GPA</span>
              <span className="edu-year">May 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" className="section section--alt">
        <div className="section__inner">
          <h2 className="section__title">
            <span className="section__title-num">02.</span> Skills
          </h2>
          <div className="skills-grid">
            {Object.entries(SKILLS).map(([level, items]) => (
              <div key={level} className="skills-group">
                <h3 className="skills-group__title">{level}</h3>
                <div className="skills-tags">
                  {items.map((s) => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="ccna-banner">
            <span className="ccna-icon">📡</span>
            <div>
              <strong>Currently Pursuing CCNA</strong>
              <p>Expanding networking expertise to complement hands-on IT experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="section">
        <div className="section__inner section__inner--center">
          <h2 className="section__title">
            <span className="section__title-num">03.</span> Contact
          </h2>
          <p className="contact__sub">
            Open to IT roles, networking opportunities, and new collaborations.
          </p>
          <a href="mailto:caleb@email.com" className="btn btn--primary btn--large">
            Get In Touch ↗
          </a>
          <div className="contact__links">
            <a href="https://github.com/OUTERHEAVN" target="_blank" rel="noreferrer" className="contact__link">
              GitHub
            </a>
            <span className="contact__divider">·</span>
            <a href="https://www.linkedin.com/in/calebjoshc/" target="_blank" rel="noreferrer" className="contact__link">
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p>Designed & built by Caleb Cabrera · {new Date().getFullYear()}</p>
      </footer>

      {/* ── FLOATING CHAT ── */}
      <FloatingChat />
    </div>
  );
}
