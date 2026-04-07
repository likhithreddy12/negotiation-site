"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_ADMIN_SETTINGS,
  TOPIC_CONFIGS,
  STRATEGIES,
  type StrategyKey,
  type TopicKey,
} from "@/lib/negotiation-config";
import type { WeightState } from "@/lib/negotiation-chat-engine";

const ADMIN_PASSWORD = "professor123";

const DEFAULT_WEIGHTS: WeightState = {
  factor1: 20,
  factor2: 20,
  factor3: 20,
  factor4: 20,
  factor5: 20,
};

function getStoredAdminState() {
  if (typeof window === "undefined") {
    return {
      authorized: false,
      topic: DEFAULT_ADMIN_SETTINGS.activeTopic,
      strategy: DEFAULT_ADMIN_SETTINGS.selectedStrategy,
      weights: DEFAULT_WEIGHTS,
    };
  }

  let topic: TopicKey = DEFAULT_ADMIN_SETTINGS.activeTopic;
  let strategy: StrategyKey = DEFAULT_ADMIN_SETTINGS.selectedStrategy;
  let weights: WeightState = DEFAULT_WEIGHTS;

  const authorized = window.localStorage.getItem("admin_auth") === "true";
  const storedTopic = window.localStorage.getItem("selected_topic");
  const storedStrategy = window.localStorage.getItem("selected_strategy");
  const storedWeights = window.localStorage.getItem("topic_weights");

  if (isValidTopic(storedTopic)) {
    topic = storedTopic;
  }

  if (isValidStrategy(storedStrategy)) {
    strategy = storedStrategy;
  }

  if (storedWeights) {
    try {
      const parsed = JSON.parse(storedWeights) as Partial<WeightState>;
      if (
        typeof parsed.factor1 === "number" &&
        typeof parsed.factor2 === "number" &&
        typeof parsed.factor3 === "number" &&
        typeof parsed.factor4 === "number" &&
        typeof parsed.factor5 === "number"
      ) {
        weights = normalizeTo100(parsed as WeightState);
      }
    } catch {}
  }

  return { authorized, topic, strategy, weights };
}

function normalizeTo100(raw: WeightState) {
  const keys = Object.keys(raw) as (keyof WeightState)[];
  const sum = keys.reduce((acc, key) => acc + raw[key], 0);

  if (sum <= 0) {
    return DEFAULT_WEIGHTS;
  }

  const exact = keys.reduce((acc, key) => {
    acc[key] = (raw[key] / sum) * 100;
    return acc;
  }, {} as WeightState);

  const rounded = keys.reduce((acc, key) => {
    acc[key] = Math.round(exact[key]);
    return acc;
  }, {} as WeightState);

  const roundedSum = keys.reduce((acc, key) => acc + rounded[key], 0);
  const diff = 100 - roundedSum;

  if (diff !== 0) {
    const largestKey = keys.reduce((best, key) =>
      exact[key] > exact[best] ? key : best
    );
    rounded[largestKey] = Math.max(0, rounded[largestKey] + diff);
  }

  return rounded;
}

function isValidTopic(value: unknown): value is TopicKey {
  return typeof value === "string" && value in TOPIC_CONFIGS;
}

function isValidStrategy(value: unknown): value is StrategyKey {
  return typeof value === "string" && STRATEGIES.includes(value as StrategyKey);
}

export default function AdminPage() {
  const initialState = getStoredAdminState();
  const [authorized, setAuthorized] = useState(initialState.authorized);
  const [password, setPassword] = useState("");
  const [topic, setTopic] = useState<TopicKey>(initialState.topic);
  const [strategy, setStrategy] = useState<StrategyKey>(initialState.strategy);
  const [weights, setWeights] = useState<WeightState>(initialState.weights);

  useEffect(() => {
    localStorage.setItem("selected_topic", topic);
    localStorage.setItem("selected_strategy", strategy);
    localStorage.setItem("topic_weights", JSON.stringify(normalizeTo100(weights)));
    localStorage.setItem(
      "admin_settings",
      JSON.stringify({
        activeTopic: topic,
        selectedStrategy: strategy,
      })
    );
  }, [strategy, topic, weights]);

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
      localStorage.setItem("admin_auth", "true");
      return;
    }

    alert("Wrong password");
  }

  function updateWeights(key: keyof WeightState, value: number) {
    setWeights((prev) => normalizeTo100({ ...prev, [key]: value }));
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

  const factors = TOPIC_CONFIGS[topic].factors.slice(0, 5);

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 30 }}>
      <h1>Admin Dashboard</h1>

      <h2>Strategy</h2>
      {STRATEGIES.map((item) => (
        <button key={item} onClick={() => setStrategy(item)} style={{ marginRight: 10 }}>
          {item}
        </button>
      ))}

      <h2 style={{ marginTop: 20 }}>Topics</h2>
      {(Object.keys(TOPIC_CONFIGS) as TopicKey[]).map((item) => (
        <button key={item} onClick={() => setTopic(item)} style={{ marginRight: 10 }}>
          {item}
        </button>
      ))}

      <h2 style={{ marginTop: 20 }}>Configuration</h2>

      {factors.map((factor, index) => {
        const key = `factor${index + 1}` as keyof WeightState;

        return (
          <div key={factor.key}>
            <span>{factor.label}</span>
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
