
export type BlockType = 
  | 'text' 
  | 'heading' 
  | 'todo' 
  | 'code' 
  | 'divider' 
  | 'kanban' 
  | 'database' 
  | 'mindmap'
  | 'project_os'
  | 'callout'
  | 'embed'; // Added embed for Synapse Live Links

export type ScheduleType = 'today' | 'week' | 'someday' | null;
export type ImportanceLevel = 'High' | 'Medium' | 'Low' | 'Extension';

export interface LinkMetadata {
  sourcePageId: string;
  sourceBlockId?: string;
  type: 'live' | 'snapshot';
  createdAt: number;
  updatedAt: number;
}

export interface SubTask {
  id: string;
  text: string;
  checked: boolean;
}

export interface TaskMetadata {
  importance: ImportanceLevel;
  status: string;
  subTasks: SubTask[];
  deadline?: number; 
  startDate?: number; 
  reminderSent?: Record<string, boolean>;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string; 
  checked?: boolean;
  schedule?: ScheduleType;
  lastEditedAt?: number; 
  metadata?: any; 
  linkMetadata?: LinkMetadata; // Added for Synapse system
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
  secondaryPageId: string | null; // Added for Split View
  isSplitPinned: boolean;
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
  x?: number;
  y?: number;
  isExpanded?: boolean;
  taskId?: string;
}
