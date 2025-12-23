
import React, { useRef, useEffect, useState } from 'react';
import { Block, BlockType, ScheduleType } from '../types';
import { KanbanBlock } from './blocks/KanbanBlock';
import { DatabaseBlock } from './blocks/DatabaseBlock';
import { MindMapBlock } from './blocks/MindMapBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ProjectManagementBlock } from './blocks/ProjectManagementBlock';

interface BlockItemProps {
  block: Block;
  isFocused: boolean;
  isSelected?: boolean;
  isRecent: boolean;
  anyBlockFocused: boolean;
  autoExpand?: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDrop: () => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({ 
  block, 
  isFocused,
  isSelected,
  isRecent,
  anyBlockFocused,
  autoExpand,
  onUpdate, 
  onKeyDown, 
  onFocus,
  onDelete,
  onDragStart,
  onDrop
}) => {
  const editableRef = useRef<HTMLTextAreaElement>(null);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    const textTypes = ['text', 'heading', 'todo', 'callout'];
    if (isFocused && editableRef.current && textTypes.includes(block.type)) {
      editableRef.current.focus();
    }
  }, [isFocused, block.type]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ content: e.target.value, lastEditedAt: Date.now() });
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 600);
  };

  const handleScheduleSelect = (s: ScheduleType) => {
    onUpdate({ schedule: s });
    setShowSchedule(false);
  };

  const renderContent = () => {
    const commonClasses = "w-full bg-transparent border-none focus:ring-0 resize-none p-0 placeholder-zinc-200 dark:placeholder-zinc-800 transition-all leading-relaxed";
    
    switch (block.type) {
      case 'heading':
        return (
          <textarea
            ref={editableRef}
            value={block.content}
            onChange={handleInput}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            placeholder="Heading"
            className={`${commonClasses} text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight`}
            rows={1}
          />
        );
      case 'todo':
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-3">
              <button 
                onClick={() => onUpdate({ checked: !block.checked, lastEditedAt: Date.now() })}
                className={`mt-1.5 w-4 h-4 rounded border flex-shrink-0 transition-all flex items-center justify-center ${
                  block.checked ? 'bg-cyan-500 border-cyan-500' : 'border-zinc-200 dark:border-zinc-800 hover:border-cyan-500'
                }`}
              >
                {block.checked && <span className="text-white text-[8px]">✓</span>}
              </button>
              <textarea
                ref={editableRef}
                value={block.content}
                onChange={handleInput}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                placeholder="To-do"
                className={`${commonClasses} ${
                  block.checked ? 'line-through text-zinc-300 dark:text-zinc-700' : 'text-zinc-800 dark:text-zinc-100'
                }`}
                rows={1}
              />
              {isFocused && (
                <button 
                  onClick={() => setShowSchedule(!showSchedule)}
                  className={`p-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${block.schedule ? 'text-cyan-500 bg-cyan-500/10' : 'text-zinc-300 hover:text-cyan-500'}`}
                >
                  {block.schedule || 'Schedule'}
                </button>
              )}
            </div>
            {showSchedule && (
              <div className="ml-7 flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                {(['today', 'week', 'someday', null] as const).map(s => (
                  <button
                    key={String(s)}
                    onClick={() => handleScheduleSelect(s)}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${
                      block.schedule === s 
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white' 
                      : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-cyan-500'
                    }`}
                  >
                    {s || 'None'}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      case 'callout':
        return (
          <div className="flex gap-4 p-5 bg-cyan-500/[0.03] dark:bg-cyan-500/[0.05] rounded-2xl border border-cyan-500/10 dark:border-cyan-500/20 items-start">
            <span className="text-lg opacity-60">💡</span>
            <textarea
              ref={editableRef}
              value={block.content}
              onChange={handleInput}
              onKeyDown={onKeyDown}
              onFocus={onFocus}
              placeholder="Insight..."
              className={`${commonClasses} text-cyan-600 dark:text-cyan-400 italic font-medium`}
              rows={1}
            />
          </div>
        );
      case 'code':
        return (
          <CodeBlock
            content={block.content}
            metadata={block.metadata}
            onChange={(content, metadata) => onUpdate({ content, metadata, lastEditedAt: Date.now() })}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
          />
        );
      case 'divider':
        return (
          <div className="py-6 cursor-pointer group" onClick={onFocus}>
            <hr className="border-zinc-100 dark:border-zinc-900 group-hover:border-cyan-500/20 transition-colors" />
          </div>
        );
      case 'kanban':
        return (
          <div onFocus={onFocus} tabIndex={0} className="outline-none py-4">
            <KanbanBlock data={JSON.parse(block.content)} onChange={(d) => onUpdate({ content: JSON.stringify(d) })} />
          </div>
        );
      case 'database':
        return (
          <div onFocus={onFocus} tabIndex={0} className="outline-none py-4">
            <DatabaseBlock data={JSON.parse(block.content)} onChange={(d) => onUpdate({ content: JSON.stringify(d) })} />
          </div>
        );
      case 'mindmap':
        return (
          <div onFocus={onFocus} tabIndex={0} className="outline-none py-4">
            <MindMapBlock root={JSON.parse(block.content)} autoExpand={autoExpand} onChange={(r) => onUpdate({ content: JSON.stringify(r) })} />
          </div>
        );
      case 'project_os':
        return (
          <div onFocus={onFocus} tabIndex={0} className="outline-none py-4">
            <ProjectManagementBlock content={block.content} onChange={(c) => onUpdate({ content: c })} />
          </div>
        );
      default:
        return (
          <textarea
            ref={editableRef}
            value={block.content}
            onChange={handleInput}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            placeholder="Draft thought..."
            className={`${commonClasses} text-zinc-900 dark:text-zinc-50`}
            rows={1}
          />
        );
    }
  };

  const isActive = isFocused || isSelected;
  const opacity = anyBlockFocused && !isActive ? 'opacity-30 blur-[0.6px]' : 'opacity-100';

  return (
    <div 
      className={`relative px-4 py-2 transition-all duration-300 rounded-xl group ${opacity} ${isActive ? 'bg-zinc-50/50 dark:bg-zinc-900/40 shadow-sm' : ''}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className={`absolute -left-10 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2'}`}>
        <button 
          draggable
          onDragStart={onDragStart}
          className="p-1.5 text-zinc-300 hover:text-cyan-500 cursor-grab active:cursor-grabbing transition-colors hidden lg:block"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" /></svg>
        </button>
        <button onClick={onDelete} className="p-1.5 text-zinc-300 hover:text-red-500 ml-1 transition-colors" title="Delete Block">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      <div className={`transition-all duration-500 ${isFocused ? 'pl-4 border-l-2 border-cyan-500' : 'border-l-2 border-transparent'}`}>
        {renderContent()}
      </div>
      
      {saveIndicator && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      )}
    </div>
  );
};
