# Tasks Breakdown
## AI Math Tutor - Learning Progress & Gamification Improvements

**Timeline:** TBD (Estimated 1-2 weeks)  
**Approach:** Phase-based implementation  
**Based on:** `tasks/prd-improvements.md`

---

## Overview

This task list implements three major improvements to the AI Math Tutor:
1. **AI Quality Upgrade**: Switch to GPT-4o and fix formula display
2. **Learning Progress Tracking**: Comprehensive parent dashboard
3. **Gamification System**: Achievements, streaks, and visual feedback

Tasks are organized by implementation phase and priority. Each phase builds on the previous one.

---

## Relevant Files

### AI Improvements
- `functions/src/index.ts` - Cloud Function for chat endpoint (update model selection)
- `functions/src/utils/prompts.ts` - System prompt with formula rules

### Progress Tracking
- `src/types/progress.ts` - TypeScript interfaces for progress data
- `src/services/progressService.ts` - Service for tracking and aggregating progress
- `src/hooks/useProgress.ts` - React hook for progress data
- `src/components/Progress/ProgressDashboard.tsx` - Main dashboard component
- `src/components/Progress/TopicCard.tsx` - Topic card component
- `src/components/Progress/TopicDetail.tsx` - Expandable topic details
- `src/components/Progress/SuccessStories.tsx` - Success stories component
- `src/pages/ProgressPage.tsx` - Progress page route

### Gamification
- `src/types/achievements.ts` - Achievement type definitions
- `src/services/achievementService.ts` - Achievement detection and tracking
- `src/hooks/useAchievements.ts` - React hook for achievements
- `src/hooks/useStreak.ts` - Streak tracking hook
- `src/components/Gamification/SparkleAnimation.tsx` - Sparkle animation component
- `src/components/Gamification/ProgressIndicator.tsx` - Header progress message
- `src/components/Gamification/StreakBadge.tsx` - Streak display component
- `src/components/Gamification/AchievementNotification.tsx` - Achievement popup
- `src/components/Gamification/AchievementsPanel.tsx` - Achievements list component
- `src/styles/animations.css` - CSS animations for sparkles and effects

### Integration
- `src/components/Chat/ChatContainer.tsx` - Integrate progress tracking and gamification
- `src/components/Chat/Message.tsx` - Add sparkle animation to correct answers
- `src/components/Header.tsx` - Add progress indicator and streak badge
- `src/App.tsx` - Add progress page route

---

## Tasks

### Phase 1: AI Improvements (Week 1, Days 1-2)

- [ ] 1.0 Upgrade AI Model to GPT-4o and Fix Formula Display
  - [ ] 1.1 Update Cloud Function model selection logic
    - Modify `functions/src/index.ts` to use GPT-4o instead of GPT-4o-mini
    - Remove GPT-4o-mini fallback logic
    - Update model selection comments
    - Test that model selection works correctly
  - [ ] 1.2 Enhance formula display rules in prompt
    - Update `functions/src/utils/prompts.ts` with explicit formula rules
    - Add rule: "When student asks for formula, provide ONLY formula with variables. NO numbers, NO substitutions, NO examples."
    - Add examples of correct vs incorrect formula responses
    - Add formula detection to prompt validation section
  - [ ] 1.3 Test formula responses
    - Test various formula requests (Pythagorean theorem, quadratic formula, etc.)
    - Verify no numbers appear in formula responses
    - Document any edge cases
  - [ ] 1.4 Monitor API costs
    - Set up cost tracking for GPT-4o usage
    - Create budget alerts if needed
    - Document cost difference vs GPT-4o-mini

### Phase 2: Progress Tracking Foundation (Week 1, Days 3-5)

- [ ] 2.0 Implement Progress Tracking Foundation
  - [ ] 2.1 Create progress data types
    - Create `src/types/progress.ts`
    - Define `ProgressEvent` interface with all required fields
    - Define `TopicProgress` interface for aggregated data
    - Define `SubTopicProgress` interface
    - Export all types
  - [ ] 2.2 Create Firestore data structure
    - Design Firestore structure: `users/{userId}/progress/{topicId}/attempts/{attemptId}`
    - Design aggregated data structure: `users/{userId}/progress/{topicId}/aggregated`
    - Update Firestore security rules for progress data
    - Test Firestore structure with sample data
  - [ ] 2.3 Implement topic extraction logic
    - Create utility function to extract topic from problem text
    - Implement keyword matching for common topics (algebra, geometry, calculus)
    - Add fallback to AI analysis if keyword matching fails
    - Handle edge cases (unknown topics, mixed topics)
  - [ ] 2.4 Build progress service
    - Create `src/services/progressService.ts`
    - Implement `trackProgressEvent()` function to save events to Firestore
    - Implement `aggregateProgress()` function to calculate topic statistics
    - Implement `getTopicProgress()` function to fetch aggregated data
    - Implement incremental aggregation (update on each event)
    - Add error handling and validation
  - [ ] 2.5 Create progress tracking hook
    - Create `src/hooks/useProgress.ts`
    - Implement hook to track progress events
    - Implement hook to fetch aggregated progress data
    - Add real-time updates using Firestore subscriptions
    - Handle loading and error states

