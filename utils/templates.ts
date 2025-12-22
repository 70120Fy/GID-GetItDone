
import { Block, KanbanData, DatabaseData, MindMapNode } from '../types';

export const TEMPLATES: Record<string, { title: string, icon: string, blocks: Block[] }> = {
  'tpl:webdev': {
    title: 'Static Website',
    icon: '🌐',
    blocks: [
      { id: 'w1', type: 'heading', content: 'Web Project' },
      { 
        id: 'w2', 
        type: 'code', 
        content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; text-align: center; padding-top: 50px; }
    h1 { color: #3b82f6; }
    button { padding: 10px 20px; border-radius: 8px; border: none; background: #3b82f6; color: white; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Hello Web!</h1>
  <p id="time"></p>
  <button onclick="updateTime()">What time is it?</button>
  <script>
    function updateTime() {
      document.getElementById('time').innerText = new Date().toLocaleTimeString();
    }
  </script>
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
      { id: 'p1', type: 'heading', content: 'Python Scripting' },
      { 
        id: 'p2', 
        type: 'code', 
        content: `def greet(name):
    return f"Hello, {name} from Python!"

print(greet("GetDone User"))

for i in range(5):
    print(f"Counting: {i}")`,
        metadata: { language: 'python' }
      }
    ]
  },
  'tpl:database': {
    title: 'Database Sheet',
    icon: '▦',
    blocks: [
      { id: 'db1', type: 'heading', content: 'Database' },
      { id: 'db2', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'c1', title: 'Name', type: 'text' },
          { id: 'c2', title: 'Category', type: 'text' },
          { id: 'c3', title: 'Value', type: 'number' },
          { id: 'c4', title: 'Done', type: 'checkbox' }
        ],
        rows: [
          { id: 'r1', c1: 'Example Item', c2: 'General', c3: 100, c4: false }
        ]
      } as DatabaseData) }
    ]
  },
  'tpl:mindmap': {
    title: 'Brainstorm Map',
    icon: '☘',
    blocks: [
      { id: 'mm1', type: 'heading', content: 'Brainstorming' },
      { id: 'mm2', type: 'mindmap', content: JSON.stringify({ 
        id: 'root', 
        text: 'Central Theme', 
        x: 400, y: 300,
        children: [
          { id: 'node1', text: 'Sub-topic A', x: 200, y: 150, children: [] },
          { id: 'node2', text: 'Sub-topic B', x: 600, y: 150, children: [] },
          { id: 'node3', text: 'Questions', x: 400, y: 500, children: [] }
        ] 
      } as MindMapNode) }
    ]
  },
  'tpl:daily': {
    title: 'Daily Planner',
    icon: '☀️',
    blocks: [
      { id: 'd1', type: 'heading', content: 'Daily Review' },
      { id: 'd2', type: 'callout', content: 'What is my primary focus today?' },
      { id: 'd3', type: 'todo', content: 'Deep Work Session', schedule: 'today' },
      { id: 'd4', type: 'divider', content: '' },
      { id: 'd5', type: 'todo', content: 'Admin & Emails' }
    ]
  },
  'tpl:expense': {
    title: 'Expense Log',
    icon: '💰',
    blocks: [
      { id: 'e1', type: 'heading', content: 'Expenses' },
      { id: 'e2', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'c1', title: 'Date', type: 'text' },
          { id: 'c2', title: 'Item', type: 'text' },
          { id: 'c3', title: 'Amount', type: 'number' },
          { id: 'c4', title: 'Paid', type: 'checkbox' }
        ],
        rows: []
      } as DatabaseData) }
    ]
  },
  'tpl:travel': {
    title: 'Travel Itinerary',
    icon: '✈️',
    blocks: [
      { id: 't1', type: 'heading', content: 'Trip Itinerary' },
      { id: 't2', type: 'callout', content: 'Destination: ' },
      { id: 't3', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'd1', title: 'Day', type: 'text' },
          { id: 'd2', title: 'Activity', type: 'text' },
          { id: 'd3', title: 'Booking Ref', type: 'text' }
        ],
        rows: [{ id: 'r1', d1: 'Day 1', d2: 'Arrival & Hotel Check-in' }]
      } as DatabaseData) },
      { id: 't4', type: 'heading', content: 'Packing Checklist' },
      { id: 't5', type: 'todo', content: 'Passport & Documents' }
    ]
  },
  'tpl:scripting': {
    title: 'Coding Script',
    icon: '📜',
    blocks: [
      { id: 's1', type: 'heading', content: 'Script Logic' },
      { id: 's2', type: 'callout', content: 'Purpose: Automation of file backups.' },
      { id: 's3', type: 'code', content: 'function backup() {\n  console.log("Starting backup...");\n}\nbackup();', metadata: { language: 'javascript' } },
      { id: 's4', type: 'todo', content: 'Test on production server' }
    ]
  },
  'tpl:meeting': {
    title: 'Meeting Notes',
    icon: '👥',
    blocks: [
      { id: 'm1', type: 'heading', content: 'Meeting: [Project Name]' },
      { id: 'm2', type: 'callout', content: 'Attendees: ' },
      { id: 'm3', type: 'heading', content: 'Agenda' },
      { id: 'm4', type: 'text', content: '- ' },
      { id: 'm5', type: 'heading', content: 'Action Items' },
      { id: 'm6', type: 'todo', content: 'Follow up with design team' }
    ]
  },
  'tpl:habit': {
    title: 'Habit Tracker',
    icon: '⚡',
    blocks: [
      { id: 'h1', type: 'heading', content: 'Habit Tracker' },
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
        rows: [{ id: 'r1', c1: 'Morning Run' }, { id: 'r2', c1: 'Reading 30m' }]
      } as DatabaseData) }
    ]
  },
  'tpl:journal': {
    title: 'Journal Entry',
    icon: '🖋️',
    blocks: [
      { id: 'j1', type: 'heading', content: 'Daily Log' },
      { id: 'j2', type: 'callout', content: 'What was the highlight of my day?' },
      { id: 'j3', type: 'text', content: 'Thoughts:' },
      { id: 'j4', type: 'todo', content: 'Reflect on wins' }
    ]
  },
  'tpl:product': {
    title: 'Product Spec',
    icon: '🎨',
    blocks: [
      { id: 'pr1', type: 'heading', content: 'Product Spec' },
      { id: 'pr2', type: 'mindmap', content: JSON.stringify({ id: 'root', text: 'Feature X', x: 300, y: 300, children: [{ id: 'c1', text: 'MVP', x: 500, y: 300, children: [] }] }) },
      { id: 'pr3', type: 'heading', content: 'Implementation Steps' },
      { id: 'pr4', type: 'todo', content: 'Technical spike' }
    ]
  },
  'tpl:goals': {
    title: 'Goal Setting',
    icon: '🎯',
    blocks: [
      { id: 'g1', type: 'heading', content: 'Annual Objectives' },
      { id: 'g2', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'goal', title: 'Goal', type: 'text' },
          { id: 'status', title: 'Status', type: 'text' },
          { id: 'progress', title: '%', type: 'number' }
        ],
        rows: [{ id: 'r1', goal: 'Learn React Native', status: 'In Progress', progress: 50 }]
      } as DatabaseData) }
    ]
  },
  'tpl:study': {
    title: 'Study Plan',
    icon: '📚',
    blocks: [
      { id: 'st1', type: 'heading', content: 'Study: [Subject]' },
      { id: 'st2', type: 'kanban', content: JSON.stringify({
        columns: [
          { id: 'c1', title: 'Review', cards: [] },
          { id: 'c2', title: 'Testing', cards: [] },
          { id: 'c3', title: 'Mastered', cards: [] }
        ]
      } as KanbanData) }
    ]
  }
};
