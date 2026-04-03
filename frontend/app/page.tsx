"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TopicKey = "car" | "laptop" | "mobile" | "job" | "rent";

type WeightState = {
  factor1: number;
  factor2: number;
  factor3: number;
  factor4: number;
  factor5: number;
};

const TOPIC_CONFIGS: Record<TopicKey, { label: string; factors: string[] }> = {
  car: {
    label: "Car",
    factors: [
      "Price",
      "Fuel Efficiency",
      "Safety",
      "Reliability",
      "Horsepower",
    ],
  },
  laptop: {
    label: "Laptop",
    factors: ["Price", "Performance", "RAM", "Battery Life", "Storage"],
  },
  mobile: {
    label: "Mobile",
    factors: ["Price", "Battery", "Camera", "Performance", "Storage"],
  },
  job: {
    label: "Job",
    factors: [
      "Salary",
      "Work-Life Balance",
      "Location",
      "Growth Opportunities",
      "Benefits",
    ],
  },
  rent: {
    label: "Rent",
    factors: ["Price", "Location", "Safety", "Space", "Amenities"],
  },
};

const DEFAULT_WEIGHTS: WeightState = {
  factor1: 20,
  factor2: 20,
  factor3: 20,
  factor4: 20,
  factor5: 20,
};

function normalizeWeights(
  changedKey: keyof WeightState,
  changedValue: number,
  current: WeightState
): WeightState {
  const next: WeightState = { ...current, [changedKey]: changedValue };

  const otherKeys = (Object.keys(current) as (keyof WeightState)[]).filter(
    (key) => key !== changedKey
  );

  const otherTotal = otherKeys.reduce((sum, key) => sum + current[key], 0);
  const remaining = 100 - changedValue;

  if (remaining <= 0) {
    const reset: WeightState = {
      factor1: 0,
      factor2: 0,
      factor3: 0,
      factor4: 0,
      factor5: 0,
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

  const total = Object.values(next).reduce((sum, value) => sum + value, 0);
  const diff = 100 - total;

  if (diff !== 0) {
    const lastKey = otherKeys[otherKeys.length - 1];
    next[lastKey] += diff;
  }

  return next;
}

export default function HomePage() {
  const [selectedTopic, setSelectedTopic] = useState<TopicKey>("car");
  const [weights, setWeights] = useState<WeightState>(DEFAULT_WEIGHTS);

  useEffect(() => {
    const savedTopic = localStorage.getItem("selected_topic");
    const savedWeights = localStorage.getItem("topic_weights");

    if (
      savedTopic &&
      ["car", "laptop", "mobile", "job", "rent"].includes(savedTopic)
    ) {
      setSelectedTopic(savedTopic as TopicKey);
    }

    if (savedWeights) {
      try {
        setWeights(JSON.parse(savedWeights) as WeightState);
      } catch {
        setWeights(DEFAULT_WEIGHTS);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("topic_weights", JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    const syncFromAdmin = () => {
      const savedTopic = localStorage.getItem("selected_topic");
      if (
        savedTopic &&
        ["car", "laptop", "mobile", "job", "rent"].includes(savedTopic)
      ) {
        setSelectedTopic(savedTopic as TopicKey);
      }
    };

    window.addEventListener("focus", syncFromAdmin);
    return () => window.removeEventListener("focus", syncFromAdmin);
  }, []);

  const topicData = TOPIC_CONFIGS[selectedTopic];

  const total = useMemo(() => {
    return Object.values(weights).reduce((sum, value) => sum + value, 0);
  }, [weights]);

  function handleSliderChange(key: keyof WeightState, value: number) {
    const updated = normalizeWeights(key, value, weights);
    setWeights(updated);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000000",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#000000",
          borderBottom: "1px solid #333333",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "18px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 700 }}>
            AI Negotiation Agent
          </div>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <a
              href="#how-it-works"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              How It Works
            </a>

            <a
              href="#configuration"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Configuration
            </a>

            <a
              href="#contact"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Contact
            </a>

            <Link
              href="/admin"
              style={{
                background: "#2563eb",
                color: "#ffffff",
                textDecoration: "none",
                padding: "10px 16px",
                borderRadius: 10,
                fontWeight: 700,
                border: "1px solid #2563eb",
              }}
            >
              Admin Access
            </Link>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 60px" }}>
        <section
          id="how-it-works"
          style={{
            background: "#111111",
            border: "1px solid #333333",
            borderRadius: 16,
            padding: 28,
            marginBottom: 28,
          }}
        >
          <h1 style={{ fontSize: 40, marginTop: 0, marginBottom: 12 }}>
            Smart Negotiation Website
          </h1>

          <p style={{ color: "#d1d5db", fontSize: 18, lineHeight: 1.7 }}>
            This platform helps users configure their priorities, choose a
            chatbot avatar, and begin a negotiation experience where the chatbot
            responds based on topic, hidden strategy, and full user weightage.
          </p>

          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 18,
            }}
          >
            {[
              "Adjust your priority weightage in the configuration section.",
              "Enter your details on the start page.",
              "Choose a male or female chatbot avatar.",
              "Start the negotiation chat and receive responses based on all selected weights.",
            ].map((text, index) => (
              <div
                key={index}
                style={{
                  background: "#000000",
                  border: "1px solid #333333",
                  borderRadius: 14,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
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

                <p style={{ margin: 0, lineHeight: 1.6, color: "#f3f4f6" }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="configuration"
          style={{
            background: "#111111",
            border: "1px solid #333333",
            borderRadius: 16,
            padding: 28,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 30 }}>Configuration</h2>
              <p style={{ margin: "8px 0 0", color: "#d1d5db" }}>
                Current topic: <strong>{topicData.label}</strong>
              </p>
            </div>

            <div
              style={{
                padding: "10px 14px",
                background: total === 100 ? "#052e16" : "#7f1d1d",
                borderRadius: 10,
                border: "1px solid #333333",
                fontWeight: 700,
              }}
            >
              Total: {total}%
            </div>
          </div>

          <div style={{ display: "grid", gap: 22 }}>
            {topicData.factors.map((factor, index) => {
              const key = `factor${index + 1}` as keyof WeightState;

              return (
                <div key={factor}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 17 }}>{factor}</span>
                    <strong>{weights[key]}%</strong>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={weights[key]}
                    onChange={(e) =>
                      handleSliderChange(key, Number(e.target.value))
                    }
                    style={{
                      width: "100%",
                      height: 10,
                      accentColor: "#2563eb",
                      cursor: "pointer",
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 24 }}>
            <Link
              href="/start"
              style={{
                display: "inline-block",
                background: "#2563eb",
                color: "#ffffff",
                textDecoration: "none",
                padding: "12px 22px",
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              Continue
            </Link>
          </div>
        </section>

        <section
          id="contact"
          style={{
            background: "#111111",
            border: "1px solid #333333",
            borderRadius: 16,
            padding: 28,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 30 }}>Contact</h2>
          <p style={{ color: "#f3f4f6", lineHeight: 1.7, marginBottom: 0 }}>
            This website is developed for academic and research purposes only.
          </p>
        </section>
      </div>
    </main>
  );
}