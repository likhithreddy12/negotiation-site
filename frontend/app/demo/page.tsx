"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_ADMIN_SETTINGS,
  TOPIC_CONFIGS,
  type StrategyKey,
  type TopicKey,
} from "@/lib/negotiation-config";
import type { WeightState } from "@/lib/negotiation-chat-engine";

type NegotiationState = {
  selectedTopic: TopicKey;
  selectedStrategy: StrategyKey;
  weights: WeightState;
};

type ChatMessage = {
  role: "bot" | "user";
  text: string;
};

type IntakeState = {
  fullName: string;
  email: string;
  avatar?: "male" | "female";
};

const DEFAULT_WEIGHTS: WeightState = {
  factor1: 20,
  factor2: 20,
  factor3: 20,
  factor4: 20,
  factor5: 20,
};

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

function normalizeTo100(raw: WeightState) {
  const keys = Object.keys(raw) as (keyof WeightState)[];
  const sum = keys.reduce((acc, key) => acc + raw[key], 0);

  if (sum <= 0) return DEFAULT_WEIGHTS;

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

function isValidTopic(value: unknown): value is TopicKey {
  return typeof value === "string" && value in TOPIC_CONFIGS;
}

function isValidStrategy(value: unknown): value is StrategyKey {
  return (
    typeof value === "string" &&
    ["tough", "soft", "friendly", "analytical", "urgent", "balanced"].includes(value)
  );
}

function getTopicLabel(topic: TopicKey) {
  return TOPIC_CONFIGS[topic].navTitle
    .replace(/^AI\s+/i, "")
    .replace(/\s+Assistant$/i, "");
}

function getWeightEntries(selectedTopic: TopicKey, weights: WeightState) {
  const factors = TOPIC_CONFIGS[selectedTopic].factors.slice(0, 5);

  return factors
    .map((factor, index) => {
      const weightKey = `factor${index + 1}` as keyof WeightState;
      return {
        key: factor.key,
        label: factor.label,
        value: weights[weightKey],
      };
    })
    .sort((a, b) => b.value - a.value);
}

function getAvatarImage(avatar?: "male" | "female") {
  return avatar === "female" ? "/agents/female.png" : "/agents/male.png";
}

function getAvatarLabel(avatar?: "male" | "female") {
  return avatar === "female" ? "Female Chat Agent" : "Male Chat Agent";
}

function getBackendTopic(topic: TopicKey) {
  switch (topic) {
    case "car":
      return "car negotiation";
    case "laptop":
      return "laptop negotiation";
    case "mobile":
      return "phone negotiation";
    case "rent":
      return "rent negotiation";
    default:
      return "general negotiation";
  }
}

function mapWeightsForBackend(topic: TopicKey, weights: WeightState) {
  const factors = TOPIC_CONFIGS[topic].factors.slice(0, 5);
  const mapped: Record<string, number> = {};

  factors.forEach((factor, index) => {
    const weightKey = `factor${index + 1}` as keyof WeightState;
    mapped[factor.key] = weights[weightKey];
  });

  return mapped;
}

export default function DemoPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<IntakeState | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TopicKey>(DEFAULT_ADMIN_SETTINGS.activeTopic);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyKey>(
    DEFAULT_ADMIN_SETTINGS.selectedStrategy
  );
  const [weights, setWeights] = useState<WeightState>(DEFAULT_WEIGHTS);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    try {
      const storedIntake = localStorage.getItem("negotiation_intake");
      const storedAdminSettings = localStorage.getItem("admin_settings");
      const storedTopic = localStorage.getItem("selected_topic");
      const storedStrategy = localStorage.getItem("selected_strategy");
      const storedWeights = localStorage.getItem("topic_weights");

      if (!storedIntake) {
        router.replace("/start");
        return;
      }

      const parsedIntake = JSON.parse(storedIntake) as IntakeState;
      setUser(parsedIntake);

      let nextTopic: TopicKey = DEFAULT_ADMIN_SETTINGS.activeTopic;
      let nextStrategy: StrategyKey = DEFAULT_ADMIN_SETTINGS.selectedStrategy;
      let nextWeights: WeightState = DEFAULT_WEIGHTS;

      if (storedAdminSettings) {
        try {
          const parsed = JSON.parse(storedAdminSettings) as {
            activeTopic?: unknown;
            selectedStrategy?: unknown;
          };

          if (isValidTopic(parsed.activeTopic)) nextTopic = parsed.activeTopic;
          if (isValidStrategy(parsed.selectedStrategy)) nextStrategy = parsed.selectedStrategy;
        } catch {}
      }

      if (isValidTopic(storedTopic)) nextTopic = storedTopic;
      if (isValidStrategy(storedStrategy)) nextStrategy = storedStrategy;

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
            nextWeights = normalizeTo100(parsed as WeightState);
          }
        } catch {}
      }

      setSelectedTopic(nextTopic);
      setSelectedStrategy(nextStrategy);
      setWeights(nextWeights);

      setMessages([
        {
          role: "bot",
          text: `Welcome ${parsedIntake.fullName || ""}. I am your ${getTopicLabel(
            nextTopic
          )} negotiation assistant. How can I help you today?`,
        },
      ]);

      setIsLoaded(true);
    } catch {
      router.replace("/start");
    }
  }, [router]);

  useEffect(() => {
    const handleStateChange = () => {
      try {
        const storedAdminSettings = localStorage.getItem("admin_settings");
        const storedTopic = localStorage.getItem("selected_topic");
        const storedStrategy = localStorage.getItem("selected_strategy");
        const storedWeights = localStorage.getItem("topic_weights");

        let nextTopic: TopicKey = DEFAULT_ADMIN_SETTINGS.activeTopic;
        let nextStrategy: StrategyKey = DEFAULT_ADMIN_SETTINGS.selectedStrategy;
        let nextWeights: WeightState = DEFAULT_WEIGHTS;

        if (storedAdminSettings) {
          try {
            const parsed = JSON.parse(storedAdminSettings) as {
              activeTopic?: unknown;
              selectedStrategy?: unknown;
            };

            if (isValidTopic(parsed.activeTopic)) nextTopic = parsed.activeTopic;
            if (isValidStrategy(parsed.selectedStrategy)) nextStrategy = parsed.selectedStrategy;
          } catch {}
        }

        if (isValidTopic(storedTopic)) nextTopic = storedTopic;
        if (isValidStrategy(storedStrategy)) nextStrategy = storedStrategy;

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
              nextWeights = normalizeTo100(parsed as WeightState);
            }
          } catch {}
        }

        setSelectedTopic(nextTopic);
        setSelectedStrategy(nextStrategy);
        setWeights(nextWeights);
      } catch {}
    };

    window.addEventListener("storage", handleStateChange);
    window.addEventListener("negotiation-state-change", handleStateChange);

    return () => {
      window.removeEventListener("storage", handleStateChange);
      window.removeEventListener("negotiation-state-change", handleStateChange);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const topicConfig = useMemo(() => TOPIC_CONFIGS[selectedTopic], [selectedTopic]);
  const weightEntries = useMemo(
    () => getWeightEntries(selectedTopic, weights),
    [selectedTopic, weights]
  );

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: trimmed,
    };

    const historyForBackend = [...messages, userMessage].map((msg) => ({
      role: msg.role === "bot" ? "assistant" : "user",
      content: msg.text,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: getBackendTopic(selectedTopic),
          strategy: selectedStrategy,
          weights: mapWeightsForBackend(selectedTopic, weights),
          message: trimmed,
          history: historyForBackend,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      const botMessage: ChatMessage = {
        role: "bot",
        text: data.reply || "No response received from backend.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        role: "bot",
        text: "Error connecting to FastAPI backend. Make sure backend is running on http://127.0.0.1:8000",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  }

  if (!isLoaded) return null;

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 20px 48px 20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#000000",
        color: "#ffffff",
        minHeight: "100vh",
      }}
    >
      <section style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 38, marginBottom: 10, lineHeight: 1.15 }}>
          {topicConfig.heroTitle} Chat
        </h1>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            maxWidth: 850,
            color: "rgba(255,255,255,0.82)",
            marginBottom: 0,
          }}
        >
          This chatbot uses the admin-selected topic and your full weightage profile saved from the
          user configuration page.
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <aside
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 18,
            padding: 18,
            background: "rgba(255,255,255,0.06)",
            position: "sticky",
            top: 20,
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>
              User Details
            </div>

            <div
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 14,
                padding: 12,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <b>Name:</b> {user?.fullName || "Not provided"}
              </div>
              <div style={{ marginBottom: 12 }}>
                <b>Email:</b> {user?.email || "Not provided"}
              </div>
              <div>
                <b>Agent:</b> {getAvatarLabel(user?.avatar)}
              </div>

              <div
                style={{
                  marginTop: 12,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <img
                  src={getAvatarImage(user?.avatar)}
                  alt={getAvatarLabel(user?.avatar)}
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "#111827",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
            Current Setup
          </div>

          <div
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.86)",
              marginBottom: 16,
            }}
          >
            <div>
              <b>Topic:</b> {getTopicLabel(selectedTopic)}
            </div>
            <div>
              <b>Strategy:</b> {STRATEGY_DETAILS[selectedStrategy].label}
            </div>
          </div>

          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
            Topic Weightage
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {weightEntries.map((item) => (
              <div key={item.key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 6,
                    fontSize: 13,
                    color: "#ffffff",
                  }}
                >
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: 10,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.14)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${item.value}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 20,
            background: "#0f0f0f",
            minHeight: "78vh",
            height: "78vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
          }}
        >
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900 }}>Negotiation Chatbot</div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.72)",
                marginTop: 4,
              }}
            >
              Fixed chat box with scrollable messages
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                style={{
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "78%",
                  padding: "12px 14px",
                  borderRadius: 16,
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                  background:
                    message.role === "user"
                      ? "#2563eb"
                      : "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  border:
                    message.role === "user"
                      ? "none"
                      : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {message.text}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.10)",
              padding: 16,
              background: "#111111",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder="Type your message here..."
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "#000000",
                  color: "#ffffff",
                  padding: "0 14px",
                  outline: "none",
                  fontSize: 14,
                }}
              />

              <button
                onClick={handleSend}
                disabled={isSending}
                style={{
                  height: 48,
                  padding: "0 18px",
                  borderRadius: 12,
                  background: isSending ? "#1d4ed8" : "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 800,
                  cursor: isSending ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  opacity: isSending ? 0.7 : 1,
                }}
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}