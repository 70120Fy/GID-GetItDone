<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GID - Local Intelligence Platform

GID is an AI-powered productivity application that combines note-taking, task management, and content creation with intelligent assistance. The platform uses Google's Gemini AI to help users generate content, create structured data, and synthesize information through an intuitive block-based editor.

## Features

- **Block-Based Editor**: Create content using various block types including text, headings, to-do lists, code, databases, kanban boards, mind maps, and more
- **AI-Powered Assistance**: Integrated Gemini AI assistant for content generation, summarization, and expansion
- **Voice Input**: Speech-to-text functionality for hands-free content creation
- **Multi-Page Organization**: Manage multiple pages for different projects and topics
- **Dark/Light Mode**: Choose your preferred theme
- **Offline Storage**: All content is saved locally in your browser
- **Undo/Redo Functionality**: Never lose your work with comprehensive history tracking
- **Template System**: Start quickly with pre-built templates
- **Structured Data**: Create databases and kanban boards for project management

## Block Types

- Text and Headings
- To-do lists with subtasks
- Code blocks
- Dividers
- Kanban boards
- Databases with multiple column types
- Mind maps
- Project OS (Project management system)
- Callout blocks

## AI Capabilities

- **Content Generation**: Generate text, lists, and structured content based on prompts
- **Summarization**: Synthesize long-form content into concise insights
- **Expansion Flow**: Suggest next steps and related content
- **Database Creation**: Generate structured data tables from natural language descriptions
- **Voice Commands**: Speak your ideas and have them converted to text

## Prerequisites

- Node.js
- A Google Gemini API key

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key: `GEMINI_API_KEY=your_api_key_here`

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser to the provided local address

## Usage

- Click the AI assistant button (✨) in the bottom-right corner to access Gemini features
- Create new pages using the sidebar
- Add different block types to your pages
- Use Ctrl+Z/Ctrl+Y (or Cmd+Z/Cmd+Y) for undo/redo functionality
- Toggle between light and dark mode from the sidebar
- Use voice input to speak your thoughts directly into the app

## Architecture

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **AI Integration**: Google GenAI SDK
- **Storage**: Local browser storage
- **Styling**: Tailwind CSS

## License

This project is private and not licensed for distribution.
