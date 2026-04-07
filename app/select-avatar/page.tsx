"use client";

import { useRouter } from "next/navigation";

type AvatarChoice = {
  key: "male" | "female";
  label: string;
  image: string;
  description: string;
};

const AVATARS: AvatarChoice[] = [
  {
    key: "male",
    label: "Male Chat Agent",
    image: "/agents/male.png",
    description: "Professional male negotiation assistant.",
  },
  {
    key: "female",
    label: "Female Chat Agent",
    image: "/agents/female.png",
    description: "Professional female negotiation assistant.",
  },
];

export default function SelectAvatarPage() {
  const router = useRouter();

  const handleSelect = (avatar: "male" | "female") => {
    const existing = localStorage.getItem("negotiation_intake");

    if (!existing) {
      router.push("/start");
      return;
    }

    const parsed = JSON.parse(existing);

    localStorage.setItem(
      "negotiation_intake",
      JSON.stringify({
        ...parsed,
        avatar,
      })
    );

    router.push("/demo");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "40px 16px",
        fontFamily:
          "Arial, sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 10 }}>
            Choose Your Chat Agent
          </h1>
          <p style={{ color: "#d1d5db" }}>
            Select the avatar you want for the negotiation chatbot.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          {AVATARS.map((avatar) => (
            <div
              key={avatar.key}
              style={{
                background: "#0d0d0f",
                border: "1px solid #2a2a2f",
                borderRadius: 20,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                minHeight: 480,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 240,
                  height: 260,
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#111827",
                  border: "1px solid #374151",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                <img
                  src={avatar.image}
                  alt={avatar.label}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                {avatar.label}
              </h2>

              <p
                style={{
                  color: "#d1d5db",
                  lineHeight: 1.7,
                  marginBottom: 20,
                  maxWidth: 260,
                }}
              >
                {avatar.description}
              </p>

              <button
                onClick={() => handleSelect(avatar.key)}
                style={{
                  marginTop: "auto",
                  width: "100%",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Select {avatar.key === "male" ? "Male" : "Female"} Agent
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}