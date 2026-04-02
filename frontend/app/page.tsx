"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            AI Sales Negotiation Agent
          </div>

          <nav style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <a href="#features" style={navLink}>
              Features
            </a>
            <a href="#how-it-works" style={navLink}>
              How It Works
            </a>
            <a href="#contact" style={navLink}>
              Contact
            </a>
            <Link href="/admin-login" style={adminButton}>
              Admin Access
            </Link>
          </nav>
        </header>

        <section
          style={{
            border: "1px solid #333",
            borderRadius: 18,
            padding: 28,
            background: "#0f0f0f",
            marginBottom: 40,
          }}
        >
          <h1 style={{ fontSize: 44, marginBottom: 16 }}>
            AI Negotiation Assistant
          </h1>

          <p style={{ fontSize: 18, color: "#d1d5db", maxWidth: 850, lineHeight: 1.6 }}>
            Practice real-world negotiation scenarios with an AI-powered assistant that adapts
            to your strategy, preferences, and decision-making style.
          </p>

          <div style={{ marginTop: 24, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/start" style={primaryButton}>
              Start Negotiation
            </Link>

            <Link href="/demo" style={secondaryButton}>
              Open Demo Chat
            </Link>
          </div>
        </section>

        <section id="features" style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>Features</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 18,
            }}
          >
            <div style={cardStyle}>
              <h3 style={{ marginBottom: 8 }}>Admin-Controlled Topics</h3>
              <p style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                The professor can choose the active negotiation topic from a secure admin page.
              </p>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginBottom: 8 }}>Multiple AI Strategies</h3>
              <p style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                Switch between balanced, soft, tough, friendly, analytical, and urgent styles.
              </p>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginBottom: 8 }}>User Preference Weightage</h3>
              <p style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                Users can adjust 5 weights based on their individual priorities, with a total of
                100.
              </p>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginBottom: 8 }}>Interactive Negotiation Chat</h3>
              <p style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                The chatbot responds using the selected topic, chosen strategy, and user inputs.
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>How It Works</h2>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={cardStyle}>1. Admin selects the active topic and AI strategy.</div>
            <div style={cardStyle}>2. Users enter topic-specific details.</div>
            <div style={cardStyle}>
              3. Users adjust the 5 factor weights so the total equals 100.
            </div>
            <div style={cardStyle}>
              4. The chatbot uses those preferences during the interaction.
            </div>
          </div>
        </section>

        <section id="contact">
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>Contact</h2>
          <div style={cardStyle}>
            This site is designed as an AI negotiation research demo with admin-controlled topic
            selection and user-controlled preference weights.
          </div>
        </section>
      </div>
    </main>
  );
}

const navLink = {
  color: "white",
  textDecoration: "none",
  fontSize: 15,
};

const adminButton = {
  color: "white",
  textDecoration: "none",
  border: "1px solid #3b82f6",
  padding: "10px 16px",
  borderRadius: 10,
  background: "#111827",
};

const primaryButton = {
  textDecoration: "none",
  color: "white",
  background: "#2563eb",
  padding: "12px 18px",
  borderRadius: 10,
  fontWeight: 600,
};

const secondaryButton = {
  textDecoration: "none",
  color: "white",
  border: "1px solid #444",
  padding: "12px 18px",
  borderRadius: 10,
  fontWeight: 600,
};

const cardStyle = {
  border: "1px solid #333",
  borderRadius: 14,
  padding: 18,
  background: "#111",
};