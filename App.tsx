
import React, { useState, useEffect } from 'react';
import { Page, Block } from './types';
import { loadPages, savePages, getDBBlob } from './utils/storage';
import { initDrive, signInToDrive, uploadToDrive } from './utils/drive';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { GeminiAssistant } from './components/GeminiAssistant';
import { TEMPLATES } from './utils/templates';

const App: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('gid_theme') === 'dark';
  });

  useEffect(() => {
    const init = async () => {
      const loadedPages = await loadPages();
      if (loadedPages.length > 0) {
        setPages(loadedPages);
        setActivePageId(loadedPages[0].id);
      } else {
        const firstPage = createNewPage('Getting Started', [
          { id: 'start1', type: 'heading', content: 'Welcome to GID' },
          { id: 'start2', type: 'text', content: 'This is your local-first context engine. Use / for commands or ✨ for Gemini help.' }
        ]);
        setPages([firstPage]);
        setActivePageId(firstPage.id);
      }
      setIsLoading(false);
      initDrive().catch(console.error);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoading && pages.length > 0) {
      savePages(pages).catch(console.error);
    }
  }, [pages, isLoading]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gid_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gid_theme', 'light');
    }
  }, [darkMode]);

  const createNewPage = (title: string = '', blocks?: Block[]): Page => {
    const id = Math.random().toString(36).substr(2, 9);
    return {
      id,
      title,
      blocks: blocks || [
        { id: Math.random().toString(36).substr(2, 9), type: 'text', content: '' }
      ],
      updatedAt: Date.now()
    };
  };

  const handleAddPage = () => {
    const newPage = createNewPage();
    setPages([newPage, ...pages]);
    setActivePageId(newPage.id);
  };

  const handleAddFromTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey];
    if (!template) return;
    const newBlocks = template.blocks.map(b => ({ ...b, id: Math.random().toString(36).substr(2, 9) }));
    const newPage = createNewPage(template.title, newBlocks);
    setPages([newPage, ...pages]);
    setActivePageId(newPage.id);
  };

  const handleDeletePage = (id: string) => {
    const newPages = pages.filter(p => p.id !== id);
    setPages(newPages);
    if (activePageId === id) {
      setActivePageId(newPages.length > 0 ? newPages[0].id : null);
    }
  };

  const handleUpdatePage = (updatedPage: Page) => {
    setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));
  };

  const handleInsertBlocks = (newBlocks: Block[]) => {
    if (!activePageId) return;
    const activePage = pages.find(p => p.id === activePageId);
    if (activePage) {
      handleUpdatePage({
        ...activePage,
        blocks: [...activePage.blocks, ...newBlocks],
        updatedAt: Date.now()
      });
    }
  };

  const handleSyncToDrive = async () => {
    setIsSyncing(true);
    try {
      await signInToDrive();
      const blob = await getDBBlob();
      await uploadToDrive(blob);
      alert("Successfully synced to Google Drive.");
    } catch (e) {
      console.error(e);
      alert("Sync failed. Check connection or Drive permissions.");
    } finally {
      setIsSyncing(false);
    }
  };

  const activePage = pages.find(p => p.id === activePageId);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-8 h-8 border-4 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Loading Engine</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black">
      <Sidebar 
        pages={pages}
        activePageId={activePageId}
        onSelectPage={setActivePageId}
        onAddPage={handleAddPage}
        onAddFromTemplate={handleAddFromTemplate}
        onDeletePage={handleDeletePage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onSync={handleSyncToDrive}
        isSyncing={isSyncing}
      />

      <main className="flex-1 overflow-y-auto h-full relative lg:ml-72 scroll-smooth">
        <div className="sticky top-0 z-20 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 flex items-center px-4 h-16 lg:hidden">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 -ml-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-2 font-black tracking-tighter text-xl">GID</span>
        </div>

        {activePage ? (
          <>
            <Editor 
              key={activePage.id}
              page={activePage}
              onUpdate={handleUpdatePage}
            />
            <GeminiAssistant page={activePage} onInsertBlocks={handleInsertBlocks} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-bold mb-4">Select or Create a Thought</h2>
            <button 
              onClick={handleAddPage}
              className="px-8 py-3 bg-black dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-2xl text-sm font-bold shadow-xl active:scale-95 transition-all"
            >
              + New Page
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
