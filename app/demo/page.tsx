"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TOPIC_CONFIGS, type StrategyKey, type TopicKey } from "@/lib/negotiation-config";
import type { ChatMessage, WeightState } from "@/lib/negotiation-chat-engine";

type Intake = {
  fullName: string;
  email: string;
  avatar?: string;
};

export default function DemoPage() {
  const router = useRouter();

  const [intake, setIntake] = useState<Intake | null>(null);
  const [topic, setTopic] = useState<TopicKey>("car");
  const [strategy, setStrategy] = useState<StrategyKey>("balanced");
  const [weights, setWeights] = useState<WeightState | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const storedIntake = localStorage.getItem("negotiation_intake");
    const storedTopic = localStorage.getItem("selected_topic");
    const storedStrategy = localStorage.getItem("selected_strategy");
    const storedWeights = localStorage.getItem("topic_weights");

    if (!storedIntake) {
      router.replace("/start");
      return;
    }

    setIntake(JSON.parse(storedIntake));

    if (
      storedTopic &&
      ["car", "laptop", "mobile", "job", "rent"].includes(storedTopic)
    ) {
      setTopic(storedTopic as TopicKey);
    }

    if (
      storedStrategy &&
      ["balanced", "tough", "soft", "friendly", "analytical", "urgent"].includes(
        storedStrategy
      )
    ) {
      setStrategy(storedStrategy as StrategyKey);
    }

    if (storedWeights) {
      try {
        setWeights(JSON.parse(storedWeights));
      } catch {
        setWeights({
          factor1: 20,
          factor2: 20,
          factor3: 20,
          factor4: 20,
          factor5: 20,
        });
      }
    } else {
      setWeights({
        factor1: 20,
        factor2: 20,
        factor3: 20,
        factor4: 20,
        factor5: 20,
      });
    }
  }, [router]);

  const displayWeights = useMemo(() => {
    if (!weights) return [];

    const factors = TOPIC_CONFIGS[topic].factors;

    return [
      { label: factors[0].label, value: weights.factor1 },
      { label: factors[1].label, value: weights.factor2 },
      { label: factors[2].label, value: weights.factor3 },
      { label: factors[3].label, value: weights.factor4 },
      { label: factors[4].label, value: weights.factor5 },
    ];
  }, [topic, weights]);

  async function sendMessage() {
    if (!message.trim() || !weights || isSending) return;

    const userText = message.trim();
    const priorMessages = [...messages];

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: userText,
          topic,
          strategy,
          weights,
          intake,
          messages: priorMessages,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Unable to get chatbot response.");
      }

      setMessages((prev) => [...prev, { role: "assistant", text: data.reply as string }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I could not process that message right now. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  if (!intake || !weights) return null;

  const avatarSrc =
    intake.avatar === "female" ? "/agents/female.png" : "/agents/male.png";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000000",
        color: "#ffffff",
        padding: 20,
        fontFamily:
          "Arial, sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "40px auto" }}>
        <h1 style={{ fontSize: 36, marginBottom: 20 }}>Negotiation Chat</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          <aside
            style={{
              background: "#111111",
              border: "1px solid #333333",
              borderRadius: 14,
              padding: 20,
              width: "100%",
            }}
          >
            <img
              src={avatarSrc}
              alt="Selected avatar"
              style={{
                width: "100%",
                maxWidth: 240,
                height: 240,
                objectFit: "cover",
                borderRadius: 12,
                marginBottom: 16,
                display: "block",
              }}
            />

            <h3 style={{ marginTop: 0 }}>User Info</h3>
            <p>
              <strong>Name:</strong> {intake.fullName}
            </p>
            <p>
              <strong>Email:</strong> {intake.email}
            </p>
            <p>
              <strong>Topic:</strong> {TOPIC_CONFIGS[topic].label}
            </p>

            <h3 style={{ marginTop: 20 }}>Weightage</h3>
            {displayWeights.map((item) => (
              <p key={item.label} style={{ margin: "8px 0" }}>
                {item.label}: {item.value}%
              </p>
            ))}
          </aside>

          <section
            style={{
              background: "#111111",
              border: "1px solid #333333",
              borderRadius: 14,
              padding: 20,
              minHeight: 520,
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "grid",
                gap: 12,
                minHeight: 320,
              }}
            >
              {messages.length === 0 ? (
                <div style={{ color: "#bfbfbf", lineHeight: 1.7 }}>
                  Start the negotiation conversation here. The chatbot will use
                  the full topic weightage in every reply.
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      alignSelf:
                        msg.role === "user" ? "flex-end" : "flex-start",
                      background: msg.role === "user" ? "#2563eb" : "#222222",
                      padding: "12px 14px",
                      borderRadius: 12,
                      maxWidth: "78%",
                      lineHeight: 1.6,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </div>
                ))
              )}

              {isSending && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    background: "#222222",
                    padding: "12px 14px",
                    borderRadius: 12,
                    maxWidth: "78%",
                    lineHeight: 1.6,
                    wordBreak: "break-word",
                  }}
                >
                  Thinking...
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
                flexWrap: "wrap",
              }}
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void sendMessage();
                  }
                }}
                placeholder="Type your negotiation message..."
                style={{
                  flex: 1,
                  minWidth: 220,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #444444",
                  background: "#000000",
                  color: "#ffffff",
                  outline: "none",
                }}
              />
              <button
                onClick={() => {
                  void sendMessage();
                }}
                disabled={isSending}
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: 10,
                  cursor: isSending ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  opacity: isSending ? 0.7 : 1,
                }}
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
