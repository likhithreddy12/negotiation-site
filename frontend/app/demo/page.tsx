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

function formatStrategyLabel(strategy: string) {
  switch (strategy) {
    case "tough":
      return "Tough";
    case "soft":
      return "Soft";
    case "friendly":
      return "Friendly";
    case "analytical":
      return "Analytical";
    case "urgent":
      return "Urgent";
    case "balanced":
      return "Balanced";
    default:
      return strategy;
  }
}

function getAllPriorities(weights: Weights) {
  return Object.entries(weights)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => ({ key: k, value: v as number }))
    .sort((a, b) => b.value - a.value);
}

export default function DemoPage() {
  const router = useRouter();
  const [intake, setIntake] = useState<Intake | null>(null);
  const [weights, setWeights] = useState<Weights | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState("balanced");

  useEffect(() => {
    const storedIntake = localStorage.getItem("negotiation_intake");
    const storedWeights = localStorage.getItem("car_config_weights");
    const storedStrategy = localStorage.getItem("selected_strategy");

    if (!storedWeights) {
      router.replace("/");
      return;
    }

    if (!storedIntake) {
      router.replace("/start");
      return;
    }

    setIntake(JSON.parse(storedIntake));
    setWeights(JSON.parse(storedWeights));

    if (storedStrategy) {
      setSelectedStrategy(storedStrategy);
    }
  }, [router]);

  const allPriorities = useMemo(
    () => (weights ? getAllPriorities(weights) : []),
    [weights]
  );

  if (!intake || !weights) return null;

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 md:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
          Negotiation Chat
        </h1>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-lg backdrop-blur-sm sm:p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Negotiation Profile
          </h2>

          <div className="space-y-3 text-sm sm:text-base">
            <p className="text-white">
              <span className="font-semibold text-white">Name:</span> {intake.fullName}
            </p>

            <p className="text-white">
              <span className="font-semibold text-white">Email:</span> {intake.email}
            </p>

            <p className="text-white">
              <span className="font-semibold text-white">Selected AI:</span>{" "}
              {intake.avatar ? (
                <>
                  {intake.avatar} {intake.avatar === "male" ? "🤵‍♂️" : "👩‍💼"}
                </>
              ) : (
                "not selected"
              )}
            </p>

            <p className="text-white">
              <span className="font-semibold text-white">Selected Strategy:</span>{" "}
              {formatStrategyLabel(selectedStrategy)}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-white">
              Full Configuration Weights
            </h3>

            <div className="space-y-3">
              {allPriorities.map((item) => (
                <div
                  key={item.key}
                  className="rounded-xl border border-white/15 bg-white/5 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-white sm:text-base">
                      {labelKey(item.key)}
                    </span>
                    <span className="text-sm font-bold text-blue-300 sm:text-base">
                      {item.value}%
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-white/15">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-blue-400/30 bg-blue-500/10 p-4">
            <p className="text-sm leading-6 text-blue-100 sm:text-base">
              ✅ The chatbot will use your selected negotiation strategy together
              with your complete configuration weights across all five factors.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}