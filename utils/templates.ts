
import { Block, KanbanData, DatabaseData, MindMapNode } from '../types';

export const TEMPLATES: Record<string, { title: string, icon: string, blocks: Block[] }> = {
  'tpl:project_mgmt': {
    title: 'Project Management',
    icon: '🛰️',
    blocks: [
      { id: 'p1', type: 'heading', content: 'Central Project OS' },
      { id: 'p2', type: 'callout', content: 'Goal: Optimize context engineering workflow.' },
      { id: 'p3', type: 'project_os', content: JSON.stringify({
        tasks: [
          { 
            id: 't1', 
            title: 'Initial Concept Draft', 
            metadata: { 
              importance: 'High', 
              status: 'In Progress', 
              deadline: Date.now() + 172800000,
              subTasks: [
                { id: 'st1', text: 'Research market needs', checked: true },
                { id: 'st2', text: 'Draft technical spec', checked: false }
              ]
            } 
          },
          { 
            id: 't2', 
            title: 'Future Extension A', 
            metadata: { 
              importance: 'Extension', 
              status: 'Backlog', 
              subTasks: []
            } 
          }
        ],
        mindMap: {
          id: 'root',
          text: 'Master Plan',
          x: 2000,
          y: 2000,
          children: [
            { id: 'node1', text: 'Concept Phase', x: 2200, y: 1950, children: [] },
            { id: 'node2', text: 'Build Phase', x: 2200, y: 2050, children: [] }
          ]
        }
      }) }
    ]
  },
  'tpl:daily': {
    title: 'Daily Planner',
    icon: '☀️',
    blocks: [
      { id: 'd1', type: 'heading', content: 'Daily Review' },
      { id: 'd2', type: 'callout', content: 'Core priority for today: ' },
      { id: 'd3', type: 'todo', content: 'Major Objective', schedule: 'today' },
      { id: 'd4', type: 'todo', content: 'Secondary Objective', schedule: 'today' },
      { id: 'd5', type: 'divider', content: '' },
      { id: 'd6', type: 'todo', content: 'Administrative tasks' }
    ]
  },
  'tpl:kanban_board': {
    title: 'Project Board',
    icon: '▥',
    blocks: [
      { id: 'kb1', type: 'heading', content: 'Workflow Architecture' },
      { id: 'kb2', type: 'kanban', content: JSON.stringify({
        columns: [
          { id: 'c1', title: 'Backlog', cards: [{ id: 'k1', content: 'Draft initial concepts', checked: false }] },
          { id: 'c2', title: 'Active', cards: [] },
          { id: 'c3', title: 'In Review', cards: [] },
          { id: 'c4', title: 'Internalized', cards: [] }
        ]
      } as KanbanData) }
    ]
  },
  'tpl:project_db': {
    title: 'Project Database',
    icon: '▦',
    blocks: [
      { id: 'db1', type: 'heading', content: 'Context Master Inventory' },
      { id: 'db2', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'item', title: 'Component', type: 'text' },
          { id: 'status', title: 'Status', type: 'text' },
          { id: 'priority', title: 'Prio', type: 'number' },
          { id: 'verify', title: 'Validated', type: 'checkbox' }
        ],
        rows: [
          { id: 'r1', item: 'Auth Module', status: 'Stable', priority: 1, verify: true },
          { id: 'r2', item: 'Sync Engine', status: 'Testing', priority: 2, verify: false }
        ]
      } as DatabaseData) }
    ]
  },
  'tpl:meeting': {
    title: 'Meeting Notes',
    icon: '👥',
    blocks: [
      { id: 'm1', type: 'heading', content: 'Project Sync' },
      { id: 'm2', type: 'callout', content: 'Context & Participants: ' },
      { id: 'm3', type: 'heading', content: 'Agenda' },
      { id: 'm4', type: 'text', content: '- ' },
      { id: 'm5', type: 'heading', content: 'Decisions & Actions' },
      { id: 'm6', type: 'todo', content: 'Action assigned to: ' }
    ]
  },
  'tpl:goals': {
    title: 'Goal Setting',
    icon: '🎯',
    blocks: [
      { id: 'g1', type: 'heading', content: 'Vision & Goals' },
      { id: 'g2', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'goal', title: 'Objective', type: 'text' },
          { id: 'status', title: 'Progress', type: 'text' },
          { id: 'progress', title: '%', type: 'number' }
        ],
        rows: [{ id: 'r1', goal: 'Example Goal', status: 'In Planning', progress: 5 }]
      } as DatabaseData) }
    ]
  },
  'tpl:mindmap': {
    title: 'Concept Map',
    icon: '☘',
    blocks: [
      { id: 'mm1', type: 'heading', content: 'Idea Architecture' },
      { id: 'mm2', type: 'mindmap', content: JSON.stringify({ 
        id: 'root', 
        text: 'Core Thesis', 
        x: 400, y: 300,
        children: [
          { id: 'node1', text: 'Pillar One', x: 200, y: 150, children: [] },
          { id: 'node2', text: 'Pillar Two', x: 600, y: 150, children: [] }
        ] 
      } as MindMapNode) }
    ]
  },
  'tpl:study': {
    title: 'Knowledge Lab',
    icon: '📚',
    blocks: [
      { id: 'st1', type: 'heading', content: 'Learning Framework: [Topic]' },
      { id: 'st2', type: 'kanban', content: JSON.stringify({
        columns: [
          { id: 'c1', title: 'Curriculum', cards: [] },
          { id: 'c2', title: 'Practicing', cards: [] },
          { id: 'c3', title: 'Mastered', cards: [] }
        ]
      } as KanbanData) }
    ]
  },
  'tpl:habit': {
    title: 'Habit Engine',
    icon: '⚡',
    blocks: [
      { id: 'h1', type: 'heading', content: 'System Optimization' },
      { id: 'h2', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'c1', title: 'Habit', type: 'text' },
          { id: 'm', title: 'M', type: 'checkbox' },
          { id: 't', title: 'T', type: 'checkbox' },
          { id: 'w', title: 'W', type: 'checkbox' },
          { id: 'th', title: 'Th', type: 'checkbox' },
          { id: 'f', title: 'F', type: 'checkbox' },
          { id: 's', title: 'S', type: 'checkbox' },
          { id: 'su', title: 'Su', type: 'checkbox' }
        ],
        rows: [{ id: 'r1', c1: 'Morning Deep Work Block' }]
      } as DatabaseData) }
    ]
  },
  'tpl:webdev': {
    title: 'Static Website',
    icon: '🌐',
    blocks: [
      { id: 'w1', type: 'heading', content: 'UI Prototype' },
      { 
        id: 'w2', 
        type: 'code', 
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff; margin: 0; overflow: hidden; }
    .glass { padding: 50px; border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; text-align: center; background: rgba(255,255,255,0.02); backdrop-filter: blur(40px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    h1 { background: linear-gradient(135deg, #22d3ee, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; letter-spacing: -0.06em; font-size: 3rem; margin: 0; }
    p { opacity: 0.4; font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 10px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="glass">
    <h1>G I D</h1>
    <p>Context Studio v1.0</p>
  </div>
</body>
</html>`,
        metadata: { language: 'html' }
      }
    ]
  },
  'tpl:python_lab': {
    title: 'Python Lab',
    icon: '🐍',
    blocks: [
      { id: 'p1', type: 'heading', content: 'Computation Engine' },
      { 
        id: 'p2', 
        type: 'code', 
        content: `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print("Generating sequence:")
print(list(fibonacci(10)))

# Simple data processing example
data = {"users": 150, "growth": "15%", "active": True}
print(f"Computed Stats: {data}")`,
        metadata: { language: 'python' }
      }
    ]
  }
};
