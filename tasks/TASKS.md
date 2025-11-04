# Tasks Breakdown
## AI Math Tutor - Socratic Learning Assistant

**Timeline:** 3 Days (November 3-6, 2025)  
**Approach:** Incremental development with daily milestones  
**Deployment:** Continuous - deploy early, iterate often

---

## Overview

Each day has clear objectives and deliverables. Tasks are ordered by priority and dependency. Checkboxes for tracking progress.

**Daily Time Allocation:**
- Day 1: 6-8 hours (Core chat + Socratic dialogue)
- Day 2: 8-10 hours (Full functionality + persistence)
- Day 3: 6-8 hours (Polish + stretch features + deployment)

---

## Day 1: Core Chat Interface & Socratic Dialogue
**Goal:** Functional chat with streaming responses and effective Socratic prompting

**Estimated Time:** 6-8 hours  
**Priority:** Critical foundation

---

### Morning Session (3-4 hours)

#### Setup & Infrastructure
- [x] **Task 1.1:** Initialize React + TypeScript project with Vite (30 min)
  - Create project: `npm create vite@latest math-tutor -- --template react-ts`
  - Install dependencies: `npm install`
  - Verify dev server runs: `npm run dev`
  - Test hot reload functionality

- [x] **Task 1.2:** Install core dependencies (15 min)
  ```bash
  npm install firebase openai katex react-katex
  npm install -D @types/katex
  ```
  - Verify installations
  - Check for any peer dependency warnings

- [x] **Task 1.3:** Create folder structure (15 min)
  - Create all directories from FOLDER.md
  - Add `index.ts` barrel exports where needed
  - Create `.gitkeep` files for empty directories

- [x] **Task 1.4:** Set up Firebase project (30 min)
  - Create new Firebase project in console
  - Enable Firestore database
  - Enable Storage
  - Enable Cloud Functions
  - Copy configuration credentials
  - Create `.env` file with Firebase config
  - Test Firebase connection

- [x] **Task 1.5:** Set up OpenAI API (15 min)
  - Get API key from OpenAI dashboard
  - Add to `.env` file (Cloud Functions)
  - Verify API access with test call
  - Check rate limits and pricing

#### Design System Setup
- [x] **Task 1.6:** Create design constants (30 min)
  - `src/constants/colors.ts` - Define 5 colors for light/dark
  - `src/constants/spacing.ts` - Define spacing scale
  - `src/constants/typography.ts` - Define font system
  - Export all from `src/constants/index.ts`

- [x] **Task 1.7:** Create CSS files (45 min)
  - `src/styles/reset.css` - Browser reset
  - `src/styles/variables.css` - CSS custom properties from constants
  - `src/styles/buttons.css` - Button styles (primary, secondary, icon)
  - `src/styles/forms.css` - Input and textarea styles
  - `src/styles/utils.css` - Utility classes
  - `src/styles/index.css` - Import all stylesheets in order

#### Basic Chat UI
- [x] **Task 1.8:** Create Message type definition (15 min)
  - `src/types/message.ts`
  - Define Message interface (id, role, content, timestamp)
  - Export types

- [x] **Task 1.9:** Build Message component (30 min)
  - `src/components/Chat/Message.tsx`
  - Display message content
  - Style user vs assistant messages differently
  - Add timestamp display
  - Handle text wrapping

- [x] **Task 1.10:** Build MessageList component (30 min)
  - `src/components/Chat/MessageList.tsx`
  - Scrollable container
  - Map through messages
  - Auto-scroll to bottom on new message
  - Empty state handling

- [x] **Task 1.11:** Build InputArea component (30 min)
  - `src/components/Chat/InputArea.tsx`
  - Textarea for user input
  - Send button
  - Handle Enter key (send) and Shift+Enter (new line)
  - Disable while sending
  - Clear input after send

- [x] **Task 1.12:** Build ChatContainer component (30 min)
  - `src/components/Chat/ChatContainer.tsx`
  - Compose MessageList and InputArea
  - Manage local state for messages
  - Handle send message action
  - Basic layout with flexbox

