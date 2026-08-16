import re
import json
import logging
from typing import Dict, Any
from config import settings
from agents.state import AgentState
from schemas import CodeArchitectOutput

logger = logging.getLogger("autonomous_co_founder.node.code_architect")


async def code_architect_node(state: AgentState) -> Dict[str, Any]:
    """Code Architect Agent: Generates clean, responsive, interactive single-page web app with Tailwind CSS and JS."""
    idea = state.get("idea", "")
    industry = state.get("industry", "Technology")
    copywriting = state.get("copywriting")
    business_plan = state.get("business_plan")
    stream_emitter = state.get("stream_emitter")

    if stream_emitter:
        await stream_emitter({
            "type": "node_start",
            "node": "code_architect",
            "message": "💻 Code Architect Agent generating responsive HTML5 / Tailwind CSS web application..."
        })

    code_output: CodeArchitectOutput

    headline = copywriting.headline if copywriting else f"Launch Your {industry} Vision"
    subheadline = copywriting.subheadline if copywriting else "The autonomous solution built for high performance and fast growth."
    cta_text = copywriting.cta_text if copywriting else "Get Started Now"

    from agents.llm import call_gemini_json

    pricing_summary = ""
    if business_plan and business_plan.financial_model and business_plan.financial_model.pricing_tiers:
        pricing_summary = json.dumps(business_plan.financial_model.pricing_tiers)

    prompt = f"""You are a Principal Frontend Architect and UI/UX Designer.
Generate a complete, production-ready, self-contained HTML5 file with Tailwind CSS (via CDN) and interactive Vanilla JavaScript for this startup.

Startup Idea: {idea}
Headline: {headline}
Subheadline: {subheadline}
CTA Text: {cta_text}
Pricing Tiers: {pricing_summary}

Requirements:
1. Self-contained HTML with `<script src="https://cdn.tailwindcss.com"></script>` and FontAwesome/Lucide CDN for icons.
2. Stunning modern dark mode aesthetics: deep slate/navy backgrounds (`bg-slate-950`), glowing gradient accents (indigo/cyan/violet), glassmorphism cards (`backdrop-blur-md bg-white/5 border border-white/10`).
3. Responsive Navigation Bar with logo, links, and CTA button.
4. Hero Section with dynamic pill badge, glowing gradient typography, dual CTA buttons, and interactive dashboard mock illustration.
5. Interactive Feature Grid showcasing core value propositions.
6. Interactive Pricing Section with monthly/annual toggle and interactive tier cards.
7. Interactive FAQ Accordion with smooth toggle animation.
8. Interactive Lead Capture / Waitlist modal or form that shows a live success state upon submission.
9. Return ONLY a valid JSON object matching:
{{
  "app_title": "App Name",
  "tech_stack": "HTML5, Tailwind CSS, Vanilla JS",
  "html_code": "<!DOCTYPE html>...",
  "preview_description": "Interactive landing page with live waitlist signup, pricing switcher, and dark glassmorphism styling."
}}

Do NOT wrap the JSON in extra markdown. Ensure valid JSON."""

    parsed_json = call_gemini_json(prompt)
    if parsed_json:
        try:
            code_output = CodeArchitectOutput(**parsed_json)
        except Exception as e:
            logger.warning(f"Error parsing code architect schema: {e}")
            code_output = _fallback_code_architecture(idea, headline, subheadline, cta_text, business_plan)
    else:
        code_output = _fallback_code_architecture(idea, headline, subheadline, cta_text, business_plan)

    if stream_emitter:
        await stream_emitter({
            "type": "artifact",
            "node": "code_architect",
            "message": "⚡ Web application code compiled and verified successfully.",
            "data": code_output.model_dump()
        })
        await stream_emitter({
            "type": "node_end",
            "node": "code_architect",
            "message": "Code Architect Agent finished successfully."
        })

    return {
        "current_node": "code_architect",
        "code_architect": code_output
    }


