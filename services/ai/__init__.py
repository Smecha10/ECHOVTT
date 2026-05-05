from config import settings
from services.ai.base import AIProvider

_provider: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    global _provider
    if _provider is not None:
        return _provider

    if settings.ai_provider == "anthropic" and settings.anthropic_api_key:
        from services.ai.anthropic_provider import AnthropicProvider
        _provider = AnthropicProvider(settings.anthropic_api_key, settings.ai_model or "claude-opus-4-7")

    elif settings.ai_provider in ("openai", "openai_compatible") and settings.openai_api_key:
        from services.ai.openai_provider import OpenAIProvider
        _provider = OpenAIProvider(settings.openai_api_key, settings.ai_model or "gpt-4o", settings.openai_base_url)

    elif settings.ai_provider == "ollama":
        from services.ai.ollama_provider import OllamaProvider
        _provider = OllamaProvider(
            model=settings.ai_model or settings.ollama_model,
            base_url=settings.ollama_base_url,
        )

    elif settings.ai_provider == "ollama_cloud" and settings.ollama_cloud_api_key:
        from services.ai.ollama_cloud_provider import OllamaCloudProvider
        _provider = OllamaCloudProvider(
            api_key=settings.ollama_cloud_api_key,
            model=settings.ai_model or settings.ollama_cloud_model,
            base_url=settings.ollama_cloud_base_url,
        )

    else:
        from services.ai.mock_provider import MockProvider
        _provider = MockProvider()

    return _provider


def reset_provider():
    global _provider
    _provider = None