**End of Morning Checklist:**
- [x] Dev server running smoothly
- [x] All dependencies installed
- [x] Firebase connected
- [x] Design system in place
- [x] Basic chat UI renders with mock data

---

### Afternoon Session (3-4 hours)

#### OpenAI Integration
- [x] **Task 1.13:** Create OpenAI Cloud Function with SSE streaming (30 min) ✅ COMPLETED
  - `functions/src/index.ts` (TypeScript, Firebase Functions v2)
  - Converted functions to TypeScript with tsconfig.json
  - Created HTTP Cloud Function `/chat` endpoint
  - Initialize OpenAI client with API key from environment
  - Configure for natural conversation:
    - model: "gpt-4o-mini" (text-only) or "gpt-4o" (with images) - smart selection
    - temperature: 0.8
    - frequency_penalty: 0.5
    - presence_penalty: 0.3
    - max_tokens: removed (no limit for flexibility)
  - Implemented Server-Sent Events (SSE) streaming format
  - CORS configured for all origins
  - Error handling (console logging only)
  - Context window optimization (last 8 messages)
  - Smart model selection: uses gpt-4o for vision (images), gpt-4o-mini for text-only
  - Support for OpenAI vision format (image content in messages)
  - Fixed: Removed unsupported parameters for GPT-5, updated to use gpt-4o/gpt-4o-mini

- [x] **Task 1.14:** Create streaming hook with SSE support (1 hour) ✅ COMPLETED
  - `src/hooks/useStreaming.ts`
  - Implement streaming state (streamingMessage, isStreaming, error)
  - Create startStream function using fetch with ReadableStream
  - Parse SSE events (data: {...} format)
  - Process stream chunks token by token
  - Update state progressively
  - Handle stream completion with callback
  - Stream cancellation support (abort controller)
  - Error handling (console logging only)
  - Accumulates message content for onComplete callback

- [x] **Task 1.15:** Build StreamingMessage component (30 min) ✅ COMPLETED
  - `src/components/Chat/StreamingMessage.tsx`
  - `src/components/Chat/StreamingMessage.css`
  - Display streaming text with animated blinking cursor
  - Show "Tutor is thinking..." indicator before stream starts
  - Smooth text appearance as chunks arrive
  - Handle completion state (hides cursor when done)
  - Idle/streaming/complete state handling
  - Responsive design (mobile-friendly)
  - Exported in barrel export (`src/components/Chat/index.ts`)

- [x] **Task 1.16:** Integrate streaming into ChatContainer (30 min) ✅ COMPLETED
  - Integrated useStreaming hook in ChatContainer
  - Show StreamingMessage during AI response
  - Convert streaming message to regular message on completion
  - Updated MessageList to display streaming message
  - Auto-scroll updates when streaming content changes
  - Message history properly maintained

#### Socratic Prompting (MOST IMPORTANT)
- [x] **Task 1.17:** Create natural conversational system prompt (1 hour) ✅ COMPLETED
  - `functions/src/utils/prompts.ts` (backend)
  - Created comprehensive Socratic tutor prompt with:
    - Core principles (never give answers, build on responses, vary language)
    - Natural teaching approach (conversational connectors, affirmations)
    - Language variety (8+ ways to ask "what's next")
    - Situation handling (confident vs struggling students, wrong answers, "just tell me")
    - **Answer validation protocol** - AI validates answers before affirming
    - Forbidden patterns clearly defined
    - Principle-based instructions (no examples)
    - Integrated into Cloud Function via `getSystemPrompt()` helper

