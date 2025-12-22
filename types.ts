
export type BlockType = 
  | 'text' 
  | 'heading' 
  | 'todo' 
  | 'code' 
  | 'divider' 
  | 'kanban' 
  | 'database' 
  | 'mindmap'
  | 'callout';

export type ScheduleType = 'today' | 'week' | 'someday' | null;

export interface Block {
  id: string;
  type: BlockType;
  content: string; 
  checked?: boolean;
  schedule?: ScheduleType;
  lastEditedAt?: number; 
  metadata?: any; 
}

export interface Page {
  id: string;
  title: string;
  blocks: Block[];
  updatedAt: number;
}

export interface AppState {
  pages: Page[];
  activePageId: string | null;
}

export interface KanbanData {
  columns: {
    id: string;
    title: string;
    cards: { id: string; content: string; checked?: boolean }[];
  }[];
}

export interface DatabaseData {
  columns: { id: string; title: string; type: 'text' | 'number' | 'checkbox' | 'date' }[];
  rows: Record<string, any>[];
}

export interface MindMapNode {
  id: string;
  text: string;
  children: MindMapNode[];
  x?: number; // X offset from parent or center
  y?: number; // Y offset from parent or center
}
