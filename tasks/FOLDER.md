# Folder Structure
## AI Math Tutor - Socratic Learning Assistant

**Last Updated:** November 3, 2025  
**Tech Stack:** React + TypeScript + Firebase + OpenAI

---

## Complete Project Structure

```
math-tutor/
│
├── src/
│   ├── components/           # All React components (organized by feature)
│   │   ├── Chat/
│   │   ├── ProblemInput/
│   │   ├── StepVisualization/
│   │   ├── Whiteboard/
│   │   └── Common/
│   │
│   ├── hooks/               # Custom React hooks
│   ├── services/            # External API integrations (OpenAI, Firebase)
│   ├── constants/           # Design system constants (colors, spacing, typography)
│   ├── styles/              # Global CSS files
│   ├── utils/               # Helper functions and utilities
│   ├── types/               # TypeScript type definitions
│   ├── config/              # Application configuration
│   │
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
│
├── public/                  # Static assets
├── tests/                   # Test files (optional)
├── docs/                    # Documentation
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── firebase.json
├── README.md
├── PRD.md
└── FOLDER.md
```

---

## Folder Descriptions

### `/src/components/`
All React components organized by feature. Feature-based folders (Chat, ProblemInput, etc.) with related components grouped together.

### `/src/hooks/`
Custom React hooks for reusable logic. One hook per file, prefixed with `use`.

### `/src/services/`
External API integrations and business logic. Pure functions for OpenAI, Firebase, and other external services.

### `/src/constants/`
Design system constants in TypeScript. Color palette, spacing scale, typography definitions exported as typed objects.

### `/src/styles/`
Global CSS files. Modular CSS by purpose (variables, reset, buttons, forms, etc.).

### `/src/utils/`
Helper functions and utilities. Pure functions for prompts, math rendering, validation, etc.

### `/src/types/`
TypeScript type definitions. Organized by domain (chat, problem, message). Interfaces and types only.

### `/src/config/`
Application configuration. Environment variable processing and service initialization settings.

---

## File Naming Conventions

### TypeScript/React Files
- **Components:** `PascalCase.tsx` (e.g., `ChatContainer.tsx`)
- **Hooks:** `camelCase.ts` with `use` prefix (e.g., `useChat.ts`)
- **Services:** `camelCase.ts` (e.g., `openai.ts`)
- **Utils:** `camelCase.ts` (e.g., `mathRenderer.ts`)
- **Types:** `camelCase.ts` (e.g., `message.ts`)

### CSS Files
- **All lowercase:** `kebab-case.css` (e.g., `chat.css`)

---

## Key Principles

### Organization
1. **Feature-based:** Group by feature, not file type
2. **Colocation:** Keep related files together
3. **Single Responsibility:** Each file has one clear purpose
4. **Discoverability:** Intuitive naming and structure
5. **Scalability:** Easy to add new features

### Naming
1. **Consistency:** Follow conventions throughout
2. **Clarity:** Names describe purpose
3. **Convention:** Match ecosystem standards

---

**Document End**