"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FactorKey =
  | "price"
  | "fuel"
  | "safety"
  | "reliability"
  | "horsepower";

type StrategyKey =
  | "tough"
  | "soft"
  | "friendly"
  | "analytical"
  | "urgent"
  | "balanced";

type TopicKey = "car" | "laptop" | "house";

const FACTORS: { key: FactorKey; label: string }[] = [
  { key: "price", label: "Price" },
  { key: "fuel", label: "Fuel Efficiency" },
  { key: "safety", label: "Safety" },
  { key: "reliability", label: "Reliability" },
  { key: "horsepower", label: "Horsepower" },
];

const STRATEGIES: { key: StrategyKey; label: string }[] = [
  { key: "tough", label: "Tough" },
  { key: "soft", label: "Soft" },
  { key: "friendly", label: "Friendly" },
  { key: "analytical", label: "Analytical" },
  { key: "urgent", label: "Urgent" },
  { key: "balanced", label: "Balanced" },
];

const TOPICS: { key: TopicKey; label: string }[] = [
  { key: "car", label: "Car" },
  { key: "laptop", label: "Laptop" },
  { key: "house", label: "House" },
];

const ADMIN_PASSWORD = "admin123";

const DEFAULT_WEIGHTS: Record<FactorKey, number> = {
  price: 10,
  fuel: 10,
  safety: 10,
  reliability: 69,
  horsepower: 1,
};

