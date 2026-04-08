"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_ADMIN_SETTINGS,
  TOPIC_CONFIGS,
  type StrategyKey,
  type TopicKey,
} from "../lib/negotiation-config";
import type { WeightState } from "../lib/negotiation-chat-engine";

const STRATEGY_DETAILS: Record<StrategyKey, { label: string; helper: string }> = {
  tough: {
    label: "Tough",
    helper: "Firm, assertive, and hard-bargaining style.",
  },
  soft: {
    label: "Soft",
    helper: "Calm, flexible, and cooperative negotiation style.",
  },
  friendly: {
    label: "Friendly",
    helper: "Warm, approachable, and relationship-focused.",
  },
  analytical: {
    label: "Analytical",
    helper: "Logic-based, data-driven, and comparison-heavy.",
  },
  urgent: {
    label: "Urgent",
    helper: "Fast-paced, deadline-focused, and action-oriented.",
  },
  balanced: {
    label: "Balanced",
    helper: "Mix of firmness, flexibility, and practical trade-offs.",
  },
};

const DEFAULT_WEIGHTS: WeightState = {
  factor1: 20,
  factor2: 20,
  factor3: 20,
  factor4: 20,
  factor5: 20,
};

type NegotiationState = {
  selectedTopic: TopicKey;
  selectedStrategy: StrategyKey;
  weights: WeightState;
};

const DEFAULT_NEGOTIATION_STATE: NegotiationState = {
  selectedTopic: DEFAULT_ADMIN_SETTINGS.activeTopic,
  selectedStrategy: DEFAULT_ADMIN_SETTINGS.selectedStrategy,
  weights: DEFAULT_WEIGHTS,
};

function normalizeTo100(raw: WeightState): WeightState {
  const keys = Object.keys(raw) as (keyof WeightState)[];
  const sum = keys.reduce((acc, key) => acc + raw[key], 0);

  if (sum <= 0) {
    return DEFAULT_WEIGHTS;
  }

  const exact = keys.reduce((acc, key) => {
    acc[key] = (raw[key] / sum) * 100;
    return acc;
  }, {} as WeightState);

  const rounded = keys.reduce((acc, key) => {
    acc[key] = Math.round(exact[key]);
    return acc;
  }, {} as WeightState);

  const roundedSum = keys.reduce((acc, key) => acc + rounded[key], 0);
  const diff = 100 - roundedSum;

  if (diff !== 0) {
    const largestKey = keys.reduce((best, key) =>
      exact[key] > exact[best] ? key : best
    );
    rounded[largestKey] = Math.max(0, rounded[largestKey] + diff);
  }

  return rounded;
}

function getSliderBackground(value: number) {
  return `linear-gradient(to right, #2563eb 0%, #2563eb ${value}%, #d1d5db ${value}%, #d1d5db 100%)`;
}

function getTopicLabel(topic: TopicKey) {
  return TOPIC_CONFIGS[topic].navTitle
    .replace(/^AI\s+/i, "")
    .replace(/\s+Assistant$/i, "");
}

function isValidTopic(value: unknown): value is TopicKey {
  return typeof value === "string" && value in TOPIC_CONFIGS;
}

function isValidStrategy(value: unknown): value is StrategyKey {
  return (
    typeof value === "string" &&
    ["tough", "soft", "friendly", "analytical", "urgent", "balanced"].includes(value)
  );
}

function buildNegotiationState(): NegotiationState {
  if (typeof window === "undefined") {
    return DEFAULT_NEGOTIATION_STATE;
  }

  let selectedTopic: TopicKey = DEFAULT_ADMIN_SETTINGS.activeTopic;
  let selectedStrategy: StrategyKey = DEFAULT_ADMIN_SETTINGS.selectedStrategy;
  let weights: WeightState = DEFAULT_WEIGHTS;

  const storedAdminSettings = window.localStorage.getItem("admin_settings");
  const storedTopic = window.localStorage.getItem("selected_topic");
  const storedStrategy = window.localStorage.getItem("selected_strategy");
  const storedWeights = window.localStorage.getItem("topic_weights");

  if (storedAdminSettings) {
    try {
      const parsed = JSON.parse(storedAdminSettings) as {
        activeTopic?: unknown;
        selectedStrategy?: unknown;
      };

      if (isValidTopic(parsed.activeTopic)) {
        selectedTopic = parsed.activeTopic;
      }

      if (isValidStrategy(parsed.selectedStrategy)) {
        selectedStrategy = parsed.selectedStrategy;
      }
    } catch {
      // ignore invalid localStorage data
    }
  }

  if (isValidTopic(storedTopic)) {
    selectedTopic = storedTopic;
  }

  if (isValidStrategy(storedStrategy)) {
    selectedStrategy = storedStrategy;
  }

  if (storedWeights) {
    try {
      const parsed = JSON.parse(storedWeights) as Partial<WeightState>;

      if (
        typeof parsed.factor1 === "number" &&
        typeof parsed.factor2 === "number" &&
        typeof parsed.factor3 === "number" &&
        typeof parsed.factor4 === "number" &&
        typeof parsed.factor5 === "number"
      ) {
        weights = normalizeTo100(parsed as WeightState);
      }
    } catch {
      // ignore invalid localStorage data
    }
  }

  return { selectedTopic, selectedStrategy, weights };
}

