from typing import AsyncGenerator
from services.ai.base import AIProvider


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o", base_url: str = "https://api.openai.com/v1"):
        from openai import AsyncOpenAI
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        self.model = model

    def _build_messages(self, prompt: str, system: str) -> list:
        msgs = []
        if system:
            msgs.append({"role": "system", "content": system})
        msgs.append({"role": "user", "content": prompt})
        return msgs

    async def complete(self, prompt: str, system: str = "") -> str:
        resp = await self.client.chat.completions.create(
            model=self.model,
            messages=self._build_messages(prompt, system or self.SYSTEM_GM),
            max_tokens=4096,
        )
        return resp.choices[0].message.content

    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        async with await self.client.chat.completions.create(
            model=self.model,
            messages=self._build_messages(prompt, system or self.SYSTEM_GM),
            max_tokens=4096,
            stream=True,
        ) as s:
            async for chunk in s:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
