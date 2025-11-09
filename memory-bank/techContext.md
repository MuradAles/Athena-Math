# Tech Context
## Technologies & Setup

**Last Updated:** November 9, 2025

---

## Technology Stack

### Frontend
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **KaTeX** + **react-katex** - Mathematical notation rendering
- **CSS Custom Properties** - Theme support (light/dark)
- **MediaRecorder API** - Browser-based audio recording
- **Audio API** - Browser-based audio playback
- **Fabric.js** - Canvas drawing library for whiteboard
- **canvas-confetti** - Celebration effects library

### Backend
- **Firebase Cloud Functions** - Serverless API endpoints
- **Node.js 18** - Functions runtime
- **OpenAI SDK** - Direct API integration (not LangChain)
- **nerdamer** - Symbolic math library for calculations and validation

### Firebase Services
- **Firestore** - Conversation persistence
- **Storage** - Image uploads
- **Cloud Functions** - Secure OpenAI API calls

### Hosting
- **Firebase Hosting** - Frontend hosting (integrated with Firebase services)
  - Production URL: https://athena-math.web.app
  - SPA routing configured (all routes redirect to `/index.html`)
  - Cache headers for static assets (1 year)
  - Build output: `dist/` folder

### AI Services
- **Smart Model Selection** - Automatically selects based on content:
  - **OpenAI GPT-4o-mini** - Text-only conversations (cost-effective, ~$0.002/conversation)
    - No organization verification required for streaming
    - Used when messages contain only text
  - **OpenAI GPT-4o** - Messages with images (vision support, requires organization verification)
    - Used when messages contain images (OpenAI vision format)
    - Also used for image extraction (`extractProblem` function, currently not used)
- **OpenAI Whisper-1** - Speech-to-text transcription
  - Used for voice input via `/transcribe` Cloud Function
  - Accepts base64-encoded audio (MP3, MP4, MPEG, MPGA, M4A, WAV, WEBM)
  - Returns transcribed text
- **OpenAI TTS-1** - Text-to-speech synthesis
  - Used for voice output via `/speech` Cloud Function
  - Accepts text and optional voice parameter (alloy, echo, fable, onyx, nova, shimmer)
  - Returns base64-encoded MP3 audio

### Model Selection (Future Improvement)
**Current:** GPT-4o-mini
- Cost: ~$0.15 per million input tokens, ~$0.60 per million output tokens
- Math accuracy: Good for simple problems, weaker for complex math
- Known issue: Makes mistakes on complex factoring (affirms wrong answers)

**Future Options (Switch LAST when finishing project):**
1. **GPT-5-mini** (if available): Better math accuracy, similar cost
   - Cost: ~$0.25 per million input tokens, ~$2 per million output tokens
   - Better reasoning capabilities
   - **Action:** Try this first if available

2. **GPT-4o**: Better math accuracy, 10x more expensive
   - Cost: ~$2.50 per million input tokens, ~$10 per million output tokens
   - Much better for complex math
   - **Action:** Use if GPT-5-mini not available and validation not enough

**Decision:** Focus on validation improvements first, switch model LAST

---

## Development Setup

### Project Structure
```
athena/
├── src/
│   ├── components/      # Feature-based component organization
│   ├── hooks/          # Custom React hooks
│   ├── services/       # External API integrations
│   ├── constants/      # Design system constants
│   ├── styles/         # Global CSS files
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript definitions
│   └── config/         # App configuration
├── functions/          # Firebase Cloud Functions
├── public/             # Static assets
└── memory-bank/        # Project documentation
```

### Environment Variables

**Frontend (.env):**
```bash
VITE_API_KEY=              # Firebase API Key
VITE_AUTH_DOMAIN=          # Firebase Auth Domain
VITE_PROJECT_ID=           # Firebase Project ID
VITE_STORAGE_BUCKET=       # Firebase Storage Bucket
VITE_MESSAGING_SENDER_ID=  # Firebase Messaging Sender ID
VITE_APP_ID=              # Firebase App ID
VITE_USE_FUNCTIONS_EMULATOR=false  # Use production functions by default
```

**Functions (.env - server-side):**
```bash
OPENAI_API_KEY=         # Stays secret, never exposed to client
```

