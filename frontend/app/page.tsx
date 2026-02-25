"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FactorKey = "price" | "reliability" | "fuel" | "horsepower" | "safety";

const FACTORS: { key: FactorKey; label: string; helper: string }[] = [
  { key: "price", label: "Price / Budget", helper: "Discounts, total cost, best deal." },
  { key: "reliability", label: "Reliability", helper: "Long-term dependability, fewer repairs." },
  { key: "fuel", label: "Fuel Efficiency", helper: "Mileage (MPG), fuel cost over time." },
  { key: "horsepower", label: "Engine Power (Horsepower)", helper: "Performance, acceleration, driving feel." },
  { key: "safety", label: "Safety", helper: "Crash ratings, driver-assist, protection." },
];

function normalizeTo100(raw: Record<FactorKey, number>) {
  const keys = Object.keys(raw) as FactorKey[];
  const sum = keys.reduce((acc, k) => acc + raw[k], 0);

  // If everything is 0, fall back to an equal split (20 each).
  if (sum <= 0) {
    const equal = { price: 20, reliability: 20, fuel: 20, horsepower: 20, safety: 20 } as Record<FactorKey, number>;
    return { normalized: equal, exact: equal };
  }

  // Exact (float) weights
  const exact = keys.reduce((acc, k) => {
    acc[k] = (raw[k] / sum) * 100;
    return acc;
  }, {} as Record<FactorKey, number>);

  // Rounded integers for display
  const rounded = keys.reduce((acc, k) => {
    acc[k] = Math.round(exact[k]);
    return acc;
  }, {} as Record<FactorKey, number>);

  // Fix rounding drift so total is exactly 100
  const roundedSum = keys.reduce((acc, k) => acc + rounded[k], 0);
  const diff = 100 - roundedSum;

  if (diff !== 0) {
    const largestKey = keys.reduce((best, k) => (exact[k] > exact[best] ? k : best), keys[0]);
    rounded[largestKey] = Math.max(0, rounded[largestKey] + diff);
  }

  return { normalized: rounded, exact };
}

function CarConfigurationSection() {
  const router = useRouter();

  // Raw slider values (user-controlled). We normalize into weights summing to 100.
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

  function handleSave() {
    localStorage.setItem("car_config_weights", JSON.stringify(normalized));
    // Change this to your real chatbot route if different
    router.push("/chat");
  }

  return (
    <section id="features" style={{ marginTop: 70 }}>
      <h2 style={{ fontSize: 28, marginBottom: 10 }}>Features</h2>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#444", marginTop: 0, marginBottom: 18 }}>
        Configure what matters most to you. Weights automatically rebalance to total 100%.
      </p>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 14,
          padding: 18,
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Car Configuration</div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
              Adjust priorities across 5 factors (auto-normalized to 100%).
            </div>
          </div>

          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 999,
              padding: "6px 10px",
              fontSize: 13,
              background: "#fafafa",
              whiteSpace: "nowrap",
            }}
          >
            Total: <span style={{ fontWeight: 800 }}>{total}%</span>
          </div>
        </div>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          {FACTORS.map((f) => (
            <div key={f.key} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{f.helper}</div>
                </div>

                <div style={{ minWidth: 52, textAlign: "right", fontWeight: 800 }}>
                  {normalized[f.key]}%
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <input
                  aria-label={f.label}
                  type="range"
                  min={0}
                  max={100}
                  value={raw[f.key]}
                  onChange={(e) => handleChange(f.key, Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 16, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4, maxWidth: 650 }}>
            These preferences will be used by the negotiation chatbot to tailor strategy and recommendations.
          </div>

          <button
            onClick={handleSave}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "black",
              color: "white",
              border: "none",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </section>
  );
}

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

      {/* HERO */}
      <section style={{ marginTop: 60 }}>
        <h1 style={{ fontSize: 44, marginBottom: 10 }}>AI Sales Negotiation Agent</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 760 }}>
          A controlled negotiation system that follows a defined strategy (tough or soft) and stays consistent for the
          same customer. Built as a real website with an API backend.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
          <a
            href="/start"
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
            Start
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

      {/* FEATURES (NOW YOUR CONFIG BOX) */}
      <CarConfigurationSection />

      {/* HOW IT WORKS */}
      <section id="how" style={{ marginTop: 70 }}>
        <h2 style={{ fontSize: 28 }}>How it Works</h2>
        <ol style={{ lineHeight: 1.8, marginTop: 12 }}>
          <li>User enters preferences and starts negotiating.</li>
          <li>The agent evaluates offers using a defined policy.</li>
          <li>Preferences guide strategy and counteroffers.</li>
          <li>Admin can adjust strategy settings.</li>
        </ol>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ marginTop: 70, marginBottom: 80 }}>
        <h2 style={{ fontSize: 28 }}>Contact</h2>
        <p style={{ lineHeight: 1.6 }}>
          This Webpage is created only for Research Purpose and you can contact: <b>klreddy@udel.edu</b>
        </p>
      </section>
    </main>
  );
}