
import React, { useState, useEffect, useRef } from 'react';
import { MindMapNode } from '../../types';

interface MindMapBlockProps {
  root: MindMapNode;
  onChange: (newRoot: MindMapNode) => void;
  autoExpand?: boolean;
}

export const MindMapBlock: React.FC<MindMapBlockProps> = ({ root, onChange, autoExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoExpand) {
      setIsExpanded(true);
    }
  }, [autoExpand]);

  const updateNode = (nodeId: string, updates: Partial<MindMapNode>) => {
    const updateRecursive = (current: MindMapNode): MindMapNode => {
      if (current.id === nodeId) {
        return { ...current, ...updates };
      }
      return {
        ...current,
        children: current.children.map(updateRecursive)
      };
    };
    onChange(updateRecursive(root));
  };

  const addChild = (parentId: string) => {
    const newNode: MindMapNode = {
      id: Math.random().toString(36).substr(2, 9),
      text: 'New Idea',
      children: [],
      x: 100, 
      y: 0
    };

    const addRecursive = (current: MindMapNode): MindMapNode => {
      if (current.id === parentId) {
        return { ...current, children: [...current.children, newNode] };
      }
      return {
        ...current,
        children: current.children.map(addRecursive)
      };
    };
    onChange(addRecursive(root));
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === root.id) return; 
    const deleteRecursive = (current: MindMapNode): MindMapNode => {
      return {
        ...current,
        children: current.children
          .filter(child => child.id !== nodeId)
          .map(deleteRecursive)
      };
    };
    onChange(deleteRecursive(root));
  };

  const handlePointerDown = (e: React.PointerEvent, nodeId: string, nodeX: number, nodeY: number) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') return;
    setDraggingNodeId(nodeId);
    setDragOffset({ x: e.clientX - nodeX, y: e.clientY - nodeY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNodeId) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    updateNode(draggingNodeId, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggingNodeId(null);
  };

  const renderLines = (node: MindMapNode, parentX: number, parentY: number): React.ReactNode => {
    const currentX = (node.x || 0);
    const currentY = (node.y || 0);
    
    return (
      <React.Fragment key={`lines-${node.id}`}>
        {node.children.map(child => {
          const cx = (child.x || 0);
          const cy = (child.y || 0);
          return (
            <svg key={`line-${node.id}-${child.id}`} className="absolute inset-0 pointer-events-none w-full h-full overflow-visible">
              <line 
                x1={currentX + 60} y1={currentY + 20} 
                x2={cx + 60} y2={cy + 20} 
                className="stroke-zinc-200 dark:stroke-zinc-800" 
                strokeWidth="2" 
              />
            </svg>
          );
        })}
        {node.children.map(child => renderLines(child, currentX, currentY))}
      </React.Fragment>
    );
  };

  const renderNodesFlat = (node: MindMapNode): React.ReactNode => {
    const x = node.x || 0;
    const y = node.y || 0;

    return (
      <React.Fragment key={`node-frag-${node.id}`}>
        <div 
          style={{ transform: `translate(${x}px, ${y}px)` }}
          onPointerDown={(e) => handlePointerDown(e, node.id, x, y)}
          className={`absolute flex items-center group transition-shadow ${draggingNodeId === node.id ? 'z-50 cursor-grabbing' : 'z-10 cursor-grab active:cursor-grabbing'}`}
        >
          <div className="relative flex items-center gap-2">
            <input 
              value={node.text}
              onChange={(e) => updateNode(node.id, { text: e.target.value })}
              className={`px-4 py-2 rounded-xl border shadow-sm focus:ring-2 focus:ring-zinc-500 outline-none transition-all min-w-[120px] ${
                node.id !== root.id
                  ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100' 
                  : 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 font-bold'
              }`}
            />
            
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => addChild(node.id)} 
                className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-950 text-xs border border-zinc-200 dark:border-zinc-700"
              >
                +
              </button>
              {node.id !== root.id && (
                <button 
                  onClick={() => deleteNode(node.id)} 
                  className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-red-500 hover:text-white text-xs border border-zinc-200 dark:border-zinc-700"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
        {node.children.map(child => renderNodesFlat(child))}
      </React.Fragment>
    );
  };

  const Canvas = ({ expanded }: { expanded: boolean }) => (
    <div 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative ${expanded ? 'h-full w-full overflow-auto p-40 bg-zinc-50 dark:bg-zinc-950' : 'h-[300px] w-full overflow-hidden bg-zinc-50/20 dark:bg-zinc-900/10'}`}
    >
      <div className="relative w-[2000px] h-[2000px]">
        {renderLines(root, 0, 0)}
        {renderNodesFlat(root)}
      </div>
      
      {!expanded && (
        <div className="absolute top-4 right-4 z-[60]">
          <button 
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm transition-all active:scale-95"
          >
            Expand Map
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={`group relative bg-zinc-50/50 dark:bg-zinc-900/20 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-all duration-500 ${isExpanded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <Canvas expanded={false} />
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-zinc-950 animate-in fade-in zoom-in duration-300 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 lg:px-8 h-16 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm shrink-0">
             <div className="flex items-center gap-3">
                <span className="text-xl">☘</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">Brainstorm Workspace</span>
             </div>
             <button 
               onClick={() => setIsExpanded(false)}
               className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-all"
             >
               <span className="text-[10px] font-black uppercase tracking-widest">Close Map</span>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
             </button>
          </div>
          <div className="flex-1 overflow-hidden">
             <Canvas expanded={true} />
          </div>
          <div className="h-12 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-8 bg-zinc-50 dark:bg-zinc-900/30 shrink-0">
             <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Draggable Node Logic • Auto-Save Enabled</span>
             <span className="hidden sm:block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Use + to expand topics • Drag to reorder</span>
          </div>
        </div>
      )}
    </>
  );
};
