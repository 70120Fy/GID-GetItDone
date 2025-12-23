import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Block, BlockType, Page } from '../types';

interface GeminiAssistantProps {
  page: Page;
  onInsertBlocks: (blocks: Block[]) => void;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ page, onInsertBlocks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recog.onerror = () => setIsListening(false);
      recog.onend = () => setIsListening(false);

      setRecognition(recog);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hide AI features entirely when offline
  if (!isOnline) {
    return null;
  }

  const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || '');

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      setPrompt('');
      recognition?.start();
      setIsListening(true);
    }
  };

  const handleGenerate = async (type: 'expand' | 'database' | 'summarize') => {
    setIsGenerating(true);
    try {
      let systemInstruction = "You are a specialized productivity assistant for GID. ";
      let userMessage = "";

      if (type === 'database') {
        systemInstruction += "Generate a valid JSON for a database block. Schema: { 'columns': [{ 'id': 'c1', 'title': 'Task', 'type': 'text' }], 'rows': [] }";
        userMessage = `Generate a database structure for: ${prompt || 'Project tracking'}. Return only raw JSON.`;
      } else if (type === 'expand') {
        systemInstruction += "Provide actionable blocks in plain text, one per line.";
        userMessage = `Page title: ${page.title}. Context: ${prompt}. Suggest next blocks.`;
      } else {
        systemInstruction += "Summarize the current page content into a concise insight.";
        userMessage = `Summarize these blocks: ${page.blocks.map(b => b.content).join(' ')}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction,
          responseMimeType: type === 'database' ? "application/json" : "text/plain"
        }
      });

      const text = response.text || '';
      
      if (type === 'database') {
        const dbData = JSON.parse(text);
        onInsertBlocks([{
          id: Math.random().toString(36).substr(2, 9),
          type: 'database',
          content: JSON.stringify(dbData),
          lastEditedAt: Date.now()
        }]);
      } else {
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const newBlocks = lines.map(line => ({
          id: Math.random().toString(36).substr(2, 9),
          type: 'text' as BlockType,
          content: line.replace(/^- /, '').trim(),
          lastEditedAt: Date.now()
        }));
        onInsertBlocks(newBlocks);
      }

      setPrompt('');
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Intelligence interrupted. Check connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[150]">
      {isOpen ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl rounded-3xl w-80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Gemini Assistant</span>
              </div>
              {recognition && (
                <button 
                  onClick={toggleListening}
                  className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-cyan-500'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </button>
              )}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isListening ? "Listening..." : "Describe a project, ask for a list..."}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border-none focus:ring-2 focus:ring-cyan-500/20 rounded-2xl p-4 text-sm resize-none h-24 placeholder-zinc-300 dark:placeholder-zinc-700 font-medium"
            />
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleGenerate('database')}
                disabled={isGenerating}
                className="py-3 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-cyan-500/20 transition-all disabled:opacity-50"
              >
                + Structured Table
              </button>
              <button 
                onClick={() => handleGenerate('expand')}
                disabled={isGenerating}
                className="py-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-500/20 transition-all disabled:opacity-50"
              >
                Expansion Flow
              </button>
              <button 
                onClick={() => handleGenerate('summarize')}
                disabled={isGenerating}
                className="py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-all disabled:opacity-50 col-span-2 shadow-2xl"
              >
                Synthesize Context
              </button>
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-cyan-500 transition-colors">Dismiss Intelligence</button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl shadow-2xl shadow-cyan-500/30 flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-all animate-sparkle"
        >
          <span className="text-3xl drop-shadow-lg">✨</span>
        </button>
      )}
    </div>
  );
};