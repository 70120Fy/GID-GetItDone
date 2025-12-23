import React, { useState, useEffect, useCallback } from 'react';
import { Page, Block } from './types';
import { loadPages, savePages } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { TEMPLATES } from './utils/templates';

const App: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // History stacks for Undo/Redo
  const [history, setHistory] = useState<Page[][]>([]);
  const [redoStack, setRedoStack] = useState<Page[][]>([]);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('gid_theme') === 'dark';
  });

  const createNewPage = useCallback((title: string = '', blocks?: Block[]): Page => {
    const id = Math.random().toString(36).substr(2, 9);
    return {
      id,
      title,
      blocks: blocks || [
        { id: Math.random().toString(36).substr(2, 9), type: 'text', content: '' }
      ],
      updatedAt: Date.now()
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      const loadedPages = await loadPages();
      if (loadedPages.length > 0) {
        setPages(loadedPages);
        setActivePageId(loadedPages[0].id);
      } else {
        const firstPage = createNewPage('Workspace', [
          { id: 'start1', type: 'heading', content: 'Begin your journey' },
          { id: 'start2', type: 'text', content: '' }
        ]);
        setPages([firstPage]);
        setActivePageId(firstPage.id);
      }
      setIsLoading(false);
    };
    init();
  }, [createNewPage]);

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

  const recordState = useCallback((newPages: Page[]) => {
    setHistory(prev => [...prev.slice(-49), newPages]); // Keep last 50 states
    setRedoStack([]);
    setPages(newPages);
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [pages, ...prev]);
    setHistory(prev => prev.slice(0, -1));
    setPages(previous);
  }, [history, pages]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory(prev => [...prev, pages]);
    setRedoStack(prev => prev.slice(1));
    setPages(next);
  }, [redoStack, pages]);

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleAddPage = () => {
    const newPage = createNewPage();
    recordState([newPage, ...pages]);
    setActivePageId(newPage.id);
  };

  const handleAddFromTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey];
    if (!template) return;
    const newBlocks = template.blocks.map(b => ({ ...b, id: Math.random().toString(36).substr(2, 9) }));
    const newPage = createNewPage(template.title, newBlocks);
    recordState([newPage, ...pages]);
    setActivePageId(newPage.id);
  };

  const handleDeletePage = (id: string) => {
    setPages(prevPages => {
      const newPages = prevPages.filter(p => p.id !== id);
      const finalPages = newPages.length === 0 ? [createNewPage('Workspace')] : newPages;
      
      // Manually manage history for the deletion event to ensure atomic update
      setHistory(h => [...h.slice(-49), prevPages]);
      setRedoStack([]);

      // If the page being deleted is currently active, switch to another one
      if (activePageId === id) {
        // Find next available ID
        const nextId = finalPages[0].id;
        setActivePageId(nextId);
      }
      
      return finalPages;
    });
  };

  const handleUpdatePage = (updatedPage: Page) => {
    const newPages = pages.map(p => p.id === updatedPage.id ? updatedPage : p);
    recordState(newPages);
  };

  const activePage = pages.find(p => p.id === activePageId);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-8 h-8 border-4 border-zinc-200 dark:border-zinc-800 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Syncing Neurons</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-cyan-500/20 selection:text-cyan-700 dark:selection:text-cyan-300 overscroll-none">
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
      />

      <main className="flex-1 overflow-y-auto h-full relative lg:ml-72 scroll-smooth">
        <div className="sticky top-0 z-20 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 flex items-center px-4 h-16 lg:hidden safe-top">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 -ml-2 text-zinc-400 hover:text-cyan-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-2 font-black tracking-tighter text-xl bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-blue-600">GID</span>
        </div>

        {activePage ? (
          <Editor 
            key={activePage.id}
            page={activePage}
            onUpdate={handleUpdatePage}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={history.length > 0}
            canRedo={redoStack.length > 0}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h2 className="text-xl font-bold mb-4 opacity-40">No Thoughts Active</h2>
            <button 
              onClick={handleAddPage}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              + Create First Thought
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
