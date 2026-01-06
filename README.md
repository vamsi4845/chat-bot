# Chat Bot

A modern chatbot application built with Next.js, TypeScript, and AG-UI SDK. Features AI-powered conversations with chain-of-thought reasoning display, streaming responses, and a clean, responsive interface.

## Features

- **Next.js 14 App Router** - Modern React framework with server-side rendering
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **AG-UI SDK** - Event-driven agent communication with Server-Sent Events (SSE)
- **OpenAI Integration** - Powered by GPT-4 for intelligent responses
- **Chain-of-Thought Reasoning** - Displays AI's step-by-step thinking process
- **Streaming Responses** - Real-time message streaming for better UX
- **Collapsible Reasoning** - Accordion-style thinking section (hidden by default)
- **Responsive Design** - Mobile-first, centered chat interface
- **Shadcn UI Components** - Beautiful, accessible UI components

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. **Clone the repository** (or navigate to the project directory):

```bash
cd chat-bot
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Run the development server**:

```bash
npm run dev
```

5. **Open your browser**:

Navigate to [http://localhost:3000](http://localhost:3000) to see the chatbot.

## Project Structure

```
chat-bot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts              # API route for chat messages (AG-UI agent)
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page with chatbot
├── components/
│   ├── chatbot/
│   │   ├── Chatbot.tsx              # Main chatbot component
│   │   ├── ChatMessage.tsx          # Message display component
│   │   ├── ChatInput.tsx            # Input component with auto-resize
│   │   ├── ReasoningAccordion.tsx   # Collapsible reasoning display
│   │   ├── MessageBubble.tsx        # Reusable message bubble component
│   │   └── index.ts                 # Component exports
│   └── ui/
│       ├── prompt-input.tsx         # Custom prompt input component
│       └── textarea.tsx              # Textarea component
├── lib/
│   ├── agui.ts                      # AG-UI SDK client configuration
│   ├── constants.ts                 # Shared constants
│   └── utils.ts                      # Utility functions (cn helper)
├── types/
│   └── chat.ts                      # TypeScript type definitions
└── package.json
```

## Usage

### Basic Usage

1. **Start a conversation**: Type your message in the input field at the bottom
2. **Send messages**: Press Enter or click the send button (↑)
3. **View reasoning**: Click on "Thinking..." to expand and see the AI's reasoning process
4. **Streaming responses**: Watch messages appear in real-time as the AI generates them

### Features Explained

- **Chain-of-Thought Reasoning**: The AI first thinks through the problem step-by-step (shown in the collapsible "Thinking..." section), then provides the final answer
- **Streaming**: Messages appear character-by-character for a more natural conversation feel
- **Message History**: All conversations are maintained in the chat thread

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI SDK**: AG-UI Client (`@ag-ui/client`)
- **AI Provider**: OpenAI (GPT-4)
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useCallback, useEffect)
- **Streaming**: Server-Sent Events (SSE) via AG-UI

## Build for Production

```bash
npm run build
npm start
```

The production build will be optimized and ready to deploy.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Structure

- **Components**: Reusable UI components following React best practices
- **API Routes**: Server-side API endpoints using Next.js Route Handlers
- **Type Safety**: Full TypeScript coverage with proper type definitions
- **Optimization**: Memoized callbacks, functional state updates, and efficient re-renders

## Environment Variables

| Variable         | Description                          | Required |
| ---------------- | ------------------------------------ | -------- |
| `OPENAI_API_KEY` | Your OpenAI API key for GPT-4 access | Yes      |

## License

This project is private and proprietary.
