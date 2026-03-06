"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FactorKey = "price" | "reliability" | "fuel" | "horsepower" | "safety";
type StrategyKey =
  | "tough"
  | "soft"
  | "friendly"
  | "analytical"
  | "urgent"
  | "balanced";

const FACTORS: { key: FactorKey; label: string; helper: string }[] = [
  { key: "price", label: "Price / Budget", helper: "Discounts, total cost, best deal." },
  { key: "reliability", label: "Reliability", helper: "Long-term dependability, fewer repairs." },
  { key: "fuel", label: "Fuel Efficiency", helper: "Mileage (MPG), fuel cost over time." },
  { key: "horsepower", label: "Engine Power (Horsepower)", helper: "Performance, acceleration, driving feel." },
  { key: "safety", label: "Safety", helper: "Crash ratings, driver-assist, protection." },
];

const STRATEGIES: { key: StrategyKey; label: string; helper: string }[] = [
  { key: "tough", label: "Tough", helper: "Firm, assertive, and hard-bargaining style." },
  { key: "soft", label: "Soft", helper: "Calm, flexible, and cooperative negotiation style." },
  { key: "friendly", label: "Friendly", helper: "Warm, approachable, and relationship-focused." },
  { key: "analytical", label: "Analytical", helper: "Logic-based, data-driven, and comparison-heavy." },
  { key: "urgent", label: "Urgent", helper: "Fast-paced, deadline-focused, and action-oriented." },
  { key: "balanced", label: "Balanced", helper: "Mix of firmness, flexibility, and practical trade-offs." },
];

function normalizeTo100(raw: Record<FactorKey, number>) {
  const keys = Object.keys(raw) as FactorKey[];
  const sum = keys.reduce((acc, k) => acc + raw[k], 0);

  if (sum <= 0) {
    const equal: Record<FactorKey, number> = {
      price: 20,
      reliability: 20,
      fuel: 20,
      horsepower: 20,
      safety: 20,
    };
    return { normalized: equal, exact: equal };
  }

  const exact = keys.reduce((acc, k) => {
    acc[k] = (raw[k] / sum) * 100;
    return acc;
  }, {} as Record<FactorKey, number>);

  const rounded = keys.reduce((acc, k) => {
    acc[k] = Math.round(exact[k]);
    return acc;
  }, {} as Record<FactorKey, number>);

  const roundedSum = keys.reduce((acc, k) => acc + rounded[k], 0);
  const diff = 100 - roundedSum;

  if (diff !== 0) {
    const largestKey = keys.reduce((best, k) => (exact[k] > exact[best] ? k : best), keys[0]);
    rounded[largestKey] = Math.max(0, rounded[largestKey] + diff);
  }

  return { normalized: rounded, exact };
}

function getSliderBackground(value: number) {
  return `linear-gradient(to right, #2563eb 0%, #2563eb ${value}%, #d1d5db ${value}%, #d1d5db 100%)`;
}

function formatStrategyLabel(strategy: StrategyKey) {
  switch (strategy) {
    case "tough":
      return "Tough";
    case "soft":
      return "Soft";
    case "friendly":
      return "Friendly";
    case "analytical":
      return "Analytical";
    case "urgent":
      return "Urgent";
    case "balanced":
      return "Balanced";
    default:
      return "Balanced";
  }
}

