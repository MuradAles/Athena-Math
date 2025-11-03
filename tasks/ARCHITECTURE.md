# Mermaid Diagrams
## AI Math Tutor - System Architecture & Flow

**Last Updated:** November 3, 2025

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend - React + TypeScript"
        UI[User Interface]
        CHAT[Chat Components]
        INPUT[Problem Input]
        STEP[Step Visualization]
        WB[Whiteboard]
    end
    
    subgraph "Services Layer"
        OAI[OpenAI Service<br/>GPT-4o-mini]
        FB[Firebase Service]
        MATH[Math Parser]
    end
    
    subgraph "Backend - Firebase"
        FS[Firestore<br/>Conversations]
        ST[Storage<br/>Images]
        HOST[Hosting]
    end
    
    subgraph "External APIs"
        GPT4[OpenAI GPT-4o<br/>Vision API]
        GPT4M[OpenAI GPT-4o-mini<br/>Chat API]
    end
    
    UI --> CHAT
    UI --> INPUT
    UI --> STEP
    UI --> WB
    
    CHAT --> OAI
    INPUT --> FB
    INPUT --> MATH
    
    OAI --> GPT4M
    MATH --> GPT4
    FB --> FS
    FB --> ST
    
    style UI fill:#3b82f6,color:#fff
    style OAI fill:#22c55e,color:#fff
    style FB fill:#ef4444,color:#fff
    style GPT4M fill:#8b5cf6,color:#fff
    style GPT4 fill:#8b5cf6,color:#fff
```

---

## 2. Data Flow - Complete User Journey

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React UI
    participant OAI as OpenAI Service
    participant GPT as GPT-4o-mini
    participant FS as Firestore
    
    Note over U,FS: Text Input Flow
    U->>UI: Types problem: "2x + 5 = 13"
    UI->>FS: Create conversation
    FS-->>UI: conversationId
    UI->>OAI: Send problem + system prompt
    OAI->>GPT: Stream chat completion
    GPT-->>OAI: Token stream
    OAI-->>UI: Display streaming response
    UI->>FS: Save messages
    
    Note over U,FS: Conversation Loop
    U->>UI: Sends answer
    UI->>FS: Save user message
    UI->>OAI: Send last 8 messages
    OAI->>GPT: Request completion (temp: 0.8)
    GPT-->>OAI: Natural response
    OAI-->>UI: Stream to user
    UI->>FS: Save AI message
    
    Note over U,FS: Image Input Flow
    U->>UI: Uploads image
    UI->>FS: Upload to Storage
    FS-->>UI: Image URL
    UI->>OAI: Extract problem (GPT-4o Vision)
    OAI-->>UI: Problem text
    UI->>U: Confirm extracted problem
```

---

## 3. Component Hierarchy

```mermaid
graph TD
    APP[App.tsx]
    
    APP --> CHAT[ChatContainer]
    APP --> PROB[ProblemInput]
    APP --> STEP[StepTimeline]
    APP --> WB[WhiteboardPanel]
    
    CHAT --> MSGLIST[MessageList]
    CHAT --> INPUT[InputArea]
    
    MSGLIST --> MSG[Message]
    MSGLIST --> STREAM[StreamingMessage]
    
    PROB --> TEXT[TextInput]
    PROB --> IMG[ImageUpload]
    PROB --> DISP[ProblemDisplay]
    
    STEP --> CARD[StepCard]
    
    MSG --> MATH[Math Renderer<br/>KaTeX]
    
    style APP fill:#3b82f6,color:#fff
    style CHAT fill:#22c55e,color:#fff
    style PROB fill:#f59e0b,color:#fff
    style STEP fill:#8b5cf6,color:#fff
    style WB fill:#ec4899,color:#fff
```

---

## 4. State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle: App Loads
    
    Idle --> ProblemInput: User starts
    
    ProblemInput --> TextEntry: Types problem
    ProblemInput --> ImageUpload: Uploads image
    
    ImageUpload --> Extracting: Processing image
    Extracting --> Confirmation: Problem extracted
    Confirmation --> Conversation: User confirms
    
    TextEntry --> Conversation: Problem submitted
    
    Conversation --> UserTurn: Waiting for answer
    UserTurn --> Thinking: User sends message
    Thinking --> Streaming: AI generates response
    Streaming --> UserTurn: Response complete
    
    UserTurn --> Complete: Problem solved
    Complete --> Idle: New problem
    
    Conversation --> StepTracking: Track progress
    StepTracking --> Conversation: Update steps
