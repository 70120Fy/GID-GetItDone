
import React, { useState, useCallback, useMemo } from 'react';
import { Page, Block, BlockType } from '../types';
import { BlockItem } from './BlockItem';
import { CommandMenu } from './CommandMenu';
import { TEMPLATES } from '../utils/templates';

import { LinkSelector } from './LinkSelector';

interface EditorProps {
  page: Page;
  allPages: Page[];
  onUpdate: (updatedPage: Page) => void;
  onOpenSplit?: (id: string) => void;
  onJumpTo?: (id: string) => void;
  isSecondary?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ page, allPages, onUpdate, onOpenSplit, onJumpTo, isSecondary }) => {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showLinkSelector, setShowLinkSelector] = useState<{ blockId?: string } | null>(null);
  const [showLinkedPanel, setShowLinkedPanel] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  // ACTION: LinkedContextsPanel()
  const inboundLinks = useMemo(() => {
    return allPages.filter(p => p.id !== page.id && p.blocks.some(b => b.linkMetadata?.sourcePageId === page.id));
  }, [allPages, page.id]);

  const outboundLinks = useMemo(() => {
    return allPages.filter(p => page.blocks.some(b => b.linkMetadata?.sourcePageId === p.id));
  }, [allPages, page.blocks]);

  const updateBlocks = useCallback((blocks: Block[]) => {
    onUpdate({ ...page, blocks, updatedAt: Date.now() });
  }, [page, onUpdate]);

  const addBlock = useCallback((afterId: string | null, type: BlockType = 'text', content: string = '') => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newBlock: Block = { id: newId, type, content, lastEditedAt: Date.now() };
    const index = afterId ? page.blocks.findIndex(b => b.id === afterId) : -1;
    const newBlocks = [...page.blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    updateBlocks(newBlocks);
    setFocusedBlockId(newId);
  }, [page.blocks, updateBlocks]);

  const handleKeyDown = (e: React.KeyboardEvent, block: Block) => {
    if (e.key === '/') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + window.scrollY, left: Math.min(rect.left + window.scrollX, window.innerWidth - 260) });
    } else if (e.key === 'Enter' && !e.shiftKey) {
      if (!['text', 'heading', 'todo', 'callout'].includes(block.type)) return;
      e.preventDefault();
      addBlock(block.id);
    } else if (e.key === 'Backspace' && block.content === '' && page.blocks.length > 1) {
      e.preventDefault();
      const index = page.blocks.findIndex(b => b.id === block.id);
      const prevBlock = page.blocks[index - 1];
      updateBlocks(page.blocks.filter(b => b.id !== block.id));
      if (prevBlock) setFocusedBlockId(prevBlock.id);
    }
  };

  // ACTION: LinkTo() - Handle final selection
  const handleLinkSelect = (targetPageId: string, targetBlockId?: string, type: 'live' | 'snapshot' = 'live') => {
    const targetPage = allPages.find(p => p.id === targetPageId);
    if (!targetPage) return;

    if (showLinkSelector?.blockId) {
      const sourceBlock = targetBlockId ? targetPage.blocks.find(b => b.id === targetBlockId) : null;
      const content = sourceBlock ? sourceBlock.content : `Context Ref: ${targetPage.title}`;
      
      const newBlocks = page.blocks.map(b => b.id === showLinkSelector.blockId ? {
        ...b,
        content: type === 'snapshot' ? content : b.content,
        type: type === 'live' ? 'embed' : b.type,
        linkMetadata: {
          sourcePageId: targetPageId,
          sourceBlockId: targetBlockId,
          type,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      } as Block : b);
      updateBlocks(newBlocks);
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      const newBlock: Block = {
        id: newId,
        type: type === 'live' ? 'embed' : 'text',
        content: `Ref: ${targetPage.title}`,
        linkMetadata: {
          sourcePageId: targetPageId,
          sourceBlockId: targetBlockId,
          type,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        lastEditedAt: Date.now()
      };
      updateBlocks([...page.blocks, newBlock]);
    }
    setShowLinkSelector(null);
  };

  const handleCommandSelect = useCallback((type: string) => {
    if (!focusedBlockId) return;
    if (type.startsWith('tpl:')) {
      const template = TEMPLATES[type];
      const newBlocks = [...page.blocks];
      const index = newBlocks.findIndex(b => b.id === focusedBlockId);
      const tBlocks = template.blocks.map(b => ({ ...b, id: Math.random().toString(36).substr(2, 9) }));
      newBlocks.splice(index + 1, 0, ...tBlocks);
      updateBlocks(newBlocks);
      return;
    }

    const bType: BlockType = type.startsWith('code:') ? 'code' : (type as BlockType);
    let content = '';
    if (bType === 'kanban') content = JSON.stringify({ columns: [{ id: 'c1', title: 'To Do', cards: [] }] });
    if (bType === 'database') content = JSON.stringify({ columns: [{ id: 'c1', title: 'Item', type: 'text' }], rows: [] });
    if (bType === 'mindmap') content = JSON.stringify({ id: 'root', text: 'Core Idea', x: 400, y: 300, children: [] });

    const updated = page.blocks.map(b => b.id === focusedBlockId ? { ...b, type: bType, content } : b);
    updateBlocks(updated);
  }, [focusedBlockId, page.blocks, updateBlocks]);

  return (
    <div 
      className={`min-h-full flex flex-col cursor-text pb-96 ${focusMode ? 'bg-white dark:bg-zinc-950' : ''}`}
      onClick={(e) => {
        // "Clicking with the mouse or finger to add a new writing area"
        if (e.target === e.currentTarget) {
          const lastBlock = page.blocks[page.blocks.length - 1];
          if (lastBlock && lastBlock.content === '' && lastBlock.type === 'text') {
            setFocusedBlockId(lastBlock.id);
          } else {
            addBlock(lastBlock?.id || null);
          }
        }
      }}
    >
      <div className="max-w-2xl w-full mx-auto px-6 py-24 flex-1">
        <div className="mb-12 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8 cursor-default" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-1 flex-1 pr-4">
            <input
              value={page.title}
              onChange={(e) => onUpdate({ ...page, title: e.target.value })}
              placeholder="Draft Context"
              className="w-full text-4xl font-black bg-transparent border-none focus:ring-0 placeholder-zinc-100 dark:placeholder-zinc-800 tracking-tighter text-zinc-900 dark:text-zinc-50"
            />
            <div className="flex items-center gap-4 mt-3">
              <button 
                onClick={() => setShowLinkedPanel(!showLinkedPanel)}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${showLinkedPanel ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:text-cyan-500'}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                Connections
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {!isSecondary && (
              <button 
                onClick={() => setShowLinkSelector({})} 
                className="px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Link to...
              </button>
            )}
            <button 
              onClick={() => setFocusMode(!focusMode)} 
              className={`p-3 rounded-2xl transition-all border ${focusMode ? 'bg-zinc-900 dark:bg-white text-white dark:text-black' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800'}`}
            >
              {focusMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* LinkedContextsPanel() */}
        {showLinkedPanel && (
          <div className="mb-12 p-8 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-300 cursor-default" onClick={e => e.stopPropagation()}>
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex justify-between items-center">
              <span>Synapse Map</span>
              <button onClick={() => setShowLinkedPanel(false)} className="text-zinc-300 hover:text-zinc-500 transition-colors">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Outbound Connections</span>
                {outboundLinks.length > 0 ? outboundLinks.map(p => (
                  <div key={p.id} className="flex flex-col gap-1 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between group">
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 truncate pr-2">{p.title || 'Untitled'}</span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onOpenSplit?.(p.id)} className="text-[9px] font-black text-cyan-500 uppercase px-2 py-1 hover:bg-cyan-500/10 rounded-lg">Split</button>
                        <button onClick={() => onJumpTo?.(p.id)} className="text-[9px] font-black text-zinc-400 uppercase px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Jump</button>
                      </div>
                    </div>
                  </div>
                )) : <span className="text-[10px] text-zinc-300 italic">No links out</span>}
              </div>
              <div className="space-y-4 border-l border-zinc-100 dark:border-zinc-800 pl-8">
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Inbound References</span>
                {inboundLinks.length > 0 ? inboundLinks.map(p => (
                  <div key={p.id} className="flex items-center justify-between group bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 truncate pr-2">{p.title || 'Untitled'}</span>
                    <button onClick={() => onOpenSplit?.(p.id)} className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-cyan-500 uppercase px-2 py-1 hover:bg-cyan-500/10 rounded-lg">View</button>
                  </div>
                )) : <span className="text-[10px] text-zinc-300 italic">No incoming links</span>}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 cursor-default" onClick={e => e.stopPropagation()}>
          {page.blocks.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              isFocused={focusedBlockId === block.id}
              allPages={allPages}
              anyBlockFocused={focusedBlockId !== null}
              onFocus={() => setFocusedBlockId(block.id)}
              onUpdate={(u) => updateBlocks(page.blocks.map(b => b.id === block.id ? { ...b, ...u } : b))}
              onKeyDown={(e) => handleKeyDown(e, block)}
              onDelete={() => updateBlocks(page.blocks.filter(b => b.id !== block.id))}
              onDragStart={() => setDraggedBlockId(block.id)}
              onDrop={() => {
                if (!draggedBlockId) return;
                const newBlocks = [...page.blocks];
                const s = newBlocks.findIndex(b => b.id === draggedBlockId);
                const t = newBlocks.findIndex(b => b.id === block.id);
                if (s !== -1 && t !== -1) {
                    const [r] = newBlocks.splice(s, 1);
                    newBlocks.splice(t, 0, r);
                    updateBlocks(newBlocks);
                }
                setDraggedBlockId(null);
              }}
              onLinkTo={() => setShowLinkSelector({ blockId: block.id })}
              onJumpToSource={(pid) => onJumpTo?.(pid)}
            />
          ))}
        </div>

        {menuPosition && <div onClick={e => e.stopPropagation()}><CommandMenu position={menuPosition} onSelect={(type) => { handleCommandSelect(type); setMenuPosition(null); }} onClose={() => setMenuPosition(null)} /></div>}

        {showLinkSelector && (
          <LinkSelector 
            pages={allPages}
            onSelect={handleLinkSelect}
            onClose={() => setShowLinkSelector(null)}
          />
        )}
        

      </div>
    </div>
  );
};
