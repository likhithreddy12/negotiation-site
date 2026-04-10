from typing import Dict, List
import random


STRATEGY_STYLES = {
    "tough": {
        "greeting": [
            "Let’s be direct.",
            "I’d handle this firmly.",
            "We should push back here.",
        ],
        "tone_words": ["firmly", "directly", "with confidence"],
    },
    "soft": {
        "greeting": [
            "Let’s take a calm approach.",
            "We can handle this smoothly.",
            "I’d keep this cooperative.",
        ],
        "tone_words": ["carefully", "cooperatively", "calmly"],
    },
    "friendly": {
        "greeting": [
            "I understand where you're coming from.",
            "That makes sense.",
            "I’d keep this warm but smart.",
        ],
        "tone_words": ["naturally", "politely", "in a friendly way"],
    },
    "analytical": {
        "greeting": [
            "Let’s look at this practically.",
            "I’d break this down logically.",
            "The best move is to focus on the trade-offs.",
        ],
        "tone_words": ["logically", "carefully", "with clear reasoning"],
    },
    "urgent": {
        "greeting": [
            "We should move quickly.",
            "I’d keep this short and direct.",
            "The fastest path is to make a clear ask.",
        ],
        "tone_words": ["quickly", "directly", "without delay"],
    },
    "balanced": {
        "greeting": [
            "Let’s take a balanced approach.",
            "I’d handle this in a practical way.",
            "There’s a fair way to move this forward.",
        ],
        "tone_words": ["practically", "fairly", "steadily"],
    },
}


TOPIC_FALLBACKS = {
    "car negotiation": ["price", "reliability", "fuel efficiency", "performance", "safety"],
    "laptop negotiation": ["price", "performance", "battery life", "storage", "portability"],
    "phone negotiation": ["price", "battery life", "camera", "performance", "durability"],
    "mobile negotiation": ["price", "battery life", "camera", "performance", "durability"],
    "rent negotiation": ["rent", "location", "amenities", "lease flexibility", "maintenance"],
    "general negotiation": ["price", "quality", "flexibility", "support", "value"],
}


def normalize_weights(weights: Dict[str, float]) -> Dict[str, float]:
    if not weights:
        return {}

    cleaned: Dict[str, float] = {}
    for key, value in weights.items():
        try:
            cleaned[str(key)] = max(float(value), 0.0)
        except (TypeError, ValueError):
            cleaned[str(key)] = 0.0

    total = sum(cleaned.values())
    if total <= 0:
        default_value = round(1 / len(cleaned), 3) if cleaned else 0.0
        return {key: default_value for key in cleaned}

    return {key: round(value / total, 3) for key, value in cleaned.items()}


def prettify_label(label: str) -> str:
    text = str(label).replace("_", " ").replace("-", " ").strip().lower()

    # small cleanup for common merged labels
    text = text.replace("batterylife", "battery life")
    text = text.replace("leaseflexibility", "lease flexibility")
    text = text.replace("fuelffficiency", "fuel efficiency")

    return text


def get_top_factors(normalized: Dict[str, float], topic: str) -> List[str]:
    sorted_items = sorted(normalized.items(), key=lambda item: item[1], reverse=True)
    labels = [prettify_label(key) for key, _ in sorted_items]

    if len(labels) >= 2:
        return labels[:2]

    fallback = TOPIC_FALLBACKS.get(topic.lower().strip(), TOPIC_FALLBACKS["general negotiation"])

    if len(labels) == 1:
        second = next((item for item in fallback if item != labels[0]), "overall value")
        return [labels[0], second]

    return fallback[:2]


def get_recent_user_messages(chat_history: List[Dict], limit: int = 3) -> List[str]:
    user_messages = [
        str(msg.get("content", "")).strip()
        for msg in chat_history
        if str(msg.get("role", "")).lower() == "user"
    ]
    return user_messages[-limit:]


def detect_intent(user_message: str, topic: str) -> str:
    text = user_message.lower().strip()
    topic_lower = topic.lower().strip()

    if any(word in text for word in ["hi", "hello", "hey", "are you there"]):
        return "greeting"

    if any(word in text for word in ["what do you suggest", "suggest", "recommend", "advice"]):
        return "suggestion"

    if any(word in text for word in ["price", "cost", "cheap", "expensive", "discount", "lower", "reduce"]):
        return "price_push"

    if any(word in text for word in ["too high", "still high", "not good", "too much", "not enough"]):
        return "push_harder"

    if "rent" in topic_lower:
        if any(word in text for word in ["lease", "term", "contract", "months"]):
            return "lease_terms"
        if any(word in text for word in ["maintenance", "repair", "fix"]):
            return "maintenance"
        if any(word in text for word in ["amenities", "parking", "gym", "utilities"]):
            return "amenities"

    if "car" in topic_lower:
        if any(word in text for word in ["mileage", "fuel", "mpg"]):
            return "efficiency"
        if any(word in text for word in ["safe", "safety"]):
            return "safety"
        if any(word in text for word in ["performance", "horsepower", "engine"]):
            return "performance"

    if any(word in text for word in ["compare", "comparison", "better option", "alternative"]):
        return "comparison"

    return "general"


