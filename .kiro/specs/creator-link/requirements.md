# Requirements Document

## Introduction

CreatorLink is a professional networking platform purpose-built for content creators and brands. It replaces vanity metrics (follower counts) with verified reputation signals — Creator Trust Scores, Brand Scores, and proven collaboration history. The platform enables creators to showcase professional portfolios, discover collaboration opportunities, and build a credible professional identity. Brands gain access to a searchable creator network with built-in authenticity signals, a streamlined application review workflow, and structured campaign management tools.

---

## Glossary

- **Creator**: A content creator who registers on the platform to showcase work, build reputation, and find brand collaborations.
- **Brand**: A company or marketing team that registers on the platform to discover creators, publish campaigns, and manage collaboration workflows.
- **Creator_Trust_Score**: A computed score (0–100) representing a creator's professional credibility, derived from audience authenticity, engagement consistency, follower growth patterns, comment quality, and brand collaboration success rate.
- **Brand_Score**: A computed score (0–100) representing a brand's reliability as a collaboration partner, derived from payment reliability, creator reviews, campaign success rates, communication quality, and response speed.
- **Portfolio**: A structured collection of a creator's past campaigns, content samples, performance metrics, and industry specializations.
- **Campaign**: A brand-published collaboration opportunity, including requirements, deliverables, compensation, and timeline.
- **Application**: A creator's submission expressing interest in a Campaign, optionally including an AI-generated pitch and relevant portfolio examples.
- **Collaboration_Match_Score**: An AI-generated percentage (0–100) indicating compatibility between a Creator and a Campaign or Brand post.
- **Swipe_Review**: The Tinder-style interface brands use to process creator applications (Approve, Decline, Waitlist).
- **Feed**: The main content discovery surface showing Brand posts and Creator posts to all authenticated users.
- **AI_Pitch**: An automatically generated personalized cover letter produced for a creator when applying to a Campaign.
- **Trust_Score_Engine**: The backend service responsible for computing and updating Creator_Trust_Score and Brand_Score.
- **Score_Audit_Log**: An immutable record of all inputs and weights used each time the Trust_Score_Engine recalculates a score.
- **Verification_Status**: A badge awarded to a Creator or Brand after identity and account verification is completed.

---

## Requirements

### Requirement 1: Creator Profile

**User Story:** As a Creator, I want a professional profile that showcases my portfolio, scores, and audience insights, so that brands can evaluate my credibility and fit for their campaigns.

#### Acceptance Criteria

1. THE Platform SHALL provide each Creator with a unique profile page displaying their Creator_Trust_Score, Portfolio, Verification_Status, and Creator Insights.
2. WHEN a Creator edits their Portfolio, THE Platform SHALL save the updated Portfolio and reflect changes on the profile page within 5 seconds.
3. THE Platform SHALL display Creator Insights including audience demographics, primary content categories, average engagement rate, and collaboration history on the Creator's profile.
4. WHEN a Creator's Creator_Trust_Score changes by more than 2 points, THE Platform SHALL notify the Creator via in-app notification within 60 seconds of the score update.
5. WHERE the Creator has no past campaigns, THE Platform SHALL display a prompt encouraging the Creator to add content samples or connect social accounts to populate the Portfolio.
6. IF a Creator submits Portfolio content that exceeds 50 MB per file, THEN THE Platform SHALL reject the upload and display an error message specifying the 50 MB limit.

---

### Requirement 2: Brand Profile

**User Story:** As a Brand, I want a professional brand profile with a Brand_Score and collaboration history, so that creators can evaluate my reliability before applying to my campaigns.

#### Acceptance Criteria

1. THE Platform SHALL provide each Brand with a unique profile page displaying their Brand_Score, company overview, campaign history, and creator ratings.
2. WHEN a creator submits a rating and review for a Brand after a completed collaboration, THE Trust_Score_Engine SHALL incorporate the new review into the Brand_Score recalculation within 24 hours.
3. THE Platform SHALL display the count of completed collaborations, average creator rating, and average response time on the Brand's profile page.
4. IF a Brand's Brand_Score falls below 40, THEN THE Platform SHALL restrict the Brand from publishing new Campaigns until the Brand_Score is reviewed by a platform moderator.
5. WHERE a Brand has fewer than 3 completed collaborations, THE Platform SHALL display a "New to Platform" indicator on the Brand profile page in place of a Brand_Score.

---

### Requirement 3: Creator Trust Score Computation

**User Story:** As a Creator, I want my Trust Score to reflect authentic engagement and collaboration performance, so that brands can rely on it as a credible signal.

#### Acceptance Criteria

