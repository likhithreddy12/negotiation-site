"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const name = fullName.trim();
    const mail = email.trim();
    const desc = description.trim();

    if (!name) return setError("Please enter your full name.");
    if (!mail || !isValidEmail(mail)) return setError("Please enter a valid email.");
    if (!desc) return setError("Please describe what you want to talk about.");

    localStorage.setItem(
      "negotiation_intake",
      JSON.stringify({
        fullName: name,
        email: mail,
        description: desc,
        createdAt: new Date().toISOString(),
      })
    );

    router.push("/demo");
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Start Negotiation Chat</h1>
      <p style={{ marginTop: 8 }}>
        Enter your details and what you want help with. Then we’ll open the AI chat.
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 18, display: "grid", gap: 12 }}>
        <label>
          Full Name
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          What do you want to talk about / get an opinion on?
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain your situation (pricing, salary, conflict, deal terms, etc.)"
            rows={5}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        {error ? <div style={{ color: "crimson" }}>{error}</div> : null}

        <button type="submit" style={{ padding: 12, fontWeight: 800, cursor: "pointer" }}>
          Continue to Chat
        </button>
      </form>
    </div>
  );
}
