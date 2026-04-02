"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_ADMIN_SETTINGS,
  getDefaultWeights,
  TOPIC_CONFIGS,
  TopicKey,
  StrategyKey,
} from "../../lib/negotiation-config";

type AdminSettings = {
  activeTopic: TopicKey;
  selectedStrategy: StrategyKey;
};

export default function StartPage() {
  const router = useRouter();
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin_settings");
    const parsedAdmin = storedAdmin ? JSON.parse(storedAdmin) : DEFAULT_ADMIN_SETTINGS;
    setAdminSettings(parsedAdmin);

    const topic = parsedAdmin.activeTopic as TopicKey;
    const defaults = getDefaultWeights(topic);

    setWeights(defaults);
  }, []);

  const topicConfig = useMemo(
    () => TOPIC_CONFIGS[adminSettings.activeTopic],
    [adminSettings.activeTopic]
  );

  const totalWeight = Object.values(weights).reduce((sum, value) => sum + Number(value || 0), 0);

  const handleWeightChange = (key: string, value: string) => {
    setWeights((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
    setError("");
  };

  const handleContinue = () => {
    if (totalWeight !== 100) {
      setError("Total weight must be exactly 100 before continuing.");
      return;
    }

    localStorage.setItem(
      "user_topic_config",
      JSON.stringify({
        topic: adminSettings.activeTopic,
        formValues,
        weights,
      })
    );

    router.push("/demo");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        padding: "30px 20px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 38, marginBottom: 10 }}>{topicConfig.startButtonText}</h1>
        <p style={{ color: "#cbd5e1", marginBottom: 28 }}>
          Fill in your details and adjust the 5 weights based on your personal priorities.
        </p>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: 28, marginBottom: 18 }}>Topic Inputs</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {topicConfig.fields.map((field) => (
              <div key={field.key}>
                <label style={{ display: "block", marginBottom: 8 }}>{field.label}</label>
                <input
                  value={formValues[field.key] || ""}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: 28, marginBottom: 18 }}>Adjust Weightage</h2>
          <p style={{ color: "#cbd5e1", marginBottom: 14 }}>
            Total must equal <strong>100</strong>.
          </p>

          <div style={{ display: "grid", gap: 18 }}>
            {topicConfig.factors.map((factor) => (
              <div key={factor.key} style={factorBox}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "center",
                    marginBottom: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <label style={{ fontWeight: 600 }}>{factor.label}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={weights[factor.key] ?? factor.defaultWeight}
                    onChange={(e) => handleWeightChange(factor.key, e.target.value)}
                    style={{
                      width: 100,
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid #444",
                      background: "#000",
                      color: "white",
                    }}
                  />
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[factor.key] ?? factor.defaultWeight}
                  onChange={(e) => handleWeightChange(factor.key, e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 12,
              border: totalWeight === 100 ? "1px solid #166534" : "1px solid #7f1d1d",
              background: totalWeight === 100 ? "#052e16" : "#2b0b0b",
            }}
          >
            Current Total: <strong>{totalWeight}</strong>
          </div>

          {error ? <p style={{ color: "#f87171", marginTop: 12 }}>{error}</p> : null}

          <button onClick={handleContinue} style={continueButton}>
            Continue to Chat
          </button>
        </section>
      </div>
    </main>
  );
}

const sectionStyle = {
  border: "1px solid #333",
  borderRadius: 16,
  padding: 24,
  background: "#111",
  marginBottom: 24,
};

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #444",
  background: "#000",
  color: "white",
};

const factorBox = {
  border: "1px solid #333",
  borderRadius: 14,
  padding: 16,
  background: "#0b0b0b",
};

const continueButton = {
  marginTop: 20,
  padding: "12px 18px",
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};