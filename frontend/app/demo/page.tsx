"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Intake = {
  fullName: string;
  email: string;
  avatar?: string;
};

type FactorKey = "price" | "reliability" | "fuel" | "horsepower" | "safety";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function DemoPage() {
  const router = useRouter();
  const [intake, setIntake] = useState<Intake | null>(null);
  const [weights, setWeights] = useState<Record<FactorKey, number> | null>(null);
  const [strategy, setStrategy] = useState("balanced");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const storedIntake = localStorage.getItem("negotiation_intake");
    const storedWeights = localStorage.getItem("car_config_weights");
    const storedStrategy = localStorage.getItem("selected_strategy");

    if (!storedIntake) {
      router.replace("/start");
      return;
    }

    setIntake(JSON.parse(storedIntake));

    if (storedWeights) {
      setWeights(JSON.parse(storedWeights));
    }

    if (storedStrategy) {
      setStrategy(storedStrategy);
    }
  }, [router]);

  const topPriority = useMemo(() => {
    if (!weights) return "price";

    return Object.entries(weights).sort((a, b) => b[1] - a[1])[0][0];
  }, [weights]);

  function sendMessage() {
    if (!message.trim()) return;

    const userText = message.trim();

    const assistantReply = `You said: "${userText}". I will respond using a ${strategy} negotiation style, with strongest focus on ${topPriority}.`;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "assistant", text: assistantReply },
    ]);

    setMessage("");
  }

  if (!intake) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "40px auto" }}>
        <h1 style={{ fontSize: 36 }}>Negotiation Chat</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <aside
            style={{
              background: "#111",
              border: "1px solid #333",
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
                  maxWidth: 220,
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              />
            )}

            <h3>User Info</h3>
            <p><strong>Name:</strong> {intake.fullName}</p>
            <p><strong>Email:</strong> {intake.email}</p>
            <p><strong>Strategy:</strong> {strategy}</p>

            {weights && (
              <>
                <h3 style={{ marginTop: 20 }}>Weights</h3>
                <p>Price: {weights.price}%</p>
                <p>Reliability: {weights.reliability}%</p>
                <p>Fuel: {weights.fuel}%</p>
                <p>Horsepower: {weights.horsepower}%</p>
                <p>Safety: {weights.safety}%</p>
              </>
            )}
          </aside>

          <section
            style={{
              background: "#111",
              border: "1px solid #333",
              borderRadius: 14,
              padding: 20,
              minHeight: 500,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, display: "grid", gap: 12 }}>
              {messages.length === 0 ? (
                <div style={{ color: "#bfbfbf" }}>
                  Start the negotiation conversation here.
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      background: msg.role === "user" ? "#2563eb" : "#222",
                      padding: "12px 14px",
                      borderRadius: 12,
                      maxWidth: "75%",
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
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #444",
                  background: "#000",
                  color: "#fff",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  background: "#2563eb",
                  color: "#fff",
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