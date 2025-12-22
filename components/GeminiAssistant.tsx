
import React, { useState } from 'react';
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

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      alert("AI thinking interrupted.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[150]">
      {isOpen ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl rounded-3xl w-80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✨</span>
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Gemini Intelligence</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What can I help you build or analyze?"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border-none focus:ring-1 focus:ring-indigo-500 rounded-2xl p-4 text-sm resize-none h-24 placeholder-zinc-300 dark:placeholder-zinc-700"
            />
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleGenerate('database')}
                disabled={isGenerating}
                className="py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all disabled:opacity-50"
              >
                + Database
              </button>
              <button 
                onClick={() => handleGenerate('expand')}
                disabled={isGenerating}
                className="py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-100 transition-all disabled:opacity-50"
              >
                Expand Context
              </button>
              <button 
                onClick={() => handleGenerate('summarize')}
                disabled={isGenerating}
                className="py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-50 col-span-2"
              >
                Summarize Content
              </button>
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Close</button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-xl shadow-indigo-500/20 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all animate-sparkle"
        >
          <span className="text-2xl">✨</span>
        </button>
      )}
    </div>
  );
};
