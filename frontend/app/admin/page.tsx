"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const topics = ["car", "laptop", "mobile", "job", "rent"] as const;
const strategies = [
  "tough",
  "soft",
  "friendly",
  "analytical",
  "urgent",
  "balanced",
] as const;

export default function AdminPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState("car");
  const [selectedStrategy, setSelectedStrategy] = useState("balanced");

  const handleSave = () => {
    localStorage.setItem(
      "admin_settings",
      JSON.stringify({
        activeTopic: selectedTopic,
        selectedStrategy: selectedStrategy,
      })
    );

    alert("Settings saved successfully");
    router.push("/");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        padding: "30px 20px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 36, marginBottom: 24 }}>Admin Dashboard</h1>

        <section
          style={{
            border: "1px solid #333",
            borderRadius: 12,
            padding: 20,
            background: "#111",
            marginBottom: 24,
          }}
        >
          <h2 style={{ marginBottom: 16 }}>Select Topic</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 8,
                  border:
                    selectedTopic === topic
                      ? "2px solid #2563eb"
                      : "1px solid #444",
                  background: selectedTopic === topic ? "#1e3a8a" : "#000",
                  color: "white",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        <section
          style={{
            border: "1px solid #333",
            borderRadius: 12,
            padding: 20,
            background: "#111",
            marginBottom: 24,
          }}
        >
          <h2 style={{ marginBottom: 16 }}>Select AI Strategy</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {strategies.map((strategy) => (
              <button
                key={strategy}
                onClick={() => setSelectedStrategy(strategy)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 8,
                  border:
                    selectedStrategy === strategy
                      ? "2px solid #22c55e"
                      : "1px solid #444",
                  background: selectedStrategy === strategy ? "#14532d" : "#000",
                  color: "white",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {strategy}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={handleSave}
          style={{
            padding: "12px 18px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Save Changes
        </button>
      </div>
    </main>
  );
}