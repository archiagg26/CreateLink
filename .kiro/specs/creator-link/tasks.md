# Implementation Plan: CreatorLink

## Overview

CreatorLink is a React SPA connecting content creators and brands through reputation-driven discovery. The implementation follows a strict dependency order: scaffolding → types → mock data → score engines → AI mocks → Zustand stores → routing → pages/components → property-based tests. All persistence and AI features are simulated via an in-memory mock data layer with deterministic algorithms running entirely in the browser.

---

## Tasks

- [x] 1. Project Scaffolding
  - [x] 1.1 Initialize Vite + React + TypeScript project
    - Run `npm create vite@latest . -- --template react-ts` in the workspace root
    - Verify `vite.config.ts`, `tsconfig.json`, and `index.html` are generated correctly
    - _Requirements: Design § Technology Stack_

  - [x] 1.2 Install and configure Tailwind CSS
    - Install `tailwindcss`, `postcss`, `autoprefixer` as dev dependencies
    - Generate `tailwind.config.js` and `postcss.config.js`
    - Add Tailwind directives to `src/index.css`
    - _Requirements: Design § Technology Stack_

  - [x] 1.3 Install React Router v6, Zustand, and fast-check
    - Install `react-router-dom@6`, `zustand`, `fast-check`, `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
    - Configure `vitest.config.ts` with `globals: true`, `environment: 'jsdom'`, and `setupFiles`
    - Create `src/setupTests.ts` importing `@testing-library/jest-dom`
    - _Requirements: Design § Technology Stack, Design § Testing Strategy_

  - [x] 1.4 Create directory structure
    - Create all directories: `src/pages`, `src/components/auth`, `src/components/creator`, `src/components/brand`, `src/components/feed`, `src/components/application`, `src/components/swipe`, `src/components/shared`, `src/stores`, `src/services`, `src/data`, `src/lib`, `src/types`, `src/hooks`, `src/router`, `src/__tests__/components`
    - _Requirements: Design § Application Layers_


- [x] 2. TypeScript Type Definitions
  - [x] 2.1 Create core user and auth types in `src/types/index.ts`
    - Define `UserRole`, `VerificationStatus`, `User` interface with all fields (`id`, `email`, `passwordHash`, `role`, `verificationStatus`, `emailVerified`, `createdAt`, `failedLoginAttempts`, `lockedUntil`)
    - _Requirements: 10.1, Design § Data Models_

  - [x] 2.2 Create creator and portfolio types
    - Define `ContentCategory` union type (all 10 values), `SocialAccount`, `PortfolioMetrics`, `PortfolioItem`, `AudienceDemographics`, `CreatorInsights`, `CollaborationRecord`, `Creator`
    - _Requirements: 1.1, 1.2, 1.3, Design § Data Models_

  - [x] 2.3 Create brand and campaign types
    - Define `Brand`, `CompensationType`, `CampaignStatus`, `Campaign`
    - _Requirements: 2.1, 2.3, 5.1, Design § Data Models_

  - [x] 2.4 Create application, feed, notification, and score types
    - Define `ApplicationStatus`, `Application`, `PostType`, `FeedPost`, `FeedFilters`, `NotificationType`, `Notification`, `ScoreAuditLog`, `CreatorScoreInputs`, `BrandScoreInputs`, `MatchScoreInputs`, `PortfolioTemplateSection`, `PortfolioTemplate`
    - _Requirements: 7.1, 5.2, 8.1, 3.3, 4.3, 12.1, Design § Data Models_


- [x] 3. Mock Data Layer and Seed Data
  - [x] 3.1 Create in-memory data store with reset helper in `src/services/store.ts`
    - Implement `InMemoryStore` with typed maps for Users, Creators, Brands, Campaigns, Applications, FeedPosts, Notifications, ScoreAuditLogs
    - Implement `resetStore()` helper that wipes all maps and re-seeds from initial data (used in tests)
    - Implement localStorage persistence: serialize store to localStorage on write, hydrate on init
    - _Requirements: Design § Mock-first principle_

  - [x] 3.2 Create seed data JSON files in `src/data/`
    - Create `src/data/users.json` — 4 seeded users (2 creators, 2 brands), all with `emailVerified: true`
    - Create `src/data/creators.json` — 2 creator profiles with varied `contentCategories`, `socialAccounts`, `portfolio` (3+ items each), `collaborationHistory`, full `insights` and `trustScore`
    - Create `src/data/brands.json` — 2 brand profiles, one with `completedCollaborations < 3` (new to platform), one established
    - Create `src/data/campaigns.json` — 4 campaigns across different categories, statuses, and compensation types
    - Create `src/data/feed.json` — 6+ feed posts (mix of campaign and portfolio post types)
    - _Requirements: 1.1, 2.1, 5.1, 6.1, Design § Mock-first principle_

  - [x] 3.3 Create mock service helper utilities in `src/services/mockUtils.ts`
    - Implement `simulateLatency(minMs, maxMs): Promise<void>` using `setTimeout` wrapped in a `Promise`
    - Implement `generateId(): string` using `crypto.randomUUID()`
    - Implement `nowISO(): string` returning `new Date().toISOString()`
    - _Requirements: Design § AI Feature Mock Implementations_


- [x] 4. Score Engine
  - [x] 4.1 Implement `computeCreatorTrustScore` in `src/lib/scoreEngine.ts`
    - Define `CREATOR_SCORE_WEIGHTS` constant with weights summing to 1.0 (audienceAuthenticity: 0.30, commentQualityScore: 0.20, followerGrowthPattern: 0.15, engagementConsistency: 0.20, brandCollaborationSuccessRate: 0.15)
    - Implement the normalised weighted-average function: filter available keys, divide weighted sum by total available weight, clamp to [0, 100], round to integer, return `{ score, partialData }`
    - _Requirements: 3.1, 3.4, 3.5, 3.6_

  - [x] 4.2 Implement `computeBrandScore` in `src/lib/scoreEngine.ts`
    - Define `BRAND_SCORE_WEIGHTS` (paymentReliability: 0.35, creatorReviewScore: 0.25, campaignSuccessRate: 0.20, communicationQualityScore: 0.10, averageResponseSpeed: 0.10)
    - Same normalised weighted-average pattern as `computeCreatorTrustScore`
    - _Requirements: 4.1, 4.4, 4.5_

  - [x] 4.3 Implement `computeCollaborationMatchScore` in `src/lib/scoreEngine.ts`
    - Category overlap sub-score (weight 0.40): `overlap / campaignCategories.length`, default 0 if no categories
    - Trust proximity sub-score (weight 0.35): linear scale with asymmetric penalty below minimum
    - Audience alignment sub-score (weight 0.25): sum audience fractions for target age groups; default 0.5 if no target specified
    - Combine, clamp [0, 100], round to integer
    - _Requirements: 9.1, 9.2, 9.4_

  - [x] 4.4 Implement `recordScoreAudit` in `src/lib/auditLog.ts`
    - Implement `recordScoreAudit(subjectId, subjectType, inputs, weights, score)` that appends a new `ScoreAuditLog` entry to the in-memory store with a generated `id` and current ISO timestamp
    - Wrap `computeCreatorTrustScore` and `computeBrandScore` calls with `recordScoreAudit` via decorator/wrapper functions exported from `scoreEngine.ts`
    - _Requirements: 3.3, 4.3_

  - [x]* 4.5 Write property tests for score engine (Properties 1–4)
    - **Property 1: Score Range Invariant** — `computeCreatorTrustScore`, `computeBrandScore`, `computeCollaborationMatchScore` always return integer in [0, 100] for any valid inputs. Use `fc.record` with `fc.float({ min: 0, max: 1 })`. numRuns: 200. **Validates: Requirements 3.4, 4.4, 9.2**
    - **Property 2: Score Determinism** — calling each function twice with identical inputs returns the same score. numRuns: 200. **Validates: Requirements 3.6, 9.4**
    - **Property 3: Partial Data Detection** — any input with at least one `undefined` field returns `partialData: true`; fully-populated input returns `partialData: false`. Use `fc.record` with `fc.option(fc.float(...))`. **Validates: Requirements 3.5, 4.5**
    - **Property 4: Score Audit Log Append** — each call to the audited score functions appends exactly one new entry with correct fields. **Validates: Requirements 3.3, 4.3**
    - Test file: `src/__tests__/scoreEngine.test.ts`


- [x] 5. Validation Utilities
  - [x] 5.1 Implement `validatePassword` in `src/lib/validation.ts`
    - Return `null` (valid) if string satisfies all rules: length ≥ 12, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char (`!@#$%^&*()_+-=[]{}|;:,.<>?`)
    - Return a descriptive error string listing any failing rules
    - _Requirements: 10.1_

  - [x] 5.2 Implement `validatePortfolioFile` in `src/lib/validation.ts`
    - Return `null` for files ≤ 50 MB; return error string containing the file name and "50 MB limit" for files > 50 MB
    - Use `MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024`
    - _Requirements: 1.6_

  - [x]* 5.3 Write property tests for validation utilities (Properties 9, 27)
    - **Property 9: Portfolio File Size Validation** — any `file.size > 50_000_000` returns non-null with "50 MB" text; any `file.size <= 50_000_000` returns null. Use `fc.integer`. **Validates: Requirements 1.6**
    - **Property 27: Password Validation Completeness** — validates that the function returns valid if and only if ALL rules are simultaneously satisfied; single-rule violation causes invalid result. Use `fc.string()` with character class strategies. **Validates: Requirements 10.1**
    - Test file: `src/__tests__/auth.test.ts`


