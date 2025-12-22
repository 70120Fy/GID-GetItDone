import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Page, Block, BlockType, KanbanData, DatabaseData, MindMapNode } from '../types';
import { BlockItem } from './BlockItem';
import { CommandMenu } from './CommandMenu';
import { TEMPLATES } from '../utils/templates';
import { GeminiAssistant } from './GeminiAssistant';

interface EditorProps {
  page: Page;
  onUpdate: (updatedPage: Page) => void;
}

export const Editor: React.FC<EditorProps> = ({ page, onUpdate }) => {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(new Set());
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [newMindMapId, setNewMindMapId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [sessionStartTime] = useState(Date.now());
  const editorRef = useRef<HTMLDivElement>(null);

  // Secondary Dark Mode toggle within the editor context
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('gid_theme') === 'dark');
  
  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    document.documentElement.classList.toggle('dark', newVal);
    localStorage.setItem('gid_theme', newVal ? 'dark' : 'light');
    // Dispatch custom event to sync with App state if needed
    window.dispatchEvent(new Event('storage'));
  };

  const updateBlocks = useCallback((blocks: Block[]) => {
    onUpdate({ ...page, blocks, updatedAt: Date.now() });
  }, [page, onUpdate]);

  const addBlock = (afterId: string | null, type: BlockType = 'text', content: string = '') => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newBlock: Block = {
      id: newId,
      type,
      content,
      lastEditedAt: Date.now()
    };
    const index = afterId ? page.blocks.findIndex(b => b.id === afterId) : -1;
    const newBlocks = [...page.blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    updateBlocks(newBlocks);
    setFocusedBlockId(newId);
    setSelectedBlockIds(new Set());
    
    if (type === 'mindmap') {
      setNewMindMapId(newId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, block: Block) => {
    const index = page.blocks.findIndex(b => b.id === block.id);

    if (e.key === '/') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuPosition({ 
        top: rect.bottom + window.scrollY, 
        left: Math.min(rect.left + window.scrollX, window.innerWidth - 260) 
      });
    } else if (e.key === 'Escape') {
      setMenuPosition(null);
      setFocusMode(false);
    }

    if (e.key === 'ArrowUp' && index > 0) {
      const target = e.target as HTMLTextAreaElement;
      if (target.selectionStart === 0) {
        e.preventDefault();
        setFocusedBlockId(page.blocks[index - 1].id);
      }
    }

    if (e.key === 'ArrowDown' && index < page.blocks.length - 1) {
      const target = e.target as HTMLTextAreaElement;
      if (target.selectionEnd === target.value.length) {
        e.preventDefault();
        setFocusedBlockId(page.blocks[index + 1].id);
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      if (['kanban', 'database', 'mindmap', 'code'].includes(block.type)) return;
      e.preventDefault();
      addBlock(block.id);
    }

    if (e.key === 'Backspace' && block.content === '' && page.blocks.length > 1) {
      e.preventDefault();
      const prevBlock = page.blocks[index - 1];
      const newBlocks = page.blocks.filter(b => b.id !== block.id);
      updateBlocks(newBlocks);
      if (prevBlock) setFocusedBlockId(prevBlock.id);
    }
  };

  const handleCommandSelect = (type: string) => {
    if (!focusedBlockId) return;

    if (type.startsWith('tpl:')) {
      const template = TEMPLATES[type];
      if (!template) return;
      
      const templateBlocks = template.blocks.map(b => {
        const id = Math.random().toString(36).substr(2, 9);
        if (b.type === 'mindmap') setNewMindMapId(id);
        return { ...b, id, lastEditedAt: Date.now() };
      });

      const index = page.blocks.findIndex(b => b.id === focusedBlockId);
      const newBlocks = [...page.blocks];
      newBlocks.splice(index + 1, 0, ...templateBlocks);
      updateBlocks(newBlocks);
      setMenuPosition(null);
      return;
    }

    let bType: BlockType = type.startsWith('code:') ? 'code' : (type as BlockType);
    let initialContent = '';
    if (bType === 'kanban') initialContent = JSON.stringify({ columns: [{ id: 'c1', title: 'To Do', cards: [] }, { id: 'c2', title: 'Done', cards: [] }] } as KanbanData);
    if (bType === 'database') initialContent = JSON.stringify({ columns: [{ id: 'c1', title: 'Item', type: 'text' }], rows: [] } as DatabaseData);
    if (bType === 'mindmap') {
      initialContent = JSON.stringify({ id: 'root', text: 'Core Idea', x: 400, y: 300, children: [] } as MindMapNode);
      setNewMindMapId(focusedBlockId);
    }

    const newBlocks = page.blocks.map(b => {
      if (b.id === focusedBlockId) {
        return { 
          ...b, 
          type: bType, 
          content: initialContent || b.content, 
          lastEditedAt: Date.now()
        };
      }
      return b;
    });
    updateBlocks(newBlocks);
    setMenuPosition(null);
  };

  const complexity = page.blocks.length;
  const complexityWidth = Math.min((complexity / 40) * 100, 100);

  return (
    <div ref={editorRef} className={`max-w-2xl mx-auto px-6 py-24 pb-[40vh] min-h-screen transition-all duration-700 ${focusMode ? 'bg-white dark:bg-zinc-950' : 'bg-transparent'}`}>
      
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-zinc-50 dark:bg-zinc-900 z-50 lg:ml-72 pointer-events-none">
        <div 
          className={`h-full transition-all duration-1000 ease-out bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]`} 
          style={{ width: `${complexityWidth}%` }}
        />
      </div>

      <div className="mb-16 space-y-8">
        <div className="flex items-center justify-between gap-6">
          <input
            value={page.title}
            onChange={(e) => onUpdate({ ...page, title: e.target.value })}
            placeholder="Untitled Context"
            className="w-full text-4xl font-black bg-transparent border-none focus:ring-0 placeholder-zinc-100 dark:placeholder-zinc-800 tracking-tighter text-zinc-900 dark:text-zinc-50"
          />
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleDarkMode}
              className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-cyan-500 transition-all hover:scale-105"
              title="Toggle Theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={() => setFocusMode(!focusMode)}
              className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${focusMode ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black shadow-2xl' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600 hover:text-cyan-500 hover:border-cyan-500/30'}`}
            >
              {focusMode ? 'Focus On' : 'Focus Mode'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {page.blocks.map((block) => (
          <BlockItem
            key={block.id}
            block={block}
            isFocused={focusedBlockId === block.id}
            isSelected={selectedBlockIds.has(block.id)}
            isRecent={block.lastEditedAt ? block.lastEditedAt > sessionStartTime : false}
            anyBlockFocused={focusedBlockId !== null || focusMode || selectedBlockIds.size > 0}
            autoExpand={newMindMapId === block.id}
            onFocus={() => {
              setFocusedBlockId(block.id);
              if (selectedBlockIds.size > 0) setSelectedBlockIds(new Set());
            }}
            onUpdate={(updates) => {
              const newBlocks = page.blocks.map(b => b.id === block.id ? { ...b, ...updates } : b);
              updateBlocks(newBlocks);
              if (newMindMapId === block.id) setNewMindMapId(null);
            }}
            onKeyDown={(e) => handleKeyDown(e, block)}
            onDelete={() => {
              const newBlocks = page.blocks.filter(b => b.id !== block.id);
              updateBlocks(newBlocks.length > 0 ? newBlocks : [{ id: 'init', type: 'text', content: '', lastEditedAt: Date.now() }]);
            }}
            onDragStart={() => setDraggedBlockId(block.id)}
            onDrop={() => {
              if (!draggedBlockId) return;
              const newBlocks = [...page.blocks];
              const s = newBlocks.findIndex(b => b.id === draggedBlockId);
              const t = newBlocks.findIndex(b => b.id === block.id);
              const [r] = newBlocks.splice(s, 1);
              newBlocks.splice(t, 0, r);
              updateBlocks(newBlocks);
              setDraggedBlockId(null);
            }}
          />
        ))}
      </div>

      {menuPosition && (
        <CommandMenu 
          position={menuPosition} 
          onSelect={handleCommandSelect} 
          onClose={() => setMenuPosition(null)}
        />
      )}

      {!focusMode && (
        <div 
          className="h-32 mt-16 flex items-center justify-center text-zinc-200 dark:text-zinc-800 text-[10px] font-black uppercase tracking-[0.3em] transition-opacity cursor-text hover:opacity-100 opacity-0 group"
          onClick={() => addBlock(page.blocks[page.blocks.length - 1]?.id || null)}
        >
          <span className="group-hover:text-cyan-500 transition-colors">Initiate Expansion</span>
        </div>
      )}

      <GeminiAssistant 
        page={page} 
        onInsertBlocks={(blocks) => {
          const newBlocks = [...page.blocks, ...blocks];
          updateBlocks(newBlocks);
        }} 
      />
    </div>
  );
};