
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
  { type: 'kanban', label: 'Board', icon: '▥', category: 'Systems' },
  { type: 'database', label: 'Table', icon: '▦', category: 'Systems' },
  { type: 'mindmap', label: 'Map', icon: '☘', category: 'Systems' },
  { type: 'code:python', label: 'Python Lab', icon: '🐍', category: 'Engineering' },
  { type: 'code:html', label: 'Static Website', icon: '🌐', category: 'Engineering' },
  { type: 'code:javascript', label: 'JS Console', icon: '📜', category: 'Engineering' },
  ...Object.entries(TEMPLATES).map(([key, tpl]) => ({
    type: key,
    label: tpl.title,
    icon: tpl.icon,
    category: 'Templates'
  }))
];

export const CommandMenu: React.FC<CommandMenuProps> = ({ onSelect, onClose, position }) => {
  const categories = Array.from(new Set(COMMANDS.map(c => c.category)));

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div 
        className="fixed z-[70] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] rounded-2xl w-64 py-4 overflow-hidden max-h-[440px] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300"
        style={{ top: position.top, left: position.left }}
      >
        {categories.map(cat => (
          <div key={cat} className="mb-4 last:mb-0">
            <div className="px-5 py-1 text-[9px] font-black text-zinc-200 dark:text-zinc-700 uppercase tracking-[0.25em] mb-1">
              {cat}
            </div>
            {COMMANDS.filter(c => c.category === cat).map((cmd) => (
              <button
                key={cmd.type}
                onClick={() => onSelect(cmd.type)}
                className="w-full flex items-center px-5 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
              >
                <span className="w-7 h-7 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 rounded-lg mr-3 text-[10px] font-bold border border-zinc-100 dark:border-zinc-700 group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors">
                  {cmd.icon}
                </span>
                <span className="font-semibold group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{cmd.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