1. THE Trust_Score_Engine SHALL compute the Creator_Trust_Score using audience authenticity, comment quality score, follower growth patterns, engagement consistency, and brand collaboration success rate as inputs.
2. WHEN any input signal for a Creator changes, THE Trust_Score_Engine SHALL recalculate the Creator_Trust_Score within 24 hours of the change.
3. THE Trust_Score_Engine SHALL record every recalculation in the Score_Audit_Log, including timestamp, input values, weights applied, and resulting score.
4. THE Platform SHALL expose the Creator_Trust_Score as a value between 0 and 100 inclusive on the Creator's profile.
5. IF the Trust_Score_Engine encounters missing or unverifiable input data for a Creator, THEN THE Trust_Score_Engine SHALL compute the score using only the available verified signals and display a "Partial Data" indicator on the Creator's profile.
6. FOR ALL Creator_Trust_Score recalculations, providing the same set of input signals SHALL produce the same score (deterministic computation).

---

### Requirement 4: Brand Score Computation

**User Story:** As a Creator, I want to see a Brand's reliability score before I invest time applying to their campaign, so that I can avoid low-quality or non-paying collaborations.

#### Acceptance Criteria

1. THE Trust_Score_Engine SHALL compute the Brand_Score using payment reliability, creator reviews, campaign success rates, communication quality score, and average response speed as inputs.
2. WHEN any input signal for a Brand changes, THE Trust_Score_Engine SHALL recalculate the Brand_Score within 24 hours of the change.
3. THE Trust_Score_Engine SHALL record every Brand_Score recalculation in the Score_Audit_Log, including timestamp, input values, weights applied, and resulting score.
4. THE Platform SHALL expose the Brand_Score as a value between 0 and 100 inclusive on the Brand's profile.
5. IF the Trust_Score_Engine encounters missing or unverifiable data for a Brand, THEN THE Trust_Score_Engine SHALL compute the score using only the available verified signals and display a "Partial Data" indicator on the Brand's profile.

---

### Requirement 5: Feed — Brand Campaign Posts

**User Story:** As a Creator, I want to browse brand-published campaign opportunities in a feed, so that I can discover collaborations relevant to my niche and audience.

#### Acceptance Criteria

1. WHEN a Brand publishes a Campaign post, THE Feed SHALL display the post to eligible Creators within 60 seconds of publication.
2. THE Feed SHALL display each Campaign post with the Collaboration_Match_Score, Brand_Score, Verification_Status, an Apply button, a Save button, and any AI Recommendation Tag.
3. WHEN a Creator loads the Feed, THE Platform SHALL sort posts by Collaboration_Match_Score in descending order as the default sort order.
4. THE Platform SHALL allow Creators to filter Feed posts by content category, compensation type, and campaign deadline.
5. IF a Campaign post is removed by the Brand or taken down by a moderator, THEN THE Feed SHALL stop displaying that post to all users within 60 seconds.

---

### Requirement 6: Feed — Creator Portfolio Posts

**User Story:** As a Creator, I want to publish portfolio updates and campaign results to the feed, so that brands and other creators can discover my professional work.

#### Acceptance Criteria

1. WHEN a Creator publishes a portfolio post, THE Feed SHALL display the post to all authenticated users within 60 seconds of publication.
2. THE Feed SHALL display each Creator post with the Creator_Trust_Score, Verification_Status, a Collaboration Match indicator, and a contact or collaborate button.
3. THE Platform SHALL allow Creators to categorize posts by type: portfolio update, campaign result, case study, creative concept, or content showcase.
4. IF a Creator post violates community guidelines as determined by the Platform's moderation system, THEN THE Platform SHALL remove the post and notify the Creator with a reason within 24 hours.

---

### Requirement 7: Campaign Application with AI Pitch

**User Story:** As a Creator, I want to apply to campaigns with one click using an AI-generated pitch and relevant portfolio examples, so that I can apply efficiently without writing a pitch from scratch each time.

#### Acceptance Criteria

1. WHEN a Creator clicks the Apply button on a Campaign post, THE Platform SHALL generate an AI_Pitch tailored to the Campaign's requirements and the Creator's Portfolio within 10 seconds.
2. THE Platform SHALL pre-populate the application form with the AI_Pitch and the three Portfolio items most relevant to the Campaign.
3. WHEN a Creator submits an Application, THE Platform SHALL confirm receipt with an in-app notification and record the application timestamp.
4. THE Platform SHALL allow Creators to edit the AI_Pitch and selected Portfolio items before submitting the Application.
5. IF a Creator has already submitted an Application for a Campaign, THEN THE Platform SHALL display the existing application status and prevent duplicate submission.
6. WHEN a Creator submits an Application, THE Platform SHALL update the Creator's collaboration history to reflect the pending application.

