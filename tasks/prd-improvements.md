# Product Requirements Document (PRD)
## AI Math Tutor - Learning Progress & Gamification Improvements

**Version:** 1.0  
**Date:** November 4, 2025  
**Timeline:** TBD (Estimated 1-2 weeks)  
**Project Type:** Educational AI Application Enhancement

---

## 1. Executive Summary

### 1.1 Feature Overview
Enhance the AI Math Tutor with three major improvements:
1. **AI Quality Upgrade**: Switch to GPT-4o model for better accuracy and response quality
2. **Learning Progress Tracking**: Comprehensive dashboard for parents to track student progress across topics
3. **Gamification System**: Achievement system, streak tracking, and visual feedback to increase student engagement

### 1.2 Problem Statement
- **AI Response Quality**: Current GPT-4o-mini model sometimes gives incorrect or incomplete answers, especially with formulas
- **Lack of Visibility**: Parents have no way to see their child's learning progress or identify struggling areas
- **Low Engagement**: Students need more motivation and feedback to stay engaged with learning

### 1.3 Target Users
- **Primary**: Students (grades 6-12) using the tutor
- **Secondary**: Parents/guardians monitoring student progress
- **Tertiary**: Teachers tracking student performance

### 1.4 Core Value Proposition
Transform the tutoring experience from a simple Q&A tool into an engaging learning system with clear progress visibility and motivational elements that encourage continued practice.

---

## 2. Product Goals

### 2.1 Primary Goals
1. **Improve AI Accuracy**: Upgrade to GPT-4o for better mathematical reasoning and correctness
2. **Formula Display Fix**: Ensure formulas are shown without actual numbers (e.g., "a² + b² = c²" not "5² + 12² = 13²")
3. **Progress Visibility**: Enable parents to see detailed breakdown of student performance across topics
4. **Increase Engagement**: Implement gamification elements that motivate students to practice more

### 2.2 Success Metrics
- **AI Accuracy**: 95%+ correct answers (validated with math tools)
- **Formula Accuracy**: 100% of formula requests show formulas without numbers
- **Parent Usage**: 70%+ of parents check progress dashboard weekly
- **Student Engagement**: 30%+ increase in average session length
- **Streak Achievement**: 60%+ of students achieve at least one streak per week

### 2.3 Non-Goals (Out of Scope)
- Social features (leaderboards, sharing achievements)
- Paid/premium features
- Advanced analytics (predictive learning paths, AI recommendations)
- Integration with external educational platforms
- Multi-student parent accounts (one parent per student account)

---

## 3. User Stories

### 3.1 AI Quality Improvements

**Story 1: Better AI Responses**
- As a student, I want accurate AI responses that are correct the first time
- So that I can learn effectively without confusion from wrong answers
- Acceptance: AI correctly validates answers using math tools, never affirms incorrect calculations

**Story 2: Formula Display**
- As a student, I want to see formulas without numbers when I ask for a formula
- So that I understand the general formula, not just a specific example
- Acceptance: When student asks "what's the formula for...", AI shows only formula (e.g., "a² + b² = c²") without substituting numbers

### 3.2 Progress Tracking

**Story 3: Parent Dashboard**
- As a parent, I want to see my child's progress across different math topics
- So that I can identify areas where they're excelling and areas where they need help
- Acceptance: Dashboard shows visual breakdown by topic with success rates and difficulty levels

**Story 4: Detailed Topic View**
- As a parent, I want to click on a topic to see detailed information
- So that I understand exactly what my child has been working on
- Acceptance: Clicking/hovering on a topic expands to show sub-topics, problems solved, success rate, hint usage

**Story 5: Success Stories**
- As a parent, I want to see positive highlights of my child's learning
- So that I can celebrate their achievements and encourage continued practice
- Acceptance: Dashboard displays success stories like "Solved 5 algebra problems today!" or "Mastered linear equations!"

### 3.3 Gamification

**Story 6: Visual Feedback**
- As a student, I want to see sparkles/animation when I answer correctly
- So that I feel immediate positive reinforcement for my success
- Acceptance: Correct answers trigger sparkle animation around the message

**Story 7: Progress Indicator**
- As a student, I want to see my level/progress at the top of the screen
- So that I know how I'm doing today
- Acceptance: Header shows message like "You improved your math today!" or "You're doing great today!"

