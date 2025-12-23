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
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path 
        d="M85 30 H40 C32 30 30 32 30 40 V75 C30 83 32 85 40 85 H75 C83 85 85 83 85 75 V58 H60 V45 H85 V40 C85 32 83 30 85 30Z" 
        fill="url(#logoGrad)"
        fillRule="evenodd"
      />
      <path d="M40 38 L65 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="40" cy="38" r="3" fill="white" />
      <path d="M68 51.5 L71 54.5 L76 49.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  pages, activePageId, onSelectPage, onAddPage, onAddFromTemplate, onDeletePage, isOpen, onClose, darkMode, onToggleDarkMode
}) => {
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const displayedTemplates = showAllTemplates ? Object.entries(TEMPLATES) : Object.entries(TEMPLATES).slice(0, 6);

  const isPageUnused = (page: Page) => {
    // A page is unused if it has no title and either no blocks or only one empty text block
    const hasNoTitle = !page.title || page.title.trim() === '';
    const hasNoContent = page.blocks.length === 0 || 
      (page.blocks.length === 1 && page.blocks[0].content.trim() === '' && page.blocks[0].type === 'text');
    return hasNoTitle && hasNoContent;
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] lg:hidden" onClick={onClose} />}
      
      <div className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800 z-[90] transform transition-all duration-500 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col px-6 py-10 safe-top">
          <div className="flex items-center gap-4 mb-10 select-none">
            <Logo />
            <div className="flex flex-col">
              <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">G<span className="text-cyan-500">ID</span></h1>
              <span className="text-[7px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.4em] mt-1 whitespace-nowrap">LOCAL INTELLIGENCE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-10 pr-1">
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.3em]">Toolkit</div>
                <button onClick={() => setShowAllTemplates(!showAllTemplates)} className="text-[9px] font-black text-cyan-500 uppercase tracking-widest bg-cyan-500/5 px-2 py-0.5 rounded-full transition-colors hover:bg-cyan-500/10">
                  {showAllTemplates ? 'Less' : 'More'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {displayedTemplates.map(([key, tpl]) => (
                  <button key={key} onClick={() => { onAddFromTemplate(key); if (window.innerWidth < 1024) onClose(); }} className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 rounded-3xl transition-all group hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl active:scale-95">
                    <span className="text-2xl mb-1">{tpl.icon}</span>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center">{tpl.title}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.3em]">Context History</div>
                <button onClick={onAddPage} className="w-8 h-8 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl shadow-lg active:scale-90 transition-transform hover:rotate-90">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                </button>
              </div>
              <div className="space-y-2">
                {pages.map((page) => {
                  const unused = isPageUnused(page);
                  const isActive = activePageId === page.id;
                  return (
                    <div 
                      key={page.id} 
                      className={`group flex items-center justify-between py-4 px-5 rounded-3xl cursor-pointer transition-all border ${isActive ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white shadow-xl shadow-cyan-500/5' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-500 border-transparent'}`} 
                      onClick={() => { onSelectPage(page.id); if (window.innerWidth < 1024) onClose(); }}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className={`text-[11px] font-black tracking-widest uppercase truncate ${unused ? 'text-zinc-300 italic opacity-60' : ''}`}>
                          {page.title || 'Draft Context'}
                        </span>
                        {unused && <span className="text-[7px] text-zinc-300 uppercase tracking-widest font-black mt-0.5">Empty Note</span>}
                      </div>

                      <button 
                        onClick={(e) => { 
                          e.stopPropagation();
                          e.preventDefault();
                          if (window.confirm('Delete this context permanently?')) {
                            onDeletePage(page.id);
                          }
                        }} 
                        className={`p-2 rounded-xl transition-all flex-shrink-0 border-2 ${
                          isActive 
                            ? 'text-red-500 border-cyan-400 bg-cyan-400/10 shadow-[0_0_12px_rgba(34,211,238,0.4)]' 
                            : 'text-zinc-300 border-transparent hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/5'
                        }`}
                        title="Delete History"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-5">
            <button 
              onClick={onToggleDarkMode} 
              className="flex items-center justify-between w-full px-5 py-4 rounded-[1.8rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{darkMode ? '☀️' : '🌙'}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-cyan-500 transition-colors">{darkMode ? 'Light Space' : 'Deep Space'}</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-cyan-500/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-300 ${darkMode ? 'right-1 bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'left-1 bg-zinc-400'}`} />
              </div>
            </button>
            
            <div className="flex items-center gap-3 px-1">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '200ms' }} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-700">Context OS v2.8 Active</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