```

---

## 5. Conversation Context Management

```mermaid
graph LR
    subgraph "Firestore"
        ALL[All Messages<br/>1-50+]
    end
    
    subgraph "Context Window"
        SYS[System Prompt<br/>500 tokens]
        LAST8[Last 8 Messages<br/>~1000 tokens]
    end
    
    subgraph "OpenAI API"
        GPT[GPT-4o-mini<br/>Streaming]
    end
    
    ALL -->|Slice -8| LAST8
    SYS --> GPT
    LAST8 --> GPT
    GPT -->|Stream| RESP[Response]
    RESP -->|Save| ALL
    
    style ALL fill:#f59e0b,color:#fff
    style LAST8 fill:#22c55e,color:#fff
    style GPT fill:#8b5cf6,color:#fff
```

---

## 6. OpenAI Service Architecture

```mermaid
flowchart TD
    START[User Message] --> CHECK{Message Type?}
    
    CHECK -->|Text Problem| CHAT[Chat Flow]
    CHECK -->|Image| IMG[Image Flow]
    
    CHAT --> PREP1[Prepare Context<br/>Last 8 messages]
    PREP1 --> PROMPT1[Add System Prompt<br/>Natural Conversation]
    PROMPT1 --> API1[OpenAI API<br/>gpt-4o-mini]
    
    API1 --> SETTINGS1[Settings:<br/>temp: 0.8<br/>freq_penalty: 0.5<br/>presence_penalty: 0.3<br/>max_tokens: 150]
    
    SETTINGS1 --> STREAM[Stream Response]
    STREAM --> DISPLAY[Display to User]
    
    IMG --> UPLOAD[Upload to Storage]
    UPLOAD --> URL[Get Image URL]
    URL --> VISION[OpenAI Vision<br/>gpt-4o]
    VISION --> EXTRACT[Extract Problem Text]
    EXTRACT --> CONFIRM[User Confirms]
    CONFIRM --> CHAT
    
    style START fill:#3b82f6,color:#fff
    style CHAT fill:#22c55e,color:#fff
    style IMG fill:#f59e0b,color:#fff
    style API1 fill:#8b5cf6,color:#fff
    style VISION fill:#8b5cf6,color:#fff
```

---

## 7. Cost Optimization Strategy

```mermaid
graph TB
    subgraph "Message History"
        M1[Message 1]
        M2[Message 2]
        M3[...]
        M20[Message 20]
    end
    
    subgraph "Cost Analysis"
        NAIVE[Naive: Send All<br/>Cost: $0.02]
        SMART[Smart: Send Last 8<br/>Cost: $0.002]
    end
    
    subgraph "Model Selection"
        MINI[GPT-4o-mini<br/>Conversations<br/>$0.15 per 1M tokens]
        FULL[GPT-4o<br/>Image Extraction Only<br/>$2.50 per 1M tokens]
    end
    
    M1 -.->|All messages| NAIVE
    M2 -.->|All messages| NAIVE
    M3 -.->|All messages| NAIVE
    M20 -.->|All messages| NAIVE
    
    M20 -->|Last 8 only| SMART
    
    SMART --> MINI
    
    style NAIVE fill:#ef4444,color:#fff
    style SMART fill:#22c55e,color:#fff
    style MINI fill:#22c55e,color:#fff
    style FULL fill:#f59e0b,color:#fff
```

---

## 8. Conversation Flow - Natural Dialogue

```mermaid
sequenceDiagram
    participant S as Student
    participant AI as AI Tutor
    participant SYS as System
    
    Note over S,SYS: Natural Conversation Flow
    
    S->>AI: "I need help with 2x + 5 = 13"
    SYS->>SYS: Apply Natural Prompt<br/>temp: 0.8, freq_penalty: 0.5
    AI->>S: "Let's tackle this! What's your<br/>first thought about where to start?"
    
    S->>AI: "Maybe subtract 5?"
    SYS->>SYS: Track confidence: medium<br/>Build on response
    AI->>S: "Good instinct! Go ahead and<br/>subtract 5 from both sides.<br/>What do you get?"
    
    S->>AI: "2x = 8"
    SYS->>SYS: Correct answer<br/>Encourage & continue
    AI->>S: "Perfect! Now you just need<br/>to deal with that 2.<br/>What's your move?"
    
    S->>AI: "Divide by 2?"
    AI->>S: "Exactly! Try it out."
    
    S->>AI: "x = 4"
    SYS->>SYS: Problem solved!<br/>Mark complete
    AI->>S: "You got it! Nice work.<br/>Want to try another one?"
    
    Note over S,SYS: Key: Natural flow, varied language,<br/>builds on responses
