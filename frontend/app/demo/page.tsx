export default function DemoPage() {
  return (
    <main style={{ maxWidth: 900, margin: "60px auto", padding: "0 20px", fontFamily: "Arial" }}>
      <h1 style={{ fontSize: 36, marginBottom: 10 }}>
        Negotiation Demo
      </h1>

      <p style={{ fontSize: 18, lineHeight: 1.6 }}>
        This page will host the AI negotiation interface.
        For now, this is a placeholder to demonstrate the website structure.
      </p>

      <div style={{ marginTop: 30, padding: 20, border: "1px solid #ddd", borderRadius: 12 }}>
        <p><b>Status:</b> Frontend ready ✅</p>
        <p><b>Backend:</b> Coming next</p>
        <p><b>Agent:</b> Controlled negotiation (tough / soft)</p>
      </div>

      <p style={{ marginTop: 30 }}>
        Next steps:
        <ul>
          <li>Connect this page to a FastAPI backend</li>
          <li>Add chat UI</li>
          <li>Enable admin-editable agent settings</li>
        </ul>
      </p>
    </main>
  );
}