def build_strategy_prefix(strategy: str, has_history: bool) -> str:
    style = STRATEGY_STYLES.get(strategy, STRATEGY_STYLES["balanced"])
    choices = style["greeting"]

    if has_history and len(choices) > 1:
        return choices[1]
    return choices[0]


def build_topic_phrase(topic: str) -> str:
    cleaned = topic.strip().lower() if topic else "general negotiation"
    if cleaned.endswith(" negotiation"):
        return cleaned.replace(" negotiation", "")
    return cleaned


def pick_response(options: List[str], recent_assistant_text: str) -> str:
    for option in options:
        if option.strip().lower() != recent_assistant_text.strip().lower():
            return option
    return options[0]


def generate_negotiation_reply(
    topic: str,
    strategy: str,
    weights: Dict[str, float],
    user_message: str,
    chat_history: List[Dict],
):
    topic_text = topic.strip() if topic else "general negotiation"
    topic_phrase = build_topic_phrase(topic_text)
    normalized = normalize_weights(weights)
    top_factors = get_top_factors(normalized, topic_text)

    primary = top_factors[0]
    secondary = top_factors[1]

    recent_user_messages = get_recent_user_messages(chat_history)
    has_history = len(chat_history) > 1

    recent_assistant_message = ""
    for msg in reversed(chat_history):
      if str(msg.get("role", "")).lower() == "assistant":
          recent_assistant_message = str(msg.get("content", "")).strip()
          break

    intent = detect_intent(user_message, topic_text)
    prefix = build_strategy_prefix(strategy, has_history)

    if intent == "greeting":
        reply_options = [
            f"{prefix} What part of this {topic_phrase} deal do you want to improve first?",
            f"{prefix} Tell me which part of the {topic_phrase} deal feels weakest to you right now.",
            f"{prefix} What exactly do you want to negotiate — {primary}, {secondary}, or the overall deal?",
        ]

    elif intent == "suggestion":
        if strategy == "tough":
            reply_options = [
                f"{prefix} I’d start by pushing hard on {primary}. Make a clear ask, and do not accept the first offer too quickly.",
                f"{prefix} My suggestion is to challenge them on {primary} first, then only discuss {secondary} if it helps you gain leverage.",
            ]
        elif strategy == "soft":
            reply_options = [
                f"{prefix} I’d begin with a polite ask around {primary}, then try to improve {secondary} without making the conversation tense.",
                f"{prefix} My suggestion is to ask for a better outcome on {primary} first and keep the discussion flexible around {secondary}.",
            ]
        elif strategy == "friendly":
            reply_options = [
                f"{prefix} I’d focus on {primary} first, but I’d say it in a natural and friendly way so the conversation stays open.",
                f"{prefix} I’d ask for improvement on {primary} and keep {secondary} in view without sounding too aggressive.",
            ]
        elif strategy == "analytical":
            reply_options = [
                f"{prefix} I’d anchor the conversation around {primary}, because that gives you the strongest value gain while still protecting {secondary}.",
                f"{prefix} The most practical move is to negotiate {primary} first, then use {secondary} as a trade-off point if needed.",
            ]
        elif strategy == "urgent":
            reply_options = [
                f"{prefix} I’d go straight at {primary} first and make a clear ask quickly.",
                f"{prefix} The fastest move is to push on {primary} now, then close only if {secondary} still looks strong.",
            ]
        else:
            reply_options = [
                f"{prefix} I’d focus on improving {primary} first, while making sure {secondary} still holds up in the final deal.",
                f"{prefix} My suggestion is to negotiate {primary} first and use {secondary} as your backup priority.",
            ]

    elif intent == "price_push":
        if "rent" in topic_text.lower():
            reply_options = [
                f"{prefix} If the rent feels high, I’d ask for a lower monthly amount first and then see whether they can improve {secondary} too.",
                f"{prefix} I’d challenge the rent directly. That gives you the strongest opening without losing focus on {secondary}.",
            ]
        else:
            reply_options = [
                f"{prefix} If price is the issue, I’d push for a reduction there first and make sure {secondary} does not get worse.",
                f"{prefix} I’d challenge the current pricing and try to improve the deal without sacrificing {secondary}.",
            ]

    elif intent == "push_harder":
        reply_options = [
            f"{prefix} Then I would not settle yet. Push harder on {primary} — that is where your strongest leverage is right now.",
            f"{prefix} If the current offer still feels weak, keep pressing on {primary} and only move forward if {secondary} stays competitive.",
        ]

    elif intent == "lease_terms":
        reply_options = [
            f"{prefix} I’d negotiate the lease terms more carefully and use {primary} as the main point of pressure.",
            f"{prefix} The lease terms are worth pushing on, especially if improving them also strengthens {primary}.",
        ]

    elif intent == "maintenance":
        reply_options = [
            f"{prefix} I’d ask for stronger maintenance support and make it part of the value discussion around {primary}.",
            f"{prefix} Maintenance matters here, so I’d push for clearer support while keeping the deal strong on {primary}.",
        ]

    elif intent == "amenities":
        reply_options = [
            f"{prefix} I’d protect the amenities that matter most and still ask for a better outcome on {primary}.",
            f"{prefix} The smart move is to keep the useful amenities in place while improving {primary}.",
        ]

    elif intent == "efficiency":
        reply_options = [
            f"{prefix} I’d bring fuel efficiency into the conversation and use it to strengthen your position on {primary}.",
            f"{prefix} If efficiency matters here, I’d make that part of the negotiation while still protecting {secondary}.",
        ]

    elif intent == "safety":
        reply_options = [
            f"{prefix} I’d make safety part of the deal discussion and not let them ignore it while you negotiate {primary}.",
            f"{prefix} Safety is worth holding onto, so I’d push on {primary} without weakening that part of the offer.",
        ]

    elif intent == "performance":
        reply_options = [
            f"{prefix} I’d bring performance into the conversation only if it helps you gain a better position on {primary}.",
            f"{prefix} The best move is to use performance as leverage while keeping the focus on {primary}.",
        ]

    elif intent == "comparison":
        reply_options = [
            f"{prefix} I’d compare this option against alternatives and use that comparison to push for better {primary}.",
            f"{prefix} A comparison helps here because it puts pressure on them to improve {primary} without losing {secondary}.",
        ]

    else:
        if strategy == "tough":
            reply_options = [
                f"{prefix} I’d keep the pressure on {primary} and avoid giving up too much on {secondary}.",
                f"{prefix} The right move is to push the deal toward better {primary} and make them work harder to keep your interest.",
            ]
        elif strategy == "soft":
            reply_options = [
                f"{prefix} I’d guide the deal toward better {primary} while keeping the discussion comfortable around {secondary}.",
                f"{prefix} I’d ask for improvement on {primary} in a cooperative way and keep {secondary} in a reasonable range.",
            ]
        elif strategy == "friendly":
            reply_options = [
                f"{prefix} I’d keep it natural, but I’d still steer the discussion toward better {primary}.",
                f"{prefix} I’d talk it through in a friendly way while making sure {primary} gets improved.",
            ]
        elif strategy == "analytical":
            reply_options = [
                f"{prefix} I’d focus on the trade-off between {primary} and {secondary}, because that is where the negotiation value is.",
                f"{prefix} The practical move is to improve {primary} first while keeping {secondary} competitive.",
            ]
        elif strategy == "urgent":
            reply_options = [
                f"{prefix} I’d make a clear ask on {primary} right now and keep the discussion moving.",
                f"{prefix} The fastest useful move is to push for better {primary} without letting {secondary} slip too far.",
            ]
        else:
            reply_options = [
                f"{prefix} I’d move the deal toward better {primary} while still protecting {secondary}.",
                f"{prefix} The next smart step is to improve {primary} first and keep {secondary} strong enough in the final outcome.",
            ]

    reply = pick_response(reply_options, recent_assistant_message)

    # light memory-based follow-up
    if len(recent_user_messages) >= 2 and intent not in {"greeting", "suggestion"}:
        previous_user = recent_user_messages[-2].lower()
        if previous_user != user_message.lower():
            if strategy in {"friendly", "balanced", "soft"}:
                reply += " That would keep the conversation moving in a more realistic direction."
            elif strategy == "tough":
                reply += " I would stay firm until they show real flexibility."
            elif strategy == "analytical":
                reply += " That gives you a stronger negotiation position based on the trade-offs."

    return {
        "reply": reply,
        "normalized_weights": normalized,
        "debug": {
            "topic": topic_text,
            "strategy": strategy,
            "top_factors": top_factors,
            "history_count": len(chat_history),
        },
    }