- [x] 6. AI Mock Utilities
  - [x] 6.1 Implement `generateAIPitch` in `src/lib/aiMock.ts`
    - Await `simulateLatency(800, 3000)`
    - Find `categoryOverlap` between creator and campaign categories
    - Sort creator portfolio by `engagementRate` descending, pick top item
    - Construct and return the pitch template string embedding `creator.displayName`, `creator.trustScore`, top portfolio item metrics (if present), and `campaign.requirements`
    - _Requirements: 7.1_

  - [x] 6.2 Implement `generatePortfolioTemplates` in `src/lib/aiMock.ts`
    - Await `simulateLatency(2000, 5000)`
    - Set `isGeneric = !creator.socialAccounts?.some(s => s.connected)`
    - Return array of 3 `PortfolioTemplate` objects with `variantIndex` 1, 2, 3 and distinct titles (Minimalist, Story-driven, Data-first styles)
    - Each template includes `suggestedCategories`, `sections` array with heading/placeholder/required fields, and `isGeneric` flag
    - _Requirements: 12.1, 12.2, 12.4_

  - [x] 6.3 Implement `rankApplications` in `src/lib/aiMock.ts`
    - Pure function: `[...applications].sort((a, b) => b.collaborationMatchScore - a.collaborationMatchScore)`
    - _Requirements: 8.5_

  - [x]* 6.4 Write property tests for AI mock utilities (Properties 18, 33, 34)
    - **Property 18: AI Pitch Non-Empty** — `generateAIPitch` returns a non-empty string containing `creator.displayName` and at least one word from `campaign.title` or `campaign.requirements`. Use `fc.record` for Creator and Campaign. **Validates: Requirements 7.1**
    - **Property 33: Three Distinct Templates** — `generatePortfolioTemplates` always returns exactly 3 templates with distinct `variantIndex` (1, 2, 3) and distinct titles, for any creator input. **Validates: Requirements 12.1, 12.2**
    - **Property 34: Generic Template Without Social Data** — creator with no connected social accounts and empty portfolio always gets `isGeneric === true` on all returned templates. **Validates: Requirements 12.4**
    - Test file: `src/__tests__/aiMock.test.ts`