### Phase 3: Build Parent Dashboard UI (Week 1, Days 4-5)

- [ ] 3.0 Build Parent Dashboard UI
  - [ ] 3.1 Create progress page route
    - Create `src/pages/ProgressPage.tsx`
    - Add route to `src/App.tsx` (`/progress` or `/dashboard`)
    - Add navigation link in header or sidebar
    - Handle authentication (redirect if not logged in)
  - [ ] 3.2 Build main dashboard component
    - Create `src/components/Progress/ProgressDashboard.tsx`
    - Implement layout with header section (student name, overall summary)
    - Implement topic grid layout (responsive)
    - Add loading state
    - Add error handling
    - Add empty state (no progress data yet)
  - [ ] 3.3 Build topic card component
    - Create `src/components/Progress/TopicCard.tsx`
    - Display topic name
    - Display success rate with visual indicator (circle or progress bar)
    - Display total problems attempted
    - Add color coding (green/yellow/red based on success rate)
    - Add expandable indicator (arrow/chevron)
    - Handle click/hover to expand
    - Make responsive for mobile
  - [ ] 3.4 Build topic detail component
    - Create `src/components/Progress/TopicDetail.tsx`
    - Display sub-topics list
    - Display problems solved per sub-topic
    - Display success rate per sub-topic
    - Display average hints used per sub-topic
    - Display average questions per problem
    - Display difficulty breakdown (easy/medium/hard)
    - Display recent problems solved
    - Add smooth expand/collapse animation
  - [ ] 3.5 Build success stories component
    - Create `src/components/Progress/SuccessStories.tsx`
    - Display success stories section
    - Show recent achievements and milestones
    - Show "Solved X problems today!" messages
    - Show "Mastered [topic]!" messages
    - Show streak achievements
    - Add carousel or list layout
    - Make it visually appealing and celebratory
  - [ ] 3.6 Style dashboard components
    - Add CSS styling for dashboard layout
    - Style topic cards with proper spacing and colors
    - Style topic details with clear hierarchy
    - Style success stories section
    - Ensure mobile responsiveness
    - Add hover effects and transitions

### Phase 4: Implement Gamification System (Week 2, Days 1-3)

- [ ] 4.0 Implement Gamification System
  - [ ] 4.1 Create achievement types and data structures
    - Create `src/types/achievements.ts`
    - Define `Achievement` interface
    - Define achievement types: 'streak', 'topic_mastery', 'daily_goal', 'hint_efficiency', 'consistency'
    - Define achievement definitions/constants
    - Export all types
  - [ ] 4.2 Build achievement service
    - Create `src/services/achievementService.ts`
    - Implement `checkAchievements()` function to detect earned achievements
    - Implement `trackAchievement()` function to save to Firestore
    - Implement `getAchievements()` function to fetch user achievements
    - Implement achievement detection logic for each type
    - Add achievement progress tracking
  - [ ] 4.3 Create achievement hook
    - Create `src/hooks/useAchievements.ts`
    - Implement hook to fetch user achievements
    - Implement hook to check for new achievements
    - Add real-time updates using Firestore subscriptions
    - Handle loading and error states
  - [ ] 4.4 Implement streak tracking
    - Create `src/hooks/useStreak.ts`
    - Track consecutive correct answers
    - Store streak in Firestore: `users/{userId}/sessions/{sessionId}/streak`
    - Reset streak on wrong answer
    - Persist streak across sessions (within same day)
    - Return current streak count
  - [ ] 4.5 Create sparkle animation component
    - Create `src/components/Gamification/SparkleAnimation.tsx`
    - Create CSS animations in `src/styles/animations.css`
    - Implement particle/sparkle effect using CSS keyframes
    - Make animation subtle and not distracting
    - Ensure good performance (GPU-accelerated)
    - Make animation reusable and configurable
  - [ ] 4.6 Create progress indicator component
    - Create `src/components/Gamification/ProgressIndicator.tsx`
    - Display dynamic message based on session performance
    - Update message based on last 5 problems
    - Show messages like "You improved your math today!", "You're doing great today!"
    - Add smooth transitions when message changes
    - Make it visually appealing but not intrusive
  - [ ] 4.7 Create streak badge component
    - Create `src/components/Gamification/StreakBadge.tsx`
    - Display fire emoji + streak count (🔥 3)
    - Show badge when streak >= 3
    - Add animation when streak increases
    - Make it visually distinct but not overwhelming
  - [ ] 4.8 Create achievement notification component
    - Create `src/components/Gamification/AchievementNotification.tsx`
    - Display achievement popup/modal when earned
    - Show achievement badge/icon
    - Show message: "Achievement Unlocked: [Name]!"
    - Add celebration animation
    - Auto-dismiss after 3-5 seconds
    - Make it dismissible by user
  - [ ] 4.9 Create achievements panel component
    - Create `src/components/Gamification/AchievementsPanel.tsx`
    - Display list of earned achievements
    - Show progress toward next achievement
    - Show achievement descriptions
    - Show date earned
    - Add filtering/sorting options
    - Make it accessible from header or profile menu