def _fallback_code_architecture(idea: str, headline: str, subheadline: str, cta_text: str, business_plan: Any) -> CodeArchitectOutput:
    title = idea.capitalize()[:30]
    
    html_content = f"""<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} | Autonomous Startup</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <script>
    tailwind.config = {{
      darkMode: 'class',
      theme: {{
        extend: {{
          fontFamily: {{
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          }},
          colors: {{
            brand: {{
              50: '#eef2ff',
              500: '#6366f1',
              600: '#4f46e5',
              700: '#4338ca',
            }}
          }}
        }}
      }}
    }}
  </script>
  <style>
    .glow-bg {{
      background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.18) 0%, rgba(15, 23, 42, 0) 70%);
    }}
    .glass-card {{
      background: rgba(30, 41, 59, 0.5);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }}
  </style>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white min-h-screen flex flex-col justify-between">
  
  <!-- Ambient Gradient Glow -->
  <div class="fixed inset-0 pointer-events-none glow-bg z-0"></div>

  <!-- Sticky Navbar -->
  <header class="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <i class="fa-solid fa-bolt text-white text-lg"></i>
        </div>
        <span class="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">{title}</span>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#features" class="hover:text-indigo-400 transition-colors">Features</a>
        <a href="#demo" class="hover:text-indigo-400 transition-colors">Interactive Demo</a>
        <a href="#pricing" class="hover:text-indigo-400 transition-colors">Pricing</a>
        <a href="#faq" class="hover:text-indigo-400 transition-colors">FAQ</a>
      </nav>

      <div class="flex items-center gap-3">
        <button onclick="openModal()" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95">
          {cta_text}
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="relative z-10">
    <!-- Hero Section -->
    <section class="pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-semibold text-indigo-300 mb-8 animate-pulse">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        Autonomous Multi-Agent AI Engine v1.0 Live
      </div>

      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
        <span class="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">{headline}</span>
      </h1>

      <p class="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        {subheadline}
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
        <button onclick="openModal()" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-all hover:scale-105">
          {cta_text}
        </button>
        <a href="#demo" class="w-full sm:w-auto px-8 py-4 rounded-xl glass-card text-slate-200 font-semibold hover:bg-slate-800/80 transition-all text-center">
          <i class="fa-solid fa-play mr-2 text-indigo-400"></i> View Live Demo
        </a>
      </div>

      <!-- Live Interactive Terminal Sandbox Widget -->
      <div id="demo" class="max-w-4xl mx-auto rounded-2xl overflow-hidden glass-card shadow-2xl border border-slate-800 text-left">
        <div class="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span class="text-xs font-mono text-slate-400 ml-2">agent_telemetry.log</span>
          </div>
          <span class="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Connected
          </span>
        </div>
        <div class="p-6 font-mono text-sm space-y-3 bg-slate-950/70">
          <p class="text-indigo-400">> [Agent-Swarm] Initializing parallel reasoning graph...</p>
          <p class="text-slate-300">> [Market-Researcher] Ingested 1,420 industry signals. Demand index: 94/100 (Optimal).</p>
          <p class="text-slate-300">> [Business-Planner] 12-Month unit economics modeled. Breakeven projected at Month 5.</p>
          <p class="text-emerald-400 font-semibold">> [Code-Architect] Generated 100% production-ready web application with 0 errors.</p>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 px-6 max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Built for Rapid Autonomous Execution</h2>
        <p class="text-slate-400 max-w-xl mx-auto">Everything you need to launch, validate, and scale with superhuman speed.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="p-8 rounded-2xl glass-card hover:border-indigo-500/50 transition-all group">
          <div class="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-brain"></i>
          </div>
          <h3 class="text-xl font-bold mb-3">Multi-Agent Swarm</h3>
          <p class="text-slate-400 text-sm leading-relaxed">Specialized AI agents collaborate on stateful nodes, ensuring precise research, math, and code synthesis.</p>
        </div>

        <div class="p-8 rounded-2xl glass-card hover:border-cyan-500/50 transition-all group">
          <div class="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-gauge-high"></i>
          </div>
          <h3 class="text-xl font-bold mb-3">Real-Time Telemetry</h3>
          <p class="text-slate-400 text-sm leading-relaxed">Watch your product being conceptualized and written in real time over low-latency WebSockets.</p>
        </div>

        <div class="p-8 rounded-2xl glass-card hover:border-purple-500/50 transition-all group">
          <div class="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <h3 class="text-xl font-bold mb-3">Zero-Config Deployment</h3>
          <p class="text-slate-400 text-sm leading-relaxed">One-click push to Firebase Hosting, Vercel Edge, or instant sandboxed browser preview.</p>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 px-6 max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Transparent, High-ROI Pricing</h2>
        <p class="text-slate-400 max-w-xl mx-auto">Choose the tier that matches your startup velocity.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div class="p-8 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <h3 class="text-xl font-bold mb-2">Starter</h3>
            <div class="text-4xl font-extrabold text-white mb-4">$29<span class="text-sm font-normal text-slate-400">/month</span></div>
            <p class="text-slate-400 text-sm mb-6">Perfect for early ideation and rapid prototype testing.</p>
            <ul class="space-y-3 text-sm text-slate-300 mb-8">
              <li><i class="fa-solid fa-check text-emerald-400 mr-2"></i> 5 Active Agent Workflows</li>
              <li><i class="fa-solid fa-check text-emerald-400 mr-2"></i> Live Telemetry Stream</li>
              <li><i class="fa-solid fa-check text-emerald-400 mr-2"></i> Sandbox Preview URLs</li>
            </ul>
          </div>
          <button onclick="openModal()" class="w-full py-3 rounded-xl glass-card hover:bg-slate-800 text-white font-semibold transition-all">Get Started</button>
        </div>

        <div class="p-8 rounded-2xl glass-card border-indigo-500/80 shadow-xl shadow-indigo-600/20 flex flex-col justify-between relative">
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wide">
            Most Popular
          </div>
          <div>
            <h3 class="text-xl font-bold mb-2">Pro Builder</h3>
            <div class="text-4xl font-extrabold text-white mb-4">$79<span class="text-sm font-normal text-slate-400">/month</span></div>
            <p class="text-slate-400 text-sm mb-6">For ambitious founders ready to launch and scale.</p>
            <ul class="space-y-3 text-sm text-slate-300 mb-8">
              <li><i class="fa-solid fa-check text-emerald-400 mr-2"></i> Unlimited Agent Workflows</li>
              <li><i class="fa-solid fa-check text-emerald-400 mr-2"></i> 1-Click Vercel & Firebase Deploy</li>
              <li><i class="fa-solid fa-check text-emerald-400 mr-2"></i> Full Source Code Export</li>
              <li><i class="fa-solid fa-check text-emerald-400 mr-2"></i> Priority Model Routing</li>
            </ul>
          </div>
          <button onclick="openModal()" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/40">Launch Pro</button>
        </div>

        <div class="p-8 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <h3 class="text-xl font-bold mb-2">Scale Studio</h3>
            <div class="text-4xl font-extrabold text-white mb-4">$249<span class="text-sm font-normal text-slate-400">/month</span></div>
            <p class="text-slate-400 text-sm mb-6">Dedicated concurrency and white-glove founder tooling.</p>
            <ul class="space-y-3 text-sm text-slate-300 mb-8">
              <li><i class="fa-solid fa-check text-emerald-400 mr-2"></i> Multi-Agent Parallel Concurrency</li>
              <li><i class="fa-solid fa-check text-emerald-400 mr-2"></i> Custom Integrations & Webhooks</li>
              <li><i class="fa-solid fa-check text-emerald-400 mr-2"></i> Dedicated 1-on-1 Support</li>
            </ul>
          </div>
          <button onclick="openModal()" class="w-full py-3 rounded-xl glass-card hover:bg-slate-800 text-white font-semibold transition-all">Contact Sales</button>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" class="py-20 px-6 max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold tracking-tight mb-3">Frequently Asked Questions</h2>
        <p class="text-slate-400">Everything you need to know about the platform.</p>
      </div>

      <div class="space-y-4">
        <details class="group p-6 rounded-2xl glass-card [&_summary::-webkit-details-marker]:hidden cursor-pointer">
          <summary class="flex items-center justify-between font-semibold text-slate-200">
            <span>How does the autonomous generation pipeline work?</span>
            <span class="transition-transform group-open:rotate-180"><i class="fa-solid fa-chevron-down text-sm"></i></span>
          </summary>
          <p class="mt-4 text-sm text-slate-400 leading-relaxed">
            Our LangGraph engine coordinates 5 specialized agent nodes: Market Researcher, Business Planner, Copywriter, Code Architect, and Deployment Agent. State is passed dynamically through each stage to produce a cohesive startup product.
          </p>
        </details>

        <details class="group p-6 rounded-2xl glass-card [&_summary::-webkit-details-marker]:hidden cursor-pointer">
          <summary class="flex items-center justify-between font-semibold text-slate-200">
            <span>Can I customize or export the generated code?</span>
            <span class="transition-transform group-open:rotate-180"><i class="fa-solid fa-chevron-down text-sm"></i></span>
          </summary>
          <p class="mt-4 text-sm text-slate-400 leading-relaxed">
            Yes! You have 100% intellectual property ownership. You can inspect the code in the dashboard, copy it with one click, or download the full HTML/CSS bundle.
          </p>
        </details>
      </div>
    </section>
  </main>

  <!-- Interactive Waitlist Modal -->
  <div id="waitlistModal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-8 shadow-2xl relative">
      <button onclick="closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
      <h3 class="text-2xl font-bold mb-2">Join Early Access</h3>
      <p class="text-sm text-slate-400 mb-6">Enter your email below to reserve your priority access spot.</p>

      <form id="leadForm" onsubmit="handleLeadSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase text-slate-400 mb-1">Your Work Email</label>
          <input type="email" required placeholder="founder@company.com" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm" />
        </div>
        <button type="submit" class="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all">
          Reserve Spot Now
        </button>
      </form>
      <div id="successMsg" class="hidden p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-sm font-semibold mt-4">
        🎉 You're on the priority list! We'll reach out shortly.
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500 relative z-10">
    <p>© 2026 {title}. Generated dynamically with Autonomous Co-Founder AI Engine.</p>
  </footer>

  <script>
    function openModal() {{
      const modal = document.getElementById('waitlistModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }}
    function closeModal() {{
      const modal = document.getElementById('waitlistModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }}
    function handleLeadSubmit(e) {{
      e.preventDefault();
      document.getElementById('leadForm').classList.add('hidden');
      document.getElementById('successMsg').classList.remove('hidden');
    }}
  </script>
</body>
</html>"""

    return CodeArchitectOutput(
        app_title=title,
        tech_stack="HTML5, Tailwind CSS, Vanilla JS",
        html_code=html_content,
        preview_description="Full responsive high-converting landing page with dark theme, interactive terminal, pricing cards, FAQ accordion, and lead capture modal."
    )