- [x] 7. Mock Service Layer
  - [x] 7.1 Implement auth mock service in `src/services/authService.ts`
    - `register(email, password, role)`: validate password with `validatePassword`, check email uniqueness, create `User` with `emailVerified: false`, store in `InMemoryStore`, return created user
    - `sendVerificationEmail(userId)`: create a token string (UUID), store in a `verificationTokens` map with TTL (30 min), simulate latency
    - `verifyEmail(token)`: look up token, check expiry, set `emailVerified: true` on matching User, invalidate token
    - `login(email, password)`: check `emailVerified`, check `lockedUntil`, compare password hash; on success reset `failedLoginAttempts`; on failure increment counter and lock after 5
    - `resendVerification(email)`, `resetPassword(email)`: simulate email sending with latency
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 7.2 Implement creator mock service in `src/services/creatorService.ts`
    - `getCreator(id)`: fetch from store with simulated latency
    - `updatePortfolio(creatorId, items)`: validate each file size, update store, recompute and record trust score via `computeCreatorTrustScore` + `recordScoreAudit`, trigger notification if score delta > 2
    - `refreshTrustScore(creatorId)`: recompute score and emit notification if threshold exceeded
    - `submitVerification(creatorId, documents)`: set `verificationStatus: 'pending'`
    - `disconnectSocialAccount(creatorId, platform)`: update `connected: false`, check if all disconnected → revoke verification status, emit notification
    - _Requirements: 1.1, 1.2, 1.4, 1.6, 11.1, 11.4_

  - [x] 7.3 Implement brand mock service in `src/services/brandService.ts`
    - `getBrand(id)`: fetch from store with simulated latency
    - `publishCampaign(brandId, campaign)`: check `brandScore >= 40` (throw restriction error otherwise), create Campaign in store, create FeedPost of type `'campaign'`
    - `updateCampaign(campaignId, data)`: update Campaign in store, recompute match scores for existing applications
    - `removeCampaign(campaignId)`: set `status: 'removed'` and `removed: true` on associated FeedPost
    - `submitVerification(brandId, documents)`: set `verificationStatus: 'pending'`
    - _Requirements: 2.4, 2.5, 5.1, 5.5_

  - [x] 7.4 Implement feed mock service in `src/services/feedService.ts`
    - `loadFeed(filters?)`: return non-removed posts, apply category/compensationType/deadline filters, sort by `collaborationMatchScore` descending
    - `publishPost(post)`: add to store, simulate latency, return created `FeedPost` with generated `id` and `publishedAt`
    - `removePost(postId)`: set `removed: true` on post in store, create notification for author
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 6.1, 6.4_

  - [x] 7.5 Implement application mock service in `src/services/applicationService.ts`
    - `getApplicationsForCampaign(campaignId)`: fetch applications from store
    - `createApplication(creatorId, campaignId, portfolioItemIds)`: check duplicate guard (`pending` or `approved` already exists), generate AI pitch via `generateAIPitch`, pre-populate up to 3 most-relevant portfolio items, compute `collaborationMatchScore`, create `Application` with `status: 'pending'` and `submittedAt`, add to creator's `collaborationHistory`, create confirmation notification
    - `updateApplication(appId, editedPitch, portfolioItemIds)`: update `editedPitch` and selected items
    - `processSwipe(appId, direction)`: update `status`, set `reviewedAt`; create creator notification for `approve`/`decline`; no notification for `waitlist`
    - `undoSwipe(appId, previousStatus)`: restore `status` to previous value
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.2, 8.3, 8.4, 8.6_

  - [x] 7.6 Implement notification mock service in `src/services/notificationService.ts`
    - `getNotifications(userId)`: fetch from store, return sorted by `createdAt` descending
    - `markRead(notificationId)`: update `read: true` in store
    - `createNotification(userId, type, title, body)`: create `Notification` object, persist to store
    - _Requirements: 1.4, 7.3, 8.2, 8.3_