**Story 8: Streak Achievement**
- As a student, I want to see when I answer multiple questions correctly in a row
- So that I feel motivated to keep going
- Acceptance: After 3+ correct answers in a row, achievement badge appears: "🔥 3 questions in a row!"

**Story 9: Achievement Display**
- As a student, I want to see my achievements and badges
- So that I feel proud of my progress and motivated to earn more
- Acceptance: Achievements panel shows earned badges, streaks, and milestones

---

## 4. Feature Requirements

### 4.1 Feature 1: AI Model Upgrade & Formula Fix

**Priority:** Critical  
**Description:** Switch from GPT-4o-mini to GPT-4o for better accuracy, and fix formula display to show formulas without numbers

#### Functional Requirements

**FR1.1: Model Upgrade**
- System MUST use GPT-4o model for all chat conversations (instead of GPT-4o-mini)
- Model selection logic MUST be updated to use GPT-4o by default
- Cost impact MUST be documented and monitored

**FR1.2: Formula Display Fix**
- When student asks for a formula, AI MUST show ONLY the formula with variables
- AI MUST NOT substitute actual numbers into formulas
- AI MUST NOT provide examples with numbers when asked for formula only
- Formula responses MUST be validated to ensure no numbers are included

**FR1.3: Prompt Enhancement**
- System prompt MUST explicitly state: "When student asks for a formula, provide ONLY the formula with variables. NO numbers, NO substitutions, NO examples."
- Prompt MUST include examples of correct vs incorrect formula responses
- Formula detection MUST be added to prompt rules section

**FR1.4: Post-Processing (Optional)**
- If AI includes numbers in formula response, system SHOULD attempt to strip numbers and show only variables
- Fallback validation SHOULD detect and correct formula responses with numbers

#### Technical Considerations
- GPT-4o costs ~10x more than GPT-4o-mini (~$2.50 vs $0.15 per million input tokens)
- Need to monitor API costs and set budget alerts
- Response time may be slightly slower but accuracy improvement justifies cost
- Math tools validation already in place, will work with GPT-4o

---

### 4.2 Feature 2: Learning Progress Tracking

**Priority:** High  
**Description:** Comprehensive progress tracking system with parent dashboard showing student performance across topics

#### Functional Requirements

**FR2.1: Event Tracking**
- System MUST track every problem attempt with:
  - Topic (algebra, geometry, calculus, etc.)
  - Sub-topic (linear_equations, quadratic_equations, etc.)
  - Difficulty level (easy, medium, hard)
  - Was correct (true/false)
  - Hints used (count)
  - Attempts before correct (count)
  - Questions asked per problem (count)
  - Timestamp
  - Session ID

**FR2.2: Progress Data Aggregation**
- System MUST aggregate progress data by topic
- System MUST calculate:
  - Total problems attempted per topic
  - Correct answers per topic
  - Success rate per topic (correct / total)
  - Average hints per problem per topic
  - Average questions per problem per topic
  - Trend (improving/declining/stable)
  - Last activity date

**FR2.3: Parent Dashboard Page**
- System MUST provide `/progress` or `/dashboard` route accessible to parents
- Dashboard MUST display:
  - Overview summary (total problems solved, success rate, recent activity)
  - Topic cards with visual indicators (color-coded success rates)
  - Expandable topic details (click/hover to expand)
  - Success stories section
  - Recent activity timeline

**FR2.4: Topic Card Display**
- Each topic card MUST show:
  - Topic name (Algebra, Geometry, Calculus, etc.)
  - Success rate (percentage or visual indicator)
  - Total problems attempted
  - Visual indicator (circle, progress bar, or color coding)
  - Expandable indicator (arrow or chevron)

**FR2.5: Topic Detail Expansion**
- Clicking/hovering on topic card MUST expand to show:
  - Sub-topics within topic
  - Problems solved per sub-topic
  - Success rate per sub-topic
  - Average hints used per sub-topic
  - Average questions per problem
  - Difficulty breakdown (easy/medium/hard problems)
  - Recent problems solved

**FR2.6: Success Stories**
- Dashboard MUST display success stories section
- Success stories MUST include:
  - "Solved X problems today!"
  - "Mastered [topic]!"
  - "Improved your [topic] score!"
  - "Answered 3 questions correctly in a row!"
  - Recent achievements

