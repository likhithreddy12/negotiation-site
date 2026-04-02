"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  function handleContinue() {
    if (!fullName.trim() || !email.trim()) {
      alert("Please enter your name and email");
      return;
    }

    localStorage.setItem(
      "negotiation_intake",
      JSON.stringify({
        fullName,
        email,
      })
    );

    router.push("/select-avatar");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 700,
          margin: "60px auto",
          background: "#111",
          border: "1px solid #333",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <h1 style={{ marginTop: 0 }}>Start</h1>
        <p style={{ color: "#cfcfcf" }}>
          Enter your details to continue to avatar selection.
        </p>

        <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
          <div>
            <label>Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              style={{
                width: "100%",
                padding: 12,
                marginTop: 8,
                borderRadius: 8,
                border: "1px solid #444",
                background: "#000",
                color: "#fff",
              }}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
              style={{
                width: "100%",
                padding: 12,
                marginTop: 8,
                borderRadius: 8,
                border: "1px solid #444",
                background: "#000",
                color: "#fff",
              }}
            />
          </div>
        </div>

        <button
          onClick={handleContinue}
          style={{
            marginTop: 24,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "12px 20px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Continue
        </button>
      </div>
    </main>
  );
}