import type { StrategyKey, TopicKey } from "@/lib/negotiation-config";

export type WeightState = {
  factor1: number;
  factor2: number;
  factor3: number;
  factor4: number;
  factor5: number;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  text: string;
};

export type ChatContext = {
  topic: TopicKey;
  strategy: StrategyKey;
  weights: WeightState;
  intake?: {
    fullName?: string;
    email?: string;
    avatar?: string;
  } | null;
  messages?: ChatMessage[];
};

const TOPIC_FACTORS: Record<TopicKey, string[]> = {
  car: ["Price", "Fuel Efficiency", "Safety", "Reliability", "Horsepower"],
  laptop: ["Price", "Performance", "RAM", "Battery Life", "Storage"],
  mobile: ["Price", "Battery", "Camera", "Performance", "Storage"],
  job: [
    "Salary",
    "Work-Life Balance",
    "Location",
    "Growth Opportunities",
    "Benefits",
  ],
  rent: ["Price", "Location", "Safety", "Space", "Amenities"],
};

type RankedFactor = {
  name: string;
  value: number;
};

function rankFactors(topic: TopicKey, weights: WeightState): RankedFactor[] {
  const factors = TOPIC_FACTORS[topic];

  return [
    { name: factors[0], value: weights.factor1 },
    { name: factors[1], value: weights.factor2 },
    { name: factors[2], value: weights.factor3 },
    { name: factors[3], value: weights.factor4 },
    { name: factors[4], value: weights.factor5 },
  ].sort((left, right) => right.value - left.value);
}

function buildStrategyGuidance(
  strategy: StrategyKey,
  highest: RankedFactor,
  second: RankedFactor
) {
  switch (strategy) {
    case "tough":
      return `Stay firm and avoid conceding on ${highest.name.toLowerCase()} or ${second.name.toLowerCase()} unless the offer improves in a meaningful way.`;
    case "soft":
      return `Keep the tone flexible, but keep guiding the negotiation back to ${highest.name.toLowerCase()} and ${second.name.toLowerCase()}.`;
    case "friendly":
      return `Be positive and cooperative, while still protecting ${highest.name.toLowerCase()} and ${second.name.toLowerCase()}.`;
    case "analytical":
      return `Use comparisons, tradeoffs, and clear reasoning centered on ${highest.name.toLowerCase()} and ${second.name.toLowerCase()}.`;
    case "urgent":
      return `Push for a quick decision, but only if ${highest.name.toLowerCase()} and ${second.name.toLowerCase()} are respected.`;
    default:
      return `Aim for a fair middle ground, with the main focus on ${highest.name.toLowerCase()} and ${second.name.toLowerCase()}.`;
  }
}

function messageLooksLikeOffer(text: string) {
  const normalized = text.toLowerCase();

  return (
    normalized.includes("offer") ||
    normalized.includes("deal") ||
    normalized.includes("quote") ||
    normalized.includes("salary") ||
    normalized.includes("rent") ||
    normalized.includes("price")
  );
}

function messageLooksLikeCounterRequest(text: string) {
  const normalized = text.toLowerCase();

  return (
    normalized.includes("counter") ||
    normalized.includes("reply") ||
    normalized.includes("respond") ||
    normalized.includes("what should i say") ||
    normalized.includes("negotiate")
  );
}

function messageLooksLikeEvaluationQuestion(text: string) {
  const normalized = text.toLowerCase();

  return (
    normalized.includes("?") ||
    normalized.includes("should i") ||
    normalized.includes("is this good") ||
    normalized.includes("what do you think") ||
    normalized.includes("can i")
  );
}

export function generateNegotiationReply(
  userMessage: string,
  context: ChatContext
) {
  const ranked = rankFactors(context.topic, context.weights);
  const highest = ranked[0];
  const second = ranked[1];
  const third = ranked[2];
  const fourth = ranked[3];
  const lowest = ranked[4];
  const topicLabel = context.topic.toLowerCase();
  const name = context.intake?.fullName?.trim() || "You";
  const guidance = buildStrategyGuidance(context.strategy, highest, second);
  const assistantTurnCount =
    context.messages?.filter((message) => message.role === "assistant").length ?? 0;

  if (messageLooksLikeOffer(userMessage)) {
    return `${name}, in this ${topicLabel} negotiation I would judge the offer against ${highest.name} (${highest.value}%) first and ${second.name} (${second.value}%) second. If those two are weak, the offer is still not strong enough, even if ${lowest.name.toLowerCase()} looks acceptable. ${guidance}`;
  }

  if (messageLooksLikeCounterRequest(userMessage)) {
    return `A strong response would be: "My biggest priorities are ${highest.name.toLowerCase()} and ${second.name.toLowerCase()}, so I need the offer to improve there before I can move ahead. I can be more flexible on ${lowest.name.toLowerCase()} if the main terms get better." ${guidance}`;
  }

  if (messageLooksLikeEvaluationQuestion(userMessage)) {
    return `The safest move is to keep the conversation anchored on ${highest.name.toLowerCase()} and ${second.name.toLowerCase()}. ${third.name} still matters, while ${fourth.name} and ${lowest.name} are the best places to trade if you need flexibility. ${guidance}`;
  }

  const intro =
    assistantTurnCount === 0
      ? `I am ready to help with your ${topicLabel} negotiation. `
      : "";

  return `${intro}Based on your message, I would respond by emphasizing ${highest.name} (${highest.value}%) and ${second.name} (${second.value}%) first, while keeping ${third.name} in view and treating ${lowest.name} as the easiest concession point. ${guidance}`;
}
