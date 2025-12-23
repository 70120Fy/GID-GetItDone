
import React, { useRef, useEffect, useState } from 'react';
import { Block, BlockType, Page, ScheduleType } from '../types';
import { KanbanBlock } from './blocks/KanbanBlock';
import { DatabaseBlock } from './blocks/DatabaseBlock';
import { MindMapBlock } from './blocks/MindMapBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ProjectManagementBlock } from './blocks/ProjectManagementBlock';

interface BlockItemProps {
  block: Block;
  isFocused: boolean;
  allPages: Page[];
  anyBlockFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDrop: () => void;
  onLinkTo: () => void;
  onJumpToSource: (pid: string) => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({ 
  block, isFocused, allPages, anyBlockFocused, onUpdate, onKeyDown, onFocus, onDelete, onDragStart, onDrop, onLinkTo, onJumpToSource
}) => {
  const editableRef = useRef<HTMLTextAreaElement>(null);
  const [showSynapseMenu, setShowSynapseMenu] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    const textTypes = ['text', 'heading', 'todo', 'callout', 'embed'];
    if (isFocused && editableRef.current && textTypes.includes(block.type)) {
      editableRef.current.focus();
    }
  }, [isFocused, block.type]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ content: e.target.value, lastEditedAt: Date.now() });
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // ACTION: RefreshLink(linkId)
  const handleRefresh = () => {
    if (block.linkMetadata) {
      const sourcePage = allPages.find(p => p.id === block.linkMetadata?.sourcePageId);
      const sourceBlock = sourcePage?.blocks.find(b => b.id === block.linkMetadata?.sourceBlockId);
      if (sourceBlock) {
        onUpdate({ content: sourceBlock.content, lastEditedAt: Date.now() });
      }
    }
    setShowSynapseMenu(false);
  };

  // ACTION: LinkSettings(linkId)
  const toggleLinkType = () => {
    if (block.linkMetadata) {
      const newType = block.linkMetadata.type === 'live' ? 'snapshot' : 'live';
      onUpdate({
        linkMetadata: { ...block.linkMetadata, type: newType, updatedAt: Date.now() },
        type: newType === 'live' ? 'embed' : 'text'
      });
    }
    setShowSynapseMenu(false);
  };

  const renderContent = () => {
    const commonClasses = "w-full bg-transparent border-none focus:ring-0 resize-none p-0 placeholder-zinc-200 dark:placeholder-zinc-800 transition-all leading-relaxed";
    
    // ACTION: EmbedLive() vs InsertSnapshot() display
    if (block.type === 'embed' && block.linkMetadata) {
      const sourcePage = allPages.find(p => p.id === block.linkMetadata?.sourcePageId);
      const sourceBlock = sourcePage?.blocks.find(b => b.id === block.linkMetadata?.sourceBlockId);
      const displayContent = (block.linkMetadata.type === 'live' && sourceBlock) ? sourceBlock.content : block.content;
      
      return (
        <div className="relative group/embed border-l-4 border-cyan-500 pl-6 py-4 bg-cyan-500/5 rounded-r-3xl transition-all">
          <div className="flex items-center gap-2 mb-2 text-[8px] font-black uppercase text-cyan-500 tracking-widest opacity-60">
            <span>{block.linkMetadata.type === 'live' ? 'Live Synapse' : 'Context Snapshot'}</span>
            {block.linkMetadata.type === 'live' && <span className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed italic">
            {displayContent || (sourcePage ? `Ref: ${sourcePage.title}` : 'Source missing')}
          </div>
          <button 
            onClick={() => onJumpToSource(block.linkMetadata!.sourcePageId)}
            className="mt-3 text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-cyan-500 transition-colors"
          >
            Show Source →
          </button>
        </div>
      );
    }

    switch (block.type) {
      case 'heading':
        return <textarea ref={editableRef} value={block.content} onKeyDown={onKeyDown} onChange={handleInput} onFocus={onFocus} placeholder="Heading" className={`${commonClasses} text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight`} rows={1} />;
      case 'todo':
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-3">
              <button onClick={() => onUpdate({ checked: !block.checked })} className={`mt-1.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${block.checked ? 'bg-cyan-500 border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-zinc-200 dark:border-zinc-800'}`}>{block.checked && <span className="text-white text-[8px]">✓</span>}</button>
              <textarea ref={editableRef} value={block.content} onKeyDown={onKeyDown} onChange={handleInput} onFocus={onFocus} placeholder="Action item" className={`${commonClasses} ${block.checked ? 'line-through text-zinc-300 dark:text-zinc-700' : 'text-zinc-800 dark:text-zinc-100'}`} rows={1} />
              {isFocused && (
                <button onClick={() => setShowSchedule(!showSchedule)} className={`p-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${block.schedule ? 'text-cyan-500 bg-cyan-500/10' : 'text-zinc-300 hover:text-cyan-500'}`}>{block.schedule || 'Schedule'}</button>
              )}
            </div>
            {showSchedule && (
              <div className="ml-7 flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                {(['today', 'week', 'someday', null] as const).map(s => (
                  <button key={String(s)} onClick={() => onUpdate({ schedule: s })} className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${block.schedule === s ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-cyan-500'}`}>{s || 'None'}</button>
                ))}
              </div>
            )}
          </div>
        );
      case 'callout':
        return (
          <div className="flex gap-4 p-5 bg-cyan-500/[0.03] dark:bg-cyan-500/[0.05] rounded-2xl border border-cyan-500/10 dark:border-cyan-500/20 items-start">
            <span className="text-lg opacity-60">💡</span>
            <textarea ref={editableRef} value={block.content} onKeyDown={onKeyDown} onChange={handleInput} onFocus={onFocus} placeholder="Insight..." className={`${commonClasses} text-cyan-600 dark:text-cyan-400 italic font-medium`} rows={1} />
          </div>
        );
      case 'code':
        return <CodeBlock content={block.content} metadata={block.metadata} onChange={(content, metadata) => onUpdate({ content, metadata })} onFocus={onFocus} onKeyDown={onKeyDown} />;
      case 'kanban':
        return <div onFocus={onFocus} tabIndex={0} className="outline-none py-4"><KanbanBlock data={JSON.parse(block.content)} onChange={(d) => onUpdate({ content: JSON.stringify(d) })} /></div>;
      case 'database':
        return <div onFocus={onFocus} tabIndex={0} className="outline-none py-4"><DatabaseBlock data={JSON.parse(block.content)} onChange={(d) => onUpdate({ content: JSON.stringify(d) })} /></div>;
      case 'mindmap':
        return <div onFocus={onFocus} tabIndex={0} className="outline-none py-4"><MindMapBlock root={JSON.parse(block.content)} onChange={(r) => onUpdate({ content: JSON.stringify(r) })} /></div>;
      case 'project_os':
        return <div onFocus={onFocus} tabIndex={0} className="outline-none py-4"><ProjectManagementBlock content={block.content} onChange={(c) => onUpdate({ content: c })} /></div>;
      case 'divider':
        return <div className="py-6 cursor-pointer" onClick={onFocus}><hr className="border-zinc-100 dark:border-zinc-900" /></div>;
      default:
        return <textarea ref={editableRef} value={block.content} onKeyDown={onKeyDown} onChange={handleInput} onFocus={onFocus} placeholder="Draft thought..." className={`${commonClasses} text-zinc-900 dark:text-zinc-50`} rows={1} />;
    }
  };

  const isActive = isFocused;
  const opacity = anyBlockFocused && !isActive ? 'opacity-30 blur-[0.6px]' : 'opacity-100';

  return (
    <div className={`relative px-4 py-2 transition-all duration-300 rounded-xl group ${opacity} ${isActive ? 'bg-zinc-50/50 dark:bg-zinc-900/40 shadow-sm' : ''}`}>
      <div className={`absolute -left-12 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 -translate-x-2'}`}>
        {/* Keep the move the area button */}
        <button draggable onDragStart={onDragStart} className="p-1.5 text-zinc-300 hover:text-cyan-500 cursor-grab active:cursor-grabbing transition-colors" title="Move Block">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" /></svg>
        </button>
        
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowSynapseMenu(!showSynapseMenu); }}
            className={`p-1.5 rounded-lg transition-colors ${block.linkMetadata ? 'text-cyan-500 bg-cyan-500/10 border border-cyan-500/20' : 'text-zinc-300 hover:text-cyan-500'}`}
            title="Synapse Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </button>
          
          {showSynapseMenu && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setShowSynapseMenu(false)} />
              <div className="absolute left-10 top-0 z-[110] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl rounded-2xl w-52 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                {!block.linkMetadata ? (
                  <button onClick={(e) => { e.stopPropagation(); onLinkTo(); setShowSynapseMenu(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-cyan-500 transition-colors">Link to...</button>
                ) : (
                  <>
                    {/* ACTION: ShowSource(linkId) */}
                    <button onClick={() => { onJumpToSource(block.linkMetadata!.sourcePageId); setShowSynapseMenu(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Show Source</button>
                    {/* ACTION: RefreshLink(linkId) */}
                    <button onClick={handleRefresh} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Refresh Link</button>
                    {/* ACTION: LinkSettings(linkId) */}
                    <button onClick={toggleLinkType} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      Set to {block.linkMetadata.type === 'live' ? 'Snapshot' : 'Live'}
                    </button>
                    <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />
                    {/* ACTION: UnlinkFrom(linkId) */}
                    <button onClick={(e) => { e.stopPropagation(); onUpdate({ linkMetadata: undefined, type: 'text' }); setShowSynapseMenu(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">Unlink Relationship</button>
                  </>
                )}
                <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />
                <button onClick={(e) => { e.stopPropagation(); onDelete(); setShowSynapseMenu(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50 transition-colors">Delete Block</button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`transition-all duration-500 ${isFocused ? 'pl-4 border-l-2 border-cyan-500' : 'border-l-2 border-transparent'}`} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
        {renderContent()}
      </div>
    </div>
  );
};
