import React, { useState } from 'react';
import { Page } from '../types';
import { TEMPLATES } from '../utils/templates';

interface SidebarProps {
  pages: Page[];
  activePageId: string | null;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onAddFromTemplate: (templateKey: string) => void;
  onDeletePage: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Logo = () => (
  <div className="relative w-12 h-12 flex-shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(34,211,238,0.4)]">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path 
        d="M85 30 H40 C32 30 30 32 30 40 V75 C30 83 32 85 40 85 H75 C83 85 85 83 85 75 V58 H60 V45 H85 V40 C85 32 83 30 85 30Z" 
        fill="url(#logoGrad)"
        fillRule="evenodd"
      />
      <path d="M40 38 L65 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="40" cy="38" r="3" fill="white" />
      <circle cx="65" cy="38" r="3" fill="white" />
      <path d="M40 55 L55 55" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="40" cy="55" r="3" fill="white" />
      <path d="M40 72 L60 72" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="40" cy="72" r="3" fill="white" />
      <path d="M68 51.5 L71 54.5 L76 49.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path 
        d="M85 35 Q88 32 91 35 T94 35 Q96 38 94 41 T91 41 Q88 44 85 41" 
        stroke="white" 
        strokeWidth="1.5" 
        fill="none" 
        opacity="0.8"
      />
    </svg>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  pages, 
  activePageId, 
  onSelectPage, 
  onAddPage, 
  onAddFromTemplate,
  onDeletePage,
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode
}) => {
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  
  const templateEntries = Object.entries(TEMPLATES);
  const displayedTemplates = showAllTemplates ? templateEntries : templateEntries.slice(0, 6);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/10 dark:bg-black/80 backdrop-blur-md z-[80] lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800 z-[90] transform transition-all duration-500 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col px-6 py-10 safe-top">
          {/* Header Area */}
          <div className="flex items-center gap-4 mb-10 group select-none">
            <Logo />
            <div className="flex flex-col">
              <h1 className="text-3xl font-black tracking-[-0.05em] leading-none text-zinc-900 dark:text-white">
                G<span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">ID</span>
              </h1>
              <span className="text-[7px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.4em] mt-1.5 ml-0.5 whitespace-nowrap">LOCAL-FIRST WORKSPACE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
            <div className="space-y-10">
              {/* Core Toolkit */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.3em]">Core Toolkit</div>
                  <button onClick={() => setShowAllTemplates(!showAllTemplates)} className="text-[9px] font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-[0.2em] transition-colors bg-cyan-500/5 px-2.5 py-1 rounded-full">
                    {showAllTemplates ? 'Minimize' : 'Explore'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {displayedTemplates.map(([key, tpl]) => (
                    <button 
                      key={key} 
                      onClick={() => { onAddFromTemplate(key); if (window.innerWidth < 1024) onClose(); }} 
                      className="flex flex-col items-center justify-center p-4 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 rounded-3xl transition-all group hover:bg-white dark:hover:bg-zinc-800 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-0.5 active:scale-95"
                    >
                      <span className="text-2xl mb-2 transition-transform group-hover:scale-125 duration-300">{tpl.icon}</span>
                      <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 group-hover:text-cyan-500 text-center line-clamp-1 uppercase tracking-widest">{tpl.title}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Active Contexts */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.3em]">Active Contexts</div>
                  <button onClick={onAddPage} className="w-7 h-7 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full shadow-lg shadow-black/10 transition-transform active:scale-90 hover:rotate-90">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {pages.map((page) => (
                    <div 
                      key={page.id} 
                      className={`group flex items-center justify-between py-3.5 px-5 rounded-3xl cursor-pointer transition-all border ${activePageId === page.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white shadow-xl shadow-cyan-500/5' : 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-500'}`} 
                      onClick={() => { onSelectPage(page.id); if (window.innerWidth < 1024) onClose(); }}
                    >
                      <span className="text-[11px] truncate font-black tracking-widest uppercase">
                        {page.title || 'Untitled Session'}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); if (confirm('Purge context?')) onDeletePage(page.id); }} className={`opacity-0 group-hover:opacity-100 p-1 transition-opacity ${activePageId === page.id ? 'text-zinc-400 hover:text-white dark:hover:text-black' : 'text-zinc-300 hover:text-red-500'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar Footer with Theme Toggle */}
          <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-5">
            <button 
              onClick={onToggleDarkMode}
              className="flex items-center justify-between w-full px-5 py-3.5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 group transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm">{darkMode ? '☀️' : '🌙'}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-cyan-500 transition-colors">
                  {darkMode ? 'Visual Light' : 'Deep Mode'}
                </span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-cyan-500/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-300 ${darkMode ? 'right-1 bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'left-1 bg-zinc-400'}`} />
              </div>
            </button>
            
            <div className="flex items-center gap-3 px-1">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '200ms' }} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-700">Offline Intelligence Verified</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};