- [x] 8. Checkpoint — Core Logic Complete
  - Ensure all score engine, validation, AI mock, and service layer files compile without TypeScript errors (`tsc --noEmit`)
  - Run `vitest --run` to confirm all currently written tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Zustand Stores
  - [x] 9.1 Implement `useAuthStore` in `src/stores/authStore.ts`
    - State: `currentUser: User | null`, `isAuthenticated: boolean`
    - Actions: `login`, `logout`, `register`, `verifyEmail`, `resendVerification`, `resetPassword` — each delegates to `authService` and updates store state
    - On `login` success: set `currentUser` and `isAuthenticated: true`; on `logout`: clear state
    - _Requirements: 10.1, 10.3, 10.4, 10.5_

  - [x] 9.2 Implement `useCreatorStore` in `src/stores/creatorStore.ts`
    - State: `creator: Creator | null`
    - Actions: `loadCreator(id)`, `updatePortfolio(items)`, `refreshTrustScore()`
    - Delegate to `creatorService`; update local state after each operation
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 9.3 Implement `useFeedStore` in `src/stores/feedStore.ts`
    - State: `posts: FeedPost[]`, `filters: FeedFilters`
    - Actions: `loadFeed()`, `setFilters(partial)`, `publishPost(post)`, `removePost(id)`
    - `loadFeed` delegates to `feedService.loadFeed(filters)` and replaces `posts` state
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 6.1_

  - [x] 9.4 Implement `useSwipeStore` in `src/stores/swipeStore.ts`
    - State: `queue: Application[]`, `lastSwiped: Application | null`, `undoAvailable: boolean`
    - Actions: `loadApplications(campaignId)`, `rankByMatchScore()`, `swipe(appId, direction)`, `undo()`
    - `swipe` saves previous state to `lastSwiped` and sets `undoAvailable: true`; schedules `undoAvailable: false` after 5 seconds
    - `undo` calls `applicationService.undoSwipe` and restores queue
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 9.5 Implement `useNotificationStore` in `src/stores/notificationStore.ts`
    - State: `notifications: Notification[]`, `unreadCount: number`
    - Actions: `loadNotifications()`, `markRead(id)`, `markAllRead()`
    - Compute `unreadCount` from `notifications.filter(n => !n.read).length`
    - _Requirements: 1.4, 7.3, 8.2, 8.3_


- [x] 10. Store Property-Based Tests
  - [x]* 10.1 Write property tests for portfolio store (Properties 7, 35)
    - **Property 7: Portfolio Update Round-Trip** — any valid portfolio items written via `updatePortfolio` are exactly returned by a subsequent `loadCreator` read. Use `fc.array(fc.record(...))` for portfolio items. **Validates: Requirements 1.2**
    - **Property 35: Template Confirm Required to Persist** — inspecting or discarding a generated template without calling confirm leaves `creator.portfolio` unchanged. **Validates: Requirements 12.3**
    - Test file: `src/__tests__/portfolioStore.test.ts`

  - [x]* 10.2 Write property tests for brand store (Properties 10, 11)
    - **Property 10: Brand Low Score Publish Restriction** — any brand with `brandScore < 40` attempting `publishCampaign` gets a restriction error and no Campaign is created. Use `fc.integer({ min: 0, max: 39 })`. **Validates: Requirements 2.4**
    - **Property 11: New-To-Platform Indicator** — any brand with `completedCollaborations < 3` has `isNewToPlatform === true`. Use `fc.integer({ min: 0, max: 2 })`. **Validates: Requirements 2.5**
    - Test file: `src/__tests__/brandStore.test.ts`

  - [x]* 10.3 Write property tests for feed store (Properties 12–15)
    - **Property 12: Feed Publish Round-Trip** — any published post is included in a subsequent `loadFeed` (without filtering). Use `fc.record` for `FeedPost`. **Validates: Requirements 5.1, 6.1**
    - **Property 13: Feed Sort Invariant** — loaded posts are in non-ascending `collaborationMatchScore` order. Use `fc.array` of FeedPost. **Validates: Requirements 5.3**
    - **Property 14: Feed Filter Correctness** — every post in a filtered result satisfies all active filter criteria simultaneously. Use `fc.record` for `FeedFilters` + `fc.array` posts. **Validates: Requirements 5.4**
    - **Property 15: Feed Post Removal** — any removed post is absent from all subsequent `loadFeed` results regardless of filters. **Validates: Requirements 5.5**
    - Test file: `src/__tests__/feedStore.test.ts`

  - [x]* 10.4 Write property tests for auth service (Properties 28–30)
    - **Property 28: Email Verification Token Activation** — valid unexpired token sets `emailVerified: true`; invalid/used token leaves it unchanged. **Validates: Requirements 10.3**
    - **Property 29: Unverified Email Login Rejection** — any user with `emailVerified: false` cannot login with correct credentials. **Validates: Requirements 10.4**
    - **Property 30: Account Lockout After Five Failures** — after exactly 5 consecutive failures `failedLoginAttempts === 5` and `lockedUntil` is ~15 min in the future; locked account returns lockout error. Use `fc.integer({ min: 1, max: 5 })`. **Validates: Requirements 10.5**
    - Test file: `src/__tests__/auth.test.ts`

  - [x]* 10.5 Write property tests for application service (Properties 19–22)
    - **Property 19: Application Pre-Population Bounds** — pre-populated `selectedPortfolioItems.length <= 3` and all items belong to the creator's portfolio. **Validates: Requirements 7.2**
    - **Property 20: Application Submission Side Effects** — new submission has non-null `submittedAt`, exactly one confirmation notification for creator, and creator's `collaborationHistory` contains the campaign with `'pending'`. **Validates: Requirements 7.3, 7.6**
    - **Property 21: Edited Pitch Preserved** — any string `S` set as `editedPitch` before submitting equals `Application.editedPitch` in the stored record. Use `fc.string()`. **Validates: Requirements 7.4**
    - **Property 22: Duplicate Application Prevention** — submitting a second application for a `(creatorId, campaignId)` with existing `'pending'` or `'approved'` status does not increase application count. **Validates: Requirements 7.5**
    - Test file: `src/__tests__/applicationService.test.ts`

  - [x]* 10.6 Write property tests for swipe store (Properties 23–26)
    - **Property 23: Swipe Approve/Decline State Transition and Notification** — swiping `'approve'` sets status `'approved'`; `'decline'` sets `'declined'`; both create exactly one creator notification. **Validates: Requirements 8.2, 8.3**
    - **Property 24: Waitlist Does Not Notify Creator** — swiping `'waitlist'` sets `'waitlisted'` and creates zero notifications for the creator. **Validates: Requirements 8.4**
    - **Property 25: Application Ranking Sorted Descending** — `rankApplications` always produces a non-ascending `collaborationMatchScore` sequence. Use `fc.array` of Application. **Validates: Requirements 8.5**
    - **Property 26: Swipe Undo Restores Previous Status** — calling `undo` immediately after a swipe restores the application to its pre-swipe status. **Validates: Requirements 8.6**
    - Test file: `src/__tests__/swipeStore.test.ts`

  - [x]* 10.7 Write property tests for notification threshold and verification (Properties 8, 31, 32)
    - **Property 8: Trust Score Change Notification Threshold** — a notification is created if and only if `|newScore - oldScore| > 2`. Use `fc.integer({ min: 0, max: 100 })` for old and new scores. **Validates: Requirements 1.4**
    - **Property 31: Creator Verification Status Transition** — creator with completed identity verification AND ≥1 connected social account always gets `verificationStatus === 'verified'`. **Validates: Requirements 11.1**
    - **Property 32: Verified Creator Loses Status on Social Disconnect** — disconnecting all social accounts from a verified creator sets `verificationStatus === 'unverified'` and creates exactly one revocation notification. **Validates: Requirements 11.4**
    - Test file: `src/__tests__/verification.test.ts`


