"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Intake = {
  fullName: string;
  email: string;
  avatar?: "male" | "female";
};

type Weights = {
  price?: number;
  reliability?: number;
  fuel?: number;
  horsepower?: number;
  safety?: number;
};

function getTopPriorities(weights: Weights) {
  const entries = Object.entries(weights)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => ({ key: k, value: v as number }))
    .sort((a, b) => b.value - a.value);

  return entries.slice(0, 2);
}

function labelKey(k: string) {
  switch (k) {
    case "price":
      return "Price / Budget";
    case "reliability":
      return "Reliability";
    case "fuel":
      return "Fuel Efficiency";
    case "horsepower":
      return "Engine Power";
    case "safety":
      return "Safety";
    default:
      return k;
  }
}

export default function DemoPage() {
  const router = useRouter();
  const [intake, setIntake] = useState<Intake | null>(null);
  const [weights, setWeights] = useState<Weights | null>(null);

  useEffect(() => {
    const storedIntake = localStorage.getItem("negotiation_intake");
    const storedWeights = localStorage.getItem("car_config_weights");

    if (!storedWeights) {
      router.replace("/"); // force user to set configuration first
      return;
    }

    if (!storedIntake) {
      router.replace("/start");
      return;
    }

    setIntake(JSON.parse(storedIntake));
    setWeights(JSON.parse(storedWeights));
  }, [router]);

  const top2 = useMemo(() => (weights ? getTopPriorities(weights) : []), [weights]);

  if (!intake || !weights) return null;

  return (
    <main style={{ maxWidth: 900, margin: "60px auto", padding: 20, color: "#fff" }}>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>Negotiation Chat</h1>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.2)",
          padding: 20,
          borderRadius: 14,
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>Negotiation Profile</h2>

        <p>
          <b>Name:</b> {intake.fullName}
        </p>
        <p>
          <b>Email:</b> {intake.email}
        </p>

        <p>
          <b>Selected AI:</b>{" "}
          {intake.avatar ? (
            <>
              {intake.avatar} {intake.avatar === "male" ? "🤵‍♂️" : "👩‍💼"}
            </>
          ) : (
            "not selected"
          )}
        </p>

        <p style={{ marginTop: 14 }}>
          <b>Top Priorities:</b>{" "}
          {top2.length ? (
            <>
              {labelKey(top2[0].key)} ({top2[0].value}%){" "}
              {top2[1] ? `, ${labelKey(top2[1].key)} (${top2[1].value}%)` : ""}
            </>
          ) : (
            "not set"
          )}
        </p>

        <p style={{ marginTop: 14, opacity: 0.85, lineHeight: 1.5 }}>
          ✅ The chatbot will negotiate using your configuration weights as the main decision rules
          (what to push hard on and what to compromise on).
        </p>
      </div>
    </main>
  );
}