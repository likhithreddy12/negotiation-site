"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const name = fullName.trim();
    const mail = email.trim();

    if (!name) return setError("Please enter your full name.");
    if (!mail || !isValidEmail(mail))
      return setError("Please enter a valid email.");

    // Save only name + email
    localStorage.setItem(
      "negotiation_intake",
      JSON.stringify({
        fullName: name,
        email: mail,
        createdAt: new Date().toISOString(),
      })
    );

    router.push("/select-avatar");
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>
        Start Negotiation Chat
      </h1>
      <p style={{ marginTop: 8 }}>
        Enter your details to begin your AI negotiation session.
      </p>

      <form
        onSubmit={onSubmit}
        style={{ marginTop: 18, display: "grid", gap: 12 }}
      >
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

        {error ? <div style={{ color: "crimson" }}>{error}</div> : null}

        <button
          type="submit"
          style={{
            padding: 12,
            fontWeight: 800,
            cursor: "pointer",
            borderRadius: 8,
          }}
        >
          Continue to Avatar Selection
        </button>
      </form>
    </div>
  );
}