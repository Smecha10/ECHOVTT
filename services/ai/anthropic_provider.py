from typing import AsyncGenerator
from services.ai.base import AIProvider


class AnthropicProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "claude-opus-4-7"):
        import anthropic
        self.client = anthropic.AsyncAnthropic(api_key=api_key)
        self.model = model

    async def complete(self, prompt: str, system: str = "") -> str:
        msg = await self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=system or self.SYSTEM_GM,
            messages=[{"role": "user", "content": prompt}],
        )
        return msg.content[0].text

    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        async with self.client.messages.stream(
            model=self.model,
            max_tokens=4096,
            system=system or self.SYSTEM_GM,
            messages=[{"role": "user", "content": prompt}],
        ) as s:
            async for text in s.text_stream:
                yield text
