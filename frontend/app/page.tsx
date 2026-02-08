export default function Home() {
  return (
    <main style={{ maxWidth: 1000, margin: "60px auto", padding: "0 20px", fontFamily: "Arial" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>NegotiateAI</div>
        <nav style={{ display: "flex", gap: 18 }}>
          <a href="#features">Features</a>
          <a href="#how">How it Works</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section style={{ marginTop: 60 }}>
        <h1 style={{ fontSize: 44, marginBottom: 10 }}>
          AI Sales Negotiation Agent
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 760 }}>
          A controlled negotiation system that follows a defined strategy
          (tough or soft) and stays consistent for the same customer.
          Built as a real website with an API backend.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
          <a
            href="/demo"
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: 10,
              background: "black",
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Open Demo
          </a>
          <a
            href="#how"
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid #ddd",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            How it Works
          </a>
        </div>
      </section>

      <section id="features" style={{ marginTop: 70 }}>
        <h2 style={{ fontSize: 28 }}>Features</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
            marginTop: 16,
          }}
        >
          {[
            ["Controlled Strategies", "Switch between tough and soft concession policies."],
            ["Multi-Issue Negotiation", "Negotiates price and product features."],
            ["Customer Consistency", "Same customer ID → predictable behavior."],
            ["Admin Editable Rules", "Professor can change policy settings later."],
          ].map(([title, desc]) => (
            <div key={title} style={{ border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{title}</div>
              <div style={{ color: "#444", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" style={{ marginTop: 70 }}>
        <h2 style={{ fontSize: 28 }}>How it Works</h2>
        <ol style={{ lineHeight: 1.8, marginTop: 12 }}>
          <li>User enters a Customer ID and starts negotiating.</li>
          <li>The agent evaluates offers using a defined policy.</li>
          <li>Customer memory ensures consistent responses.</li>
          <li>Admin can adjust strategy settings.</li>
        </ol>
      </section>

      <section id="contact" style={{ marginTop: 70, marginBottom: 80 }}>
        <h2 style={{ fontSize: 28 }}>Contact</h2>
        <p style={{ lineHeight: 1.6 }}>
          For research/demo access, contact: <b>yourname@university.edu</b>
        </p>
      </section>
    </main>
  );
}
