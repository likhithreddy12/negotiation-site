"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const handleContinue = () => {
    if (!fullName.trim() || !email.trim()) {
      alert("Please enter your name and email.");
      return;
    }

    localStorage.setItem(
      "negotiation_intake",
      JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim(),
      })
    );

    router.push("/select-avatar");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#0d0d0f",
          border: "1px solid #2a2a2f",
          borderRadius: 18,
          padding: 28,
        }}
      >
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>
          Start Negotiation
        </h1>

        <p style={{ color: "#d1d5db", marginBottom: 22 }}>
          Enter your details before selecting your chat agent.
        </p>

        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              style={{
                width: "100%",
                background: "#000",
                color: "#fff",
                border: "1px solid #374151",
                borderRadius: 10,
                padding: "12px 14px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: "100%",
                background: "#000",
                color: "#fff",
                border: "1px solid #374151",
                borderRadius: 10,
                padding: "12px 14px",
                outline: "none",
              }}
            />
          </div>
        </div>

        <button
          onClick={handleContinue}
          style={{
            marginTop: 22,
            width: "100%",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Continue to Chat Agent Selection
        </button>
      </div>
    </main>
  );
}