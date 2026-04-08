"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_ADMIN_SETTINGS,
  TOPIC_CONFIGS,
  STRATEGIES,
  type StrategyKey,
  type TopicKey,
} from "@/lib/negotiation-config";

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

function isValidTopic(value: unknown): value is TopicKey {
  return typeof value === "string" && value in TOPIC_CONFIGS;
}

function isValidStrategy(value: unknown): value is StrategyKey {
  return typeof value === "string" && STRATEGIES.includes(value as StrategyKey);
}

export default function AdminPage() {
  const router = useRouter();

  const [isReady, setIsReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [topic, setTopic] = useState<TopicKey>(DEFAULT_ADMIN_SETTINGS.activeTopic);
  const [strategy, setStrategy] = useState<StrategyKey>(DEFAULT_ADMIN_SETTINGS.selectedStrategy);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const adminAuthorized = window.localStorage.getItem("admin_auth") === "true";

    if (!adminAuthorized) {
      router.replace("/admin-login");
      return;
    }

    let nextTopic: TopicKey = DEFAULT_ADMIN_SETTINGS.activeTopic;
    let nextStrategy: StrategyKey = DEFAULT_ADMIN_SETTINGS.selectedStrategy;

    const storedAdminSettings = window.localStorage.getItem("admin_settings");
    const storedTopic = window.localStorage.getItem("selected_topic");
    const storedStrategy = window.localStorage.getItem("selected_strategy");

    if (storedAdminSettings) {
      try {
        const parsed = JSON.parse(storedAdminSettings) as {
          activeTopic?: unknown;
          selectedStrategy?: unknown;
        };

        if (isValidTopic(parsed.activeTopic)) {
          nextTopic = parsed.activeTopic;
        }

        if (isValidStrategy(parsed.selectedStrategy)) {
          nextStrategy = parsed.selectedStrategy;
        }
      } catch {
        // ignore invalid localStorage
      }
    }

    if (isValidTopic(storedTopic)) {
      nextTopic = storedTopic;
    }

    if (isValidStrategy(storedStrategy)) {
      nextStrategy = storedStrategy;
    }

    setAuthorized(true);
    setTopic(nextTopic);
    setStrategy(nextStrategy);
    setIsReady(true);
  }, [router]);

  function handleSaveChanges() {
    const nextAdminSettings = {
      activeTopic: topic,
      selectedStrategy: strategy,
    };

    localStorage.setItem("selected_topic", topic);
    localStorage.setItem("selected_strategy", strategy);
    localStorage.setItem("admin_settings", JSON.stringify(nextAdminSettings));

    window.dispatchEvent(new Event("negotiation-state-change"));

    setSavedMessage("Changes saved. Admin access is now locked.");

    setTimeout(() => {
      localStorage.removeItem("admin_auth");
      setAuthorized(false);
      router.push("/");
    }, 1000);
  }

  function handleLogoutNow() {
    localStorage.removeItem("admin_auth");
    setAuthorized(false);
    router.push("/");
  }

  if (!isReady || !authorized) return null;

  const topicEntries = Object.entries(TOPIC_CONFIGS) as [
    TopicKey,
    (typeof TOPIC_CONFIGS)[TopicKey]
  ][];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000000",
        color: "#ffffff",
        padding: "40px 16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>
              Admin Dashboard
            </h1>
            <p
              style={{
                marginTop: 8,
                marginBottom: 0,
                color: "rgba(255,255,255,0.76)",
                lineHeight: 1.6,
              }}
            >
              Select the active topic and negotiation strategy for the chatbot.
            </p>
          </div>

          <button
            onClick={handleLogoutNow}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Lock Admin Access
          </button>
        </div>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 20,
            background: "#0d0d0f",
            padding: 24,
            boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
          }}
        >
          <section>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 0, marginBottom: 14 }}>
              Select Topic
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {topicEntries.map(([key, config]) => {
                const active = topic === key;

                return (
                  <button
                    key={key}
                    onClick={() => setTopic(key)}
                    style={{
                      textAlign: "left",
                      padding: 16,
                      borderRadius: 14,
                      border: active ? "2px solid #2563eb" : "1px solid #2a2a2f",
                      background: active ? "rgba(37,99,235,0.18)" : "#111111",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
                      {config.navTitle.replace(/^AI\s+/i, "").replace(/\s+Assistant$/i, "")}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: "rgba(255,255,255,0.74)",
                      }}
                    >
                      {config.heroSubtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 14 }}>
              Select Strategy
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {STRATEGIES.map((item) => {
                const active = strategy === item;

                return (
                  <button
                    key={item}
                    onClick={() => setStrategy(item)}
                    style={{
                      textAlign: "left",
                      padding: 16,
                      borderRadius: 14,
                      border: active ? "2px solid #2563eb" : "1px solid #2a2a2f",
                      background: active ? "rgba(37,99,235,0.18)" : "#111111",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
                      {STRATEGY_DETAILS[item].label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: "rgba(255,255,255,0.74)",
                      }}
                    >
                      {STRATEGY_DETAILS[item].helper}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section
            style={{
              marginTop: 28,
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 16,
              background: "rgba(255,255,255,0.03)",
              padding: 18,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
              Current Selection
            </div>

            <div style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.86)" }}>
              <div>
                <b>Topic:</b>{" "}
                {TOPIC_CONFIGS[topic].navTitle.replace(/^AI\s+/i, "").replace(/\s+Assistant$/i, "")}
              </div>
              <div>
                <b>Strategy:</b> {STRATEGY_DETAILS[strategy].label}
              </div>
            </div>
          </section>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              marginTop: 26,
            }}
          >
            <div
              style={{
                color: savedMessage ? "#93c5fd" : "rgba(255,255,255,0.70)",
                fontSize: 14,
              }}
            >
              {savedMessage || "Save changes to apply the selected topic and strategy."}
            </div>

            <button
              onClick={handleSaveChanges}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(37,99,235,0.28)",
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}