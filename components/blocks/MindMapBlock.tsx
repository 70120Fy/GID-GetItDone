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

  const addChild = (parentId: string, parentX: number = 0, parentY: number = 0) => {
    const newNode: MindMapNode = {
      id: Math.random().toString(36).substr(2, 9),
      text: 'New Connection',
      children: [],
      x: parentX + 220, 
      y: parentY + (Math.random() * 100 - 50)
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
    if (draggingNodeId) {
      setDraggingNodeId(null);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const renderTree = (node: MindMapNode) => {
    const nodes: React.ReactNode[] = [];
    const lines: React.ReactNode[] = [];

    const traverse = (n: MindMapNode) => {
      const nx = n.x || 0;
      const ny = n.y || 0;

      nodes.push(
        <div 
          key={`node-${n.id}`}
          style={{ 
            left: `${nx}px`, 
            top: `${ny}px`,
            position: 'absolute'
          }}
          onPointerDown={(e) => handlePointerDown(e, n.id, nx, ny)}
          className={`flex items-center group transition-shadow ${draggingNodeId === n.id ? 'z-50 cursor-grabbing' : 'z-10 cursor-grab active:cursor-grabbing'}`}
        >
          <div className="relative flex items-center gap-2">
            <input 
              value={n.text}
              onChange={(e) => updateNode(n.id, { text: e.target.value })}
              className={`px-5 py-2.5 rounded-2xl border shadow-xl focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all min-w-[160px] text-center ${
                n.id !== root.id
                  ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 font-medium' 
                  : 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white font-black text-base uppercase tracking-widest'
              }`}
            />
            
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => addChild(n.id, nx, ny)} 
                className="w-8 h-8 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white text-xs border border-zinc-100 dark:border-zinc-700 shadow-xl transition-all active:scale-90"
              >
                +
              </button>
              {n.id !== root.id && (
                <button 
                  onClick={() => deleteNode(n.id)} 
                  className="w-8 h-8 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center hover:bg-red-500 hover:text-white text-xs border border-zinc-100 dark:border-zinc-700 shadow-xl transition-all active:scale-90"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      );

      n.children.forEach(child => {
        const cx = child.x || 0;
        const cy = child.y || 0;
        // Draw a nice bezier curve or straight line
        lines.push(
          <path 
            key={`line-${n.id}-${child.id}`}
            d={`M ${nx + 80} ${ny + 20} L ${cx + 80} ${cy + 20}`}
            className="stroke-cyan-500/20 dark:stroke-cyan-400/20" 
            strokeWidth="3" 
            fill="none"
            strokeDasharray="8 8"
          />
        );
        traverse(child);
      });
    };

    traverse(node);
    return { nodes, lines };
  };

  const { nodes, lines } = renderTree(root);

  const Canvas = ({ expanded }: { expanded: boolean }) => (
    <div 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative select-none overflow-auto custom-scrollbar touch-none overscroll-none ${expanded ? 'h-full w-full p-40 bg-zinc-50 dark:bg-zinc-950' : 'h-[350px] w-full bg-cyan-500/[0.02] dark:bg-cyan-500/[0.04]'}`}
    >
      <div className="relative w-[3000px] h-[3000px] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {lines}
        </svg>
        <div className="absolute inset-0 pointer-events-auto">
          {nodes}
        </div>
      </div>
      
      {!expanded && (
        <div className="absolute top-6 right-6 z-[60]">
          <button 
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 px-5 py-2.5 bg-zinc-900 dark:bg-white border border-zinc-900 dark:border-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white dark:text-black hover:scale-105 shadow-2xl transition-all active:scale-95"
          >
            Expand Synapse View
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={`group relative bg-zinc-50/50 dark:bg-zinc-900/20 rounded-3xl border border-cyan-500/5 dark:border-cyan-500/10 overflow-hidden transition-all duration-500 ${isExpanded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 shadow-inner'}`}>
        <Canvas expanded={false} />
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-zinc-950 animate-in fade-in zoom-in duration-300 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-8 h-20 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm shrink-0 safe-top">
             <div className="flex items-center gap-4">
                <span className="text-2xl animate-pulse">☘</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Synapse Architecture</span>
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-0.5">Mapping Core Connections</span>
                </div>
             </div>
             <button 
               onClick={() => setIsExpanded(false)}
               className="flex items-center gap-3 px-6 py-2.5 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:text-cyan-500 hover:bg-cyan-500/5 rounded-2xl transition-all border border-zinc-100 dark:border-zinc-800"
             >
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Close Workspace</span>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
             </button>
          </div>
          <div className="flex-1 overflow-hidden relative">
             <Canvas expanded={true} />
          </div>
          <div className="h-16 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-10 bg-white dark:bg-zinc-950 shrink-0">
             <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Synapse Engine • Offline Encrypted</span>
             <span className="hidden md:block text-[9px] font-black text-cyan-500 uppercase tracking-[0.25em]">Drag components to restructure logic • + To branch thoughts</span>
          </div>
        </div>
      )}
    </>
  );
};