- [x] 11. Checkpoint — Stores and Services
  - Ensure `tsc --noEmit` passes
  - Run `vitest --run` — all written property tests should pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Routing and App Shell
  - [x] 12.1 Create route guard components in `src/router/guards.tsx`
    - `AuthGuard`: render `<Outlet />` if `isAuthenticated`, else `<Navigate to="/login" />`
    - `RoleGuard`: accept `role` prop; render `<Outlet />` if `currentUser.role === role`, else `<Navigate to="/feed" />`
    - `PublicOnlyGuard`: render children if not authenticated, else `<Navigate to="/feed" />`
    - _Requirements: Design § Route Guards_

  - [x] 12.2 Create route definitions in `src/router/routes.tsx`
    - Define all routes matching the route map in the design doc: public routes (`/login`, `/register`, `/verify-email`), onboarding routes, and authenticated routes (`/feed`, `/notifications`, `/creator/:id`, `/creator/me/*`, `/brand/:id`, `/brand/me/*`)
    - Apply `AuthGuard`, `RoleGuard`, `PublicOnlyGuard` wrappers as specified
    - Implement lazy-loaded page imports with `React.lazy` and `<Suspense>`
    - Root `/` redirects to `/feed` if authenticated, else to `/login`
    - _Requirements: Design § Routing Structure_

  - [x] 12.3 Create `App.tsx` and `main.tsx`
    - `main.tsx`: mount `<App />` into `#root` with `StrictMode`
    - `App.tsx`: wrap `<RouterProvider router={...}>` using `createBrowserRouter` with the routes from 12.2
    - Add top-level `<Suspense fallback={<div>Loading…</div>}>` for lazy pages
    - _Requirements: Design § Architecture_


- [ ] 13. Shared UI Components
  - [-] 13.1 Implement `ScoreBadge` component in `src/components/shared/ScoreBadge.tsx`
    - Props: `score: number`, `type: 'trust' | 'brand' | 'match'`
    - Render a pill with a color appropriate to score (green ≥ 70, yellow 40–69, red < 40)
    - Display label text: "Trust Score", "Brand Score", or "Match" based on type
    - _Requirements: 1.1, 2.1, 5.2, 9.2_

  - [-] 13.2 Implement `VerificationBadge` component in `src/components/shared/VerificationBadge.tsx`
    - Props: `status: VerificationStatus`
    - Render "Verified" (green checkmark), "Pending" (yellow clock), or "New to Platform" (grey) based on status
    - _Requirements: 1.1, 2.5, 5.2_

  - [-] 13.3 Implement `PartialDataIndicator` component in `src/components/shared/PartialDataIndicator.tsx`
    - Props: `field: string`
    - Render an inline warning badge: "Partial Data – [field]"
    - _Requirements: 3.5, 4.5_

  - [-] 13.4 Implement `UndoToast` component in `src/components/shared/UndoToast.tsx`
    - Props: `onUndo: () => void`, `timeout?: number` (default 5000)
    - Show toast with "Undo" button; auto-dismiss after timeout milliseconds
    - Call `onUndo` and dismiss on button click
    - _Requirements: 8.6_

  - [ ] 13.5 Implement `PortfolioItem` component in `src/components/shared/PortfolioItem.tsx`
    - Props: `item: PortfolioItem`, `editable?: boolean`
    - Display title, description, category badge, media thumbnail, and metrics (views, likes, comments, shares, engagement rate)
    - When `editable`, show edit and delete action buttons
    - _Requirements: 1.1, 1.2_


