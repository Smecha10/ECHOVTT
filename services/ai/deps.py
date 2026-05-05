from typing import Annotated
from fastapi import Header
from services.ai.base import AIProvider


def ai_provider_dep(
    x_ai_provider: Annotated[str | None, Header()] = None,
    x_ai_key: Annotated[str | None, Header()] = None,
    x_ai_model: Annotated[str | None, Header()] = None,
    x_ai_base_url: Annotated[str | None, Header()] = None,
) -> AIProvider:
    """
    Per-request AI provider. Client sends X-AI-* headers from their own
    API key stored in localStorage — nothing is persisted server-side.
    Falls back to the server's .env config when no headers are present.
    """
    if x_ai_provider:
        if x_ai_provider == "anthropic" and x_ai_key:
            from services.ai.anthropic_provider import AnthropicProvider
            return AnthropicProvider(x_ai_key, x_ai_model or "claude-opus-4-7")

        if x_ai_provider in ("openai", "openai_compatible") and x_ai_key:
            from services.ai.openai_provider import OpenAIProvider
            return OpenAIProvider(
                x_ai_key,
                x_ai_model or "gpt-4o",
                x_ai_base_url or "https://api.openai.com/v1",
            )

        if x_ai_provider == "ollama_cloud" and x_ai_key:
            from services.ai.ollama_cloud_provider import OllamaCloudProvider
            return OllamaCloudProvider(
                api_key=x_ai_key,
                model=x_ai_model or "llama3.3:70b",
                base_url=x_ai_base_url or "https://ollama.com/api",
            )

        if x_ai_provider == "ollama":
            from services.ai.ollama_provider import OllamaProvider
            return OllamaProvider(
                model=x_ai_model or "llama3.2",
                base_url=x_ai_base_url or "http://localhost:11434/v1",
            )

    from services.ai import get_ai_provider
    return get_ai_provider()
