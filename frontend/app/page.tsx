"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Intake = {
  fullName: string;
  email: string;
  avatar?: string;
};

type TopicKey = "car" | "laptop" | "mobile" | "job" | "rent";
type StrategyKey =
  | "balanced"
  | "tough"
  | "soft"
  | "friendly"
  | "analytical"
  | "urgent";

type WeightState = {
  factor1: number;
  factor2: number;
  factor3: number;
  factor4: number;
  factor5: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
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

function getWeightedPriorities(topic: TopicKey, weights: WeightState) {
  const factors = TOPIC_CONFIGS[topic].factors;

  const mapped = [
    { name: factors[0], value: weights.factor1 },
    { name: factors[1], value: weights.factor2 },
    { name: factors[2], value: weights.factor3 },
    { name: factors[3], value: weights.factor4 },
    { name: factors[4], value: weights.factor5 },
  ];

  return mapped.sort((a, b) => b.value - a.value);
}

function buildWeightSummary(topic: TopicKey, weights: WeightState) {
  const sorted = getWeightedPriorities(topic, weights);

  const highest = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const lowest = sorted[4];

  return {
    sorted,
    highest,
    second,
    third,
    lowest,
  };
}

function generateAssistantReply(
  userMessage: string,
  topic: TopicKey,
  strategy: StrategyKey,
  weights: WeightState
) {
  const summary = buildWeightSummary(topic, weights);

  const emphasisSentence = `My main priorities are ${summary.highest.name} (${summary.highest.value}%) and ${summary.second.name} (${summary.second.value}%), while I still care about ${summary.third.name}, ${summary.sorted[3].name}, and ${summary.lowest.name}.`;

  const topicOpeners: Record<TopicKey, string> = {
    car: "For this car discussion,",
    laptop: "For this laptop discussion,",
    mobile: "For this mobile discussion,",
    job: "For this job discussion,",
    rent: "For this rental discussion,",
  };

  const strategyStyles: Record<StrategyKey, string> = {
    balanced:
      "I want a fair outcome and I am looking for a practical middle ground.",
    tough:
      "I need a stronger offer and I am not willing to compromise easily on my priorities.",
    soft:
      "I am open to discussion, but I still want the offer to reflect what matters most to me.",
    friendly:
      "I would like to keep this conversation positive and cooperative while still protecting my priorities.",
    analytical:
      "I am evaluating this carefully and comparing the offer against my weighted priorities.",
    urgent:
      "I need a clear and efficient decision quickly, but it still has to match my main priorities.",
  };

  const userIntent = userMessage.trim();

  return `${topicOpeners[topic]} ${emphasisSentence} ${strategyStyles[strategy]} Based on what you said — "${userIntent}" — I would respond by giving the strongest importance to ${summary.highest.name}, then ${summary.second.name}, while still considering ${summary.third.name}, ${summary.sorted[3].name}, and ${summary.lowest.name} in the final decision.`;
}

export default function DemoPage() {
  const router = useRouter();

  const [intake, setIntake] = useState<Intake | null>(null);
  const [topic, setTopic] = useState<TopicKey>("car");
  const [strategy, setStrategy] = useState<StrategyKey>("balanced");
  const [weights, setWeights] = useState<WeightState | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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
      { label: factors[0], value: weights.factor1 },
      { label: factors[1], value: weights.factor2 },
      { label: factors[2], value: weights.factor3 },
      { label: factors[3], value: weights.factor4 },
      { label: factors[4], value: weights.factor5 },
    ];
  }, [topic, weights]);

  function sendMessage() {
    if (!message.trim() || !weights) return;

    const userText = message.trim();

    const assistantReply = generateAssistantReply(
      userText,
      topic,
      strategy,
      weights
    );

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "assistant", text: assistantReply },
    ]);

    setMessage("");
  }

  if (!intake || !weights) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000000",
        color: "#ffffff",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "40px auto" }}>
        <h1 style={{ fontSize: 36, marginBottom: 20 }}>Negotiation Chat</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
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
            }}
          >
            {intake.avatar && (
              <img
                src={intake.avatar}
                alt="Selected avatar"
                style={{
                  width: "100%",
                  maxWidth: 240,
                  height: 240,
                  objectFit: "cover",
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              />
            )}

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
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, display: "grid", gap: 12 }}>
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
                    }}
                  >
                    {msg.text}
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
              }}
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your negotiation message..."
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #444444",
                  background: "#000000",
                  color: "#ffffff",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Send
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}