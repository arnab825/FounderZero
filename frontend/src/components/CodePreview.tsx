import React, { useState } from 'react';
import { 
  Code2, 
  Eye, 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCw,
  ExternalLink,
  Maximize2,
  Minimize2
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { CodeArchitectData, DeploymentData } from '../services/api';

interface CodePreviewProps {
  codeArchitect?: CodeArchitectData;
  deployment?: DeploymentData;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ codeArchitect, deployment }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);

  const htmlCode = codeArchitect?.html_code || '';

  const copyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(codeArchitect?.app_title || 'startup').toLowerCase().replace(/\s+/g, '-')}-index.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getViewportWidthClass = () => {
    switch (deviceViewport) {
      case 'mobile':
        return 'w-[375px] max-w-[95%] h-[95%] shadow-2xl rounded-3xl border-4 border-slate-700 bg-slate-950 mx-auto';
      case 'tablet':
        return 'w-[768px] max-w-[95%] h-[95%] shadow-2xl rounded-2xl border-4 border-slate-700 bg-slate-950 mx-auto';
      case 'desktop':
      default:
        return 'w-full h-full rounded-none border-0';
    }
  };

  return (
    <div className={`flex flex-col rounded-2xl glass-panel border border-dark-800 overflow-hidden shadow-2xl bg-dark-950/95 transition-all duration-300 ${
      isMaximized 
        ? 'fixed inset-4 sm:inset-6 z-50 shadow-2xl' 
        : 'h-full w-full'
    }`}>
      
      {/* Header Bar */}
      <div className="px-4 py-3 bg-dark-900/90 border-b border-dark-800 flex items-center justify-between flex-wrap gap-2">
        
        {/* Left: View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-dark-950 border border-dark-800">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'preview'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive Preview</span>
          </button>

          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'code'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Source Code (Monaco Editor)</span>
          </button>
        </div>

        {/* Center: Device Viewport Switcher (Preview Mode Only) */}
        {viewMode === 'preview' && (
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-dark-950 border border-dark-800">
            <button
              onClick={() => setDeviceViewport('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                deviceViewport === 'desktop' ? 'bg-dark-800 text-primary-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Desktop View (Full Screen)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDeviceViewport('tablet')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                deviceViewport === 'tablet' ? 'bg-dark-800 text-primary-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setDeviceViewport('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                deviceViewport === 'mobile' ? 'bg-dark-800 text-primary-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {deployment?.live_url && (
            <a
              href={deployment.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
              title="Open deployed live app"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live App</span>
            </a>
          )}

          {viewMode === 'preview' && (
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-slate-200 border border-dark-750 transition-colors"
              title="Reload sandbox preview"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={copyCode}
            disabled={!htmlCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-300 border border-dark-750 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={downloadFile}
            disabled={!htmlCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .html</span>
          </button>

          {/* Fullscreen Maximize Button */}
          <button
            onClick={() => setIsMaximized((m) => !m)}
            className="p-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-slate-200 border border-dark-750 transition-colors"
            title={isMaximized ? "Minimize View" : "Maximize View to Big Screen"}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4 text-primary-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 bg-dark-950 overflow-hidden relative flex items-center justify-center p-2 min-h-0">
        {htmlCode ? (
          viewMode === 'preview' ? (
            <div className="w-full h-full flex items-center justify-center overflow-hidden p-1">
              <iframe
                key={iframeKey}
                srcDoc={htmlCode}
                title="Generated Application Preview"
                className={`bg-slate-950 transition-all duration-300 ${getViewportWidthClass()}`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              />
            </div>
          ) : (
            <div className="w-full h-full overflow-hidden bg-[#1e1e1e] rounded-xl border border-dark-800">
              <Editor
                height="100%"
                language="html"
                theme="vs-dark"
                value={htmlCode}
                options={{
                  readOnly: true,
                  domReadOnly: true,
                  minimap: { enabled: true },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  padding: { top: 14, bottom: 14 },
                  renderLineHighlight: 'all',
                  cursorStyle: 'line',
                  folding: true,
                  renderWhitespace: 'selection',
                }}
              />
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 space-y-3 py-16">
            <Code2 className="w-10 h-10 text-slate-700 animate-pulse" />
            <p className="font-sans text-sm">Code Architect is generating the frontend code...</p>
          </div>
        )}
      </div>
    </div>
  );
};