```

---

## 9. Firebase Data Structure

```mermaid
erDiagram
    CONVERSATIONS ||--o{ MESSAGES : contains
    CONVERSATIONS {
        string id PK
        string problem
        timestamp createdAt
        timestamp updatedAt
        string status
    }
    
    MESSAGES {
        string id PK
        string conversationId FK
        string role
        string content
        timestamp timestamp
        int tokenCount
    }
    
    IMAGES {
        string id PK
        string url
        string extractedText
        timestamp uploadedAt
    }
```

---

## 10. Step Visualization Logic

```mermaid
flowchart TD
    START[Conversation Starts] --> TRACK[Track Messages]
    
    TRACK --> DETECT{Detect Q&A Pair?}
    
    DETECT -->|AI Question| STEP1[Create Step]
    STEP1 --> WAIT[Wait for Answer]
    WAIT --> ANS[User Answers]
    ANS --> UPDATE[Update Step]
    
    UPDATE --> CHECK{Correct?}
    
    CHECK -->|Yes| COMPLETE[Mark Complete ✓]
    CHECK -->|No| RETRY[Increment Attempts]
    
    RETRY --> HINT{Attempts >= 2?}
    HINT -->|Yes| PROVIDE[Provide Hint]
    HINT -->|No| WAIT
    
    PROVIDE --> WAIT
    
    COMPLETE --> DETECT
    
    DETECT -->|Problem Solved| END[Show Final Steps]
    
    style START fill:#3b82f6,color:#fff
    style COMPLETE fill:#22c55e,color:#fff
    style END fill:#8b5cf6,color:#fff
```

---

## 11. Technology Stack Visualization

```mermaid
graph TB
    subgraph "Frontend Layer"
        REACT[React 18<br/>TypeScript]
        VITE[Vite<br/>Build Tool]
    end
    
    subgraph "UI Libraries"
        KATEX[KaTeX<br/>Math Rendering]
        EXCAL[Excalidraw<br/>Whiteboard]
    end
    
    subgraph "State & Hooks"
        HOOKS[Custom Hooks<br/>useState, useEffect]
    end
    
    subgraph "Backend Services"
        FIRE[Firebase<br/>Firestore + Storage + Hosting]
    end
    
    subgraph "AI Services"
        OAI[OpenAI API<br/>gpt-4o-mini + gpt-4o]
    end
    
    REACT --> HOOKS
    REACT --> KATEX
    REACT --> EXCAL
    VITE --> REACT
    
    HOOKS --> FIRE
    HOOKS --> OAI
    
    style REACT fill:#3b82f6,color:#fff
    style FIRE fill:#ef4444,color:#fff
    style OAI fill:#8b5cf6,color:#fff
```

---

## 12. Deployment Flow

```mermaid
flowchart LR
    DEV[Development<br/>npm run dev] --> BUILD[Build<br/>npm run build]
    
    BUILD --> TEST[Test Build<br/>Locally]
    
    TEST --> DEPLOY{Deploy Ready?}
    
    DEPLOY -->|No| FIX[Fix Issues]
    FIX --> BUILD
    
    DEPLOY -->|Yes| FB[Firebase Deploy]
    
    FB --> HOSTING[Firebase Hosting]
    
    HOSTING --> LIVE[Live Application<br/>Public URL]
    
    style DEV fill:#3b82f6,color:#fff
    style BUILD fill:#f59e0b,color:#fff
    style LIVE fill:#22c55e,color:#fff
```

---

## How to Use These Diagrams

### In Documentation
Copy any diagram into your README.md or other markdown files. GitHub, GitLab, and many markdown viewers support Mermaid natively.

### In VS Code
Install "Markdown Preview Mermaid Support" extension to view these diagrams.

### Online Viewer
Visit https://mermaid.live/ and paste any diagram to view/edit interactively.

### Export as Image
Use mermaid.live to export diagrams as PNG/SVG for presentations.

---

**Document End**