---

### Requirement 8: Swipe-Based Creator Review for Brands

**User Story:** As a Brand, I want to review creator applications using a swipe-style interface, so that I can process applications quickly and intuitively.

#### Acceptance Criteria

1. THE Platform SHALL present each pending Application to the reviewing Brand user in the Swipe_Review interface, displaying the Creator's Creator_Trust_Score, Portfolio summary, AI_Pitch, Collaboration_Match_Score, and Verification_Status.
2. WHEN a Brand user swipes right (Approve) on an Application, THE Platform SHALL move the Application to the Approved stage and notify the Creator within 60 seconds.
3. WHEN a Brand user swipes left (Decline) on an Application, THE Platform SHALL move the Application to the Declined stage and notify the Creator within 60 seconds.
4. WHEN a Brand user swipes down (Waitlist) on an Application, THE Platform SHALL move the Application to the Waitlist stage without immediately notifying the Creator.
5. THE Platform SHALL allow Brands to request AI ranking of pending Applications before entering the Swipe_Review interface, sorting Applications by Collaboration_Match_Score in descending order.
6. IF a Brand user accidentally swipes on an Application, THE Platform SHALL provide an Undo action reversible within 5 seconds of the swipe gesture.

---

### Requirement 9: Collaboration Match Score

**User Story:** As a Creator and as a Brand, I want to see an AI-generated compatibility score on every post and application, so that both parties can quickly assess relevance without reading every detail.

#### Acceptance Criteria

1. THE Platform SHALL compute a Collaboration_Match_Score for each Creator–Campaign pairing using the Creator's content categories, audience demographics, Creator_Trust_Score, and the Campaign's stated requirements.
2. THE Platform SHALL display the Collaboration_Match_Score as a percentage (0–100%) on Campaign posts in the Feed and within the Swipe_Review interface.
3. WHEN the inputs to the Collaboration_Match_Score change (e.g., Creator updates Portfolio, Brand updates Campaign), THE Platform SHALL recompute the score within 60 seconds.
4. FOR ALL Collaboration_Match_Score computations, providing the same Creator and Campaign inputs SHALL produce the same score (deterministic computation).

---

### Requirement 10: User Authentication and Registration

**User Story:** As a new user, I want to register as either a Creator or a Brand, so that I receive a profile and access to the features appropriate for my role.

#### Acceptance Criteria

1. THE Platform SHALL require all users to register with a valid email address and a password of at least 12 characters containing at least one uppercase letter, one lowercase letter, one digit, and one special character.
2. WHEN a new user completes registration, THE Platform SHALL send an email verification link to the registered email address within 60 seconds.
3. WHEN a user clicks the email verification link, THE Platform SHALL activate the account and redirect the user to the onboarding flow for their selected role (Creator or Brand).
4. IF a user attempts to log in with an unverified email address, THEN THE Platform SHALL reject the login and display a prompt to resend the verification email.
5. IF a user submits an incorrect password 5 consecutive times, THEN THE Platform SHALL lock the account for 15 minutes and send an account-lock notification to the registered email address.
6. THE Platform SHALL support password reset via a time-limited reset link sent to the registered email address, where the reset link SHALL expire after 30 minutes.

---

### Requirement 11: Verification Status

**User Story:** As a Creator or Brand, I want to achieve a Verification_Status badge, so that the other party trusts the authenticity of my profile.

#### Acceptance Criteria

1. THE Platform SHALL award Verification_Status to a Creator upon successful completion of identity verification and connection of at least one social media account.
2. THE Platform SHALL award Verification_Status to a Brand upon successful completion of business registration document review.
3. WHEN a verification submission is received, THE Platform SHALL provide a decision (approved or rejected with reason) within 5 business days.
4. IF a verified Creator's connected social account is disconnected, THEN THE Platform SHALL revoke Verification_Status and notify the Creator within 24 hours.

---

### Requirement 12: AI Portfolio Template Generation

**User Story:** As a Creator, I want AI-generated portfolio templates based on my content style and niche, so that I can set up a professional portfolio quickly without starting from scratch.

#### Acceptance Criteria

1. WHEN a Creator requests an AI-generated portfolio template, THE Platform SHALL generate a structured Portfolio template using the Creator's stated content categories, social account data, and any uploaded content samples within 15 seconds.
2. THE Platform SHALL generate at least 3 distinct template variants for each request, allowing the Creator to choose or further customize one.
3. THE Platform SHALL allow the Creator to accept, modify, or discard each generated template without saving to the active Portfolio until the Creator explicitly confirms.
4. IF the Creator has not connected a social account or uploaded any content samples, THEN THE Platform SHALL generate a generic template based solely on the Creator's stated content categories.
