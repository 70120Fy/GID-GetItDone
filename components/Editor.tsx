import React, { useState, useCallback, useRef } from 'react';
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
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [newMindMapId, setNewMindMapId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  // Quick dark mode toggle for editor header
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('gid_theme') === 'dark');
  
  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    document.documentElement.classList.toggle('dark', newVal);
    localStorage.setItem('gid_theme', newVal ? 'dark' : 'light');
    window.dispatchEvent(new Event('storage'));
  };

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

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('editor-inner-container')) {
      const lastBlock = page.blocks[page.blocks.length - 1];
      addBlock(lastBlock?.id || null);
    }
  };

  const exportToMarkdown = () => {
    let md = `# ${page.title || 'Untitled Context'}\n\n`;

    page.blocks.forEach(block => {
      switch (block.type) {
        case 'heading':
          md += `## ${block.content}\n\n`;
          break;
        case 'todo':
          md += `- [${block.checked ? 'x' : ' '}] ${block.content}${block.schedule ? ` (${block.schedule})` : ''}\n`;
          break;
        case 'callout':
          md += `> [!INFO]\n> ${block.content.replace(/\n/g, '\n> ')}\n\n`;
          break;
        case 'divider':
          md += `---\n\n`;
          break;
        case 'code':
          const lang = block.metadata?.language || '';
          md += `\`\`\`${lang}\n${block.content}\n\`\`\`\n\n`;
          break;
        case 'kanban':
          try {
            const data: KanbanData = JSON.parse(block.content);
            md += `### Kanban: Board\n`;
            data.columns.forEach(col => {
              md += `#### ${col.title}\n`;
              col.cards.forEach(card => md += `- [${card.checked ? 'x' : ' '}] ${card.content}\n`);
              md += `\n`;
            });
          } catch (e) { md += `[Kanban Data Error]\n\n`; }
          break;
        case 'database':
          try {
            const data: DatabaseData = JSON.parse(block.content);
            md += `| ${data.columns.map(c => c.title).join(' | ')} |\n`;
            md += `| ${data.columns.map(() => '---').join(' | ')} |\n`;
            data.rows.forEach(row => {
              md += `| ${data.columns.map(col => {
                const val = row[col.id];
                return col.type === 'checkbox' ? (val ? '☑' : '☐') : val;
              }).join(' | ')} |\n`;
            });
            md += `\n`;
          } catch (e) { md += `[Database Data Error]\n\n`; }
          break;
        case 'mindmap':
          md += `*Mind map exported as text list*\n`;
          const walkMindMap = (node: MindMapNode, depth: number) => {
            md += `${'  '.repeat(depth)}- ${node.text}\n`;
            node.children.forEach(c => walkMindMap(c, depth + 1));
          };
          try { walkMindMap(JSON.parse(block.content), 0); } catch(e) {}
          md += `\n`;
          break;
        default:
          md += `${block.content}\n\n`;
          break;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(page.title || 'context').toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent, block: Block) => {
    const index = page.blocks.findIndex(b => b.id === block.id);
    if (e.key === '/') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + window.scrollY, left: Math.min(rect.left + window.scrollX, window.innerWidth - 260) });
    } else if (e.key === 'Enter' && !e.shiftKey) {
      if (!['text', 'heading', 'todo', 'callout'].includes(block.type)) return;
      e.preventDefault();
      addBlock(block.id);
    } else if (e.key === 'Backspace' && block.content === '' && page.blocks.length > 1) {
      e.preventDefault();
      const prevBlock = page.blocks[index - 1];
      updateBlocks(page.blocks.filter(b => b.id !== block.id));
      if (prevBlock) setFocusedBlockId(prevBlock.id);
    }
  };

  const handleCommandSelect = (type: string) => {
    if (!focusedBlockId) return;
    if (type.startsWith('tpl:')) {
      const template = TEMPLATES[type];
      const newBlocks = [...page.blocks];
      const index = newBlocks.findIndex(b => b.id === focusedBlockId);
      const tBlocks = template.blocks.map(b => ({ ...b, id: Math.random().toString(36).substr(2, 9) }));
      newBlocks.splice(index + 1, 0, ...tBlocks);
      updateBlocks(newBlocks);
      setMenuPosition(null);
      return;
    }

    const bType: BlockType = type.startsWith('code:') ? 'code' : (type as BlockType);
    let content = '';
    if (bType === 'kanban') content = JSON.stringify({ columns: [{ id: 'c1', title: 'To Do', cards: [] }] });
    if (bType === 'database') content = JSON.stringify({ columns: [{ id: 'c1', title: 'Item', type: 'text' }], rows: [] });
    if (bType === 'mindmap') content = JSON.stringify({ id: 'root', text: 'Core Idea', x: 400, y: 300, children: [] });

    const updated = page.blocks.map(b => b.id === focusedBlockId ? { ...b, type: bType, content } : b);
    updateBlocks(updated);
    setMenuPosition(null);
  };

  return (
    <div 
      ref={editorContainerRef}
      onClick={handleContainerClick}
      className={`max-w-2xl mx-auto px-6 py-24 pb-[60vh] min-h-screen transition-all duration-700 cursor-text editor-inner-container ${focusMode ? 'bg-white dark:bg-zinc-950' : ''}`}
    >
      <div className="mb-16 space-y-8 pointer-events-auto">
        <div className="flex items-center justify-between gap-6">
          <input
            value={page.title}
            onChange={(e) => onUpdate({ ...page, title: e.target.value })}
            placeholder="Draft Context"
            className="w-full text-4xl font-black bg-transparent border-none focus:ring-0 placeholder-zinc-100 dark:placeholder-zinc-800 tracking-tighter text-zinc-900 dark:text-zinc-50"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={exportToMarkdown}
              className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-cyan-500 transition-all active:scale-95" 
              title="Export as Markdown"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </button>
            <button onClick={toggleDarkMode} className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-cyan-500 transition-all active:scale-95" title="Quick Theme Toggle">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setFocusMode(!focusMode)} className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${focusMode ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-xl' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600 hover:text-cyan-500'}`}>
              {focusMode ? 'Focus Active' : 'Focus Mode'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 pointer-events-auto">
        {page.blocks.map((block) => (
          <div key={block.id} onClick={(e) => e.stopPropagation()}>
            <BlockItem
              block={block}
              isFocused={focusedBlockId === block.id}
              isRecent={false}
              anyBlockFocused={focusedBlockId !== null || focusMode}
              autoExpand={newMindMapId === block.id}
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
                const [r] = newBlocks.splice(s, 1);
                newBlocks.splice(t, 0, r);
                updateBlocks(newBlocks);
                setDraggedBlockId(null);
              }}
            />
          </div>
        ))}
      </div>

      {menuPosition && <div onClick={(e) => e.stopPropagation()}><CommandMenu position={menuPosition} onSelect={handleCommandSelect} onClose={() => setMenuPosition(null)} /></div>}
      
      <div onClick={(e) => e.stopPropagation()}>
        <GeminiAssistant page={page} onInsertBlocks={(bs) => updateBlocks([...page.blocks, ...bs])} />
      </div>
    </div>
  );
};