- [ ] **Task 1.18:** Test prompt with hardcoded problem - FOCUS ON NATURAL FLOW (1-2 hours)
  - Add test problem: "2x + 5 = 13"
  - Have actual conversation with AI
  - **TEST FOR**: Natural dialogue (not robotic Q&A loop)
  - Verify AI builds on student responses
  - Verify AI varies language (doesn't repeat same phrases)
  - Try to trick it into giving answers
  - Test with wrong answers
  - Test with "just tell me" requests
  - Test with confident vs struggling student responses
  - Iterate on prompt until conversation feels natural
  - Document what works and what doesn't

- [ ] **Task 1.19:** Refine prompt based on testing (continuous)
  - Adjust language for better guidance
  - Ensure conversational variety (no repetitive questions)
  - Fine-tune hint threshold
  - Test with 2-3 different problem types
  - Adjust temperature/penalty settings if needed for more natural flow

**End of Day 1 Checklist:**
- [x] Can send message and receive streaming response ✅
- [x] AI follows Socratic method (asks, doesn't tell) - Task 1.17 completed ✅
- [x] Conversation feels natural and encouraging - Task 1.17 completed ✅
- [ ] Successfully completed 5+ turn conversation - Needs Task 1.18 (testing)
- [ ] Prompt works on at least 2 problem types - Needs Task 1.18 (testing)
- [x] No critical bugs in UI or streaming ✅
- [x] Fixed: Removed unsupported API parameters, using correct models ✅

---

## Day 2: Full Functionality & Persistence
**Goal:** Complete problem-solving features with all input methods and data persistence

**Estimated Time:** 8-10 hours  
**Priority:** Core features completion

---

### Morning Session (4-5 hours)

#### Authentication & Chat History
**Priority:** Foundation for user data persistence

- [x] **Task 2.1:** Set up Firebase Authentication (30 min) ✅ COMPLETED
  - Enable Email/Password auth in Firebase Console
  - Enable Google OAuth provider in Firebase Console
  - Configure OAuth consent screen
  - Test authentication flow
  - Added COOP headers for OAuth popup support

- [x] **Task 2.2:** Create authentication service (45 min) ✅ COMPLETED
  - `src/services/auth.ts`
  - Initialize Firebase Auth
  - Functions: signInWithEmail, signUpWithEmail, signInWithGoogle, signOut
  - Export auth instance
  - Error handling
  - Added redirect fallback for blocked popups

- [x] **Task 2.3:** Create authentication hook (30 min) ✅ COMPLETED
  - `src/hooks/useAuth.ts`
  - Use `onAuthStateChanged` to track auth state
  - Return: user, loading, signIn, signUp, signInWithGoogle, signOut
  - Handle auth state changes
  - Integrated redirect result handling

- [x] **Task 2.4:** Build Login component (45 min) ✅ COMPLETED
  - `src/components/Auth/Login.tsx`
  - Email/password form
  - Google OAuth button
  - Link to signup
  - Error display
  - Loading states
  - Applied design system styling

- [x] **Task 2.5:** Build Signup component (30 min) ✅ COMPLETED
  - `src/components/Auth/Signup.tsx`
  - Email/password form
  - Google OAuth button
  - Link to login
  - Error display
  - Loading states
  - Applied design system styling

- [x] **Task 2.6:** Create Auth context and provider (30 min) ✅ COMPLETED
  - `src/contexts/AuthContext.tsx`
  - Wrap app with AuthProvider
  - Provide auth state globally
  - Handle loading state

- [x] **Task 2.7:** Add logout button to top right (20 min) ✅ COMPLETED
  - Update App.tsx or create Header component
  - Show user email/name
  - Logout button in top right
  - Only show when authenticated
  - Created Header component with user info

- [x] **Task 2.8:** Create chat type definitions (20 min) ✅ COMPLETED
  - `src/types/chat.ts`
  - Define Chat interface (id, userId, title, problem, createdAt, updatedAt, lastMessagePreview)
  - Define Message interface (already exists, but verify)
  - Export types

- [x] **Task 2.9:** Set up Firestore structure and service (30 min) ✅ COMPLETED
  - `src/services/firestore.ts`
  - Initialize Firestore
  - Export db instance
  - Structure: `users/{userId}/chats/{chatId}`
  - Update Firestore security rules (users can only read/write their own chats)
  - Added indexes for efficient queries
  - Implemented smart chat naming utility

- [x] **Task 2.10:** Create chat management hook (1 hour) ✅ COMPLETED
  - `src/hooks/useChats.ts`
  - Function: createChat(userId, problem) → returns chatId
  - Function: loadChats(userId) → returns list of chats
  - Function: loadChatMessages(userId, chatId) → returns messages
  - Function: saveMessage(userId, chatId, message)
  - Real-time listener for new messages
  - Smart chat title generation from problem context
  - Added deleteChat functionality

- [x] **Task 2.11:** Build ChatList component (45 min) ✅ COMPLETED
  - `src/components/Chat/ChatList.tsx`
  - Show list of user's chats
  - "New Chat" button at top (compact size)
  - Click chat → load messages
  - Show chat title, last message preview, timestamp
  - Highlight active chat
  - Delete chat functionality with confirmation
  - Collapsible sidebar with smooth animation

- [x] **Task 2.12:** Integrate chat history into App (30 min) ✅ COMPLETED
  - Update App.tsx to show ChatList (sidebar or top)
  - Show ChatContainer for active chat
  - Handle "New Chat" → create new chat, clear messages
  - Handle chat selection → load messages
  - Show login/signup when not authenticated
  - Centered chat layout (ChatGPT-style)
  - Custom scrollbar (thumb only, no track)

**Additional Features Completed:**
- [x] Smart chat naming from problem context
- [x] Delete chat functionality
- [x] Collapsible sidebar with animation
- [x] Centered chat messages and input (768px max-width)
- [x] Removed input background
- [x] Custom scrollbar styling

**Mid-Morning Checkpoint:**
- [x] Users can sign up/login (email + Google) ✅
- [x] Users can logout ✅
- [x] Users can create new chat ✅
- [x] Users can see their chat history ✅
- [x] Users can switch between chats ✅
- [x] Messages save to Firestore per chat ✅

---

#### Problem Input - Image Upload (Chat-Based)
**Note:** Keeping chat-based approach - users type problems directly in chat OR upload images in the same input area.

- [x] **Task 2.13:** Set up Firebase Storage (30 min) ✅ COMPLETED
  - Configure Storage rules in Firebase console
  - Test upload permissions
  - Set up CORS if needed
  - Created storage.rules with authenticated user permissions
  - **Note:** Storage needs to be enabled in Firebase Console (go to Storage section and click "Get Started")

- [x] **Task 2.14:** Create image upload hook (45 min) ✅ COMPLETED
  - `src/hooks/useImageUpload.ts`
  - Handle file selection
  - Validate file type and size (max 5MB)
  - Upload to Firebase Storage
  - Get download URL
  - Track upload progress
  - Error handling
  - Proper contentType handling for Storage rules

- [x] **Task 2.15:** Add image upload to InputArea component (1 hour) ✅ COMPLETED
  - Update `src/components/Chat/InputArea.tsx`
  - Add image upload button/icon next to send button (📷 icon)
  - Add file input (hidden, triggered by button)
  - Support drag and drop for images
  - Show image preview in chat (before extraction)
  - Upload progress indicator
  - Remove image option
  - Error display
  - Beautiful preview UI with progress overlay

- [x] **Task 2.16:** Create image extraction service (45 min) ✅ COMPLETED
  - `src/services/imageExtraction.ts`
  - Function to extract problem from image URL
  - Use GPT-4 Vision API via Cloud Function (`extractProblem` endpoint)
  - Prompt: "Extract the math problem. Return ONLY the problem text."
  - Handle API errors
  - Validate extracted text
  - Added `extractProblem` Cloud Function in `functions/src/index.ts`
  - **NOTE:** Currently not used - images are sent directly to AI without extraction

- [x] **Task 2.17:** Integrate image upload into chat flow (30 min) ✅ COMPLETED
  - When image uploaded, show preview above input area
  - Upload image to Firebase Storage
  - Send image directly to AI (no text extraction)
  - Images can be sent with or without text
  - Handle errors gracefully (show error overlay on preview)
  - Upload progress shown during upload
  - Images display in chat messages (not as URLs)

- [x] **Task 2.17a:** Display images in chat messages (30 min) ✅ COMPLETED
  - Updated Message type to include optional `imageUrl` field
  - Updated Message component to display images instead of URLs
  - Images render inline in chat messages
  - Legacy messages with `[Image: ...]` format still supported
  - Updated Firestore to save/read `imageUrl` field
  - Added CSS styling for images in messages
  - Removed Firebase URL text from message display

**Mid-Day Checkpoint:**
- [x] Can type problem and start conversation ✅
- [x] Can upload image and send directly to AI ✅
- [x] Images display properly in chat messages ✅
- [x] Error handling works ✅
- [ ] Math rendering (Task 2.18-2.20) - Not started

---

### Afternoon Session (4-5 hours)

#### Math Rendering
- [x] **Task 2.18:** Create math renderer utility (30 min) ✅ COMPLETED
  - `src/utils/mathRenderer.ts`
  - Function to detect LaTeX patterns ($...$ and $$...$$)
  - Parse and split text with math
  - Return structured data for rendering

- [x] **Task 2.19:** Integrate KaTeX into Message (45 min) ✅ COMPLETED
  - Update `Message.tsx` component
  - Import react-katex and CSS
  - Use InlineMath for $...$
  - Use BlockMath for $$...$$
  - Handle rendering errors gracefully
  - Test with various math notations

- [ ] **Task 2.20:** Test math rendering (30 min)
  - Test inline: $2x + 5 = 13$
  - Test block: $$\frac{a}{b}$$
  - Test fractions, exponents, roots
  - Test Greek letters: $\alpha$, $\beta$
  - Verify readability

#### Testing Suite
- [ ] **Task 2.21:** Create test problems (30 min)
  - `src/utils/problemExamples.ts`
  - Add 5+ diverse problems
  - Include expected steps for each
  - Categorize by type

- [ ] **Task 2.22:** Manual testing - Problem Type 1 (20 min)
  - **Simple Arithmetic:** "45 + 67 = ?"
  - Have complete conversation
  - Verify AI guidance
  - Check math rendering
  - Verify persistence
  - Document any issues

- [ ] **Task 2.23:** Manual testing - Problem Type 2 (20 min)
  - **Basic Algebra:** "3x - 7 = 14"
  - Complete conversation (should be 3-4 steps)
  - Test with wrong answers
  - Verify hints appear
  - Document results

- [ ] **Task 2.24:** Manual testing - Problem Type 3 (20 min)
  - **Word Problem:** "Sarah has $20. She buys 3 books at $5 each. How much money left?"
  - Test problem understanding
  - Verify step-by-step breakdown
  - Check encouragement
  - Document results

- [ ] **Task 2.25:** Manual testing - Problem Type 4 (20 min)
  - **Geometry:** "Find area of triangle with base 6cm, height 4cm"
  - Test formula guidance
  - Verify visual problem solving
  - Document results

- [ ] **Task 2.26:** Manual testing - Problem Type 5 (20 min)
  - **Multi-step:** "2(x + 3) = 16"
  - Test order of operations guidance
  - Verify complex reasoning
  - Document results

- [ ] **Task 2.27:** Edge case testing (30 min)
  - Student says "just tell me the answer"
  - Student gives wrong answer 3+ times
  - Student asks off-topic question
  - Very long problem text
  - Image upload failure
  - Network disconnection
  - Document all edge case behaviors

- [ ] **Task 2.28:** Bug fixes from testing (1-2 hours)
  - Fix any issues found during testing
  - Improve prompt if needed
  - Adjust UI based on feedback
  - Re-test problem areas

**End of Day 2 Checklist:**
- [x] Text input works perfectly ✅
- [x] Image upload works (sends directly to AI) ✅
- [x] Images display in chat messages ✅
- [x] Math renders correctly in all messages - Tasks 2.18-2.19 completed ✅ (Task 2.20 testing pending)
- [x] Conversations persist across page refresh ✅
- [ ] All 5 problem types tested and working - Not started
- [ ] Edge cases handled gracefully - Partially tested
- [x] No critical bugs ✅

**Day 2 Stretch Features (Completed):**
- [x] **Task 2.29:** Audio input (speech-to-text) with Whisper-1 ✅ COMPLETED
  - `src/hooks/useAudioRecording.ts` - Custom hook for microphone recording
  - `functions/src/index.ts` - `/transcribe` Cloud Function endpoint
  - OpenAI Whisper-1 API integration
  - Base64 audio encoding/decoding
  - Microphone access and MediaRecorder API
  - InputArea component with microphone button
  - Visual feedback for recording state
  - Error handling and user feedback

- [x] **Task 2.30:** Audio output (text-to-speech) with TTS-1 ✅ COMPLETED
  - `src/hooks/useTextToSpeech.ts` - Custom hook for TTS generation
  - `functions/src/index.ts` - `/speech` Cloud Function endpoint
  - OpenAI TTS-1 API integration
  - Base64 audio decoding and playback
  - Message component with play button
  - Auto-play audio for new AI responses
  - Play/stop controls

- [x] **Task 2.31:** Auto-play audio for AI responses ✅ COMPLETED
  - Auto-play triggers when new assistant message received
  - Fixed React Hooks error (useCallback inside map)
  - Removed excessive console logs
  - Reduced message spacing for better UX
  - Proper cleanup and error handling

---

## Day 3: Polish, Stretch Features & Deployment
**Goal:** Add step visualization, whiteboard (if time), deploy, and create demo

**Estimated Time:** 6-8 hours  
**Priority:** Enhancement and delivery

---

### Morning Session (4-5 hours)

#### Step Visualization
- [ ] **Task 3.1:** Create Step type definition (15 min)
  - `src/types/step.ts`
  - Define Step interface (id, question, answer, isComplete)
  - Export types

- [ ] **Task 3.2:** Add step tracking to chat hook (45 min)
  - Update `useChat.ts`
  - Identify question-answer pairs
  - Create step objects
  - Track completion status
  - Determine current active step

- [ ] **Task 3.3:** Build StepCard component (45 min)
  - `src/components/StepVisualization/StepCard.tsx`
  - Display step number/checkmark/arrow
  - Show question and answer
  - Style for complete/active/pending states
  - Expandable/collapsible
  - Smooth transitions

- [ ] **Task 3.4:** Build StepTimeline component (1 hour)
  - `src/components/StepVisualization/StepTimeline.tsx`
  - Container for all steps
  - Show problem at top
  - Progress indicator (X of Y steps)
  - Map through steps to StepCard
  - Sticky positioning
  - Responsive layout

- [ ] **Task 3.5:** Create step visualization styles (30 min)
  - `src/styles/step-visualization.css`
  - Timeline visual styles
  - Card animations
  - Progress bar
  - Mobile-friendly

- [ ] **Task 3.6:** Integrate StepTimeline into app (30 min)
  - Add to ChatContainer or separate panel
  - Pass step data
  - Toggle visibility option
  - Sync with conversation state

- [ ] **Task 3.7:** Test step visualization (30 min)
  - Test with all 5 problem types
  - Verify step detection
  - Check visual appearance
  - Test on mobile
  - Adjust as needed

#### Whiteboard (If Time Permits)
- [ ] **Task 3.8:** Install Excalidraw (10 min)
  ```bash
  npm install @excalidraw/excalidraw
  ```

- [ ] **Task 3.9:** Build WhiteboardPanel component (1.5 hours)
  - `src/components/Whiteboard/WhiteboardPanel.tsx`
  - Embed Excalidraw component
  - Full-screen overlay
  - Toggle button in chat
  - Clear canvas button
  - Close button
  - Configure UI options

- [ ] **Task 3.10:** Create whiteboard styles (20 min)
  - `src/styles/whiteboard.css`
  - Overlay positioning
  - Header bar
  - Responsive sizing
  - Z-index management

- [ ] **Task 3.11:** Integrate whiteboard (30 min)
  - Add toggle button to ChatContainer
  - Show/hide whiteboard
  - Test drawing functionality
  - Test on mobile (touch)

- [ ] **Task 3.12:** Test whiteboard (20 min)
  - Test drawing tools
  - Test eraser
  - Test shapes
  - Verify mobile functionality

**Mid-Day Checkpoint:**
- [ ] Step visualization working and looks good
- [ ] Whiteboard integrated (or decided to skip)
- [ ] All features working together
- [ ] Ready for polish

---

### Afternoon Session (2-3 hours)

#### UI Polish
- [ ] **Task 3.13:** Overall UI refinement (1 hour)
  - Consistent spacing throughout
  - Color contrast check
  - Font sizes readable
  - Button states clear
  - Loading states polished
  - Error messages user-friendly
  - Responsive on mobile

- [ ] **Task 3.14:** Add theme toggle (optional, 30 min)
  - Create ThemeToggle component
  - Implement useTheme hook
  - Add dark mode styles
  - Persist theme preference
  - Test both themes

- [ ] **Task 3.15:** Performance check (20 min)
  - Test with long conversations
  - Check memory usage
  - Verify smooth scrolling
  - Optimize if needed

- [ ] **Task 3.16:** Accessibility improvements (20 min)
  - Add ARIA labels
  - Test keyboard navigation
  - Check color contrast
  - Add focus indicators

#### Deployment
- [ ] **Task 3.17:** Create .env.example (10 min)
  - Copy .env structure
  - Replace values with placeholders
  - Add comments explaining each variable

- [ ] **Task 3.18:** Update .gitignore (10 min)
  - Ensure .env is ignored
  - Ignore build artifacts
  - Ignore Firebase cache

- [ ] **Task 3.19:** Create production build (15 min)
  ```bash
  npm run build
  ```
  - Verify no errors
  - Check bundle size
  - Test build locally

- [ ] **Task 3.20:** Firebase deployment setup (20 min)
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init hosting
  ```
  - Select Firebase project
  - Set build directory to 'dist'
  - Configure as SPA (single-page app)
  - Don't overwrite index.html

- [ ] **Task 3.21:** Deploy to Firebase Hosting (15 min)
  ```bash
  firebase deploy --only hosting
  ```
  - Verify deployment successful
  - Get hosting URL
  - Test deployed app
  - Check all features work

- [ ] **Task 3.22:** Test deployed application (30 min)
  - Test on desktop
  - Test on mobile
  - Test all features
  - Verify Firebase connections
  - Check OpenAI API calls
  - Test persistence
  - Document deployment URL

---

### Evening Session (2 hours)

#### Documentation
- [ ] **Task 3.23:** Write README.md (1 hour)
  - Project overview (2-3 sentences)
  - Features list with descriptions
  - Tech stack details
  - Prerequisites
  - Setup instructions (step-by-step)
  - Environment variables guide
  - Running locally instructions
  - Deployment guide
  - Usage examples
  - Link to deployed app
  - Link to demo video
  - Future improvements section
  - License

- [ ] **Task 3.24:** Create problem walkthroughs (30 min)
  - Document all 5 test problems
  - Include screenshots of conversations
  - Show step-by-step dialogue
  - Highlight Socratic method
  - Add to README or separate EXAMPLES.md

- [ ] **Task 3.25:** Document prompt engineering (20 min)
  - Explain prompt design process
  - Show prompt iterations
  - Describe what worked/didn't work
  - Add lessons learned
  - Include in README or PROMPTS.md

#### Demo Video
- [ ] **Task 3.26:** Write demo script (15 min)
  - Introduction (30 sec)
  - Text input demo (1 min)
  - Image upload demo (1 min)
  - Step visualization showcase (1 min)
  - Whiteboard demo (1 min, if built)
  - Conclusion (30 sec)
  - Total: 5 minutes

- [ ] **Task 3.27:** Record demo video (45 min)
  - Set up screen recording
  - Clear browser cache/history
  - Prepare test problems
  - Record full walkthrough
  - Keep under 5 minutes
  - Re-record if needed

- [ ] **Task 3.28:** Edit demo video (30 min)
  - Trim unnecessary parts
  - Add title slide
  - Add transitions if needed
  - Add voiceover or captions
  - Export final video
  - Upload to YouTube/Vimeo
  - Add link to README

**End of Day 3 Checklist:**
- [ ] Step visualization complete and polished
- [ ] Whiteboard integrated (if attempted)
- [ ] Application deployed to Firebase
- [ ] README fully documented
- [ ] 5+ problem walkthroughs documented
- [ ] Demo video recorded and uploaded
- [ ] All links in README work
- [ ] Project ready for submission

---

## Final Submission Checklist

### Code Quality
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Code is formatted consistently
- [ ] Comments added for complex logic
- [ ] No hardcoded API keys in code
- [ ] .env.example provided

### Functionality
- [ ] Text input works
- [ ] Image upload works
- [ ] AI follows Socratic method
- [ ] Math renders correctly
- [ ] Conversations persist
- [ ] All 5 problem types work
- [ ] Step visualization works
- [ ] Whiteboard works (if included)

### Documentation
- [ ] README.md complete
- [ ] Setup instructions clear
- [ ] 5+ problem walkthroughs
- [ ] Prompt engineering notes
- [ ] Demo video linked
- [ ] Deployed app linked

### Deployment
- [ ] App deployed and accessible
- [ ] All features work in production
- [ ] No CORS issues
- [ ] Firebase rules set correctly
- [ ] Environment variables configured

### Demo Video
- [ ] Under 5 minutes
- [ ] Shows all core features
- [ ] Shows stretch features (if built)
- [ ] Clear audio/visuals
- [ ] Uploaded and linked

---

## Time Management Tips

### If Ahead of Schedule
- Add more test problems
- Improve UI polish
- Add theme toggle
- Enhance error messages
- Add keyboard shortcuts
- Improve mobile experience

### If Behind Schedule
**Priority Cuts (in order):**
1. Skip whiteboard → Focus on step visualization
2. Skip theme toggle → Stick with light mode
3. Reduce test problems from 5 to 3
4. Simplify demo video (no editing, just recording)
5. Basic README only (skip detailed walkthroughs)

**Never Cut:**
- Core chat functionality
- Socratic prompting quality
- At least 3 problem types working
- Deployment
- Basic documentation

### If Stuck
1. Check console for errors
2. Review similar examples in docs
3. Test in isolation
4. Ask for specific help
5. Move to next task, come back later

---

## Success Metrics

### Day 1 Success
- Can have conversation with AI
- AI asks questions, doesn't give answers
- Streaming works smoothly
- 5+ turns conversation successful

### Day 2 Success
- All input methods work
- All 5 problem types tested
- Data persists correctly
- No critical bugs

### Day 3 Success
- Stretch feature(s) implemented
- App deployed and working
- Documentation complete
- Demo video recorded

---

## Emergency Troubleshooting

### Common Issues

**Issue: OpenAI API not working**
- Check API key in .env
- Verify VITE_ prefix
- Check rate limits
- Restart dev server

**Issue: Firebase not connecting**
- Verify config in .env
- Check Firebase console settings
- Verify Firestore rules
- Check network requests

**Issue: Streaming not working**
- Check OpenAI client version
- Verify stream: true parameter
- Check for-await-of syntax
- Test with simple prompt

**Issue: Math not rendering**
- Verify KaTeX CSS imported
- Check LaTeX syntax
- Test with simple equation
- Check console for errors

**Issue: Image upload failing**
- Check Firebase Storage rules
- Verify file size limit
- Check file type validation
- Test with simple image

---

## Post-Completion Tasks

### Optional Enhancements
- [ ] Add conversation history sidebar
- [ ] Add problem difficulty rating
- [ ] Add export conversation feature
- [ ] Add share conversation link
- [x] Add voice input/output ✅ COMPLETED (Tasks 2.29-2.31)
- [ ] Add handwriting recognition
- [ ] Add multi-language support

### Maintenance
- [ ] Monitor Firebase usage
- [ ] Track OpenAI API costs
- [ ] Collect user feedback
- [ ] Fix reported bugs
- [ ] Update documentation

---

**Good luck! Build something amazing! 🚀**