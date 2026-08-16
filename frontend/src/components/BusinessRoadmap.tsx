import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Calendar, 
  Sparkles, 
  Layers, 
  MessageSquareQuote, 
  Copy, 
  Check,
  Globe,
  Share2
} from 'lucide-react';
import { MarketResearchData, BusinessPlanData, CopywritingData } from '../services/api';

interface BusinessRoadmapProps {
  marketResearch?: MarketResearchData;
  businessPlan?: BusinessPlanData;
  copywriting?: CopywritingData;
}

export const BusinessRoadmap: React.FC<BusinessRoadmapProps> = ({
  marketResearch,
  businessPlan,
  copywriting,
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'market' | 'copy'>('roadmap');
  const [copiedPitch, setCopiedPitch] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel border border-dark-800 overflow-hidden shadow-xl bg-dark-950/70">
      
      {/* View Switcher Tabs */}
      <div className="px-6 pt-4 border-b border-dark-800 bg-dark-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'roadmap'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>12-Month Plan & Financials</span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'market'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Market Research & Moat</span>
          </button>

          <button
            onClick={() => setActiveTab('copy')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'copy'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>Copywriting & Marketing</span>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">

        {/* TAB 1: 12-Month Roadmap & Financials */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6 animate-fadeIn">
            {businessPlan ? (
              <>
                {/* Executive Summary Card */}
                <div className="p-5 rounded-xl bg-dark-900/80 border border-dark-800">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-primary-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Executive Thesis
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {businessPlan.executive_summary}
                  </p>
                </div>

                {/* Key Financial KPIs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl glass-panel border border-dark-800">
                    <div className="text-slate-400 text-xs font-medium mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary-400" /> Est. CAC
                    </div>
                    <div className="text-xl font-bold text-white">
                      {businessPlan.financial_model.estimated_cac}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl glass-panel border border-dark-800">
                    <div className="text-slate-400 text-xs font-medium mb-1 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Est. LTV
                    </div>
                    <div className="text-xl font-bold text-emerald-400">
                      {businessPlan.financial_model.estimated_ltv}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl glass-panel border border-dark-800">
                    <div className="text-slate-400 text-xs font-medium mb-1 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-cyan-400" /> Breakeven
                    </div>
                    <div className="text-xl font-bold text-cyan-400">
                      Month {businessPlan.financial_model.breakeven_month}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl glass-panel border border-dark-800">
                    <div className="text-slate-400 text-xs font-medium mb-1 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-purple-400" /> Margin Ratio
                    </div>
                    <div className="text-xl font-bold text-purple-400">
                      82% Gross
                    </div>
                  </div>
                </div>

                {/* Quarterly Roadmap Timeline */}
                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary-400" /> 12-Month Milestone Roadmap
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businessPlan.milestones.map((m, idx) => (
                      <div key={idx} className="p-5 rounded-xl bg-dark-900/60 border border-dark-800 hover:border-dark-700 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-1 rounded-md bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-bold font-mono">
                            {m.quarter}
                          </span>
                          <span className="text-xs font-semibold text-slate-300">
                            {m.focus}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Key Deliverables:</div>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {m.goals.map((g, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-primary-400 mt-0.5">•</span>
                                <span>{g}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {m.target_kpis && Object.keys(m.target_kpis).length > 0 && (
                          <div className="mt-4 pt-3 border-t border-dark-800 flex flex-wrap gap-2">
                            {Object.entries(m.target_kpis).map(([kpiName, val]) => (
                              <span key={kpiName} className="text-[11px] px-2 py-0.5 rounded bg-dark-850 text-slate-300 border border-dark-750">
                                <strong className="text-slate-400">{kpiName}:</strong> {val}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Tiers Table */}
                {businessPlan.financial_model.pricing_tiers && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-3">Formulated Pricing Tiers</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {businessPlan.financial_model.pricing_tiers.map((tier, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-dark-900/40 border border-dark-800 flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-slate-200">{tier.name}</div>
                            <div className="text-lg font-extrabold text-primary-400 my-1">{tier.price}</div>
                            <ul className="text-xs text-slate-400 space-y-1 mt-2">
                              {tier.features.map((f, i) => (
                                <li key={i}>✓ {f}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Sparkles className="w-8 h-8 mx-auto text-slate-600 mb-2 animate-pulse" />
                <p>Waiting for Business Planner agent execution...</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Market Research & Competitive Moat */}
        {activeTab === 'market' && (
          <div className="space-y-6 animate-fadeIn">
            {marketResearch ? (
              <>
                {/* Market Size & Demand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-dark-900/70 border border-dark-800">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> TAM / Market Opportunity
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {marketResearch.market_size_summary}
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-dark-900/70 border border-dark-800">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Demand Validation & Urgency
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {marketResearch.demand_validation}
                    </p>
                  </div>
                </div>

                {/* Competitors Matrix */}
                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary-400" /> Competitive Landscape & Differentiation
                  </h4>
                  <div className="space-y-3">
                    {marketResearch.competitors.map((comp, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-dark-900/60 border border-dark-800 hover:border-dark-700 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-slate-200 text-sm">{comp.name}</h5>
                          {comp.website && (
                            <span className="text-xs text-slate-500 font-mono">{comp.website}</span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3">
                          <div className="p-2.5 rounded-lg bg-dark-850 text-slate-300">
                            <span className="font-semibold text-emerald-400 block mb-1">Strengths:</span>
                            {comp.strengths.join(', ')}
                          </div>
                          <div className="p-2.5 rounded-lg bg-dark-850 text-slate-300">
                            <span className="font-semibold text-rose-400 block mb-1">Gaps / Weaknesses:</span>
                            {comp.weaknesses.join(', ')}
                          </div>
                          <div className="p-2.5 rounded-lg bg-primary-950/40 border border-primary-900/60 text-primary-200">
                            <span className="font-semibold text-primary-400 block mb-1">Our Moat:</span>
                            {comp.differentiation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Personas */}
                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" /> Ideal Customer Personas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {marketResearch.target_personas.map((p, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-dark-900/50 border border-dark-800">
                        <h5 className="font-bold text-white text-sm mb-2">{p.title}</h5>
                        <div className="space-y-2 text-xs text-slate-300">
                          <div>
                            <strong className="text-slate-400">Pain Points:</strong> {p.pain_points.join(', ')}
                          </div>
                          <div>
                            <strong className="text-slate-400">Willingness to Pay:</strong> {p.willingness_to_pay}
                          </div>
                          <div>
                            <strong className="text-slate-400">Acquisition Channels:</strong> {p.channels.join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Sparkles className="w-8 h-8 mx-auto text-slate-600 mb-2 animate-pulse" />
                <p>Waiting for Market Research agent execution...</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Copywriting & Marketing Messaging */}
        {activeTab === 'copy' && (
          <div className="space-y-6 animate-fadeIn">
            {copywriting ? (
              <>
                {/* Hero Headline Showcase */}
                <div className="p-6 rounded-xl bg-gradient-to-r from-primary-950/40 to-dark-900 border border-primary-800/40">
                  <div className="text-xs uppercase font-bold tracking-wider text-primary-400 mb-1">Generated Hero Positioning</div>
                  <h2 className="text-2xl font-extrabold text-white mt-1 mb-2">{copywriting.headline}</h2>
                  <p className="text-sm text-slate-300">{copywriting.subheadline}</p>
                  <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold text-xs shadow-md">
                    CTA: {copywriting.cta_text}
                  </div>
                </div>

                {/* 30-Second Elevator Pitch */}
                <div className="p-5 rounded-xl bg-dark-900/80 border border-dark-800 relative">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-accent-purple flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> 30-Second Elevator Pitch
                    </h4>
                    <button
                      onClick={() => copyToClipboard(copywriting.elevator_pitch)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                    >
                      {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPitch ? 'Copied' : 'Copy Pitch'}</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                    "{copywriting.elevator_pitch}"
                  </p>
                </div>

                {/* Value Propositions Grid */}
                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-3">Core Value Propositions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {copywriting.value_props.map((vp, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-dark-900/50 border border-dark-800">
                        <div className="font-bold text-primary-300 text-sm mb-1">{vp.feature}</div>
                        <div className="text-xs text-slate-400">{vp.benefit}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Viral Social Launch Hooks */}
                {copywriting.social_media_hooks && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-cyan-400" /> Launch Post Templates (X / LinkedIn)
                    </h4>
                    <div className="space-y-2">
                      {copywriting.social_media_hooks.map((hook, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-dark-900/60 border border-dark-800 text-xs text-slate-300 flex items-center justify-between gap-3">
                          <span className="font-mono">{hook}</span>
                          <button
                            onClick={() => copyToClipboard(hook)}
                            className="p-1.5 rounded hover:bg-dark-800 text-slate-400 hover:text-slate-200 shrink-0"
                            title="Copy hook"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Sparkles className="w-8 h-8 mx-auto text-slate-600 mb-2 animate-pulse" />
                <p>Waiting for Copywriter agent execution...</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
