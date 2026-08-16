import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, Check, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { TelemetryLog } from '../hooks/useAgentWebSocket';

interface TerminalLogProps {
  logs: TelemetryLog[];
  currentNode: string;
  isFinished: boolean;
  isConnected: boolean;
}

const STAGES = [
  { id: 'market_research', label: 'Market Research' },
  { id: 'business_planner', label: 'Business & Financials' },
  { id: 'copywriter', label: 'Copywriting' },
  { id: 'code_architect', label: 'Code Synthesis' },
  { id: 'deployment', label: 'Live Deployment' },
];

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs, currentNode, isFinished, isConnected }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const copyTerminalLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.node || 'SYSTEM'}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStageIndex = (nodeId: string) => {
    const idx = STAGES.findIndex((s) => s.id === nodeId);
    return idx === -1 ? 0 : idx;
  };

  const currentStageIndex = isFinished ? STAGES.length : getStageIndex(currentNode);

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel border border-dark-800 overflow-hidden shadow-2xl bg-dark-950/90">
      
      {/* Pipeline Progress Stepper */}
      <div className="px-4 py-3 bg-dark-900/90 border-b border-dark-800 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-2 min-w-max">
          {STAGES.map((stage, idx) => {
            const isCompleted = isFinished || idx < currentStageIndex;
            const isCurrent = !isFinished && stage.id === currentNode;

            return (
              <React.Fragment key={stage.id}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : isCurrent
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40 ring-2 ring-primary-500/20 animate-pulse'
                      : 'bg-dark-850 text-slate-500 border border-dark-800'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-ping" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                  <span>{stage.label}</span>
                </div>
                {idx < STAGES.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pl-4">
          <button
            onClick={copyTerminalLogs}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-slate-200 text-xs border border-dark-750 transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Logs'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Title Bar */}
      <div className="px-4 py-2.5 bg-dark-900/60 border-b border-dark-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 ml-2 text-xs font-mono text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-primary-400" />
            <span>langgraph_agent_swarm.py</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className={`flex items-center gap-1.5 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            {isConnected ? 'STREAMING ACTIVE' : 'CONNECTING...'}
          </span>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div 
        onScroll={(e) => {
          const target = e.currentTarget;
          const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 40;
          setAutoScroll(isAtBottom);
        }}
        className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 select-text"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 py-12">
            <Sparkles className="w-8 h-8 text-primary-500/40 animate-spin" />
            <p className="font-sans text-sm">Initializing multi-agent graph & waiting for telemetry...</p>
          </div>
        ) : (
          logs.map((log) => {
            let badgeColor = 'text-slate-400 bg-slate-800/60 border-slate-700';
            let textColor = 'text-slate-300';

            if (log.type === 'node_start') {
              badgeColor = 'text-primary-400 bg-primary-950/60 border-primary-800/80';
              textColor = 'text-primary-200 font-semibold';
            } else if (log.type === 'artifact') {
              badgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
              textColor = 'text-emerald-300 font-semibold';
            } else if (log.type === 'error') {
              badgeColor = 'text-rose-400 bg-rose-950/60 border-rose-800/80';
              textColor = 'text-rose-300 font-semibold';
            }

            return (
              <div key={log.id} className="flex items-start gap-2.5 py-0.5 leading-relaxed hover:bg-white/[0.02] px-1 rounded">
                <span className="text-slate-600 select-none shrink-0 text-[10px] mt-0.5">
                  [{log.timestamp}]
                </span>
                {log.node && (
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border shrink-0 ${badgeColor}`}>
                    {log.node.replace('_', ' ')}
                  </span>
                )}
                <span className={`flex-1 break-words ${textColor}`}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
