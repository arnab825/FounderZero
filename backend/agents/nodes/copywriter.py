import json
import logging
from typing import Dict, Any
from config import settings
from agents.state import AgentState
from schemas import CopywritingOutput

logger = logging.getLogger("autonomous_co_founder.node.copywriter")


async def copywriter_node(state: AgentState) -> Dict[str, Any]:
    """Copywriter Agent: Formulates high-converting brand messaging, landing page copy, value propositions and viral launch hooks."""
    idea = state.get("idea", "")
    industry = state.get("industry", "Technology")
    market_research = state.get("market_research")
    business_plan = state.get("business_plan")
    stream_emitter = state.get("stream_emitter")

    if stream_emitter:
        await stream_emitter({
            "type": "node_start",
            "node": "copywriter",
            "message": "✍️ Copywriter Agent drafting conversion-optimized brand positioning & landing page copy..."
        })

    copy_output: CopywritingOutput

    from agents.llm import call_gemini_json

    personas_summary = ""
    if market_research and market_research.target_personas:
        personas_summary = ", ".join([p.title for p in market_research.target_personas])

    prompt = f"""You are a world-class Direct-Response Copywriter and Startup Brand Strategist.
Craft persuasive, high-converting launch copy for this startup:

Idea: {idea}
Industry: {industry}
Target Audience: {personas_summary}

Respond ONLY with valid JSON matching this schema:
{{
  "headline": "Bold, punchy hero headline (under 12 words) focusing on the ultimate benefit",
  "subheadline": "Compelling 1-2 sentence subheadline explaining how it works and removes pain",
  "value_props": [
    {{"feature": "Feature Title 1", "benefit": "Clear customer outcome and time/money saved"}},
    {{"feature": "Feature Title 2", "benefit": "Clear customer outcome and time/money saved"}},
    {{"feature": "Feature Title 3", "benefit": "Clear customer outcome and time/money saved"}}
  ],
  "elevator_pitch": "Electrifying 30-second elevator pitch",
  "cta_text": "High-intent primary Call-to-Action button text (e.g., 'Launch in 60 Seconds — Free')",
  "faq_items": [
    {{"question": "How quickly can I get started?", "answer": "Answer explaining zero friction setup."}},
    {{"question": "How does it compare to traditional alternatives?", "answer": "Answer highlighting the 10x cost and speed advantage."}},
    {{"question": "Can I export or customize my results?", "answer": "Answer confirming full ownership and control."}}
  ],
  "social_media_hooks": [
    "🔥 We built the fastest way to turn raw ideas into live businesses. Here is the breakdown:",
    "💡 Why 90% of startups waste 3 months before launch (and how to launch in under 5 minutes):",
    "🚀 Just launched our autonomous engine on ProductHunt — check out the live preview!"
  ]
}}

Respond ONLY with JSON."""

    parsed_json = call_gemini_json(prompt)
    if parsed_json:
        try:
            copy_output = CopywritingOutput(**parsed_json)
        except Exception as e:
            logger.warning(f"Error parsing copywriting schema: {e}")
            copy_output = _fallback_copywriting(idea)
    else:
        copy_output = _fallback_copywriting(idea)

    if stream_emitter:
        await stream_emitter({
            "type": "artifact",
            "node": "copywriter",
            "message": "✨ Marketing copy, value propositions, and viral launch hooks generated.",
            "data": copy_output.model_dump()
        })
        await stream_emitter({
            "type": "node_end",
            "node": "copywriter",
            "message": "Copywriter Agent finished successfully."
        })

    return {
        "current_node": "copywriter",
        "copywriting": copy_output
    }


def _fallback_copywriting(idea: str) -> CopywritingOutput:
    clean_title = idea.capitalize()[:40]
    return CopywritingOutput(
        headline=f"Turn Ideas Into Live Reality with {clean_title}",
        subheadline="An autonomous multi-agent powerhouse that validates demand, builds your financial model, writes your copy, and generates code instantly.",
        value_props=[
            {
                "feature": "Multi-Agent Parallel Intelligence",
                "benefit": "Automate months of founder legwork across research, finances, copy, and code in under 60 seconds."
            },
            {
                "feature": "100% Ready-to-Deploy Codebase",
                "benefit": "Receive clean, responsive, modern code with zero external dependencies and instant live preview."
            },
            {
                "feature": "Data-Driven Unit Economics",
                "benefit": "Clear 12-month CAC/LTV forecasting, break-even timelines, and actionable quarterly milestones."
            }
        ],
        elevator_pitch=f"Most founders spend months and thousands of dollars validating concepts. Our platform automates market research, financial roadmaps, marketing assets, and code generation for '{idea}' with instant one-click live deployment.",
        cta_text="Start Free Trial — No Credit Card Required",
        faq_items=[
            {
                "question": "How fast does the autonomous engine work?",
                "answer": "The full multi-agent pipeline completes your market validation, business plan, copy, and functional code in less than 60 seconds."
            },
            {
                "question": "Do I own the generated code and business assets?",
                "answer": "Yes, 100% of the generated assets, code, financial spreadsheets, and marketing copy belong completely to you."
            },
            {
                "question": "Where can I deploy the generated web app?",
                "answer": "You can deploy directly to Firebase Hosting, Vercel, or run it immediately inside our sandboxed browser environment."
            }
        ],
        social_media_hooks=[
            f"🚀 Introducing the future of startup generation for {clean_title}. From zero to live product in under 60 seconds. Thread 👇",
            f"💡 What if your co-founder was an autonomous multi-agent swarm? Here is what we generated for {clean_title}:",
            f"⚡ We just went from raw idea to live deployed landing page with zero manual code. Check it out live!"
        ]
    )
