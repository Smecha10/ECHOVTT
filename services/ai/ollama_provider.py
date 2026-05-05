import logging
from typing import AsyncGenerator
from services.ai.base import AIProvider

logger = logging.getLogger(__name__)


class OllamaProvider(AIProvider):
    def __init__(self, model: str = "llama3.2", base_url: str = "http://localhost:11434/v1"):
        from openai import AsyncOpenAI
        # Ollama's OpenAI-compatible endpoint requires no real key
        self.client = AsyncOpenAI(api_key="ollama", base_url=base_url)
        self.model = model

    def _messages(self, prompt: str, system: str) -> list:
        msgs = []
        if system:
            msgs.append({"role": "system", "content": system})
        msgs.append({"role": "user", "content": prompt})
        return msgs

    async def complete(self, prompt: str, system: str = "") -> str:
        try:
            resp = await self.client.chat.completions.create(
                model=self.model,
                messages=self._messages(prompt, system or self.SYSTEM_GM),
            )
            content = resp.choices[0].message.content
            if not content:
                logger.warning("Ollama returned empty content")
                raise ValueError("Ollama returned empty response")
            return content
        except Exception as e:
            logger.error(f"Ollama local API error: {e}")
            raise RuntimeError(f"Ollama local API failed: {e}") from e

    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        try:
            async with await self.client.chat.completions.create(
                model=self.model,
                messages=self._messages(prompt, system or self.SYSTEM_GM),
                stream=True,
            ) as s:
                async for chunk in s:
                    if chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"Ollama local stream error: {e}")
            raise RuntimeError(f"Ollama local stream failed: {e}") from e