function ProfessorStrategyPanel() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyKey>("balanced");

  const adminPassword = "professor123";

  useEffect(() => {
    const stored = localStorage.getItem("selected_strategy") as StrategyKey | null;
    if (stored) {
      setSelectedStrategy(stored);
    }
  }, []);

  function handleUnlock() {
    if (password === adminPassword) {
      setIsUnlocked(true);

      const stored = localStorage.getItem("selected_strategy") as StrategyKey | null;
      if (stored) {
        setSelectedStrategy(stored);
      }
    } else {
      alert("Incorrect admin password.");
    }
  }

  function handleSelectStrategy(strategy: StrategyKey) {
    setSelectedStrategy(strategy);
    localStorage.setItem("selected_strategy", strategy);
  }

  return (
    <section style={{ marginTop: 24 }}>
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 18,
          padding: 18,
          background: "rgba(255,255,255,0.06)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#ffffff" }}>
              Professor Strategy Control
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.76)", marginTop: 4 }}>
              Admin-only strategy selection for chatbot behavior.
            </div>
          </div>

          <button
            onClick={() => setShowAdmin((prev) => !prev)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {showAdmin ? "Hide Admin Panel" : "Admin Access"}
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 14, color: "#93c5fd", fontWeight: 700 }}>
          Current Strategy: {formatStrategyLabel(selectedStrategy)}
        </div>

        {showAdmin && !isUnlocked && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                flex: 1,
                minWidth: 220,
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "#111827",
                color: "#ffffff",
                outline: "none",
              }}
            />

            <button
              onClick={handleUnlock}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                background: "#ffffff",
                color: "#000000",
                border: "none",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Unlock
            </button>
          </div>
        )}

        {showAdmin && isUnlocked && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 14, color: "#93c5fd", marginBottom: 12, fontWeight: 700 }}>
              Selected Strategy: {formatStrategyLabel(selectedStrategy)}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {STRATEGIES.map((strategy) => {
                const isActive = selectedStrategy === strategy.key;

                return (
                  <button
                    key={strategy.key}
                    onClick={() => handleSelectStrategy(strategy.key)}
                    style={{
                      textAlign: "left",
                      padding: 14,
                      borderRadius: 14,
                      border: isActive ? "2px solid #60a5fa" : "1px solid rgba(255,255,255,0.15)",
                      background: isActive ? "rgba(37,99,235,0.22)" : "rgba(255,255,255,0.05)",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 15 }}>{strategy.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.82, marginTop: 4 }}>
                      {strategy.helper}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CarConfigurationSection() {
  const router = useRouter();

  const [raw, setRaw] = useState<Record<FactorKey, number>>({
    price: 30,
    reliability: 25,
    fuel: 20,
    safety: 15,
    horsepower: 10,
  });

  const { normalized } = useMemo(() => normalizeTo100(raw), [raw]);
  const total = Object.values(normalized).reduce((a, b) => a + b, 0);

  function handleChange(key: FactorKey, next: number) {
    setRaw((prev) => ({ ...prev, [key]: next }));
  }

  function handleStart() {
    localStorage.setItem("car_config_weights", JSON.stringify(normalized));
    router.push("/start");
  }

  return (
    <section id="features" style={{ marginTop: 70 }}>
      <h2 style={{ fontSize: 28, marginBottom: 10, color: "#ffffff" }}>Features</h2>

      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.82)",
          marginTop: 0,
          marginBottom: 18,
        }}
      >
        Configure what matters most to you. Weights automatically rebalance to total 100%.
      </p>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 20,
          padding: 22,
          background: "#ffffff",
          boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 24, color: "#000000" }}>
              Car Configuration
            </div>

            <div style={{ fontSize: 13, color: "#374151", marginTop: 6 }}>
              Adjust priorities across 5 factors (auto-normalized to 100%).
            </div>
          </div>

          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 999,
              padding: "8px 12px",
              fontSize: 13,
              background: "#f3f4f6",
              whiteSpace: "nowrap",
              color: "#111827",
              fontWeight: 600,
            }}
          >
            Total: <span style={{ fontWeight: 900, color: "#000000" }}>{total}%</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {FACTORS.map((f) => (
            <div
              key={f.key}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 16,
                background: "#ffffff",
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: "#000000" }}>{f.label}</div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#4b5563",
                      marginTop: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {f.helper}
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 58,
                    textAlign: "right",
                    fontWeight: 900,
                    color: "#2563eb",
                    fontSize: 16,
                  }}
                >
                  {normalized[f.key]}%
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <input
                  aria-label={f.label}
                  type="range"
                  min={0}
                  max={100}
                  value={raw[f.key]}
                  onChange={(e) => handleChange(f.key, Number(e.target.value))}
                  className="custom-slider"
                  style={{
                    width: "100%",
                    height: 10,
                    borderRadius: 999,
                    outline: "none",
                    appearance: "none",
                    WebkitAppearance: "none",
                    background: getSliderBackground(raw[f.key]),
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            marginTop: 18,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#374151",
              lineHeight: 1.5,
              maxWidth: 650,
            }}
          >
            These preferences will be used by the negotiation chatbot to tailor strategy and recommendations.
          </div>

          <button
            onClick={handleStart}
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 10px 24px rgba(37,99,235,0.28)",
            }}
          >
            Start
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "40px 20px 80px 20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#000000",
        color: "#ffffff",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 20, color: "#ffffff" }}>NegotiateAI</div>

        <nav
          style={{
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <a href="#features" style={{ color: "rgba(255,255,255,0.88)", textDecoration: "none" }}>
            Features
          </a>
          <a href="#how" style={{ color: "rgba(255,255,255,0.88)", textDecoration: "none" }}>
            How it Works
          </a>
          <a href="#contact" style={{ color: "rgba(255,255,255,0.88)", textDecoration: "none" }}>
            Contact
          </a>
        </nav>
      </header>

      <ProfessorStrategyPanel />

      <section style={{ marginTop: 60 }}>
        <h1
          style={{
            fontSize: 44,
            marginBottom: 10,
            color: "#ffffff",
            lineHeight: 1.15,
          }}
        >
          AI Sales Negotiation Agent
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            maxWidth: 760,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          A controlled negotiation system that follows a defined strategy and uses complete user configuration weights
          for consistent negotiation behavior.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
          <a
            href="#how"
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.35)",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            How it Works
          </a>
        </div>
      </section>

      <CarConfigurationSection />

      <section id="how" style={{ marginTop: 70 }}>
        <h2 style={{ fontSize: 28, color: "#ffffff" }}>How it Works</h2>
        <ol style={{ lineHeight: 1.8, marginTop: 12, color: "rgba(255,255,255,0.82)" }}>
          <li>User configures all factor weights and starts negotiation.</li>
          <li>Professor can select the active negotiation strategy from the first page.</li>
          <li>The chatbot uses the selected strategy plus the full weighted profile.</li>
          <li>Admin can update the strategy whenever needed.</li>
        </ol>
      </section>

      <section id="contact" style={{ marginTop: 70, marginBottom: 80 }}>
        <h2 style={{ fontSize: 28, color: "#ffffff" }}>Contact</h2>
        <p style={{ lineHeight: 1.6, color: "rgba(255,255,255,0.82)" }}>
          This webpage is created only for research purposes and you can contact: <b>klreddy@udel.edu</b>
        </p>
      </section>
    </main>
  );
}