**FR2.7: Progress Visualization**
- Success rates MUST be visualized using:
  - Color-coded circles or progress bars
  - Green for high success (>80%)
  - Yellow for moderate success (50-80%)
  - Red for low success (<50%)
- Visual indicators MUST be intuitive and clear

**FR2.8: Data Persistence**
- Progress data MUST be stored in Firestore
- Structure: `users/{userId}/progress/{topicId}/attempts/{attemptId}`
- Aggregated data MUST be cached and updated incrementally
- Data MUST persist across sessions

#### Technical Considerations
- Need to extract topic from problem context (use AI or keyword matching)
- Sub-topic extraction may require additional AI analysis or manual mapping
- Aggregation should be done incrementally to avoid performance issues
- Consider using Firestore aggregation queries or Cloud Functions for heavy computation
- Dashboard should load quickly (<2 seconds) even with large datasets

---

### 4.3 Feature 3: Gamification System

**Priority:** High  
**Description:** Achievement system, streak tracking, and visual feedback to increase student engagement

#### Functional Requirements

**FR3.1: Sparkle Animation on Correct Answers**
- When student provides correct answer, system MUST trigger sparkle animation
- Animation MUST appear around the correct answer message
- Animation MUST be subtle and not distracting
- Animation MUST use CSS animations or lightweight library (no heavy dependencies)

**FR3.2: Progress Indicator in Header**
- Header MUST display dynamic progress message
- Message MUST update based on session performance:
  - "You improved your math today!"
  - "You're doing great today!"
  - "Keep up the good work!"
  - "You're on a roll!"
- Message MUST change based on recent activity (last 5 problems)

**FR3.3: Streak Tracking**
- System MUST track consecutive correct answers
- When streak reaches 3, system MUST display achievement badge
- Streak badge MUST show: "🔥 [X] questions in a row!"
- Streak MUST reset when student answers incorrectly
- Streak counter MUST persist across sessions (within same day)

**FR3.4: Achievement System**
- System MUST track various achievements:
  - Streak achievements (3, 5, 10 questions in a row)
  - Topic mastery (solved 10 problems in a topic)
  - Daily goals (solved 5 problems today)
  - Hint efficiency (solved problem with 0-1 hints)
  - Consistency (solved problems 7 days in a row)
- Achievements MUST be stored in Firestore: `users/{userId}/achievements/{achievementId}`

**FR3.5: Achievement Display**
- Achievements panel/page MUST show:
  - Earned achievements with badges/icons
  - Progress toward next achievement
  - Achievement descriptions
  - Date earned
- Achievements MUST be accessible from header or profile menu

**FR3.6: Achievement Notifications**
- When achievement is earned, system MUST display notification:
  - Modal or toast notification
  - Achievement badge/icon
  - Message: "Achievement Unlocked: [Achievement Name]!"
  - Animation/celebration effect
- Notification MUST not be intrusive (dismissible, auto-dismiss after 3-5 seconds)

**FR3.7: Level/Progress Visualization**
- System MAY display level indicator (e.g., "Level 3: Algebra Expert")
- Level MUST be calculated based on problems solved and success rate
- Level progress bar MAY show progress toward next level
- Level MUST be visible in header or profile section

**FR3.8: Session Summary**
- At end of session (or when appropriate), system MAY display summary:
  - Problems solved today
  - Streak achieved
  - Achievements unlocked
  - Areas improved
- Summary MUST be celebratory and encouraging

#### Technical Considerations
- Sparkle animation can use CSS keyframes or lightweight library like `canvas-confetti`
- Achievement detection should happen client-side for immediate feedback
- Achievement state should sync with Firestore for persistence
- Streak tracking needs to account for session boundaries
- Consider using React context for global achievement state

---

## 5. User Experience Requirements

### 5.1 Dashboard UX Principles
- **Clarity**: Information must be easy to understand at a glance
- **Visual Hierarchy**: Important information (struggling areas) should stand out
- **Expandability**: Details available on demand, not overwhelming by default
- **Celebration**: Positive feedback for achievements and progress

### 5.2 Gamification UX Principles
- **Immediate Feedback**: Rewards must appear instantly after action
- **Visual Appeal**: Animations must be delightful but not distracting
- **Progress Visibility**: Students must always see their progress and achievements
- **Motivation**: All elements must encourage continued practice