function writeNegotiationState(nextState: NegotiationState) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeTo100(nextState.weights);

  window.localStorage.setItem("selected_topic", nextState.selectedTopic);
  window.localStorage.setItem("selected_strategy", nextState.selectedStrategy);
  window.localStorage.setItem("topic_weights", JSON.stringify(normalized));
  window.localStorage.setItem(
    "admin_settings",
    JSON.stringify({
      activeTopic: nextState.selectedTopic,
      selectedStrategy: nextState.selectedStrategy,
    })
  );

  window.dispatchEvent(new Event("negotiation-state-change"));
}

function ProfessorStrategyPanel({
  selectedTopic,
  selectedStrategy,
}: {
  selectedTopic: TopicKey;
  selectedStrategy: StrategyKey;
}) {
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
              Topic and strategy are managed from the separate admin page.
            </div>
          </div>

          <Link
            href="/admin-login"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 10,
              background: "#2563eb",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Admin Access
          </Link>
        </div>

        <div style={{ marginTop: 14, fontSize: 14, color: "#93c5fd", fontWeight: 700 }}>
          Current Topic: {getTopicLabel(selectedTopic)} | Current Strategy:{" "}
          {STRATEGY_DETAILS[selectedStrategy].label}
        </div>
      </div>
    </section>
  );
}

function ConfigurationSection({
  selectedTopic,
  selectedStrategy,
  weights,
  onWeightsChange,
}: {
  selectedTopic: TopicKey;
  selectedStrategy: StrategyKey;
  weights: WeightState;
  onWeightsChange: (weights: WeightState) => void;
}) {
  const router = useRouter();
  const factors = TOPIC_CONFIGS[selectedTopic].factors.slice(0, 5);
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);

  function handleChange(key: keyof WeightState, next: number) {
    onWeightsChange(normalizeTo100({ ...weights, [key]: next }));
  }

  function handleStart() {
    writeNegotiationState({
      selectedTopic,
      selectedStrategy,
      weights,
    });
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
        Configure what matters most to you for the selected topic. Weights automatically rebalance
        to total 100%.
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
              {getTopicLabel(selectedTopic)} Configuration
            </div>

            <div style={{ fontSize: 13, color: "#374151", marginTop: 6 }}>
              {TOPIC_CONFIGS[selectedTopic].heroSubtitle}
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
          {factors.map((factor, index) => {
            const weightKey = `factor${index + 1}` as keyof WeightState;

            return (
              <div
                key={factor.key}
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
                    <div style={{ fontWeight: 900, fontSize: 15, color: "#000000" }}>
                      {factor.label}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "#4b5563",
                        marginTop: 4,
                        lineHeight: 1.4,
                      }}
                    >
                      Priority weight for this factor during negotiation.
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
                    {weights[weightKey]}%
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <input
                    aria-label={factor.label}
                    type="range"
                    min={0}
                    max={100}
                    value={weights[weightKey]}
                    onChange={(e) => handleChange(weightKey, Number(e.target.value))}
                    style={{
                      width: "100%",
                      height: 10,
                      borderRadius: 999,
                      outline: "none",
                      appearance: "none",
                      WebkitAppearance: "none",
                      background: getSliderBackground(weights[weightKey]),
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
            );
          })}
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
            These preferences and the professor-selected strategy will be used by the negotiation
            chatbot throughout the conversation.
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
  const [negotiationState, setNegotiationState] = useState<NegotiationState>(
    DEFAULT_NEGOTIATION_STATE
  );

  useEffect(() => {
    const syncState = () => {
      setNegotiationState(buildNegotiationState());
    };

    syncState();

    window.addEventListener("storage", syncState);
    window.addEventListener("negotiation-state-change", syncState);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("negotiation-state-change", syncState);
    };
  }, []);

  const { selectedTopic, selectedStrategy, weights } = negotiationState;

  const topicConfig = useMemo(() => TOPIC_CONFIGS[selectedTopic], [selectedTopic]);

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

      <ProfessorStrategyPanel
        selectedTopic={selectedTopic}
        selectedStrategy={selectedStrategy}
      />

      <section style={{ marginTop: 60 }}>
        <h1
          style={{
            fontSize: 44,
            marginBottom: 10,
            color: "#ffffff",
            lineHeight: 1.15,
          }}
        >
          {topicConfig.heroTitle}
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            maxWidth: 760,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          {topicConfig.heroSubtitle} The chatbot remembers the professor-selected strategy and your
          full weightage for every reply.
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

      <ConfigurationSection
        selectedTopic={selectedTopic}
        selectedStrategy={selectedStrategy}
        weights={weights}
        onWeightsChange={(nextWeights) => {
          const nextState = {
            selectedTopic,
            selectedStrategy,
            weights: nextWeights,
          };

          setNegotiationState(nextState);
          writeNegotiationState(nextState);
        }}
      />

      <section id="how" style={{ marginTop: 70 }}>
        <h2 style={{ fontSize: 28, color: "#ffffff" }}>How it Works</h2>
        <ol style={{ lineHeight: 1.8, marginTop: 12, color: "rgba(255,255,255,0.82)" }}>
          <li>User configures all factor weights and starts negotiation.</li>
          <li>Professor can select the active topic and negotiation strategy from the separate admin page.</li>
          <li>The chatbot uses the selected strategy plus the full weighted profile.</li>
          <li>Chat replies stay anchored on the highest-priority factors during the conversation.</li>
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