- [ ] 14. Auth Pages
  - [x] 14.1 Implement `RegisterPage` in `src/pages/RegisterPage.tsx`
    - Role selection radio buttons (Creator / Brand)
    - Email input and password input with inline strength validation using `validatePassword`
    - On submit: call `authStore.register`, handle duplicate email error, show success message with instruction to verify email
    - _Requirements: 10.1, 10.2_

  - [x] 14.2 Implement `LoginPage` in `src/pages/LoginPage.tsx`
    - Email + password form
    - Handle `unverified-email` error state: show "Resend verification email" link
    - Handle `account-locked` error state: show lock duration remaining
    - On success: navigate to `/feed`
    - _Requirements: 10.4, 10.5_

  - [~] 14.3 Implement `EmailVerificationPage` in `src/pages/EmailVerificationPage.tsx`
    - Read `?token=` query param; if present, call `authStore.verifyEmail(token)` on mount and show success/failure state
    - If no token, show "Check your email" waiting state with "Resend email" button calling `authStore.resendVerification`
    - On verified success: navigate to `/onboarding/{role}`
    - _Requirements: 10.2, 10.3, 10.4_


- [ ] 15. Creator Pages
  - [~] 15.1 Implement `CreatorOnboardingPage` in `src/pages/CreatorOnboardingPage.tsx`
    - Multi-step wizard: Step 1 — content category selection (multi-select from `ContentCategory` options); Step 2 — social account links (platform dropdowns + handle inputs); Step 3 — optional AI template generation prompt
    - Save selections to `creatorStore` on completion; navigate to `/creator/me/portfolio`
    - _Requirements: 1.1, 12.1_

  - [~] 15.2 Implement `CreatorProfilePage` in `src/pages/CreatorProfilePage.tsx`
    - Fetch creator via `creatorStore.loadCreator(params.id)` on mount
    - Display: `ScoreBadge` (trust, score, partialData), `VerificationBadge`, bio, content category chips, social account list
    - Display `CreatorInsights` section: audience demographics (age groups, top countries, gender split), average engagement rate, collaboration count, success rate
    - Display `PortfolioItem` list (non-editable view)
    - If `creator.portfolio.length === 0` and viewing own profile: show empty-state prompt to add content or connect social accounts
    - _Requirements: 1.1, 1.3, 1.5_

  - [~] 15.3 Implement `PortfolioEditorPage` in `src/pages/PortfolioEditorPage.tsx`
    - Load current portfolio from `creatorStore`
    - File upload input: validate with `validatePortfolioFile`, show inline error if rejected, otherwise show preview
    - Add, edit, remove portfolio items; save changes via `creatorStore.updatePortfolio`
    - Show success confirmation that changes are reflected on the profile
    - _Requirements: 1.2, 1.6_

  - [~] 15.4 Implement `AITemplateGeneratorPage` in `src/pages/AITemplateGeneratorPage.tsx`
    - "Generate Templates" button triggers `generatePortfolioTemplates(creator)` with a loading spinner
    - Display 3 template cards with title, suggested categories, sections list
    - "Confirm" button on a card calls `creatorStore.updatePortfolio` with the template-derived structure (template confirm action)
    - "Discard" button dismisses without saving
    - Handle `isGeneric` case: show info banner "Generated using content categories only — connect a social account for personalised templates"
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 15.5 Write property test for creator profile completeness (Property 5)
    - **Property 5: Creator Profile Completeness** — for any `Creator` object with populated fields, the rendered `CreatorProfilePage` contains Trust Score, Portfolio items, Verification Status badge, audience demographics, primary categories, average engagement rate, and collaboration history. Use `fc.record` for Creator struct. **Validates: Requirements 1.1, 1.3**
    - Test file: `src/__tests__/components/creatorProfile.test.tsx`


- [ ] 16. Brand Pages
  - [~] 16.1 Implement `BrandOnboardingPage` in `src/pages/BrandOnboardingPage.tsx`
    - Multi-step wizard: Step 1 — company info (name, industry, description); Step 2 — verification document upload (file input)
    - Save to `brandStore` on completion; navigate to `/brand/:id`
    - _Requirements: 2.1_

  - [~] 16.2 Implement `BrandProfilePage` in `src/pages/BrandProfilePage.tsx`
    - Fetch brand via store on mount
    - If `brand.isNewToPlatform` (< 3 completed collaborations): show "New to Platform" indicator instead of Brand Score
    - Otherwise: show `ScoreBadge` (brand type) with `PartialDataIndicator` if `brandScorePartialData`
    - Display: company overview, campaign history list (title + status), completed collaboration count, average creator rating, average response time
    - Show `VerificationBadge`
    - _Requirements: 2.1, 2.3, 2.5_

  - [~] 16.3 Implement `CampaignEditorPage` in `src/pages/CampaignEditorPage.tsx`
    - Form fields: title, description, requirements, content categories (multi-select), compensation type + amount, deadline
    - Check `brand.brandScore >= 40` before showing publish button; if < 40 show restriction notice
    - On submit: call `brandService.publishCampaign` or `brandService.updateCampaign`
    - _Requirements: 2.4, 5.1_

  - [ ]* 16.4 Write property test for brand profile completeness (Property 6)
    - **Property 6: Brand Profile Completeness** — for any `Brand` object, the rendered `BrandProfilePage` shows Brand Score (or "New to Platform" when `completedCollaborations < 3`), company overview, campaign history, average creator rating, completed collaboration count, and average response time. **Validates: Requirements 2.1, 2.3, 2.5**
    - Test file: `src/__tests__/components/brandProfile.test.tsx`


