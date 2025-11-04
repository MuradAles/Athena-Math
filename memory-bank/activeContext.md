# Active Context
## Current Work Focus

**Last Updated:** November 4, 2025  
**Current Phase:** Day 2 Complete - Math Tools Validation + Whiteboard Integration

---

## What We Just Completed

### ✅ Day 2: Authentication & Chat History (COMPLETED)
- **Task 2.1-2.7:** Firebase Authentication setup (Email/Password + Google OAuth)
  - Created auth service with redirect fallback for blocked popups
  - Added COOP headers for OAuth support
  - Login/Signup components with design system styling
  - Auth context provider for global state
  - Header component with user info and logout
- **Task 2.8-2.12:** Chat persistence and history
  - Firestore structure: `users/{userId}/chats/{chatId}`
  - Smart chat naming from problem context
  - ChatList component with collapsible sidebar
  - Delete chat functionality
  - Real-time message subscriptions
  - Centered chat layout (ChatGPT-style)
  - Custom scrollbar styling

### ✅ Day 2: Audio Features (COMPLETED - Stretch)
- **Task 2.29:** Audio input (speech-to-text) with Whisper-1
  - `src/hooks/useAudioRecording.ts` - Custom hook for microphone recording
  - `functions/src/index.ts` - `/transcribe` Cloud Function endpoint
  - OpenAI Whisper-1 API integration
  - Base64 audio encoding/decoding
  - Microphone access and MediaRecorder API
  - InputArea component with microphone button
  - Visual feedback for recording state
  - Error handling and user feedback
- **Task 2.30:** Audio output (text-to-speech) with TTS-1
  - `src/hooks/useTextToSpeech.ts` - Custom hook for TTS generation
  - `functions/src/index.ts` - `/speech` Cloud Function endpoint
  - OpenAI TTS-1 API integration
  - Base64 audio decoding and playback
  - Message component with play button
  - Play/stop controls
- **Task 2.31:** Auto-play audio for AI responses
  - Auto-play triggers when new assistant message received
  - Fixed React Hooks error (useCallback inside map)
  - Removed excessive console logs
  - Reduced message spacing for better UX
  - Proper cleanup and error handling

### ✅ Day 2: Image Upload & Display (COMPLETED)
- **Task 2.13-2.15:** Image upload functionality
  - Firebase Storage rules deployed
  - Image upload hook with progress tracking
  - InputArea component with image upload button
  - Drag-and-drop support
  - Image preview above input area
- **Task 2.16-2.17:** Image extraction service (created but not used)
  - `extractProblem` Cloud Function using GPT-4o Vision
  - Image extraction service ready
  - **NOTE:** Currently not used - images sent directly to AI
- **Task 2.17a:** Image display in messages (COMPLETED)
  - Updated Message type to include optional `imageUrl` field
  - Message component displays images inline (not as URLs)
  - Firestore saves/reads `imageUrl` field
  - Legacy messages with `[Image: ...]` format still supported
  - CSS styling for images in messages
- **Fix:** Image message reconstruction in chat history
  - Fixed issue where messages with images weren't converted back to OpenAI vision format
  - ChatContainer now reconstructs vision format when reading messages from Firestore
  - Ensures AI can see images in conversation history

### ✅ Math Tools & Validation System (COMPLETED)
- **Math Tools Implementation:**
  - Created `functions/src/utils/mathTools.ts` with nerdamer integration
  - Implemented algebra tools (solve linear/quadratic, factor, expand, simplify)
  - Implemented geometry tools (area, volume, perimeter, surface area, Pythagorean theorem)
  - Implemented calculus tools (derivative, integral, limit)
  - Implemented arithmetic tools (evaluate expression, calculate percentage)
  - Implemented validation tools (validate_answer, check_step)
- **Math Tool Schemas:**
  - Created `functions/src/utils/mathToolSchemas.ts` with OpenAI function schemas
  - All tools properly defined with descriptions and parameters
  - Tools integrated into Cloud Function with automatic execution
- **Enhanced Validation Prompt:**
  - Strengthened prompt with MANDATORY validation rules
  - Added explicit examples for arithmetic validation (e.g., "100 - 36 = 74" → must validate)
  - Made tool usage mandatory for ALL numerical answers
  - Improved error messages to include correct answers
- **Improved Validation Function:**
  - Enhanced `validateAnswer` to handle arithmetic expressions better
  - Added numeric comparison with floating-point tolerance
  - Better extraction of numbers from student answers (handles "x = 4" format)
  - Improved error messages showing correct answer

### ✅ Whiteboard Enhancement (COMPLETED)
- **Image Upload to Whiteboard:**
  - Added image upload button in whiteboard header
  - Canvas resizes to match uploaded image dimensions (maintains aspect ratio)
  - Image loaded as background layer (non-selectable, sent to back)
  - Supports images up to 5MB