### 5.3 Interaction Patterns
- Dashboard: Click/hover to expand topic details
- Achievements: Click to view full achievement list
- Sparkles: Automatic, no user interaction needed
- Streak counter: Always visible in header or chat area

---

## 6. Design Considerations

### 6.1 Dashboard Layout
- **Header Section**: Student name, overall progress summary
- **Topic Grid**: Cards arranged in grid layout (responsive)
- **Success Stories Section**: Carousel or list of recent achievements
- **Recent Activity**: Timeline of recent problems solved

### 6.2 Topic Card Design
- **Visual**: Circular progress indicator or progress bar
- **Colors**: Green (good), Yellow (needs improvement), Red (struggling)
- **Size**: Consistent card size, expandable on click/hover
- **Information**: Topic name, success rate, total problems

### 6.3 Gamification Visuals
- **Sparkles**: Particle effect around correct answer message
- **Achievement Badges**: Circular icons with achievement symbol
- **Streak Counter**: Fire emoji + number (🔥 3)
- **Level Indicator**: Progress bar or level badge in header

### 6.4 Animation Guidelines
- **Duration**: Short (0.5-1 second) for feedback animations
- **Easing**: Smooth, natural motion (ease-out)
- **Frequency**: Not too frequent (avoid animation fatigue)
- **Performance**: Lightweight, GPU-accelerated animations

---

## 7. Technical Considerations

### 7.1 Data Structure

**Progress Event:**
```typescript
interface ProgressEvent {
  id: string;
  userId: string;
  sessionId: string;
  topic: string;
  subTopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  wasCorrect: boolean;
  hintsUsed: number;
  attemptsBeforeCorrect: number;
  questionsPerProblem: number;
  timestamp: Timestamp;
  problemText?: string;
}
```

**Aggregated Progress:**
```typescript
interface TopicProgress {
  topic: string;
  totalProblems: number;
  correctAnswers: number;
  successRate: number;
  avgHintsPerProblem: number;
  avgQuestionsPerProblem: number;
  difficultyBreakdown: {
    easy: { attempted: number; correct: number };
    medium: { attempted: number; correct: number };
    hard: { attempted: number; correct: number };
  };
  subTopics: SubTopicProgress[];
  trend: 'improving' | 'declining' | 'stable';
  lastActivity: Timestamp;
}
```

**Achievement:**
```typescript
interface Achievement {
  id: string;
  userId: string;
  type: 'streak' | 'topic_mastery' | 'daily_goal' | 'hint_efficiency' | 'consistency';
  name: string;
  description: string;
  progress: number;
  target: number;
  earned: boolean;
  earnedAt?: Timestamp;
  icon?: string;
}
```

### 7.2 Firestore Structure
```
users/
  {userId}/
    progress/
      {topicId}/
        attempts/
          {attemptId}: ProgressEvent
        aggregated: TopicProgress
    achievements/
      {achievementId}: Achievement
    sessions/
      {sessionId}/
        streak: number
        problemsSolved: number
        startTime: Timestamp
        endTime?: Timestamp
```

### 7.3 API Changes
- **Model Selection**: Update Cloud Function to use GPT-4o by default
- **Prompt Enhancement**: Update prompt file with formula rules
- **Progress Tracking**: Add Cloud Function endpoint for progress aggregation (optional, can be client-side)

### 7.4 Performance Considerations
- Progress aggregation should be incremental (update on each event)
- Dashboard should cache aggregated data
- Achievement detection should be client-side for immediate feedback
- Sparkle animations should be lightweight CSS animations

---

## 8. Success Metrics

### 8.1 AI Quality Metrics
- **Accuracy Rate**: 95%+ correct answers (validated with math tools)
- **Formula Accuracy**: 100% of formula requests show formulas without numbers
- **Response Time**: Average response time < 3 seconds (acceptable for GPT-4o)

### 8.2 Progress Tracking Metrics
- **Parent Adoption**: 70%+ of parents check dashboard weekly
- **Dashboard Usage**: Average 2+ minutes per session on dashboard
- **Data Completeness**: 90%+ of problems tracked with correct topic

### 8.3 Gamification Metrics
- **Engagement Increase**: 30%+ increase in average session length
- **Streak Achievement**: 60%+ of students achieve at least one streak per week
- **Achievement Unlock Rate**: Average 2+ achievements per student per week
- **Retention**: 20%+ increase in daily active users

