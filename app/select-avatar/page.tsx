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

    localStorage.setItem("negotiation_intake", JSON.stringify(parsed));

    router.push("/demo");
  };

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800 }}>
        Choose Your AI Negotiation Assistant
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          marginTop: 40,
        }}
      >
        {/* Male Bot */}
        <div
          onClick={() => chooseAvatar("male")}
          style={{
            cursor: "pointer",
            padding: 20,
            border: "1px solid #444",
            borderRadius: 12,
            width: 200,
          }}
        >
          <img
            src="https://i.imgur.com/6VBx3io.png"
            alt="Male Bot"
            style={{ width: "100%", borderRadius: 12 }}
          />
          <h3 style={{ marginTop: 10 }}>Male AI</h3>
        </div>

        {/* Female Bot */}
        <div
          onClick={() => chooseAvatar("female")}
          style={{
            cursor: "pointer",
            padding: 20,
            border: "1px solid #444",
            borderRadius: 12,
            width: 200,
          }}
        >
          <img
            src="https://i.imgur.com/YXz9E4V.png"
            alt="Female Bot"
            style={{ width: "100%", borderRadius: 12 }}
          />
          <h3 style={{ marginTop: 10 }}>Female AI</h3>
        </div>
      </div>
    </div>
  );
}
