from typing import Dict, List


STRATEGY_STYLES = {
    "tough": {
        "tone": "firm, confident, and negotiation-focused",
        "opening_first": [
            "Let me be direct.",
            "Here’s how I’d approach that.",
            "I’d push back on that.",
        ],
        "opening_followup": [
            "Staying direct,",
            "Looking at where we are,",
            "From a negotiation standpoint,",
        ],
    },
    "soft": {
        "tone": "calm, cooperative, and flexible",
        "opening_first": [
            "Let’s work through this calmly.",
            "I think there’s room to find a middle ground here.",
            "We can probably shape this into something more comfortable.",
        ],
        "opening_followup": [
            "Building on that,",
            "I still think there’s room to adjust this,",
            "From here,",
        ],
    },
    "friendly": {
        "tone": "warm, natural, and people-focused",
        "opening_first": [
            "I understand where you're coming from.",
            "That makes sense to me.",
            "I can see why you'd want that.",
        ],
        "opening_followup": [
            "That said,",
            "From that angle,",
            "I’d respond like this,",
        ],
    },
    "analytical": {
        "tone": "logical, structured, and comparison-based",
        "opening_first": [
            "Let’s look at this practically.",
            "The best way to approach this is through trade-offs.",
            "I’d break this down in a straightforward way.",
        ],
        "opening_followup": [
            "Looking at the trade-offs,",
            "From a practical standpoint,",
            "If we compare the options,",
        ],
    },
    "urgent": {
        "tone": "direct, focused, and action-oriented",
        "opening_first": [
            "We should move on this quickly.",
            "I’d handle this directly and without delay.",
            "The fastest path is to make a clear ask now.",
        ],
        "opening_followup": [
            "At this point,",
            "To keep momentum,",
            "The quickest next move is this,",
        ],
    },
    "balanced": {
        "tone": "professional, steady, and fair",
        "opening_first": [
            "Let’s take a balanced approach.",
            "I’d handle this in a practical way.",
            "There’s a fair way to move this forward.",
        ],
        "opening_followup": [
            "Given that,",
            "From here,",
            "The best next step would be,",
        ],
    },
}


TOPIC_FALLBACK_LABELS = {
    "car negotiation": ["price", "reliability", "fuel efficiency", "performance", "safety"],
    "laptop negotiation": ["price", "performance", "battery life", "storage", "portability"],
    "phone negotiation": ["price", "battery", "camera", "performance", "durability"],
    "mobile negotiation": ["price", "battery", "camera", "performance", "durability"],
    "rent negotiation": ["rent", "location", "amenities", "lease flexibility", "maintenance"],
    "general negotiation": ["price", "quality", "flexibility", "support", "value"],
}


def normalize_weights(weights: Dict[str, float]) -> Dict[str, float]:
    if not weights:
        return {}

    cleaned = {}
    for key, value in weights.items():
        try:
            cleaned[str(key)] = max(float(value), 0.0)
        except (TypeError, ValueError):
            cleaned[str(key)] = 0.0

    total = sum(cleaned.values())
    if total <= 0:
        equal_value = round(1 / len(cleaned), 3) if cleaned else 0.0
        return {key: equal_value for key in cleaned}

    return {key: round(value / total, 3) for key, value in cleaned.items()}


def prettify_factor_label(label: str) -> str:
    return str(label).replace("_", " ").strip().lower()


def get_sorted_factors(normalized: Dict[str, float]) -> List[str]:
    return [
        prettify_factor_label(key)
        for key, _ in sorted(normalized.items(), key=lambda item: item[1], reverse=True)
    ]


def get_top_factors(normalized: Dict[str, float], topic: str) -> List[str]:
    sorted_factors = get_sorted_factors(normalized)

    if len(sorted_factors) >= 2:
        return sorted_factors[:2]

    fallback = TOPIC_FALLBACK_LABELS.get(topic.lower().strip(), TOPIC_FALLBACK_LABELS["general negotiation"])

    if len(sorted_factors) == 1:
        second = next((item for item in fallback if item != sorted_factors[0]), "overall value")
        return [sorted_factors[0], second]

    return fallback[:2]


def get_last_assistant_message(chat_history: List[Dict]) -> str:
    for message in reversed(chat_history):
        if str(message.get("role", "")).lower() == "assistant":
            return str(message.get("content", "")).strip().lower()
    return ""