### Phase 5: Integration and Testing (Week 2, Days 4-5)

- [ ] 5.0 Integration and Testing
  - [ ] 5.1 Integrate progress tracking into chat
    - Update `src/components/Chat/ChatContainer.tsx`
    - Call `trackProgressEvent()` when problem is solved
    - Extract topic from problem context
    - Track hints used, attempts, questions per problem
    - Handle errors gracefully
  - [ ] 5.2 Integrate sparkle animation into messages
    - Update `src/components/Chat/Message.tsx`
    - Detect when message is a correct answer
    - Trigger sparkle animation on correct answers
    - Ensure animation doesn't break layout
    - Test animation performance
  - [ ] 5.3 Integrate gamification into header
    - Update `src/components/Header.tsx`
    - Add progress indicator component
    - Add streak badge component
    - Add achievements menu/link
    - Ensure proper spacing and layout
  - [ ] 5.4 Wire up achievement detection
    - Connect achievement service to chat events
    - Detect achievements when conditions are met
    - Trigger achievement notifications
    - Update achievements panel
    - Test all achievement types
  - [ ] 5.5 Test end-to-end flow
    - Test complete user flow: solve problem → track progress → see dashboard
    - Test gamification: correct answer → sparkles → streak → achievement
    - Test dashboard: view topics → expand details → see success stories
    - Test error scenarios (network failures, invalid data)
    - Test mobile responsiveness
  - [ ] 5.6 Performance optimization
    - Optimize Firestore queries (use indexes if needed)
    - Optimize progress aggregation (ensure incremental updates)
    - Optimize animations (ensure GPU acceleration)
    - Test with large datasets
    - Optimize dashboard loading time
  - [ ] 5.7 Bug fixes and polish
    - Fix any UI/UX issues
    - Fix any data tracking issues
    - Fix any animation glitches
    - Improve error messages
    - Add loading states where needed
  - [ ] 5.8 Documentation
    - Document progress tracking data structure
    - Document achievement system
    - Document API changes
    - Update README with new features
    - Add comments to complex code

---

## Notes

- All progress data stored in Firestore under `users/{userId}/progress/`
- Achievements stored in `users/{userId}/achievements/`
- Topic extraction may require AI analysis or keyword matching
- Gamification triggers should be client-side for immediate feedback
- Sparkle animations should be lightweight CSS animations
- GPT-4o costs ~10x more than GPT-4o-mini - monitor costs closely
- Progress aggregation should be incremental to avoid performance issues
- Dashboard should load quickly (<2 seconds) even with large datasets
- Achievement detection should happen client-side for immediate feedback
- Streak tracking needs to account for session boundaries

---

## Testing Checklist

### AI Improvements
- [ ] GPT-4o model is used for all conversations
- [ ] Formula requests show formulas without numbers
- [ ] API costs are within acceptable range

### Progress Tracking
- [ ] Progress events are tracked correctly
- [ ] Topics are extracted accurately
- [ ] Progress aggregation works correctly
- [ ] Dashboard displays correct data
- [ ] Topic details expand/collapse smoothly
- [ ] Success stories display correctly

### Gamification
- [ ] Sparkles appear on correct answers
- [ ] Progress indicator updates correctly
- [ ] Streak tracking works across sessions
- [ ] Achievements are detected correctly
- [ ] Achievement notifications appear
- [ ] Achievements panel displays correctly

### Integration
- [ ] All features work together
- [ ] No performance issues
- [ ] Mobile responsive
- [ ] Error handling works
- [ ] Loading states work

---

**Status:** Complete task breakdown ready for implementation.