export default function HomePage() {
  const router = useRouter();

  const [weights, setWeights] =
    useState<Record<FactorKey, number>>(DEFAULT_WEIGHTS);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminError, setAdminError] = useState("");

  const [showTopicsPanel, setShowTopicsPanel] = useState(false);
  const [showStrategiesPanel, setShowStrategiesPanel] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState<TopicKey>("car");
  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategyKey>("balanced");

  useEffect(() => {
    const savedWeights = localStorage.getItem("car_config_weights");
    const savedTopic = localStorage.getItem("selected_topic");
    const savedStrategy = localStorage.getItem("selected_strategy");

    if (savedWeights) {
      try {
        setWeights(JSON.parse(savedWeights));
      } catch {}
    }

    if (savedTopic) {
      setSelectedTopic(savedTopic as TopicKey);
    }

    if (savedStrategy) {
      setSelectedStrategy(savedStrategy as StrategyKey);
    }
  }, []);

  const total = useMemo(
    () => Object.values(weights).reduce((sum, value) => sum + value, 0),
    [weights]
  );

  const normalizeWeights = (updated: Record<FactorKey, number>) => {
    const entries = Object.entries(updated) as [FactorKey, number][];
    const currentTotal = entries.reduce((sum, [, value]) => sum + value, 0);

    if (currentTotal === 100) return updated;
    if (currentTotal === 0) return DEFAULT_WEIGHTS;

    const scaled: Record<FactorKey, number> = {
      price: 0,
      fuel: 0,
      safety: 0,
      reliability: 0,
      horsepower: 0,
    };

    let runningTotal = 0;

    entries.forEach(([key, value], index) => {
      if (index === entries.length - 1) {
        scaled[key] = 100 - runningTotal;
      } else {
        const nextValue = Math.round((value / currentTotal) * 100);
        scaled[key] = nextValue;
        runningTotal += nextValue;
      }
    });

    return scaled;
  };

  const handleWeightChange = (key: FactorKey, value: number) => {
    const updated = { ...weights, [key]: value };
    const normalized = normalizeWeights(updated);
    setWeights(normalized);
  };

  const handleContinue = () => {
    localStorage.setItem("car_config_weights", JSON.stringify(weights));

    localStorage.setItem(
      "topic_weights",
      JSON.stringify({
        factor1: weights.price,
        factor2: weights.fuel,
        factor3: weights.safety,
        factor4: weights.reliability,
        factor5: weights.horsepower,
      })
    );

    router.push("/start");
  };

  const handleAdminOpen = () => {
    setShowPasswordModal(true);
    setAdminPassword("");
    setAdminError("");
  };

  const handleUnlockAdmin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      setShowPasswordModal(false);
      setAdminPassword("");
      setAdminError("");
    } else {
      setAdminError("Incorrect password");
    }
  };

  const handleSaveAdminChanges = () => {
    localStorage.setItem("selected_topic", selectedTopic);
    localStorage.setItem("selected_strategy", selectedStrategy);

    setAdminUnlocked(false);
    setShowTopicsPanel(false);
    setShowStrategiesPanel(false);
    setAdminPassword("");
    setAdminError("");
  };

  const sectionStyle: React.CSSProperties = {
    maxWidth: 920,
    margin: "0 auto 24px auto",
    background: "#0d0d0f",
    border: "1px solid #2a2a2f",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
  };

  const smallCardStyle: React.CSSProperties = {
    background: "#070709",
    border: "1px solid #2a2a2f",
    borderRadius: 14,
    padding: 16,
    minHeight: 110,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #222",
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#000",
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700 }}>AI Negotiation Agent</div>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap",
              fontSize: 14,
            }}
          >
            <a href="#how-it-works" style={{ color: "#fff", textDecoration: "none" }}>
              How It Works
            </a>
            <a href="#configuration" style={{ color: "#fff", textDecoration: "none" }}>
              Configuration
            </a>
            <a href="#contact" style={{ color: "#fff", textDecoration: "none" }}>
              Contact
            </a>

            <button
              onClick={handleAdminOpen}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Admin Access
            </button>
          </nav>
        </div>
      </header>

      <div style={{ padding: "24px 16px 40px" }}>
        <section id="how-it-works" style={sectionStyle}>
          <h1 style={{ fontSize: 28, marginBottom: 14, fontWeight: 700 }}>
            Smart Negotiation Website
          </h1>

          <p style={{ color: "#e5e7eb", lineHeight: 1.7, marginBottom: 22 }}>
            This platform helps users configure their priorities, choose a chatbot
            avatar, and begin a negotiation experience where the chatbot responds
            based on topic, hidden strategy, and full user weightage.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
            }}
          >
            {[
              "Adjust your priority weightage in the configuration section.",
              "Enter your details on the start page.",
              "Choose a male or female chatbot avatar.",
              "Start the negotiation chat and receive responses based on all selected weights.",
            ].map((text, index) => (
              <div key={index} style={smallCardStyle}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ lineHeight: 1.7, fontWeight: 600, fontSize: 15 }}>
                  {text}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="configuration" style={sectionStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Configuration</h2>
            <div
              style={{
                background: "#0c4a2d",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #166534",
                fontWeight: 700,
              }}
            >
              Total: {total}%
            </div>
          </div>

          <p style={{ marginBottom: 22, color: "#d1d5db" }}>
            Current topic:{" "}
            <span style={{ color: "#fff", fontWeight: 700 }}>
              {selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1)}
            </span>
          </p>

          <div style={{ display: "grid", gap: 22 }}>
            {FACTORS.map((factor) => (
              <div key={factor.key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  <span>{factor.label}</span>
                  <span>{weights[factor.key]}%</span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[factor.key]}
                  onChange={(e) =>
                    handleWeightChange(factor.key, Number(e.target.value))
                  }
                  style={{
                    width: "100%",
                    accentColor: "#2563eb",
                    cursor: "pointer",
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleContinue}
            style={{
              marginTop: 24,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Continue
          </button>
        </section>

        <section id="contact" style={sectionStyle}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Contact</h2>
          <p style={{ color: "#d1d5db" }}>
            This website is developed for academic and research purposes only.
          </p>
        </section>
      </div>

      {showPasswordModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#0d0d0f",
              border: "1px solid #2a2a2f",
              borderRadius: 18,
              padding: 24,
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>
              Admin Login
            </h3>

            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              style={{
                width: "100%",
                background: "#000",
                color: "#fff",
                border: "1px solid #374151",
                borderRadius: 10,
                padding: "12px 14px",
                outline: "none",
                marginBottom: 12,
              }}
            />

            {adminError && (
              <p style={{ color: "#f87171", marginBottom: 12 }}>{adminError}</p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleUnlockAdmin}
                style={{
                  flex: 1,
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Unlock
              </button>

              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  flex: 1,
                  background: "#111827",
                  color: "#fff",
                  border: "1px solid #374151",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {adminUnlocked && (
        <div
          style={{
            position: "fixed",
            top: 90,
            right: 20,
            width: "min(360px, calc(100vw - 32px))",
            background: "#0d0d0f",
            border: "1px solid #2a2a2f",
            borderRadius: 18,
            padding: 18,
            zIndex: 999,
            boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>
            Admin Controls
          </h3>

          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            <button
              onClick={() => setShowTopicsPanel((prev) => !prev)}
              style={{
                background: "#111827",
                color: "#fff",
                border: "1px solid #374151",
                borderRadius: 10,
                padding: "12px 14px",
                fontWeight: 700,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              Topics
            </button>

            {showTopicsPanel && (
              <div
                style={{
                  background: "#070709",
                  border: "1px solid #2a2a2f",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  gap: 10,
                }}
              >
                {TOPICS.map((topic) => (
                  <button
                    key={topic.key}
                    onClick={() => setSelectedTopic(topic.key)}
                    style={{
                      background:
                        selectedTopic === topic.key ? "#2563eb" : "#111827",
                      color: "#fff",
                      border: "1px solid #374151",
                      borderRadius: 10,
                      padding: "10px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowStrategiesPanel((prev) => !prev)}
              style={{
                background: "#111827",
                color: "#fff",
                border: "1px solid #374151",
                borderRadius: 10,
                padding: "12px 14px",
                fontWeight: 700,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              Chat Strategies
            </button>

            {showStrategiesPanel && (
              <div
                style={{
                  background: "#070709",
                  border: "1px solid #2a2a2f",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  gap: 10,
                }}
              >
                {STRATEGIES.map((strategy) => (
                  <button
                    key={strategy.key}
                    onClick={() => setSelectedStrategy(strategy.key)}
                    style={{
                      background:
                        selectedStrategy === strategy.key
                          ? "#2563eb"
                          : "#111827",
                      color: "#fff",
                      border: "1px solid #374151",
                      borderRadius: 10,
                      padding: "10px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {strategy.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSaveAdminChanges}
            style={{
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
            Save Changes
          </button>
        </div>
      )}
    </main>
  );
}