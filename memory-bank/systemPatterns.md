# System Patterns
## Architecture & Design Decisions

**Last Updated:** November 3, 2025

---

## System Architecture

```
Frontend (React + TypeScript)
  ↓
  ├─→ Cloud Functions (OpenAI calls) ← API key stays here (secure!)
  ├─→ Firestore (save/load conversations)
  └─→ Storage (upload problem images)
```

### Frontend
- React + TypeScript + Vite
- Hosted on Vercel or Render
- Client-side state management (React hooks)
- Direct Firestore reads for conversation history
- Direct Storage uploads for images

### Backend (Firebase Cloud Functions)
- Secure OpenAI API calls (API key server-side)
- Context window management (last 8 messages)
- Streaming responses back to frontend
- Problem extraction from images (GPT-4o Vision)

---

## Key Design Patterns

### 1. Feature-Based Component Organization
**Pattern:** Group components by feature, not file type

```
src/components/
  ├── Chat/           # Chat-related components
  ├── ProblemInput/   # Problem input components
  ├── StepVisualization/  # Step tracking components
  └── Common/         # Shared components
```

**Why:** Better discoverability, easier to understand feature boundaries

### 2. Design System Constants
**Pattern:** TypeScript constants → CSS custom properties

```
constants/colors.ts → styles/variables.css
```

**Why:** Single source of truth, type-safe, theme support

### 3. Context Window Optimization
**Pattern:** Only send last 8 messages to OpenAI

```typescript
const contextWindow = messages.slice(-8);
```

**Why:** 10x cost reduction while maintaining conversation flow

### 4. Natural Conversation Settings
**Pattern:** Higher temperature + penalties for natural dialogue

```typescript
{
  temperature: 0.8,         // More natural, varied
  frequency_penalty: 0.5,   // Reduces repetition
  presence_penalty: 0.3,    // Encourages variety
  max_tokens: 150           // Concise tutor responses
}
```

**Why:** Prevents robotic "What should we do next?" repetition

### 5. Streaming Response Pattern
**Pattern:** Process token-by-token, update UI progressively

```typescript
for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) {
    setStreamingMessage(prev => prev + delta);
  }
}
```

**Why:** Better UX, feels more conversational

### 6. Secure API Key Management
**Pattern:** Cloud Functions proxy (never expose key in client)

```
Frontend → Cloud Function → OpenAI API
         (no key)         (has key)
```

**Why:** Security best practice, prevents key theft

---

## Data Structures

### Message
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string; // Optional image URL for user messages
  timestamp: Date;
}
```

### Conversation
```typescript
interface Conversation {
  conversationId: string;
  problem: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Context Window (Sent to OpenAI)
```typescript
// Smart model selection based on content
const hasImages = messages.some(msg => 
  Array.isArray(msg.content) && 
  msg.content.some(item => item.type === 'image_url')
);
const model = hasImages ? "gpt-4o" : "gpt-4o-mini";

{
  model, // gpt-4o for images, gpt-4o-mini for text-only
  messages: [
    { role: "system", content: NATURAL_PROMPT },
    ...last8UserAndAssistantMessages.map(msg => ({
      role: msg.role,
      content: msg.content // Can be string or array (for images)
    }))
  ],
  stream: true,
  temperature: 0.8,
  frequency_penalty: 0.5,
  presence_penalty: 0.3,
  // max_tokens: Removed (no limit for flexible explanations)
}
```

### Image Content Format (OpenAI Vision)
```typescript
{
  role: "user",
  content: [
    { type: "text", text: "What is this problem?" },
    { type: "image_url", image_url: { url: "https://..." } }
  ]
}
```

### Model Selection (Future Improvement)
**Current:** GPT-4o-mini
- Cost: ~$0.15 per million input tokens, ~$0.60 per million output tokens
- Math accuracy: Good for simple problems, weaker for complex math
- Speed: Fast
- Issue: Makes mistakes on complex factoring (e.g., affirming wrong answers)

**Future Options:**
1. **GPT-5-mini** (if available): Better math accuracy, similar cost to GPT-4o-mini
   - Cost: ~$0.25 per million input tokens, ~$2 per million output tokens
   - Better reasoning capabilities
   - Fast performance
   - **Recommendation:** Try this first when available

2. **GPT-4o**: Better math accuracy, but 10x more expensive
   - Cost: ~$2.50 per million input tokens, ~$10 per million output tokens
   - Much better for complex math
   - **Recommendation:** Use if GPT-5-mini not available and validation not enough

**Decision:** Switch model LAST when finishing project (after all other improvements)
- Focus on validation improvements first
- Test with current model
- Switch model only if validation improvements not sufficient

---

## Component Relationships

```
ChatContainer
  ├── MessageList
  │     └── Message (multiple)
  └── InputArea
        ├── Textarea
        └── Send Button
```

**Data Flow:**
1. User types in InputArea (or uploads image) → sends message
2. Message saved to Firestore via `useChats.addMessage()`
3. Firestore subscription updates ChatContainer state in real-time
4. MessageList displays all messages (including images)
5. Streaming hook updates UI progressively during AI response
6. On completion, streaming message → regular message → saved to Firestore
7. Image URLs stored in Firestore `imageUrl` field, displayed inline in messages

**Current Implementation:**
- ✅ ChatContainer manages messages via Firestore subscriptions (`useChats` hook)
- ✅ MessageList auto-scrolls to bottom on new messages
- ✅ InputArea handles Enter (send) vs Shift+Enter (new line), image upload
- ✅ Message component displays role-based styling (user right, assistant left)
- ✅ Message component displays images inline (not as URLs)
- ✅ Streaming integration complete
- ✅ Images sent directly to AI in OpenAI vision format

---

## File Naming Conventions

- **Components:** `PascalCase.tsx` (e.g., `ChatContainer.tsx`)
- **Hooks:** `camelCase.ts` with `use` prefix (e.g., `useStreaming.ts`)
- **Services:** `camelCase.ts` (e.g., `openai.ts`)
- **Utils:** `camelCase.ts` (e.g., `mathRenderer.ts`)
- **Types:** `camelCase.ts` (e.g., `message.ts`)
- **CSS:** `kebab-case.css` (e.g., `buttons.css`)

---

## Key Principles

1. **Single Responsibility:** Each file has one clear purpose
2. **Colocation:** Keep related files together
3. **Type Safety:** TypeScript throughout
4. **Cost Optimization:** Smart context window management
5. **Security First:** API keys server-side only
6. **Natural UX:** Prioritize conversational flow over robotic patterns

---

## Type Import Pattern

**Pattern:** Barrel exports with type-only imports

```typescript
// src/types/index.ts
export type { Message, MessageRole } from './message';

// Usage in components
import type { Message as MessageType } from '../../types';
```

**Why:** Better module resolution, cleaner imports, type-safe

---

**Document Status:** Architecture patterns established, full functionality implemented with authentication, persistence, and image support

