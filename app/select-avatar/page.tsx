"use client";

import { useRouter } from "next/navigation";

export default function SelectAvatar() {
  const router = useRouter();

  const chooseAvatar = (type: "male" | "female") => {
    const intake = localStorage.getItem("negotiation_intake");
    if (!intake) {
      router.replace("/start");
      return;
    }

    const parsed = JSON.parse(intake);
    parsed.avatar = type;

    // ✅ store back into intake
    localStorage.setItem("negotiation_intake", JSON.stringify(parsed));

    // ✅ also store separately for easy use in chatbot
    localStorage.setItem("selected_agent", type);

    // ✅ go to chat page (your chat is /demo)
    router.push("/demo");
  };

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>
        Choose Your AI Negotiation Assistant
      </h1>
      <p style={{ marginTop: 10, color: "rgba(255,255,255,0.75)" }}>
        Select an agent to begin your negotiation session.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 30,
          marginTop: 40,
        }}
      >
        {/* Male Bot */}
        <div
          onClick={() => chooseAvatar("male")}
          style={{
            cursor: "pointer",
            padding: 18,
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 16,
            width: 240,
            background: "rgba(255,255,255,0.06)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
          }}
        >
          <img
            src="/agents/male.png"
            alt="Male AI"
            style={{ width: "100%", borderRadius: 14, background: "#fff" }}
          />
          <h3 style={{ marginTop: 12, color: "#fff" }}>Male AI</h3>
          <p style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            Direct, confident, and decisive negotiation style.
          </p>
        </div>

        {/* Female Bot */}
        <div
          onClick={() => chooseAvatar("female")}
          style={{
            cursor: "pointer",
            padding: 18,
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 16,
            width: 240,
            background: "rgba(255,255,255,0.06)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
          }}
        >
          <img
            src="/agents/female.png"
            alt="Female AI"
            style={{ width: "100%", borderRadius: 14, background: "#fff" }}
          />
          <h3 style={{ marginTop: 12, color: "#fff" }}>Female AI</h3>
          <p style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            Collaborative, empathetic, and persuasive negotiation style.
          </p>
        </div>
      </div>
    </div>
  );
}