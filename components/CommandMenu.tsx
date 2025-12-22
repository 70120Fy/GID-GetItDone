import React from 'react';
import { BlockType } from '../types';
import { TEMPLATES } from '../utils/templates';

interface CommandMenuProps {
  onSelect: (type: BlockType | string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

const COMMANDS: { type: string; label: string; icon: string; category: string }[] = [
  { type: 'text', label: 'Draft Text', icon: 'T', category: 'Basic' },
  { type: 'heading', label: 'Heading', icon: 'H', category: 'Basic' },
  { type: 'todo', label: 'Action Item', icon: '✓', category: 'Basic' },
  { type: 'callout', label: 'Insight', icon: '💡', category: 'Basic' },
  { type: 'divider', label: 'Divider', icon: '—', category: 'Basic' },
  { type: 'kanban', label: 'Blank Board', icon: '▥', category: 'Systems' },
  { type: 'database', label: 'Blank Table', icon: '▦', category: 'Systems' },
  { type: 'tpl:kanban_board', label: 'Workflow Master', icon: '📊', category: 'Featured Templates' },
  { type: 'tpl:project_db', label: 'Context Database', icon: '▦', category: 'Featured Templates' },
  { type: 'mindmap', label: 'Synapse Map', icon: '☘', category: 'Systems' },
  { type: 'code:python', label: 'Python Lab', icon: '🐍', category: 'Engineering' },
  { type: 'code:html', label: 'Website Builder', icon: '🌐', category: 'Engineering' },
  { type: 'code:javascript', label: 'JS Lab', icon: '📜', category: 'Engineering' },
  ...Object.entries(TEMPLATES).filter(([k]) => k !== 'tpl:kanban_board' && k !== 'tpl:project_db').map(([key, tpl]) => ({
    type: key,
    label: tpl.title,
    icon: tpl.icon,
    category: 'Library'
  }))
];

export const CommandMenu: React.FC<CommandMenuProps> = ({ onSelect, onClose, position }) => {
  const categories = Array.from(new Set(COMMANDS.map(c => c.category)));

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div 
        className="fixed z-[70] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] rounded-3xl w-72 py-5 overflow-hidden max-h-[480px] overflow-y-auto animate-in fade-in zoom-in duration-300 backdrop-blur-3xl"
        style={{ top: position.top, left: position.left }}
      >
        {categories.map(cat => (
          <div key={cat} className="mb-5 last:mb-0">
            <div className="px-6 py-1.5 text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.3em] mb-1.5">
              {cat}
            </div>
            <div className="px-2 space-y-0.5">
              {COMMANDS.filter(c => c.category === cat).map((cmd) => (
                <button
                  key={cmd.type}
                  onClick={() => onSelect(cmd.type)}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 rounded-2xl transition-all group active:scale-[0.98]"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 rounded-xl mr-3.5 text-xs font-bold border border-zinc-100 dark:border-zinc-700 group-hover:bg-white dark:group-hover:bg-zinc-700 group-hover:border-cyan-500/20 transition-all shadow-sm">
                    {cmd.icon}
                  </span>
                  <span className="font-bold text-[13px] tracking-tight group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{cmd.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};