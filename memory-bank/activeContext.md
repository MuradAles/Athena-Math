# Active Context
## Current Work Focus

**Last Updated:** November 3, 2025  
**Current Phase:** Day 1 - Core Chat Interface & Socratic Dialogue

---

## What We Just Completed

### ✅ Tasks 1.8-1.12: Basic Chat UI Components
- **Task 1.8:** Created Message type definition (`src/types/message.ts`)
- **Task 1.9:** Built Message component with role-based styling
  - User messages: blue background (right-aligned)
  - Assistant messages: light surface (left-aligned)
  - Timestamp formatting
  - Text wrapping handled
- **Task 1.10:** Built MessageList component
  - Scrollable container with auto-scroll
  - Empty state handling
  - Maps through messages array
- **Task 1.11:** Built InputArea component
  - Textarea with auto-resizing
  - Send button with disabled states
  - Enter sends, Shift+Enter for new line
  - Clears input after send
- **Task 1.12:** Built ChatContainer component
  - Composes MessageList and InputArea
  - Manages local state for messages
  - Full viewport height layout
  - Placeholder response (awaiting OpenAI integration)

**Note:** Fixed import issue by creating `src/types/index.ts` barrel export and using `import type` for type-only imports.

### ✅ Task 1.3: Folder Structure
- Created all required directories:
  - `src/components/` (Chat, ProblemInput, StepVisualization, Whiteboard, Common)
  - `src/hooks/`
  - `src/services/`
  - `src/constants/`
  - `src/styles/`
  - `src/utils/`
  - `src/types/`
  - `src/config/`
- Added `.gitkeep` files for empty directories
- Created barrel export files

### ✅ Task 1.6: Design Constants
- `src/constants/colors.ts` - Light/dark theme color palette (5-color system)
- `src/constants/spacing.ts` - Spacing scale (4px base unit)
- `src/constants/typography.ts` - Typography system (fonts, sizes, weights)
- `src/constants/index.ts` - Central export

### ✅ Task 1.7: CSS Files
- `src/styles/reset.css` - Browser reset
- `src/styles/variables.css` - CSS custom properties from constants
- `src/styles/buttons.css` - Button styles (primary, secondary, icon)
- `src/styles/forms.css` - Input and textarea styles
- `src/styles/utils.css` - Utility classes
- `src/styles/index.css` - Main stylesheet
- Updated `src/index.css` to import design system

---

## Current Status

**Session:** Basic chat UI complete, ready for OpenAI integration  
**Next Tasks:** OpenAI service and streaming (Tasks 1.13-1.16)

---

## What We're Working On Now

### Next Immediate Steps (Tasks 1.13-1.16)

1. **Task 1.13:** Create OpenAI service with optimal settings
   - `src/services/openai.ts` (or Cloud Functions)
   - Initialize OpenAI client
   - Configure natural conversation settings
   - Add error handling

2. **Task 1.14:** Create streaming hook
   - `src/hooks/useStreaming.ts`
   - Implement streaming state
   - Process stream chunks token by token
   - Handle completion and errors

3. **Task 1.15:** Build StreamingMessage component
   - `src/components/Chat/StreamingMessage.tsx`
   - Display streaming text with cursor
   - Show "Tutor is thinking..." indicator

4. **Task 1.16:** Integrate streaming into ChatContainer
   - Use useStreaming hook
   - Show StreamingMessage during AI response
   - Convert to regular message on completion

---

## Active Decisions

### Architecture
- ✅ **OpenAI SDK Direct** (not LangChain) - simpler, smaller, better streaming
- ✅ **Firebase Cloud Functions** - for secure API key handling
- ✅ **GPT-4o-mini** - for conversations (current, cost-effective)
  - **Known Issue:** Sometimes affirms wrong answers on complex math
  - **Future:** Consider GPT-5-mini or GPT-4o when finishing project
- ✅ **GPT-4o** - for image extraction only (vision required)
- ✅ **Hosting:** Vercel or Render (not Firebase Hosting)
- ✅ **Services:** Firebase (Firestore + Storage + Cloud Functions)

### Model Selection Decision
- **Current:** GPT-4o-mini (cost-effective, good for simple math)
- **Future Options:**
  1. **GPT-5-mini** (if available): Better math accuracy, similar cost → Try first
  2. **GPT-4o**: Better math accuracy, 10x more expensive → Use if GPT-5-mini not available
- **Decision:** Switch model LAST when finishing project (after all other improvements)
- **Focus:** Validation improvements first, model switching deferred

### Conversation Management
- **Context Window:** Only last 8 messages to OpenAI (cost optimization)
- **Natural Settings:** temperature: 0.8, frequency_penalty: 0.5, presence_penalty: 0.3
- **Max Tokens:** 150 (concise tutor-like responses)

### Priority Focus
- **#1 Priority:** Natural conversational prompt (not robotic Q&A)
- **#2 Priority:** Never give direct answers
- **#3 Priority:** Varied language (avoid repetition)

---

## Blockers & Questions

**None currently** - Ready to proceed with chat UI components

---

## Today's Goal (Day 1)

**End of Day 1 Checklist:**
- [ ] Can send message and receive streaming response
- [ ] AI follows Socratic method (asks, doesn't tell)
- [ ] Conversation feels natural and encouraging
- [ ] Successfully completed 5+ turn conversation
- [ ] Prompt works on at least 2 problem types
- [ ] No critical bugs in UI or streaming

---

**Document Status:** Active development - Day 1 morning complete, afternoon session starting

