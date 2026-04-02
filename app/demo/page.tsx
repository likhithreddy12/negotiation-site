"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_ADMIN_SETTINGS,
  TOPIC_CONFIGS,
  TopicKey,
  StrategyKey,
} from "../../lib/negotiation-config";

type AdminSettings = {
  activeTopic: TopicKey;
  selectedStrategy: StrategyKey;
};

type ChatMessage = {
  role: "user" | "bot";
  content: string;
};

export default function DemoPage() {
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [userConfig, setUserConfig] = useState<{
    topic: TopicKey;
    formValues: Record<string, string>;
    weights: Record<string, number>;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin_settings");
    if (storedAdmin) {
      setAdminSettings(JSON.parse(storedAdmin));
    }

    const storedUserConfig = localStorage.getItem("user_topic_config");
    if (storedUserConfig) {
      setUserConfig(JSON.parse(storedUserConfig));
    }
  }, []);

  const activeTopic = userConfig?.topic || adminSettings.activeTopic;
  const topicConfig = useMemo(() => TOPIC_CONFIGS[activeTopic], [activeTopic]);

  const sortedFactors = useMemo(() => {
    const entries = Object.entries(userConfig?.weights || {});
    return entries.sort((a, b) => b[1] - a[1]);
  }, [userConfig]);

  const topFactors = sortedFactors
    .slice(0, 2)
    .map(([key]) => topicConfig.factors.find((factor) => factor.key === key)?.label || key);

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage = message.trim();

    const botReply = generateBotReply({
      userMessage,
      topic: activeTopic,
      strategy: adminSettings.selectedStrategy,
      topFactors,
      formValues: userConfig?.formValues || {},
    });

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "bot", content: botReply },
    ]);

    setMessage("");
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
      <div style={{ maxWidth: 950, margin: "0 auto" }}>
        <h1 style={{ fontSize: 38, marginBottom: 10 }}>{topicConfig.navTitle}</h1>
        <p style={{ color: "#cbd5e1", marginBottom: 8 }}>
          Strategy: <strong>{adminSettings.selectedStrategy}</strong>
        </p>
        <p style={{ color: "#cbd5e1", marginBottom: 24 }}>
          Top priorities: <strong>{topFactors.join(", ") || "Default priorities"}</strong>
        </p>

        <section style={boxStyle}>
          <h2 style={{ fontSize: 24, marginBottom: 14 }}>Selected Configuration</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            <div style={innerBox}>
              <h3 style={{ marginBottom: 10 }}>Inputs</h3>
              {Object.entries(userConfig?.formValues || {}).length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No details entered yet.</p>
              ) : (
                Object.entries(userConfig?.formValues || {}).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: 8, color: "#cbd5e1" }}>
                    • {key}: {value}
                  </div>
                ))
              )}
            </div>

            <div style={innerBox}>
              <h3 style={{ marginBottom: 10 }}>Weights</h3>
              {topicConfig.factors.map((factor) => (
                <div key={factor.key} style={{ marginBottom: 8, color: "#cbd5e1" }}>
                  • {factor.label}: {userConfig?.weights?.[factor.key] ?? factor.defaultWeight}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={boxStyle}>
          <h2 style={{ fontSize: 24, marginBottom: 14 }}>Negotiation Chat</h2>

          <div
            style={{
              border: "1px solid #333",
              borderRadius: 14,
              minHeight: 280,
              padding: 16,
              background: "#0b0b0b",
              marginBottom: 16,
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>
                Start the conversation. The chatbot will respond using the selected topic,
                strategy, and your weight preferences.
              </p>
            ) : (
              messages.map((item, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 14,
                    textAlign: item.role === "user" ? "right" : "left",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      maxWidth: "80%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: item.role === "user" ? "#1d4ed8" : "#1f2937",
                    }}
                  >
                    {item.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Ask about your ${activeTopic} negotiation...`}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                border: "1px solid #444",
                background: "#000",
                color: "white",
              }}
            />
            <button onClick={handleSend} style={sendButton}>
              Send
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function generateBotReply({
  userMessage,
  topic,
  strategy,
  topFactors,
  formValues,
}: {
  userMessage: string;
  topic: TopicKey;
  strategy: StrategyKey;
  topFactors: string[];
  formValues: Record<string, string>;
}) {
  const factorText = topFactors.length ? topFactors.join(" and ") : "your chosen priorities";
  const userContext = Object.entries(formValues)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  const strategyLine =
    strategy === "tough"
      ? "I would take a firm position and push strongly for a better deal."
      : strategy === "soft"
      ? "I would keep the tone flexible and cooperative while trying to improve the outcome."
      : strategy === "friendly"
      ? "I would build rapport first and then negotiate gradually."
      : strategy === "analytical"
      ? "I would use detailed comparisons, trade-offs, and facts to support the negotiation."
      : strategy === "urgent"
      ? "I would create urgency and try to close the deal quickly."
      : "I would use a balanced approach between firmness and flexibility.";

  const topicLine =
    topic === "car"
      ? "For this car negotiation, I would compare price against reliability, safety, and long-term value."
      : topic === "laptop"
      ? "For this laptop negotiation, I would focus on performance, price, battery life, and portability."
      : topic === "mobile"
      ? "For this mobile negotiation, I would balance price with camera quality, performance, and battery life."
      : topic === "job"
      ? "For this job negotiation, I would weigh salary against benefits, growth, and work-life balance."
      : "For this rent negotiation, I would compare rent price with location, amenities, and lease flexibility.";

  return `You asked: "${userMessage}". ${topicLine} Your highest priorities are ${factorText}. ${strategyLine} Based on your current configuration (${userContext || "no extra details provided"}), I would guide the negotiation around those priorities first.`;
}

const boxStyle = {
  border: "1px solid #333",
  borderRadius: 16,
  padding: 24,
  background: "#111",
  marginBottom: 24,
};

const innerBox = {
  border: "1px solid #333",
  borderRadius: 14,
  padding: 16,
  background: "#0b0b0b",
};

const sendButton = {
  padding: "12px 18px",
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};