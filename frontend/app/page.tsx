"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FactorKey = "price" | "reliability" | "fuel" | "horsepower" | "safety";

const FACTORS: { key: FactorKey; label: string }[] = [
  { key: "price", label: "Price" },
  { key: "reliability", label: "Reliability" },
  { key: "fuel", label: "Fuel Efficiency" },
  { key: "horsepower", label: "Horsepower" },
  { key: "safety", label: "Safety" },
];

export default function HomePage() {
  const router = useRouter();

  const [weights, setWeights] = useState<Record<FactorKey, number>>({
    price: 20,
    reliability: 20,
    fuel: 20,
    horsepower: 20,
    safety: 20,
  });

  const [strategy, setStrategy] = useState("balanced");
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const updateWeight = (key: FactorKey, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleStart = () => {
    if (total !== 100) {
      alert("Total weight must equal 100%");
      return;
    }

    localStorage.setItem("car_config_weights", JSON.stringify(weights));
    localStorage.setItem("selected_strategy", strategy);

    router.push("/start");
  };

  const unlockAdmin = () => {
    const password = prompt("Enter admin password");
    if (password === "admin123") {
      setAdminUnlocked(true);
    } else {
      alert("Wrong password");
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 36, marginBottom: 10 }}>
        Smart Negotiation Website
      </h1>

      <p style={{ marginBottom: 30 }}>
        Configure your priorities and start AI-powered negotiation.
      </p>

      {/* ADMIN BUTTON */}
      {!adminUnlocked && (
        <button
          onClick={unlockAdmin}
          style={{
            marginBottom: 20,
            padding: "8px 16px",
            background: "#333",
            color: "#fff",
            borderRadius: 6,
          }}
        >
          Admin Access
        </button>
      )}

      {/* STRATEGY (ADMIN ONLY) */}
      {adminUnlocked && (
        <div style={{ marginBottom: 30 }}>
          <h3>Select Strategy</h3>
          {["tough", "soft", "friendly", "analytical", "urgent", "balanced"].map(
            (s) => (
              <button
                key={s}
                onClick={() => setStrategy(s)}
                style={{
                  marginRight: 10,
                  marginTop: 10,
                  padding: "8px 12px",
                  background: strategy === s ? "#2563eb" : "#444",
                  color: "#fff",
                  borderRadius: 6,
                }}
              >
                {s}
              </button>
            )
          )}
        </div>
      )}

      {/* WEIGHTS */}
      <div>
        <h3>Set Your Preferences (Total must be 100%)</h3>

        {FACTORS.map((f) => (
          <div key={f.key} style={{ marginBottom: 20 }}>
            <label>
              {f.label}: {weights[f.key]}%
            </label>

            <input
              type="range"
              min={0}
              max={100}
              value={weights[f.key]}
              onChange={(e) =>
                updateWeight(f.key, Number(e.target.value))
              }
              style={{ width: "100%" }}
            />
          </div>
        ))}

        <h4>Total: {total}%</h4>
      </div>

      {/* START BUTTON */}
      <button
        onClick={handleStart}
        style={{
          marginTop: 30,
          padding: "12px 20px",
          fontSize: 16,
          background: "#2563eb",
          color: "#fff",
          borderRadius: 8,
        }}
      >
        Start Negotiation
      </button>
    </main>
  );
}