- [ ] 17. Feed Page
  - [~] 17.1 Implement `FeedCard` component in `src/components/feed/FeedCard.tsx`
    - Props: `post: FeedPost`
    - For campaign posts: render `Collaboration_Match_Score` (ScoreBadge match), `Brand_Score` (ScoreBadge brand), `VerificationBadge`, "Apply" button, "Save" button, and `aiRecommendationTag` chip if present
    - For creator portfolio posts: render `Creator_Trust_Score` (ScoreBadge trust), `VerificationBadge`, and "Collaborate" / "Contact" button
    - Show `post.category` and `post.type` labels
    - _Requirements: 5.2, 6.2_

  - [~] 17.2 Implement `FeedFilters` component in `src/components/feed/FeedFilters.tsx`
    - Controls: category dropdown (all ContentCategory values + "All"), compensation type dropdown, deadline date picker
    - On change: call `feedStore.setFilters(...)`, which triggers `feedStore.loadFeed()`
    - _Requirements: 5.4_

  - [x] 17.3 Implement `FeedPage` in `src/pages/FeedPage.tsx`
    - On mount: call `feedStore.loadFeed()`
    - Render `FeedFilters` at top and `FeedCard` list below, sorted by `collaborationMatchScore` (handled by store)
    - Show loading skeleton while fetching
    - Empty state: "No posts match your filters"
    - _Requirements: 5.1, 5.3, 5.4, 6.1_

  - [ ]* 17.4 Write property test for FeedCard display completeness (Property 16)
    - **Property 16: Feed Card Display Completeness** — for any `FeedPost`, the rendered `FeedCard` shows the correct set of fields depending on post type (campaign vs creator). **Validates: Requirements 5.2, 6.2**
    - Test file: `src/__tests__/components/feedCard.test.tsx`


- [ ] 18. Campaign Application Flow
  - [~] 18.1 Implement `AIPitchPanel` component in `src/components/application/AIPitchPanel.tsx`
    - Props: `pitch: string`, `onChange: (v: string) => void`
    - Render a `<textarea>` pre-populated with `pitch`; fire `onChange` on every change
    - Show character count
    - _Requirements: 7.1, 7.4_

  - [~] 18.2 Implement `ApplicationForm` component in `src/components/application/ApplicationForm.tsx`
    - Accept props: `creator: Creator`, `campaign: Campaign`
    - On mount: call `applicationService.createApplication` to generate AI pitch and pre-select portfolio items; show loading spinner during generation
    - Render `AIPitchPanel` with AI pitch; allow editing
    - Render portfolio item checkboxes (max 3 selectable, pre-selected from service response)
    - "Submit Application" button: call `applicationService.updateApplication` (to persist edited pitch) then confirm submission
    - If duplicate application detected: show existing status instead of form
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [~] 18.3 Wire application flow into `FeedPage` and `CreatorProfilePage`
    - "Apply" button on `FeedCard` (campaign type) opens `ApplicationForm` in a modal or navigates to application route
    - Pass `creator` and `campaign` data to `ApplicationForm`
    - _Requirements: 7.1, 7.6_


- [ ] 19. Swipe Review Interface
  - [~] 19.1 Implement `SwipeCard` component in `src/components/swipe/SwipeCard.tsx`
    - Props: `application: Application`, `creator: Creator`, `onSwipe: (dir: 'approve' | 'decline' | 'waitlist') => void`
    - Display `Creator_Trust_Score` (ScoreBadge), portfolio summary (first 3 items), `AIPitchPanel` (read-only), `Collaboration_Match_Score` (ScoreBadge match), `VerificationBadge`
    - Keyboard and button controls: right arrow / green button → approve; left arrow / red button → decline; down arrow / grey button → waitlist
    - _Requirements: 8.1_

  - [~] 19.2 Implement `SwipeControls` component in `src/components/swipe/SwipeControls.tsx`
    - Approve (right), Decline (left), Waitlist (down) action buttons
    - Wire to `onSwipe` prop
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [~] 19.3 Implement `SwipeReviewPage` in `src/pages/SwipeReviewPage.tsx`
    - On mount: call `swipeStore.loadApplications(campaignId)` from route params
    - "Rank by AI" button: call `swipeStore.rankByMatchScore()`
    - Render current `queue[0]` in `SwipeCard`; handle empty queue state
    - On swipe: call `swipeStore.swipe(appId, direction)`, show `UndoToast` for 5 seconds
    - Undo handler: call `swipeStore.undo()`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [~] 19.4 Wire `SwipeReviewPage` into routing and brand campaign list
    - Link from `BrandProfilePage` campaign history → `/brand/me/campaigns/:id/review`
    - _Requirements: 8.1_


- [ ] 20. Notifications System
  - [~] 20.1 Implement `NotificationsPanel` component in `src/components/shared/NotificationsPanel.tsx`
    - Render list of `Notification` objects from `notificationStore`
    - Each item shows title, body, relative timestamp, and read/unread indicator
    - "Mark all as read" button
    - _Requirements: 1.4, 7.3, 8.2, 8.3_

  - [~] 20.2 Implement `NotificationsPage` in `src/pages/NotificationsPage.tsx`
    - Call `notificationStore.loadNotifications()` on mount
    - Render `NotificationsPanel` full-page
    - On item click: call `notificationStore.markRead(id)`
    - _Requirements: 1.4, 7.3_

  - [~] 20.3 Add unread notification badge to app navigation
    - Show `notificationStore.unreadCount` as a badge on the notifications nav icon
    - Update in real-time as notifications are marked read
    - _Requirements: 1.4, 8.2, 8.3_

  - [~] 20.4 Implement `AppLayout` with navigation in `src/components/shared/AppLayout.tsx`
    - Top navigation bar with logo, links to Feed, profile (creator/brand based on role), Notifications (with badge), and Logout button
    - Renders `<Outlet />` for child routes
    - _Requirements: Design § Application Layers_


