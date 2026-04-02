"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type FactorKey = "price" | "reliability" | "fuel" | "horsepower" | "safety";
type StrategyKey =
  | "tough"
  | "soft"
  | "friendly"
  | "analytical"
  | "urgent"
  | "balanced";

const FACTORS: { key: FactorKey; label: string }[] = [
  { key: "price", label: "Price / Budget" },
  { key: "reliability", label: "Reliability" },
  { key: "fuel", label: "Fuel Efficiency" },
  { key: "horsepower", label: "Horsepower" },
  { key: "safety", label: "Safety" },
];

const STRATEGIES: { key: StrategyKey; label: string }[] = [
  { key: "balanced", label: "Balanced" },
  { key: "tough", label: "Tough" },
  { key: "soft", label: "Soft" },
  { key: "friendly", label: "Friendly" },
  { key: "analytical", label: "Analytical" },
  { key: "urgent", label: "Urgent" },
];

const ADMIN_PASSWORD = "professor123";

function normalizeWeights(
  changedKey: FactorKey,
  changedValue: number,
  current: Record<FactorKey, number>
) {
  const next = { ...current, [changedKey]: changedValue };

  const otherKeys = FACTORS.map((f) => f.key).filter((k) => k !== changedKey);
  const otherTotal = otherKeys.reduce((sum, key) => sum + current[key], 0);

  const remaining = 100 - changedValue;

  if (remaining <= 0) {
    const reset: Record<FactorKey, number> = {
      price: 0,
      reliability: 0,
      fuel: 0,
      horsepower: 0,
      safety: 0,
    };
    reset[changedKey] = 100;
    return reset;
  }

  if (otherTotal === 0) {
    const equalShare = Math.floor(remaining / otherKeys.length);
    let leftover = remaining - equalShare * otherKeys.length;

    for (const key of otherKeys) {
      next[key] = equalShare;
    }

    for (const key of otherKeys) {
      if (leftover <= 0) break;
      next[key] += 1;
      leftover -= 1;
    }

    return next;
  }

  let assigned = 0;
  for (let i = 0; i < otherKeys.length; i++) {
    const key = otherKeys[i];
    if (i === otherKeys.length - 1) {
      next[key] = remaining - assigned;
    } else {
      const proportional = Math.round((current[key] / otherTotal) * remaining);
      next[key] = proportional;
      assigned += proportional;
    }
  }

  const total = Object.values(next).reduce((a, b) => a + b, 0);
  const diff = 100 - total;
  if (diff !== 0) {
    const lastKey = otherKeys[otherKeys.length - 1];
    next[lastKey] += diff;
  }

  return next;
}

export default function HomePage() {
  const [weights, setWeights] = useState<Record<FactorKey, number>>({
    price: 20,
    reliability: 20,
    fuel: 20,
    horsepower: 20,
    safety: 20,
  });

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategyKey>("balanced");

  useEffect(() => {
    const savedWeights = localStorage.getItem("car_config_weights");
    const savedStrategy = localStorage.getItem("selected_strategy");
    const savedAdmin = localStorage.getItem("admin_unlocked");

    if (savedWeights) {
      setWeights(JSON.parse(savedWeights));
    }

    if (savedStrategy) {
      setSelectedStrategy(savedStrategy as StrategyKey);
    }

    if (savedAdmin === "true") {
      setAdminUnlocked(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("car_config_weights", JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    localStorage.setItem("selected_strategy", selectedStrategy);
  }, [selectedStrategy]);

  const total = useMemo(
    () => Object.values(weights).reduce((a, b) => a + b, 0),
    [weights]
  );

  function handleSliderChange(key: FactorKey, value: number) {
    const normalized = normalizeWeights(key, value, weights);
    setWeights(normalized);
  }

  function unlockAdmin() {
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      localStorage.setItem("admin_unlocked", "true");
      setAdminOpen(false);
      setAdminPassword("");
    } else {
      alert("Wrong admin password");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header style={{ marginBottom: 30 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h1 style={{ fontSize: 36, margin: 0 }}>AI Negotiation Agent</h1>

            <button
              onClick={() => setAdminOpen((prev) => !prev)}
              style={{
                background: "#111",
                color: "#fff",
                border: "1px solid #555",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Admin Access
            </button>
          </div>

          <p style={{ color: "#cfcfcf", marginTop: 12 }}>
            Configure your priorities, then start the chatbot.
          </p>
        </header>

        {adminOpen && !adminUnlocked && (
          <div
            style={{
              border: "1px solid #333",
              background: "#111",
              padding: 16,
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Professor / Admin Login</h3>
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 12,
                borderRadius: 8,
                border: "1px solid #444",
                background: "#000",
                color: "#fff",
              }}
            />
            <button
              onClick={unlockAdmin}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Unlock
            </button>
          </div>
        )}

        {adminUnlocked && (
          <div
            style={{
              border: "1px solid #333",
              background: "#111",
              padding: 20,
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Negotiation Strategy</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {STRATEGIES.map((strategy) => (
                <button
                  key={strategy.key}
                  onClick={() => setSelectedStrategy(strategy.key)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border:
                      selectedStrategy === strategy.key
                        ? "2px solid #2563eb"
                        : "1px solid #555",
                    background:
                      selectedStrategy === strategy.key ? "#1d4ed8" : "#000",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {strategy.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <section
          style={{
            border: "1px solid #333",
            background: "#111",
            padding: 24,
            borderRadius: 14,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Car Preference Weightage</h2>
          <p style={{ color: "#cfcfcf" }}>
            Total always stays at <strong>100%</strong> automatically.
          </p>

          <div style={{ display: "grid", gap: 20, marginTop: 20 }}>
            {FACTORS.map((factor) => (
              <div key={factor.key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span>{factor.label}</span>
                  <strong>{weights[factor.key]}%</strong>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[factor.key]}
                  onChange={(e) =>
                    handleSliderChange(factor.key, Number(e.target.value))
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

          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                background: total === 100 ? "#052e16" : "#7f1d1d",
                borderRadius: 8,
                border: "1px solid #333",
              }}
            >
              Total: <strong>{total}%</strong>
            </div>

            <Link
              href="/start"
              style={{
                background: "#2563eb",
                color: "#fff",
                textDecoration: "none",
                padding: "12px 22px",
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              Start
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}