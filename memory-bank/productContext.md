# Product Context
## AI Math Tutor - How It Works

**Last Updated:** November 3, 2025

---

## Why This Product Exists

Traditional math solvers simply show answers. This product teaches problem-solving methodology through guided questioning, fostering deeper understanding and independent thinking skills.

---

## Core User Flows

### 1. Text Problem Solving
- Student types a math problem
- Receives guided help through conversation
- Learns step-by-step problem-solving process
- **Acceptance:** 5+ turn conversation leads to solution discovery

### 2. Image Problem Solving
- Student uploads photo of homework problem
- System extracts problem text accurately
- Student can edit extracted text before solving
- **Acceptance:** Accurate extraction from printed materials

### 3. Stuck on a Step
- Student provides wrong answer repeatedly
- System provides helpful hints (not answers)
- Hints appear after 2 unsuccessful attempts
- **Acceptance:** Concrete hint without revealing answer

### 4. Track Progress
- Visual timeline shows completed steps
- Clear indication of current active step
- Progress indicator (X of Y steps)
- **Acceptance:** Visual clarity of learning journey

### 5. Visual Explanations (Stretch)
- Whiteboard tool for diagrams
- Works on mobile (touch) and desktop (mouse)
- Non-blocking (can chat while whiteboard open)
- Image upload to whiteboard (canvas resizes to image dimensions)
- Draw/highlight on uploaded images
- Send canvas snapshot to AI for analysis
- **Acceptance:** Functional drawing and shape tools, image upload, canvas-to-chat integration

---

## Key Features

### Problem Input System
- Text input via textarea (max 500 chars)
- Image upload (JPG, PNG, WEBP, max 5MB)
- Drag-and-drop support
- Image preview before processing
- Problem extraction confirmation

### Socratic Dialogue Engine
**Critical:** Natural conversation, not robotic Q&A

**Requirements:**
- Never provides direct answers
- Builds on student's previous responses (not scripted)
- Varies language to avoid repetition
- Provides hints after 2 unsuccessful attempts
- Uses encouraging, human-like language
- Adapts to student confidence level

**Forbidden Patterns:**
- ❌ "What should we do next?" repeated 5 times
- ❌ Direct answers: "x = 4" or "The answer is 8"
- ❌ Scripted templates ignoring student responses

**Natural Flow Example:**
```
AI: Let's tackle 2x + 5 = 13 together. What's your first thought?
Student: Maybe subtract 5?
AI: Good instinct! Go ahead and subtract 5 from both sides. What do you get?
Student: 2x = 8
AI: Perfect! Now you just need to deal with that 2. What's your move?
```

### Streaming Text Responses
- Real-time token-by-token display (like ChatGPT)
- Visual "thinking" indicator
- Smooth, readable pace
- Maintains responsiveness during streaming

### Mathematical Notation Rendering
- LaTeX syntax support
- Inline math: `$x + 5$`
- Block equations: `$$\frac{a}{b}$$`
- Works in both student and AI messages
- Automatic detection and parsing

### Conversation Persistence
- All messages automatically saved
- Persists across page refreshes
- Unique conversation ID per problem
- Load previous conversation on return
- Clear conversation option

---

## Problem Types Supported

1. **Simple Arithmetic** - "45 + 67 = ?" (1-2 steps)
2. **Basic Algebra** - "3x - 7 = 14" (3-4 steps)
3. **Word Problems** - "Sarah has $20. She buys 3 books..." (3-4 steps)
4. **Geometry** - "Find area of triangle..." (2-3 steps)
5. **Multi-Step** - "2(x + 3) = 16" (4-5 steps)

---

## User Experience Principles

- **Simplicity:** Clean, uncluttered design focused on conversation
- **Clarity:** Clear visual hierarchy and feedback
- **Responsiveness:** Fast interactions, no lag
- **Accessibility:** Readable fonts, good contrast, keyboard navigation
- **Mobile-Friendly:** Works on phones and tablets (320px+)

---

**Document Status:** Product requirements defined, ready for implementation

