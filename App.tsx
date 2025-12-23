
import React, { useState, useEffect, useCallback } from 'react';
import { Page, Block } from './types';
import { loadPages, savePages } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { TEMPLATES } from './utils/templates';

const App: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [secondaryPageId, setSecondaryPageId] = useState<string | null>(null);
  const [isSplitPinned, setIsSplitPinned] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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
<<<<<<< qwen-code-f2b43b07-7671-4f49-a293-d1224f3bcbb5
    setHistory(prev => [...prev.slice(-49), newPages]); // Keep last 50 states
=======
    setHistory(prev => [...prev.slice(-49), pages]);
>>>>>>> main
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

  // ACTION: RequestDeleteContext(contextId)
  const handleDeletePage = (id: string) => {
    const context = pages.find(p => p.id === id);
    if (!context) return;

    const isEmpty = context.blocks.length === 0 || 
                    (context.blocks.length === 1 && context.blocks[0].content.trim() === '' && context.blocks[0].type === 'text');
    const inboundLinks = pages.filter(p => p.id !== id && p.blocks.some(b => b.linkMetadata?.sourcePageId === id));
    const outboundLinks = context.blocks.filter(b => b.linkMetadata !== undefined);
    const hasLinks = inboundLinks.length > 0 || outboundLinks.length > 0;

    // EDGE CASE: Empty and Unlinked
    if (isEmpty && !hasLinks) {
      executeDeletion(id);
      return;
    }

    // Confirmation logic based on state
    if (!isEmpty) {
      if (!window.confirm("This context contains content. Delete Anyway?")) return;
    }

    if (hasLinks) {
      const linkNames = inboundLinks.map(p => p.title || 'Untitled').join(', ');
      const msg = inboundLinks.length > 0 
        ? `This context is linked to other contexts: ${linkNames}.\nDeleting it will mark these as 'Source Deleted'. Continue?`
        : "This context has outbound Synapse links. Delete and Unlink?";
      if (!window.confirm(msg)) return;
    }

    executeDeletion(id);
  };

  const executeDeletion = (id: string) => {
    const pageToDelete = pages.find(p => p.id === id);
    let newPages = pages.filter(p => p.id !== id).map(p => ({
      ...p,
      blocks: p.blocks.map(b => {
        if (b.linkMetadata?.sourcePageId === id) {
          // ACTION: DeleteContext - handle inbound links
          const sourceBlock = pageToDelete?.blocks.find(sb => sb.id === b.linkMetadata?.sourceBlockId);
          const fallback = sourceBlock ? sourceBlock.content : `Ref: ${pageToDelete?.title}`;
          return { 
            ...b, 
            content: `[Source Deleted] ${fallback}`, 
            type: 'text' as const, 
            linkMetadata: undefined 
          };
        }
        return b;
      })
    }));

    if (newPages.length === 0) {
      newPages = [createNewPage('Workspace')];
    }
    
    recordState(newPages);
    
    if (activePageId === id) {
      setActivePageId(newPages[0].id);
    }
    if (secondaryPageId === id) {
      setSecondaryPageId(null);
    }
  };

  const handleUpdatePage = (updatedPage: Page) => {
    setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
  };

  const activePage = pages.find(p => p.id === activePageId);
  const secondaryPage = pages.find(p => p.id === secondaryPageId);

  if (isLoading) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overscroll-none">
      <Sidebar 
        pages={pages}
        activePageId={activePageId}
        onSelectPage={(id) => {
          // ACTION: PinSplitView() check
          if (!isSplitPinned) setActivePageId(id);
        }}
        onAddPage={handleAddPage}
        onAddFromTemplate={handleAddFromTemplate}
        onDeletePage={handleDeletePage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <main className="flex-1 flex lg:ml-72 relative">
        <div className={`flex-1 overflow-y-auto h-full scroll-smooth transition-all duration-500 ${secondaryPageId ? 'w-1/2 border-r border-zinc-100 dark:border-zinc-800' : 'w-full'}`}>
          {activePage && (
            <Editor 
              key={`main-${activePage.id}`}
              page={activePage}
              allPages={pages}
              onUpdate={handleUpdatePage}
              onOpenSplit={(id) => setSecondaryPageId(id)}
              onJumpTo={setActivePageId}
            />
          )}
        </div>

        {secondaryPage && (
          <div className="flex-1 overflow-y-auto h-full scroll-smooth bg-zinc-50/10 dark:bg-zinc-900/10 animate-in slide-in-from-right duration-500 border-l border-zinc-100 dark:border-zinc-800 relative">
            <div className="sticky top-4 right-4 z-[60] flex justify-end p-4 pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                <button 
                  onClick={() => setIsSplitPinned(!isSplitPinned)}
                  className={`p-2 rounded-xl border backdrop-blur-md transition-all ${isSplitPinned ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg' : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-400 border-zinc-100 dark:border-zinc-800'}`}
                  title="Pin Split View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                </button>
                <button 
                  onClick={() => setSecondaryPageId(null)}
                  className="p-2 bg-white/80 dark:bg-zinc-900/80 text-zinc-400 border border-zinc-100 dark:border-zinc-800 rounded-xl backdrop-blur-md hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            <Editor 
              key={`split-${secondaryPage.id}`}
              page={secondaryPage}
              allPages={pages}
              onUpdate={handleUpdatePage}
              onOpenSplit={(id) => setSecondaryPageId(id)}
              onJumpTo={setActivePageId}
              isSecondary
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
