
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
  onSync: () => void;
  isSyncing: boolean;
}

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
  onToggleDarkMode,
  onSync,
  isSyncing
}) => {
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  
  const templateEntries = Object.entries(TEMPLATES);
  const displayedTemplates = showAllTemplates ? templateEntries : templateEntries.slice(0, 4);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/10 dark:bg-black/60 backdrop-blur-sm z-[80] lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800 z-[90] transform transition-all duration-500 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col px-6 py-12">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
              <h1 className="text-xs font-black tracking-[0.2em] uppercase text-zinc-900 dark:text-zinc-100">GID</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onSync}
                disabled={isSyncing}
                title="Sync SQLite to Google Drive"
                className={`p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ${isSyncing ? 'animate-spin' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8" />
                </svg>
              </button>
              <button 
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-10">
              <section className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Templates</div>
                  <button onClick={() => setShowAllTemplates(!showAllTemplates)} className="text-[9px] font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest">
                    {showAllTemplates ? 'Less' : 'All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {displayedTemplates.map(([key, tpl]) => (
                    <button key={key} onClick={() => { onAddFromTemplate(key); if (window.innerWidth < 1024) onClose(); }} className="flex flex-col items-start p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl transition-all group hover:bg-zinc-100">
                      <span className="text-lg mb-1">{tpl.icon}</span>
                      <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-900 text-left line-clamp-1">{tpl.title}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Thoughts</div>
                  <button onClick={onAddPage} className="text-zinc-400 hover:text-zinc-900 transition-colors p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
                {pages.map((page) => (
                  <div key={page.id} className={`group flex items-center justify-between py-1 cursor-pointer transition-all ${activePageId === page.id ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`} onClick={() => { onSelectPage(page.id); if (window.innerWidth < 1024) onClose(); }}>
                    <span className={`text-xs truncate font-bold ${activePageId === page.id ? 'text-zinc-900 dark:text-zinc-100 underline decoration-zinc-900/10' : ''}`}>
                      {page.title || 'Untitled'}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); if (confirm('Erase context?')) onDeletePage(page.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
              </section>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 opacity-20">
            <div className="w-1 h-1 rounded-full bg-zinc-900 dark:bg-zinc-100" />
            <span className="text-[8px] font-black uppercase tracking-widest">SQLite Powered Brain</span>
          </div>
        </div>
      </div>
    </>
  );
};
