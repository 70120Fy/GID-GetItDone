
import React, { useRef, useEffect, useState } from 'react';
import { Block, BlockType, ScheduleType } from '../types';
import { KanbanBlock } from './blocks/KanbanBlock';
import { DatabaseBlock } from './blocks/DatabaseBlock';
import { MindMapBlock } from './blocks/MindMapBlock';
import { CodeBlock } from './blocks/CodeBlock';

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
  const [isTyping, setIsTyping] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const typingTimeout = useRef<any>(null);

  useEffect(() => {
    const textTypes = ['text', 'heading', 'todo', 'callout'];
    if (isFocused && editableRef.current && textTypes.includes(block.type)) {
      editableRef.current.focus();
    }
  }, [isFocused, block.type]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 1500);

    onUpdate({ content: e.target.value, lastEditedAt: Date.now() });
    
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
    
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 600);
  };

  const cycleSchedule = () => {
    const schedules: ScheduleType[] = [null, 'today', 'week', 'someday'];
    const currentIndex = schedules.indexOf(block.schedule || null);
    const nextIndex = (currentIndex + 1) % schedules.length;
    onUpdate({ schedule: schedules[nextIndex], lastEditedAt: Date.now() });
  };

  const renderScheduleBadge = () => {
    if (!block.schedule) return null;
    const colors = {
      today: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800',
      week: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
      someday: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800'
    };
    return (
      <button 
        onClick={cycleSchedule}
        className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border transition-all active:scale-90 ${colors[block.schedule]}`}
      >
        {block.schedule}
      </button>
    );
  };

  const renderContent = () => {
    const commonClasses = "w-full bg-transparent border-none focus:ring-0 resize-none p-0 placeholder-zinc-300 dark:placeholder-zinc-700 transition-all leading-relaxed";
    
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
          <div className="flex items-start gap-3">
            <button 
              onClick={() => onUpdate({ checked: !block.checked, lastEditedAt: Date.now() })}
              className={`mt-1.5 w-4 h-4 rounded border-2 flex-shrink-0 transition-all flex items-center justify-center ${
                block.checked ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
              }`}
            >
              {block.checked && <span className="text-white dark:text-black text-[8px]">✓</span>}
            </button>
            <div className="flex-1">
              <textarea
                ref={editableRef}
                value={block.content}
                onChange={handleInput}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                placeholder="To-do"
                className={`${commonClasses} ${
                  block.checked ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-800 dark:text-zinc-100'
                }`}
                rows={1}
              />
              <div className="flex gap-2 mt-1">{renderScheduleBadge()}</div>
            </div>
          </div>
        );
      case 'callout':
        return (
          <div className="flex gap-4 p-5 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 items-start">
            <span className="text-lg opacity-40">💡</span>
            <textarea
              ref={editableRef}
              value={block.content}
              onChange={handleInput}
              onKeyDown={onKeyDown}
              onFocus={onFocus}
              placeholder="Insight..."
              className={`${commonClasses} text-zinc-700 dark:text-zinc-300 italic font-medium`}
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
            <hr className="border-zinc-100 dark:border-zinc-800 group-hover:border-zinc-200 dark:group-hover:border-zinc-700 transition-colors" />
          </div>
        );
      case 'kanban':
        return (
          <div onFocus={onFocus} tabIndex={0} className="outline-none py-4">
            <KanbanBlock 
              data={JSON.parse(block.content || '{"columns":[]}')} 
              onChange={(data) => onUpdate({ content: JSON.stringify(data), lastEditedAt: Date.now() })}
            />
          </div>
        );
      case 'database':
        return (
          <div onFocus={onFocus} tabIndex={0} className="outline-none py-4">
            <DatabaseBlock 
              data={JSON.parse(block.content || '{"columns":[],"rows":[]}')} 
              onChange={(data) => onUpdate({ content: JSON.stringify(data), lastEditedAt: Date.now() })}
            />
          </div>
        );
      case 'mindmap':
        return (
          <div onFocus={onFocus} tabIndex={0} className="outline-none py-4">
            <MindMapBlock 
              root={JSON.parse(block.content || '{"id":"root","text":"Idea","children":[]}')}
              autoExpand={autoExpand}
              onChange={(root) => onUpdate({ content: JSON.stringify(root), lastEditedAt: Date.now() })}
            />
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <textarea
              ref={editableRef}
              value={block.content}
              onChange={handleInput}
              onKeyDown={onKeyDown}
              onFocus={onFocus}
              placeholder="Start drafting thought..."
              className={`${commonClasses} text-zinc-900 dark:text-zinc-50`}
              rows={1}
            />
            {renderScheduleBadge()}
          </div>
        );
    }
  };

  const opacity = anyBlockFocused && !isFocused && !isSelected ? 'opacity-30 dark:opacity-20 blur-[0.6px]' : 'opacity-100';
  const recentGlow = isRecent && !anyBlockFocused ? 'border-l-2 border-black/10 dark:border-white/10' : 'border-l-2 border-transparent';
  const selectionStyle = isSelected ? 'bg-zinc-100 dark:bg-zinc-800/80 shadow-inner' : isFocused ? 'bg-zinc-50/40 dark:bg-zinc-900/40 shadow-sm' : '';

  return (
    <div 
      className={`relative px-4 py-2 transition-all duration-300 rounded-xl group ${opacity} ${recentGlow} ${selectionStyle}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex">
        <button 
          draggable
          onDragStart={onDragStart}
          className="p-1.5 text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-grab active:cursor-grabbing transition-colors"
          title="Drag to move"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
          </svg>
        </button>
        <button 
          onClick={onDelete}
          className="p-1.5 text-zinc-300 hover:text-red-400 transition-colors"
          title="Delete block"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {renderContent()}
      
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-900/10 dark:bg-white/10 transition-opacity duration-300 pointer-events-none ${saveIndicator ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
};
