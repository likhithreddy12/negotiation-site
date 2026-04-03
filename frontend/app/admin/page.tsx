"use client";

import { useEffect, useState } from "react";

type TopicKey = "car" | "laptop" | "mobile" | "job" | "rent";
type StrategyKey =
  | "balanced"
  | "tough"
  | "soft"
  | "friendly"
  | "analytical"
  | "urgent";

const TOPIC_CONFIGS: Record<TopicKey, string[]> = {
  car: ["Price", "Fuel Efficiency", "Safety", "Reliability", "Horsepower"],
  laptop: ["Price", "Performance", "RAM", "Battery", "Storage"],
  mobile: ["Price", "Battery", "Camera", "Performance", "Storage"],
  job: [
    "Salary",
    "Work-Life Balance",
    "Location",
    "Growth",
    "Benefits",
  ],
  rent: ["Price", "Location", "Safety", "Space", "Amenities"],
};

type WeightState = {
  factor1: number;
  factor2: number;
  factor3: number;
  factor4: number;
  factor5: number;
};

const DEFAULT_WEIGHTS: WeightState = {
  factor1: 20,
  factor2: 20,
  factor3: 20,
  factor4: 20,
  factor5: 20,
};

const ADMIN_PASSWORD = "professor123";

function normalizeWeights(
  changedKey: keyof WeightState,
  changedValue: number,
  current: WeightState
): WeightState {
  const next = { ...current, [changedKey]: changedValue };
  const keys = Object.keys(current) as (keyof WeightState)[];
  const others = keys.filter((k) => k !== changedKey);

  const remaining = 100 - changedValue;
  if (remaining <= 0) {
    const reset: WeightState = {
      factor1: 0,
      factor2: 0,
      factor3: 0,
      factor4: 0,
      factor5: 0,
    };
    reset[changedKey] = 100;
    return reset;
  }

  const share = Math.floor(remaining / others.length);
  let leftover = remaining - share * others.length;

  for (const key of others) {
    next[key] = share;
  }

  for (const key of others) {
    if (leftover <= 0) break;
    next[key] += 1;
    leftover--;
  }

  return next;
}

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [topic, setTopic] = useState<TopicKey>("car");
  const [strategy, setStrategy] = useState<StrategyKey>("balanced");
  const [weights, setWeights] = useState<WeightState>(DEFAULT_WEIGHTS);

  useEffect(() => {
    const saved = localStorage.getItem("admin_auth");
    if (saved === "true") setAuthorized(true);
  }, []);

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
      localStorage.setItem("admin_auth", "true");
    } else {
      alert("Wrong password");
    }
  }

  function updateWeights(key: keyof WeightState, value: number) {
    const updated = normalizeWeights(key, value, weights);
    setWeights(updated);
    localStorage.setItem("topic_weights", JSON.stringify(updated));
  }

  function saveStrategy(s: StrategyKey) {
    setStrategy(s);
    localStorage.setItem("selected_strategy", s);
  }

  function saveTopic(t: TopicKey) {
    setTopic(t);
    localStorage.setItem("selected_topic", t);
  }

  if (!authorized) {
    return (
      <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 40 }}>
        <h1>Admin Login</h1>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, marginTop: 10 }}
        />
        <br />
        <button onClick={handleLogin} style={{ marginTop: 10 }}>
          Login
        </button>
      </main>
    );
  }

  const factors = TOPIC_CONFIGS[topic];

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 30 }}>
      <h1>Admin Dashboard</h1>

      <h2>Strategy</h2>
      {(["balanced","tough","soft","friendly","analytical","urgent"] as StrategyKey[]).map((s) => (
        <button key={s} onClick={() => saveStrategy(s)} style={{ marginRight: 10 }}>
          {s}
        </button>
      ))}

      <h2 style={{ marginTop: 20 }}>Topics</h2>
      {(["car","laptop","mobile","job","rent"] as TopicKey[]).map((t) => (
        <button key={t} onClick={() => saveTopic(t)} style={{ marginRight: 10 }}>
          {t}
        </button>
      ))}

      <h2 style={{ marginTop: 20 }}>Configuration</h2>

      {factors.map((f, i) => {
        const key = `factor${i + 1}` as keyof WeightState;
        return (
          <div key={f}>
            <span>{f}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[key]}
              onChange={(e) => updateWeights(key, Number(e.target.value))}
            />
            {weights[key]}%
          </div>
        );
      })}
    </main>
  );
}