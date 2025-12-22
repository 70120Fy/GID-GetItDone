
import React, { useState, useEffect, useRef } from 'react';

interface CodeBlockProps {
  content: string;
  metadata?: {
    language: 'javascript' | 'python' | 'html';
  };
  onChange: (content: string, metadata?: any) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
}

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ content, metadata, onChange, onKeyDown, onFocus }) => {
  const language = metadata?.language || 'javascript';
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (language === 'python' && !pyodide && window.loadPyodide) {
      const initPy = async () => {
        try {
          const p = await window.loadPyodide();
          await p.loadPackage("micropip");
          p.runPython(`
import sys
import io
class StringIOWrapper(io.StringIO):
    def __init__(self):
        super().__init__()
    def get_val(self):
        return self.getvalue()
sys.stdout = StringIOWrapper()
          `);
          setPyodide(p);
        } catch (e) {
          console.error("Pyodide init failed", e);
        }
      };
      initPy();
    }
  }, [language, pyodide]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    
    if (language === 'javascript') {
      try {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args: any[]) => logs.push('ERROR: ' + args.join(' ')),
        };
        const runner = new Function('console', content);
        runner(customConsole);
        setOutput(logs.join('\n') || 'Done (no output)');
      } catch (err: any) {
        setOutput('Error: ' + err.message);
      }
    } else if (language === 'python') {
      if (!pyodide) {
        setOutput('Python engine loading...');
        setIsRunning(false);
        return;
      }
      try {
        pyodide.runPython("sys.stdout = io.StringIO()");
        await pyodide.runPythonAsync(content);
        const stdout = pyodide.runPython("sys.stdout.getvalue()");
        setOutput(stdout || 'Execution finished (no output)');
      } catch (err: any) {
        setOutput('Python Error: ' + err.message);
      }
    }
    setIsRunning(false);
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const defaultDoc = `
    <body style="background: #ffffff; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; color: #94a3b8; margin: 0;">
      <div style="text-align: center;">
        <p style="font-size: 14px; font-weight: 600;">Static Preview Area</p>
        <p style="font-size: 11px;">Draft your HTML to see results here</p>
      </div>
    </body>
  `;

  const renderHeader = (inOverlay: boolean = false) => {
    const isPython = language === 'python';
    const isWebsite = language === 'html';
    
    return (
      <div className={`flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/5 shrink-0 ${inOverlay ? 'h-16 px-6 lg:px-8 bg-zinc-950 shadow-xl' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{isPython ? '🐍' : isWebsite ? '🌐' : '📜'}</span>
            {inOverlay && (
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {isWebsite ? 'Website Builder' : isPython ? 'Python Environment' : 'Script Lab'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl">
            {(['javascript', 'python', 'html'] as const).map(lang => (
              <button
                key={lang}
                onClick={(e) => {
                  e.stopPropagation();
                  setOutput('');
                  onChange(content, { ...metadata, language: lang });
                }}
                className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] transition-all ${
                  language === lang 
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm' 
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {lang === 'html' ? 'Website' : lang === 'javascript' ? 'JS' : 'Python'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 items-center">
          {language !== 'html' && (
            <button
              onClick={(e) => { e.stopPropagation(); runCode(); }}
              disabled={isRunning}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                inOverlay 
                ? 'bg-white text-black hover:bg-zinc-200' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              {isRunning ? '...' : 'Run Code'}
            </button>
          )}
          
          <button
            onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
            className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${inOverlay ? 'text-zinc-400 hover:text-white hover:bg-white/5 px-3' : 'text-zinc-500 hover:text-white'}`}
            title={isExpanded ? "Shrink View" : "Full Screen"}
          >
            <span className={inOverlay ? 'text-[10px] font-black uppercase tracking-widest' : 'hidden'}>Close</span>
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderContent = (isLarge: boolean) => (
    <div className={`flex flex-col lg:flex-row gap-[1px] flex-1 overflow-hidden ${isLarge ? 'h-full bg-zinc-800' : 'min-h-[400px]'}`}>
      <div className={`flex-1 flex flex-col min-h-[200px] bg-zinc-950 relative overflow-hidden`}>
        <textarea
          ref={isLarge ? null : editorRef}
          value={content}
          onChange={(e) => onChange(e.target.value, metadata)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          placeholder={language === 'html' ? "<!-- Write HTML here... -->" : "# Write code here..."}
          className={`w-full h-full bg-transparent border-none focus:ring-0 resize-none p-6 code-font text-sm leading-relaxed overflow-y-auto text-zinc-300 custom-scrollbar`}
          spellCheck={false}
        />
      </div>

      {language !== 'html' ? (
        <div className={`w-full lg:w-1/3 bg-black border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col gap-3 shrink-0 overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Console Output</span>
            <button onClick={() => setOutput('')} className="text-[9px] text-zinc-600 hover:text-white transition-colors uppercase font-black tracking-widest">Clear</button>
          </div>
          <pre className="flex-1 code-font text-xs text-zinc-400 overflow-auto whitespace-pre-wrap select-text custom-scrollbar py-2">
            {output || '> Waiting for execution...'}
          </pre>
        </div>
      ) : (
        <div className={`flex-1 lg:flex-none lg:w-1/2 bg-white flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-200 min-h-[300px] overflow-hidden`}>
          <div className="h-8 bg-zinc-100/80 border-b border-zinc-200 flex items-center px-4 gap-3 shrink-0">
             <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
             </div>
             <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-2">Real-time Preview</span>
          </div>
          <div className="flex-1 bg-white relative overflow-hidden">
            <iframe
              key={isLarge ? 'expanded' : 'normal'}
              title="preview"
              srcDoc={content || defaultDoc}
              className="absolute inset-0 w-full h-full border-none bg-white"
              sandbox="allow-scripts allow-modals"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <div className={`flex flex-col my-4 bg-zinc-950 rounded-2xl p-0.5 shadow-2xl border border-white/5 overflow-hidden transition-all duration-500 ${isExpanded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        {renderHeader(false)}
        {renderContent(false)}
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden">
          {renderHeader(true)}
          <div className="flex-1 flex overflow-hidden">
             {renderContent(true)}
          </div>
          <div className="h-12 border-t border-white/5 flex items-center justify-between px-8 bg-zinc-950 shrink-0">
             <div className="flex items-center gap-2 opacity-30">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Full Screen Workspace</span>
             </div>
             <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest hidden sm:block">
               {language === 'python' ? 'Python Exclusive Lab' : language === 'html' ? 'Website Creative Workspace' : 'JavaScript Scripting Lab'}
             </span>
          </div>
        </div>
      )}
    </div>
  );
};
