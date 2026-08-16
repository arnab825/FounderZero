import json
import logging
from typing import Optional, Dict, Any, List
from config import settings

logger = logging.getLogger("autonomous_co_founder.llm")

# Gemini Model Chain
FALLBACK_MODELS = [
    settings.GEMINI_MODEL,
    "gemini-3.7-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
]


def call_gemini_json(prompt: str, model_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Calls Google Gemini API with structured JSON output and automatic model fallback."""
    if not settings.GEMINI_API_KEY:
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to configure google.generativeai: {e}")
        return None

    models_to_try = [model_name] if model_name else []
    for m in FALLBACK_MODELS:
        if m and m not in models_to_try:
            models_to_try.append(m)

    for current_model in models_to_try:
        try:
            model = genai.GenerativeModel(
                model_name=current_model,
                generation_config={"response_mime_type": "application/json"}
            )
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            
            # Clean markdown code blocks if any
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            parsed = json.loads(raw_text.strip())
            logger.info(f"Successfully generated response using model: {current_model}")
            return parsed
        except Exception as e:
            logger.warning(f"Gemini call with model '{current_model}' failed: {e}. Trying next model...")

    return None
