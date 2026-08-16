import json
import logging
from typing import Dict, Any
from config import settings
from agents.state import AgentState
from schemas import (
    BusinessPlanOutput,
    FinancialModel,
    MilestoneItem,
)

logger = logging.getLogger("autonomous_co_founder.node.business_planner")


async def business_planner_node(state: AgentState) -> Dict[str, Any]:
    """Business Planner Agent: Formulates monetization models, unit economics, financial budgets, and roadmaps."""
    idea = state.get("idea", "")
    industry = state.get("industry", "Technology")
    market_research = state.get("market_research")
    stream_emitter = state.get("stream_emitter")

    if stream_emitter:
        await stream_emitter({
            "type": "node_start",
            "node": "business_planner",
            "message": "📊 Business Planner Agent formulating 12-month financial model & operational roadmap..."
        })

    business_output: BusinessPlanOutput

    from agents.llm import call_gemini_json

    market_summary = market_research.market_size_summary if market_research else "High growth"

    prompt = f"""You are a Silicon Valley Chief Financial Officer and Startup Strategist.
Formulate a 12-month business plan and financial model for this startup idea:

Idea: {idea}
Industry: {industry}
Market Summary: {market_summary}

Respond ONLY with valid JSON matching this schema:
{{
  "executive_summary": "Crisp 2-sentence executive summary of the business strategy and revenue thesis",
  "revenue_streams": ["SaaS Tiered Subscriptions", "Usage-based Add-ons", "Enterprise Custom Integrations"],
  "financial_model": {{
    "pricing_tiers": [
      {{"name": "Starter", "price": "$29/mo", "features": ["Core generation", "1 Project", "Standard Support"]}},
      {{"name": "Pro", "price": "$79/mo", "features": ["Unlimited generations", "Custom domains", "Priority Telemetry"]}},
      {{"name": "Enterprise", "price": "$299/mo", "features": ["Dedicated agents", "Team seats", "SLA"]}}
    ],
    "estimated_cac": "$45",
    "estimated_ltv": "$480",
    "breakeven_month": 5,
    "monthly_budget_breakdown": {{
      "infrastructure_and_api": 450,
      "growth_and_marketing": 1200,
      "operations_and_tooling": 350
    }}
  }},
  "milestones": [
    {{
      "quarter": "Q1 (Months 1-3)",
      "focus": "Alpha Validation & Core Engine",
      "goals": ["Launch MVP to 100 beta users", "Achieve 40% Week-4 Retention", "Gather 25 customer interviews"],
      "target_kpis": {{"Beta Signups": "500", "Monthly Active Users": "150", "Initial MRR": "$1,200"}}
    }},
    {{
      "quarter": "Q2 (Months 4-6)",
      "focus": "Product-Market Fit & Monetization Launch",
      "goals": ["Roll out Pro tier billing", "Launch self-serve onboarding", "Reach cash-flow breakeven"],
      "target_kpis": {{"Paying Customers": "60", "MRR": "$5,500", "NPS": "> 60"}}
    }},
    {{
      "quarter": "Q3 (Months 7-9)",
      "focus": "Growth Channels & Distribution",
      "goals": ["Integrate affiliate flywheel", "Launch API platform", "Optimize CAC to under $40"],
      "target_kpis": {{"Total Users": "5,000", "MRR": "$18,000", "LTV/CAC": "> 4.5x"}}
    }},
    {{
      "quarter": "Q4 (Months 10-12)",
      "focus": "Scale & Enterprise Expansion",
      "goals": ["Deploy team collaboration workspace", "Close 10 Enterprise pilot contracts", "Prepare Series Seed round"],
      "target_kpis": {{"ARR": "$350,000", "Enterprise Customers": "15", "Net Revenue Retention": "125%"}}
    }}
  ]
}}

Respond ONLY with JSON."""

    parsed_json = call_gemini_json(prompt)
    if parsed_json:
        try:
            business_output = BusinessPlanOutput(**parsed_json)
        except Exception as e:
            logger.warning(f"Error parsing business plan schema: {e}")
            business_output = _fallback_business_plan()
    else:
        business_output = _fallback_business_plan()

    if stream_emitter:
        await stream_emitter({
            "type": "artifact",
            "node": "business_planner",
            "message": "📈 Business plan and 12-month financial model calculated.",
            "data": business_output.model_dump()
        })
        await stream_emitter({
            "type": "node_end",
            "node": "business_planner",
            "message": "Business Planner Agent finished successfully."
        })

    return {
        "current_node": "business_planner",
        "business_plan": business_output
    }


def _fallback_business_plan() -> BusinessPlanOutput:
    return BusinessPlanOutput(
        executive_summary="High-margin SaaS model powered by autonomous agent workflows with low initial compute overhead and product-led viral loops.",
        revenue_streams=[
            "Tiered Subscription SaaS (Starter / Pro / Agency)",
            "Usage-based Agent Run Credits",
            "Custom Domain & White-Label Add-ons"
        ],
        financial_model=FinancialModel(
            pricing_tiers=[
                {
                    "name": "Starter",
                    "price": "$29/mo",
                    "features": ["5 Active Workflows", "Live Telemetry", "Standard Subdomain Hosting", "Community Support"]
                },
                {
                    "name": "Pro Builder",
                    "price": "$79/mo",
                    "features": ["Unlimited Workflows", "Custom Domain Deployment", "Full Source Code Export", "Priority Support"]
                },
                {
                    "name": "Scale & Studio",
                    "price": "$249/mo",
                    "features": ["Multi-Agent Concurrency", "Dedicated API Keys", "Custom Integrations", "1-on-1 Founder Strategy"]
                }
            ],
            estimated_cac="$42",
            estimated_ltv="$520",
            breakeven_month=5,
            monthly_budget_breakdown={
                "Cloud Compute & LLM APIs": 400,
                "Growth, Ads & Influencer Co-marketing": 1100,
                "Domain, Tools & Payment Processing": 250
            }
        ),
        milestones=[
            MilestoneItem(
                quarter="Q1 (Months 1-3)",
                focus="MVP Launch & Initial Cohort Retention",
                goals=["Launch public beta to indie founder communities", "Achieve 45% Day-30 retention", "Collect first 50 paid user reviews"],
                target_kpis={"Beta Signups": "800", "Paying Subs": "25", "MRR": "$1,975"}
            ),
            MilestoneItem(
                quarter="Q2 (Months 4-6)",
                focus="Product-Market Fit & Monetization Acceleration",
                goals=["Ship one-click Vercel & Firebase deployments", "Automate viral share loops", "Reach positive unit economics"],
                target_kpis={"Paying Subs": "95", "MRR": "$7,500", "LTV/CAC": "3.8x"}
            ),
            MilestoneItem(
                quarter="Q3 (Months 7-9)",
                focus="Scale Acquisition & Growth Channels",
                goals=["Launch affiliate partner program", "Publish 20 SEO programmatic landing pages", "Integrate automated email nurture"],
                target_kpis={"Active Founders": "6,500", "MRR": "$24,000", "Churn": "< 3.5%"}
            ),
            MilestoneItem(
                quarter="Q4 (Months 10-12)",
                focus="Enterprise & Full Autonomous Suite Expansion",
                goals=["Launch team collaboration spaces", "Integrate advanced custom agent nodes", "Target $350K ARR milestone"],
                target_kpis={"ARR": "$320,000", "Net Retention": "128%", "Gross Margin": "84%"}
            )
        ]
    )