- **Canvas Export & Send:**
  - Added "Send Canvas to AI" button (green export style)
  - Exports canvas as PNG image using Fabric.js `toDataURL()`
  - Uploads canvas image to Firebase Storage
  - Automatically sends canvas image to chat with message
- **Whiteboard ↔ Chat Integration:**
  - Added `onSendCanvas` callback prop to WhiteboardPanel
  - ChatContainer exposes `sendMessage` via forwardRef
  - App.tsx wires up whiteboard → chat communication
  - Canvas images appear in chat messages and AI can analyze them

### ✅ Day 1: OpenAI Integration & Streaming (COMPLETED)
- **Task 1.13:** OpenAI Cloud Function with SSE streaming
  - Smart model selection: `gpt-4o` for images, `gpt-4o-mini` for text-only
  - Support for OpenAI vision format (image content in messages)
  - Fixed unsupported parameters (removed frequency_penalty/presence_penalty for GPT-5)
- **Task 1.14:** Streaming hook with detailed error logging
- **Task 1.15:** StreamingMessage component
- **Task 1.16:** Streaming integration complete
- **Task 1.17:** Natural conversational Socratic prompt (COMPLETED)

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

**Session:** Day 2 complete - Math tools validation system implemented, image message reconstruction fixed, whiteboard image upload and canvas-to-chat integration working  
**Next Tasks:** Testing validation system with real problems, manual testing suite (Tasks 2.21-2.28)

---

## What We're Working On Now

### Next Immediate Steps (Day 2 - Afternoon Session)

1. **Task 2.20:** Test math rendering ✅ NEXT
   - Test various math notations
   - Verify readability
   - Test inline: $2x + 5 = 13$
   - Test block: $$\frac{a}{b}$$

2. **Task 2.21-2.27:** Manual testing suite
   - Test 5 problem types
   - Edge case testing
   - Bug fixes

---

## Active Decisions

### Architecture
- ✅ **OpenAI SDK Direct** (not LangChain) - simpler, smaller, better streaming
- ✅ **Firebase Cloud Functions** - for secure API key handling
- ✅ **Smart Model Selection** - automatically selects model based on content:
  - **GPT-4o-mini** - for text-only conversations (cost-effective)
  - **GPT-4o** - for messages with images (vision support)
  - Automatically detects image content and switches models
- ✅ **GPT-4o** - for image extraction (`extractProblem` function, currently not used)
- ✅ **Hosting:** Production Cloud Functions (not emulator)
- ✅ **Services:** Firebase (Firestore + Storage + Cloud Functions)
- ✅ **Math Tools:** nerdamer library for symbolic math calculations
- ✅ **Whiteboard:** Fabric.js for canvas drawing and image manipulation

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
- **Max Tokens:** Removed (no limit for flexible explanations)
- **Image Support:** Images sent directly to AI in OpenAI vision format (no text extraction)

### Priority Focus
- **#1 Priority:** Natural conversational prompt (not robotic Q&A)
- **#2 Priority:** Never give direct answers
- **#3 Priority:** Varied language (avoid repetition)
- **#4 Priority:** Mandatory validation - ALL numerical answers must be validated with tools

---

## Blockers & Questions

**None currently** - Ready to proceed with chat UI components

---

## Today's Goal (Day 1)

**End of Day 1 Checklist:**
- [x] Can send message and receive streaming response ✅
- [x] AI follows Socratic method (asks, doesn't tell) ✅
- [x] Conversation feels natural and encouraging ✅
- [ ] Successfully completed 5+ turn conversation - Needs testing (Task 1.18)
- [ ] Prompt works on at least 2 problem types - Needs testing (Task 1.18)
- [x] No critical bugs in UI or streaming ✅

**End of Day 2 Checklist:**
- [x] Text input works perfectly ✅
- [x] Image upload works (sends directly to AI) ✅
- [x] Images display in chat messages ✅
- [x] Math renders correctly in all messages - Tasks 2.18-2.19 completed ✅ (Task 2.20 testing pending)
- [x] Conversations persist across page refresh ✅
- [ ] All 5 problem types tested and working - Not started
- [ ] Edge cases handled gracefully - Partially tested
- [x] No critical bugs ✅

**Stretch Features Completed:**
- [x] Voice input (speech-to-text) with Whisper-1 ✅
- [x] Voice output (text-to-speech) with TTS-1 ✅
- [x] Auto-play audio for AI responses ✅

---

**Document Status:** Day 2 complete - Math tools validation system implemented, image message reconstruction fixed, whiteboard image upload and canvas-to-chat integration working. Ready for testing.

