# Tech Context
## Technologies & Setup

**Last Updated:** November 3, 2025

---

## Technology Stack

### Frontend
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **KaTeX** + **react-katex** - Mathematical notation rendering
- **CSS Custom Properties** - Theme support (light/dark)

### Backend
- **Firebase Cloud Functions** - Serverless API endpoints
- **Node.js 18** - Functions runtime
- **OpenAI SDK** - Direct API integration (not LangChain)

### Firebase Services
- **Firestore** - Conversation persistence
- **Storage** - Image uploads
- **Cloud Functions** - Secure OpenAI API calls

### Hosting
- **Vercel or Render** - Frontend hosting (NOT Firebase Hosting)

### AI Services
- **OpenAI GPT-4o-mini** - Conversations (current, cost-effective, ~$0.002/conversation)
  - **Issue:** Sometimes affirms wrong answers on complex math problems
  - **Future:** Consider switching to GPT-5-mini or GPT-4o when finishing project
- **OpenAI GPT-4o** - Image extraction only (vision, ~$0.01/image)

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
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
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
  "firebase": "^latest",
  "openai": "^latest",
  "katex": "^latest",
  "react-katex": "^latest"
}
```

### Functions
```json
{
  "openai": "^latest",
  "firebase-admin": "^latest",
  "firebase-functions": "^latest"
}
```

---

## Key Configuration

### OpenAI Settings
```typescript
{
  model: "gpt-4o-mini",      // For conversations
  temperature: 0.8,           // Natural, varied responses
  frequency_penalty: 0.5,    // Reduces repetition
  presence_penalty: 0.3,     // Encourages variety
  max_tokens: 150,           // Concise tutor responses
  stream: true               // Real-time responses
}
```

### Context Window
- **Strategy:** Only send last 8 messages to OpenAI
- **Cost Impact:** 10x reduction (~$0.002 vs ~$0.02 per conversation)
- **Implementation:** `messages.slice(-8)`

### Firebase Setup
- **Firestore:** Real-time listeners for conversations
- **Storage:** Image upload with 5MB max, public read/write rules
- **Functions:** Node.js 18 runtime, us-central1 region (default)

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
firebase deploy --only functions  # Deploy Cloud Functions
# Deploy dist/ to Vercel or Render
```

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
- ✅ Firestore security rules (validate user access)
- ✅ Storage rules (validate file types and sizes)
- ✅ CORS configuration for API calls
- ⚠️ No user authentication (public demo)

---

**Document Status:** Tech stack confirmed and ready