---

## Dependencies

### Frontend
```json
{
  "firebase": "^12.5.0",
  "openai": "^6.7.0",
  "katex": "^0.16.25",
  "react-katex": "^3.1.0",
  "canvas-confetti": "^1.9.4",
  "fabric": "^6.7.1"
}
```

### Functions
```json
{
  "openai": "^latest",
  "firebase-admin": "^latest",
  "firebase-functions": "^latest",
  "nerdamer": "^latest"
}
```

---

## Key Configuration

### OpenAI Settings
```typescript
// Smart model selection
const hasImages = conversationMessages.some(
  msg => Array.isArray(msg.content) && 
  msg.content.some(item => item.type === 'image_url')
);
const model = hasImages ? "gpt-4o" : "gpt-4o-mini";

{
  model,                    // gpt-4o for images, gpt-4o-mini for text-only
  temperature: 0.8,         // Natural, varied responses
  frequency_penalty: 0.5,   // Reduces repetition
  presence_penalty: 0.3,    // Encourages variety
  // max_tokens: Removed (no limit for flexible explanations)
  stream: true              // Real-time responses
}
```

### Context Window
- **Strategy:** Only send last 8 messages to OpenAI
- **Cost Impact:** 10x reduction (~$0.002 vs ~$0.02 per conversation)
- **Implementation:** `messages.slice(-8)`

### Firebase Setup
- **Firestore:** Real-time listeners for conversations
  - Structure: `users/{userId}/chats/{chatId}/messages/{messageId}`
  - Security rules: Users can only read/write their own data
  - Indexes: `updatedAt` field for efficient queries
- **Storage:** Image upload with 5MB max, authenticated user access only
  - Path: `users/{userId}/images/{imageId}`
  - Rules: Users can upload and read their own images
  - Content type validation (image/* only)
- **Functions:** Node.js 22 runtime, us-central1 region (default)
  - Production deployment (not emulator)
  - CORS enabled for all origins
  - Environment variables loaded from `.env` file

---

## Build & Deployment

### Development
```bash
npm run dev              # Vite dev server
firebase emulators:start  # Local Firebase emulators
```

### Production
```bash
npm run build            # Frontend build (output: dist/)
npm run deploy           # Build and deploy everything
npm run deploy:hosting   # Build and deploy only frontend
npm run deploy:functions # Deploy only Cloud Functions
npm run deploy:rules     # Deploy Firestore and Storage rules
```

### Key Deployment Notes
- **Cloud Functions:** Use production URLs by default (`VITE_USE_FUNCTIONS_EMULATOR=false`)
- **Functions:** Deployed with `cors: true` for CORS handling
- **Storage Rules:** Must be deployed separately (`firebase deploy --only storage:rules`)
- **Firestore Rules:** Must be deployed separately (`firebase deploy --only firestore:rules`)

---

## Cost Estimates

### Development (3 days)
- ~50-100 test conversations
- Estimated: **$2-3 total**

### Production (100 users/month)
- 3 conversations per user average
- 300 conversations total
- Using GPT-4o-mini + smart context
- Estimated: **$1-2/month**

---

## Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design (320px - 2560px width)

---

## Performance Targets

- Initial page load: < 2 seconds
- Message send to response start: < 1 second
- Image upload and processing: < 5 seconds
- Smooth scrolling and animations
- No janky UI during streaming

---

## Security Considerations

- ✅ API keys in Cloud Functions (server-side only)
- ✅ Firestore security rules (users can only access their own data)
- ✅ Storage rules (users can only upload/read their own images, 5MB max, image/* only)
- ✅ CORS configuration for API calls (Cloud Functions)
- ✅ User authentication (Email/Password + Google OAuth)
- ✅ Cross-Origin-Opener-Policy headers for OAuth popups

---

### Math Tools
- **nerdamer** - Symbolic math library for calculations
  - Used for solving equations, factoring, expanding, simplifying
  - Used for derivatives, integrals, limits
  - Used for evaluating arithmetic expressions
  - Provides accurate mathematical validation

**Document Status:** Tech stack confirmed, deployed, and working in production with math tools and whiteboard integration

