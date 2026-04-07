import { NextResponse } from "next/server";
import { generateNegotiationReply } from "@/lib/negotiation-chat-engine";
import type { ChatMessage, WeightState } from "@/lib/negotiation-chat-engine";
import type { StrategyKey, TopicKey } from "@/lib/negotiation-config";

type ChatRequestBody = {
  userMessage?: string;
  topic?: TopicKey;
  strategy?: StrategyKey;
  weights?: WeightState;
  intake?: {
    fullName?: string;
    email?: string;
    avatar?: string;
  } | null;
  messages?: ChatMessage[];
};

function isValidTopic(value: unknown): value is TopicKey {
  return ["car", "laptop", "mobile", "job", "rent"].includes(String(value));
}

function isValidStrategy(value: unknown): value is StrategyKey {
  return ["tough", "soft", "friendly", "analytical", "urgent", "balanced"].includes(
    String(value)
  );
}

function isValidWeights(value: unknown): value is WeightState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const weights = value as Record<string, unknown>;

  return ["factor1", "factor2", "factor3", "factor4", "factor5"].every(
    (key) => typeof weights[key] === "number"
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;

    if (!body.userMessage?.trim()) {
      return NextResponse.json(
        { error: "A user message is required." },
        { status: 400 }
      );
    }

    if (!isValidTopic(body.topic) || !isValidStrategy(body.strategy) || !isValidWeights(body.weights)) {
      return NextResponse.json(
        { error: "Missing or invalid negotiation context." },
        { status: 400 }
      );
    }

    const reply = generateNegotiationReply(body.userMessage, {
      topic: body.topic,
      strategy: body.strategy,
      weights: body.weights,
      intake: body.intake,
      messages: body.messages ?? [],
    });

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "The chatbot could not process the request." },
      { status: 500 }
    );
  }
}
