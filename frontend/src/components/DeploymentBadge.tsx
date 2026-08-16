import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Flame, 
  Zap, 
  Server 
} from 'lucide-react';
import { DeploymentData } from '../services/api';

interface DeploymentBadgeProps {
  deployment?: DeploymentData;
}

export const DeploymentBadge: React.FC<DeploymentBadgeProps> = ({ deployment }) => {
  const [copied, setCopied] = useState(false);

  if (!deployment) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(deployment.live_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformIcon = () => {
    switch (deployment.platform) {
      case 'firebase':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'vercel':
        return <Zap className="w-4 h-4 text-white" />;
      default:
        return <Server className="w-4 h-4 text-primary-400" />;
    }
  };

  const getPlatformName = () => {
    switch (deployment.platform) {
      case 'firebase':
        return 'Firebase Hosting';
      case 'vercel':
        return 'Vercel Edge Network';
      default:
        return 'Sandboxed Live Server';
    }
  };

  return (
    <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-950/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Live Production Deployment</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> SSL Active
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              {getPlatformIcon()}
              <span>{getPlatformName()}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono truncate max-w-[240px] sm:max-w-md">
              {deployment.live_url}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={copyUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-300 border border-dark-750 text-xs font-semibold transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy URL'}</span>
        </button>

        <a
          href={deployment.live_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all hover:scale-105"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Live App</span>
        </a>
      </div>
    </div>
  );
};