def detect_user_intent(user_message: str, topic: str, top_factors: List[str]) -> str:
    text = user_message.strip().lower()

    if any(word in text for word in ["discount", "lower", "reduce", "cheaper", "less", "budget", "price"]):
        return f"push for a better deal on {top_factors[0]}"
    if any(word in text for word in ["best", "worth", "value", "good deal", "fair"]):
        return f"frame the negotiation around overall value, with emphasis on {top_factors[0]}"
    if any(word in text for word in ["compare", "comparison", "option", "alternative", "better"]):
        return f"compare alternatives while protecting {top_factors[0]}"
    if "rent" in topic.lower():
        if any(word in text for word in ["lease", "term", "month", "contract"]):
            return "negotiate lease terms in a practical way"
        if any(word in text for word in ["maintenance", "repair", "fix", "service"]):
            return "push for stronger maintenance support"
        if any(word in text for word in ["amenities", "parking", "gym", "utility"]):
            return "protect the useful amenities while improving the overall deal"
    return f"move the deal in your favor, especially around {top_factors[0]}"


def build_opening(strategy: str, is_first_real_turn: bool) -> str:
    style = STRATEGY_STYLES.get(strategy, STRATEGY_STYLES["balanced"])
    choices = style["opening_first"] if is_first_real_turn else style["opening_followup"]
    return choices[0]


def build_topic_phrase(topic: str) -> str:
    cleaned = topic.strip().lower() if topic else "general negotiation"
    if cleaned.endswith(" negotiation"):
        return cleaned.replace(" negotiation", "")
    return cleaned


def remove_repetitive_sentence(reply: str, previous_assistant_message: str) -> str:
    if not previous_assistant_message:
        return reply

    reply_lines = [line.strip() for line in reply.splitlines() if line.strip()]
    filtered_lines = []

    for line in reply_lines:
        if line.lower() == previous_assistant_message:
            continue
        filtered_lines.append(line)

    return "\n\n".join(filtered_lines).strip() or reply.strip()


def generate_negotiation_reply(
    topic: str,
    strategy: str,
    weights: Dict[str, float],
    user_message: str,
    chat_history: List[Dict],
):
    topic_text = topic.strip() if topic else "general negotiation"
    normalized = normalize_weights(weights)
    top_factors = get_top_factors(normalized, topic_text)
    primary_factor = top_factors[0]
    secondary_factor = top_factors[1]

    assistant_messages = [
        msg for msg in chat_history if str(msg.get("role", "")).lower() == "assistant"
    ]
    previous_assistant_message = get_last_assistant_message(chat_history)
    is_first_real_turn = len(assistant_messages) <= 1

    opening = build_opening(strategy, is_first_real_turn)
    intent = detect_user_intent(user_message, topic_text, top_factors)
    topic_phrase = build_topic_phrase(topic_text)

    strategy_tone = STRATEGY_STYLES.get(strategy, STRATEGY_STYLES["balanced"])["tone"]

    if strategy == "tough":
        action_line = (
            f"I wouldn’t accept the current position too quickly. I’d press for a stronger move on "
            f"{primary_factor} and only give ground if it clearly improves the overall deal."
        )
        tradeoff_line = (
            f"If they resist, I’d keep the pressure on {primary_factor} while making sure "
            f"{secondary_factor} does not get weaker in the process."
        )
    elif strategy == "soft":
        action_line = (
            f"I’d respond in a cooperative way and ask for an improvement around {primary_factor} "
            f"without making the conversation feel confrontational."
        )
        tradeoff_line = (
            f"The goal would be to improve {primary_factor} while keeping {secondary_factor} in a comfortable range."
        )
    elif strategy == "friendly":
        action_line = (
            f"I’d keep it natural and positive, but still guide the discussion toward a better outcome on {primary_factor}."
        )
        tradeoff_line = (
            f"That way, you’re protecting {primary_factor} without losing sight of {secondary_factor}."
        )
    elif strategy == "analytical":
        action_line = (
            f"I’d anchor the response around trade-offs and show why improving {primary_factor} leads to a better overall result."
        )
        tradeoff_line = (
            f"If needed, I’d compare options side by side so {secondary_factor} stays competitive too."
        )
    elif strategy == "urgent":
        action_line = (
            f"I’d make a clear ask right away and focus the conversation on improving {primary_factor} as quickly as possible."
        )
        tradeoff_line = (
            f"The fastest strong outcome is one where {primary_factor} improves without unnecessary loss on {secondary_factor}."
        )
    else:
        action_line = (
            f"I’d take a practical approach and steer the negotiation toward a better position on {primary_factor}."
        )
        tradeoff_line = (
            f"At the same time, I’d make sure {secondary_factor} still holds up well in the final deal."
        )

    reply = f"""
{opening}

For this {topic_phrase} discussion, I’d {intent}.

{action_line}

{tradeoff_line}

A natural next message would be to ask for a concrete improvement, then see how much flexibility they actually have.
""".strip()

    reply = remove_repetitive_sentence(reply, previous_assistant_message)

    return {
        "reply": reply,
        "normalized_weights": normalized,
        "debug": {
            "strategy": strategy,
            "strategy_tone": strategy_tone,
            "topic": topic_text,
            "top_factors": top_factors,
            "history_count": len(chat_history),
        },
    }