---

## 9. Implementation Phases

### Phase 1: AI Improvements (Week 1, Days 1-2)
1. Upgrade to GPT-4o model
2. Fix formula prompt rules
3. Test formula responses
4. Monitor API costs

### Phase 2: Progress Tracking Foundation (Week 1, Days 3-5)
1. Implement event tracking system
2. Create Firestore data structure
3. Build progress aggregation logic
4. Create parent dashboard page
5. Implement topic card display
6. Add expandable topic details

### Phase 3: Gamification (Week 2, Days 1-3)
1. Implement sparkle animation
2. Add progress indicator to header
3. Build streak tracking system
4. Create achievement system
5. Add achievement display components
6. Implement achievement notifications

### Phase 4: Polish & Testing (Week 2, Days 4-5)
1. UI/UX refinement
2. Performance optimization
3. Testing across browsers
4. Bug fixes
5. Documentation

---

## 10. Open Questions

1. **Topic Extraction**: How should we determine topic from problem text? (AI analysis, keyword matching, user selection?)
2. **Sub-topic Mapping**: Should we have a predefined list of sub-topics or extract dynamically?
3. **Difficulty Detection**: How should we determine problem difficulty? (AI analysis, manual tagging, user input?)
4. **Parent Access**: How do parents access dashboard? (Separate login, shared account, invite link?)
5. **Achievement Types**: What specific achievements should we include? (Need complete list)
6. **Streak Reset**: Should streaks reset daily, weekly, or only on wrong answer?
7. **Level System**: Should we implement level system now or defer to future?
8. **Cost Monitoring**: What budget alerts should we set for GPT-4o usage?

---

## 11. Risks & Mitigations

### 11.1 High-Risk Items

**Risk:** GPT-4o costs significantly higher than GPT-4o-mini
- **Impact:** High - May exceed budget
- **Mitigation:** Monitor costs closely, set budget alerts, consider hybrid approach (GPT-4o for complex problems only)
- **Contingency:** Revert to GPT-4o-mini if costs too high, focus on validation improvements

**Risk:** Topic extraction inaccurate
- **Impact:** Medium - Progress data unreliable
- **Mitigation:** Use AI for topic extraction, fallback to keyword matching, allow manual correction
- **Contingency:** Manual topic selection option for users

### 11.2 Medium-Risk Items

**Risk:** Performance issues with progress aggregation
- **Impact:** Medium - Dashboard slow to load
- **Mitigation:** Incremental aggregation, caching, Cloud Functions for heavy computation
- **Contingency:** Pagination, lazy loading, limit historical data

**Risk:** Gamification animations impact performance
- **Impact:** Low - Slower UI, user frustration
- **Mitigation:** Lightweight CSS animations, GPU acceleration, limit animation frequency
- **Contingency:** Disable animations option, reduce animation complexity

---

## 12. Future Enhancements (Post-Launch)

### 12.1 Short-Term (1-2 weeks)
- Level system with XP points
- More achievement types
- Weekly progress reports (email to parents)
- Comparison with peers (anonymized)

### 12.2 Medium-Term (1-2 months)
- Adaptive difficulty based on progress
- Personalized learning paths
- Practice problem recommendations
- Detailed analytics for teachers

### 12.3 Long-Term (3+ months)
- Social features (share achievements)
- Competition/leaderboards
- Rewards system (virtual badges, themes)
- Integration with school systems

---

## 13. Appendix

### 13.1 Key Terms
- **Topic**: Broad math category (Algebra, Geometry, Calculus, etc.)
- **Sub-topic**: Specific topic within category (linear_equations, quadratic_equations, etc.)
- **Streak**: Consecutive correct answers in a row
- **Achievement**: Milestone or badge earned by completing specific tasks
- **Progress Event**: Single instance of problem attempt tracked in system

### 13.2 References
- GPT-4o API Documentation: OpenAI API reference
- Firestore Best Practices: Firebase documentation
- Gamification Patterns: Educational game design principles

### 13.3 Stakeholders
- **Developer**: Primary implementer
- **Product Owner**: Feature requirements and prioritization
- **End Users**: Students and parents using the system

---

**Document Status:** Ready for Review and Task Breakdown

