import json
import logging
from typing import AsyncGenerator
from services.ai.base import AIProvider

logger = logging.getLogger(__name__)


class OllamaCloudProvider(AIProvider):
    """
    Provider for Ollama Cloud hosted inference.
    Uses the native Ollama API at https://ollama.com/api
    (NOT the OpenAI-compatible /v1 endpoint).
    """

    def __init__(self, api_key: str, model: str = "llama3.3:70b", base_url: str = "https://ollama.com/api"):
        import httpx
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(120.0, connect=15.0),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )

    def _build_messages(self, prompt: str, system: str) -> list:
        msgs = []
        if system:
            msgs.append({"role": "system", "content": system})
        msgs.append({"role": "user", "content": prompt})
        return msgs

    async def complete(self, prompt: str, system: str = "") -> str:
        url = f"{self.base_url}/chat"
        payload = {
            "model": self.model,
            "messages": self._build_messages(prompt, system or self.SYSTEM_GM),
            "stream": False,
        }
        try:
            logger.info(f"Ollama Cloud request: model={self.model}, url={url}")
            resp = await self.client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            content = data.get("message", {}).get("content", "")
            if not content:
                logger.warning(f"Ollama Cloud returned empty content: {data}")
                raise ValueError("Ollama Cloud returned empty response")
            return content
        except Exception as e:
            logger.error(f"Ollama Cloud API error: {e}")
            raise RuntimeError(f"Ollama Cloud API failed: {e}") from e

    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        url = f"{self.base_url}/chat"
        payload = {
            "model": self.model,
            "messages": self._build_messages(prompt, system or self.SYSTEM_GM),
            "stream": True,
        }
        try:
            async with self.client.stream("POST", url, json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        chunk = json.loads(line)
                        content = chunk.get("message", {}).get("content", "")
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            logger.error(f"Ollama Cloud stream error: {e}")
            raise RuntimeError(f"Ollama Cloud stream failed: {e}") from e

    async def close(self):
        await self.client.aclose()
