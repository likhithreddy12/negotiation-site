from typing import Any, Dict, List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from chatbot_engine import generate_negotiation_reply

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later lock this to localhost:3000 or your deployed URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    topic: str
    strategy: str
    weights: Dict[str, float]
    message: str
    history: List[ChatMessage] = Field(default_factory=list)


@app.get("/")
def root() -> Dict[str, str]:
    return {"message": "Backend is running"}


@app.post("/chat")
def chat(request: ChatRequest) -> Dict[str, Any]:
    cleaned_history = [
        {
            "role": msg.role.strip(),
            "content": msg.content.strip(),
        }
        for msg in request.history
        if msg.role and msg.content and msg.content.strip()
    ]

    cleaned_weights = {
        str(key).strip(): float(value)
        for key, value in request.weights.items()
    }

    result = generate_negotiation_reply(
        topic=request.topic.strip(),
        strategy=request.strategy.strip(),
        weights=cleaned_weights,
        user_message=request.message.strip(),
        chat_history=cleaned_history,
    )

    if isinstance(result, dict):
        reply = str(result.get("reply", "")).strip()
        return {
            **result,
            "reply": reply or "I understand. Tell me a bit more about what outcome you're hoping for.",
        }

    return {
        "reply": "I understand. Tell me a bit more about what outcome you're hoping for."
    }