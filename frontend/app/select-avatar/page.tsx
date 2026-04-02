"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SelectAvatarPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const intake = localStorage.getItem("negotiation_intake");
    if (!intake) {
      router.replace("/start");
      return;
    }
    setReady(true);
  }, [router]);

  function chooseAvatar(avatar: string) {
    const intake = localStorage.getItem("negotiation_intake");
    if (!intake) return;

    const parsed = JSON.parse(intake);
    localStorage.setItem(
      "negotiation_intake",
      JSON.stringify({
        ...parsed,
        avatar,
      })
    );

    router.push("/demo");
  }

  if (!ready) return null;

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
      <div style={{ maxWidth: 900, margin: "60px auto" }}>
        <h1>Select Chatbot Avatar</h1>
        <p style={{ color: "#cfcfcf" }}>Choose male or female chatbot.</p>

        <div
          style={{
            marginTop: 30,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          <button
            onClick={() => chooseAvatar("/agents/male.png")}
            style={{
              background: "#111",
              border: "1px solid #333",
              borderRadius: 14,
              padding: 20,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <img
              src="/agents/male.png"
              alt="Male Avatar"
              style={{
                width: "100%",
                maxWidth: 240,
                height: 240,
                objectFit: "cover",
                borderRadius: 12,
              }}
            />
            <h3>Male Chatbot</h3>
          </button>

          <button
            onClick={() => chooseAvatar("/agents/female.png")}
            style={{
              background: "#111",
              border: "1px solid #333",
              borderRadius: 14,
              padding: 20,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <img
              src="/agents/female.png"
              alt="Female Avatar"
              style={{
                width: "100%",
                maxWidth: 240,
                height: 240,
                objectFit: "cover",
                borderRadius: 12,
              }}
            />
            <h3>Female Chatbot</h3>
          </button>
        </div>
      </div>
    </main>
  );
}