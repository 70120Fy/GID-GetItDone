
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Page, Block, BlockType, KanbanData, DatabaseData, MindMapNode } from '../types';
import { BlockItem } from './BlockItem';
import { CommandMenu } from './CommandMenu';
import { TEMPLATES } from '../utils/templates';

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

  const deleteSelectedBlocks = useCallback(() => {
    if (selectedBlockIds.size === 0 && focusedBlockId) {
      const newBlocks = page.blocks.filter(b => b.id !== focusedBlockId);
      updateBlocks(newBlocks.length > 0 ? newBlocks : [{ id: 'init', type: 'text', content: '', lastEditedAt: Date.now() }]);
      setFocusedBlockId(null);
      return;
    }
    
    const newBlocks = page.blocks.filter(b => !selectedBlockIds.has(b.id));
    updateBlocks(newBlocks.length > 0 ? newBlocks : [{ id: 'init', type: 'text', content: '', lastEditedAt: Date.now() }]);
    setSelectedBlockIds(new Set());
    setFocusedBlockId(null);
  }, [selectedBlockIds, focusedBlockId, page.blocks, updateBlocks]);

  const handleKeyDown = (e: React.KeyboardEvent, block: Block) => {
    const index = page.blocks.findIndex(b => b.id === block.id);

    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      const target = e.target as HTMLTextAreaElement;
      if (target && target.tagName === 'TEXTAREA') {
        if (target.selectionStart === 0 && target.selectionEnd === target.value.length) {
          e.preventDefault();
          setSelectedBlockIds(new Set(page.blocks.map(b => b.id)));
        }
      } else {
         e.preventDefault();
         setSelectedBlockIds(new Set(page.blocks.map(b => b.id)));
      }
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedBlockIds.size > 0) {
        e.preventDefault();
        deleteSelectedBlocks();
        return;
      }
    }

    if (e.key === '/') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuPosition({ 
        top: rect.bottom + window.scrollY, 
        left: Math.min(rect.left + window.scrollX, window.innerWidth - 260) 
      });
    } else if (e.key === 'Escape') {
      setMenuPosition(null);
      setFocusMode(false);
      setSelectedBlockIds(new Set());
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

  const handleBlockDragStart = (id: string) => {
    setDraggedBlockId(id);
  };

  const handleBlockDrop = (targetId: string) => {
    if (!draggedBlockId || draggedBlockId === targetId) return;
    
    const newBlocks = [...page.blocks];
    const sourceIndex = newBlocks.findIndex(b => b.id === draggedBlockId);
    const targetIndex = newBlocks.findIndex(b => b.id === targetId);
    
    const [removed] = newBlocks.splice(sourceIndex, 1);
    newBlocks.splice(targetIndex, 0, removed);
    
    updateBlocks(newBlocks);
    setDraggedBlockId(null);
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

      const cleanBlocks = page.blocks.map(b => {
         if (b.id === focusedBlockId && b.content.includes('/')) {
           return { ...b, content: b.content.split('/')[0].trim() };
         }
         return b;
      });
      const index = cleanBlocks.findIndex(b => b.id === focusedBlockId);
      const newBlocks = [...cleanBlocks];
      newBlocks.splice(index + 1, 0, ...templateBlocks);
      updateBlocks(newBlocks);
      setMenuPosition(null);
      return;
    }

    let bType: BlockType = 'text';
    let langMetadata: any = undefined;

    if (type.startsWith('code:')) {
      bType = 'code';
      langMetadata = { language: type.split(':')[1] };
    } else {
      bType = type as BlockType;
    }

    let initialContent = '';
    if (bType === 'kanban') initialContent = JSON.stringify({ columns: [{ id: 'c1', title: 'To Do', cards: [] }, { id: 'c2', title: 'Done', cards: [] }] } as KanbanData);
    if (bType === 'database') initialContent = JSON.stringify({ columns: [{ id: 'c1', title: 'Item', type: 'text' }], rows: [] } as DatabaseData);
    if (bType === 'mindmap') {
      initialContent = JSON.stringify({ id: 'root', text: 'Core Idea', x: 400, y: 300, children: [] } as MindMapNode);
      setNewMindMapId(focusedBlockId);
    }

    const newBlocks = page.blocks.map(b => {
      if (b.id === focusedBlockId) {
        const cleanContent = b.content.split('/')[0].trim();
        return { 
          ...b, 
          type: bType, 
          content: initialContent || cleanContent, 
          lastEditedAt: Date.now(), 
          metadata: langMetadata 
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
          className={`h-full transition-all duration-1000 ease-out ${complexity > 30 ? 'bg-orange-500' : 'bg-zinc-900/10 dark:bg-zinc-100/10'}`} 
          style={{ width: `${complexityWidth}%` }}
        />
      </div>

      <div className="mb-16 space-y-6">
        <div className="flex items-center justify-between">
          <input
            value={page.title}
            onChange={(e) => onUpdate({ ...page, title: e.target.value })}
            placeholder="Untitled Context"
            className="w-full text-4xl font-black bg-transparent border-none focus:ring-0 placeholder-zinc-200 dark:placeholder-zinc-800 tracking-tighter text-zinc-900 dark:text-zinc-50"
          />
          <button 
            onClick={() => setFocusMode(!focusMode)}
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border shrink-0 ${focusMode ? 'bg-black dark:bg-zinc-100 border-black dark:border-zinc-100 text-white dark:text-zinc-900' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          >
            {focusMode ? 'Focus On' : 'Focus Mode'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
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
            onDragStart={() => handleBlockDragStart(block.id)}
            onDrop={() => handleBlockDrop(block.id)}
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
          className="h-32 mt-12 flex items-center justify-center text-zinc-200 dark:text-zinc-800 text-[10px] font-black uppercase tracking-[0.25em] transition-opacity cursor-text hover:opacity-100 opacity-0"
          onClick={() => addBlock(page.blocks[page.blocks.length - 1]?.id || null)}
        >
          Click to start a new thought
        </div>
      )}
    </div>
  );
};
