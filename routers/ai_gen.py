import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from services.ai.base import AIProvider
from services.ai.deps import ai_provider_dep

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai", tags=["ai"])


class PromptRequest(BaseModel):
    prompt: str
    system: str = ""


class WizardStepRequest(BaseModel):
    step: str
    answers: dict = {}


class GenerateEnemiesRequest(BaseModel):
    context: str = ""
    count: int = 4
    difficulty: str = "medium"
    chronicle_config: dict = {}


class GenerateBestiaryRequest(BaseModel):
    chronicle_config: dict = {}
    count: int = 8


@router.post("/prompt")
async def free_prompt(req: PromptRequest, ai: AIProvider = Depends(ai_provider_dep)):
    result = await ai.complete(req.prompt, req.system or ai.SYSTEM_GM)
    return {"result": result}


@router.post("/wizard-step")
async def wizard_step(req: WizardStepRequest, ai: AIProvider = Depends(ai_provider_dep)):
    step_prompts = {
        "world": f"Given these world-building choices: {req.answers}\nGenerate 3-5 follow-up questions to deepen the world. Return JSON array of {{question, type (text|chips), options: []}}.",
        "story": f"Given this story setup: {req.answers}\nGenerate follow-up questions about plot hooks and stakes. Return JSON array.",
        "factions": f"For this world: {req.answers}\nGenerate faction names and descriptions. Return JSON array of {{name, description, alignment}}.",
        "scenes": f"For this setting: {req.answers}\nSuggest scene types. Return JSON.",
        "bestiary": f"For this world/tone: {req.answers}\nSuggest enemy archetypes. Return JSON.",
    }
    prompt = step_prompts.get(req.step, f"Respond to step {req.step} with {req.answers}. Return JSON.")
    result = await ai.complete(prompt, ai.SYSTEM_GM)
    return {"result": result}


@router.post("/portrait-prompt")
async def portrait_prompt(data: dict, ai: AIProvider = Depends(ai_provider_dep)):
    name = data.get("name", "")
    class_name = data.get("class_name", "")
    appearance = data.get("appearance_prompt", "")
    prompt = f"Write a DALL-E image generation prompt for: {name}, a {class_name} character. Appearance: {appearance}. Fantasy portrait, painterly, dark atmospheric lighting. No copyrighted characters."
    result = await ai.complete(prompt)
    return {"prompt": result}


@router.post("/npc")
async def generate_npc(data: dict, ai: AIProvider = Depends(ai_provider_dep)):
    result = await ai.generate_npc(data.get("context", ""), data.get("role", "merchant"))
    return result


@router.post("/test")
async def test_connection(ai: AIProvider = Depends(ai_provider_dep)):
    """Test the AI provider connection with a minimal prompt."""
    try:
        result = await ai.complete(
            "Respond with exactly this JSON: {\"status\": \"connected\", \"message\": \"ECHO VTT AI is ready.\"}",
            "You are a connection test. Respond with the exact JSON requested.",
        )
        provider_name = type(ai).__name__
        return {
            "success": True,
            "provider": provider_name,
            "response": result[:200],
        }
    except Exception as e:
        logger.error(f"AI connection test failed: {e}")
        return {
            "success": False,
            "provider": type(ai).__name__,
            "error": str(e),
        }


@router.post("/generate-enemies")
async def generate_enemies(req: GenerateEnemiesRequest, ai: AIProvider = Depends(ai_provider_dep)):
    """Generate enemies with full stat blocks, classes, and distance-aware stats."""
    context = req.context
    if not context and req.chronicle_config:
        context = req.chronicle_config.get("overview", req.chronicle_config.get("free_text", "a dangerous dungeon"))
    result = await ai.generate_encounter(context, req.difficulty, req.count)
    return result


@router.post("/generate-bestiary")
async def generate_bestiary(req: GenerateBestiaryRequest, ai: AIProvider = Depends(ai_provider_dep)):
    """Generate a full bestiary for a chronicle with varied enemy classes."""
    result = await ai.generate_bestiary(req.chronicle_config, req.count)
    return {"bestiary": result}