- [ ] 21. Verification Flow
  - [~] 21.1 Implement `VerificationFlowPage` for creators in `src/pages/VerificationFlowPage.tsx`
    - Step 1: identity document upload (file input)
    - Step 2: social account connection (per-platform toggle; sets `connected: true` in creatorStore)
    - Step 3: review and submit — call `creatorService.submitVerification`
    - After submission: show "Pending" status and expected decision timeline (5 business days)
    - _Requirements: 11.1, 11.3_

  - [~] 21.2 Extend `VerificationFlowPage` for brands
    - Step 1: business registration document upload
    - Step 2: review and submit — call `brandService.submitVerification`
    - _Requirements: 11.2, 11.3_

  - [~] 21.3 Handle social account disconnection
    - In creator settings / profile page: "Disconnect" button per social account calls `creatorService.disconnectSocialAccount`
    - If all accounts disconnected and creator is verified: service revokes status and emits notification (see Property 32)
    - _Requirements: 11.4_


- [~] 22. Checkpoint — UI Complete
  - Run `tsc --noEmit` — zero TypeScript errors
  - Run `vitest --run` — all tests pass
  - Manually verify the following flows compile and render without runtime errors: login, register, feed, creator profile, brand profile, swipe review
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Remaining Property-Based Tests — Moderation and Feed Card
  - [ ]* 23.1 Write property test for post removal notification (Property 17)
    - **Property 17: Post Removal Notifies Creator** — any `FeedPost` flagged and removed has `removed === true` AND exactly one notification exists for the author with removal reason. **Validates: Requirements 6.4**
    - Test file: `src/__tests__/moderation.test.ts`

- [ ] 24. Final Integration Wiring
  - [~] 24.1 Wire navigation and deep links
    - Ensure clicking a creator's name/avatar in `FeedCard` navigates to `/creator/:id`
    - Ensure clicking a brand name in `FeedCard` navigates to `/brand/:id`
    - Ensure "Apply" in `FeedCard` opens `ApplicationForm` correctly with correct `campaign` and `creator` context
    - _Requirements: 5.2, 6.2, 7.1_

  - [~] 24.2 Wire score recomputation triggers
    - After `creatorStore.updatePortfolio`: recompute `collaborationMatchScore` for all pending applications by that creator and update feed posts
    - After `brandService.updateCampaign`: recompute `collaborationMatchScore` for all applications to that campaign
    - _Requirements: 9.3_

  - [~] 24.3 Seed data verification and smoke test
    - Start the dev server (`npm run dev`) in a separate terminal and verify that seeded users can log in, browse the feed, and view creator and brand profiles without console errors
    - _Requirements: Design § Mock-first principle_

- [~] 25. Final Checkpoint
  - Run `vitest --run --reporter=verbose` — all 35+ property tests plus unit tests pass
  - Run `tsc --noEmit` — zero errors
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All property tests use `fast-check` with `numRuns: 200` for score properties and the default 100 for other properties
- Each property test file should call `resetStore()` in a `beforeEach` hook to ensure test isolation
- The `simulateLatency` helper must be mocked in tests (use `vi.mock` or replace with a no-op) so tests do not time out
- `crypto.randomUUID()` is available in Vite/jsdom environments; no polyfill needed for Node 18+
- Score recomputation for existing applications (task 24.2) uses the same pure `computeCollaborationMatchScore` function — no special handling needed


## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3", "1.4"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.2", "2.3", "2.4"]
    },
    {
      "id": 2,
      "tasks": ["3.1", "3.2", "3.3"]
    },
    {
      "id": 3,
      "tasks": ["4.1", "4.2", "4.3", "5.1", "5.2"]
    },
    {
      "id": 4,
      "tasks": ["4.4", "6.1", "6.2", "6.3"]
    },
    {
      "id": 5,
      "tasks": ["4.5", "5.3", "6.4"]
    },
    {
      "id": 6,
      "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6"]
    },
    {
      "id": 7,
      "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5"]
    },
    {
      "id": 8,
      "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6", "10.7"]
    },
    {
      "id": 9,
      "tasks": ["12.1", "12.2", "12.3"]
    },
    {
      "id": 10,
      "tasks": ["13.1", "13.2", "13.3", "13.4", "13.5"]
    },
    {
      "id": 11,
      "tasks": ["14.1", "14.2", "14.3"]
    },
    {
      "id": 12,
      "tasks": ["15.1", "15.2", "15.3", "15.4", "16.1", "16.2", "16.3", "17.1", "17.2"]
    },
    {
      "id": 13,
      "tasks": ["15.5", "16.4", "17.3", "17.4", "18.1", "18.2", "19.1", "19.2", "20.1", "20.2", "20.3", "20.4", "21.1", "21.2", "21.3"]
    },
    {
      "id": 14,
      "tasks": ["18.3", "19.3", "19.4", "23.1"]
    },
    {
      "id": 15,
      "tasks": ["24.1", "24.2", "24.3"]
    }
  ]
}
```
