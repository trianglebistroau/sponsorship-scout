/*
#Context
This task focuses ONLY on updating wording, labels, and microcopy on the existing Research page.
Do NOT refactor logic, layout, or components.
Do NOT introduce new features.
Treat this as a content + UX language pass.

The goal is to make the Research page feel:
- More creator-friendly
- Less technical
- More spacious and breathable
- Bold, calm, quirky, and trustworthy

Think “creative studio” instead of “analytics dashboard”.

#Goal
Improve the naming and copy of key sections so creators immediately understand:
- what this space is for
- how to use it
- how it supports their creative identity and brand growth

Remember this space is introduced after the users/creators have already seen the "profile page" that states their creative DNA, content creation goals, superpowers and growth zones

Reduce density, minimise words, clearer intent.

#Task
##For Strategy, Themes and Brands box
- Rename this section with a single creator-friendky name that feels natural, warm and non-corporate. Examples include (do not hardcode this exact wording un;ess it fits cleanly)
    + “Your Creative Playbook”
    + “Your Content Blueprint”
    + “Your Creative World”
    + “Your Creator Foundations”
- Replace the current existing labels: Ideas, Themes. Strategies and Brands. Instead, inside this section, there should be four sub-areas using simple language
1. Content Lanes
    + What the user consistently talk about from their previous videos after analysis
    + Examples: uni life, food, wellness, fashion
    + Position as “the worlds you show up in”

2. Formats
   + How they show up on camera
   + Examples: vlogs, camera-facing, montages
   + Keep this practical and skimmable

3. Recurring Series:
   + Their repeatable creator “recipes”
   + These shape their personal brand identity
   + Example framing: “things people come back for”, what defines their image among audiences, their own iconic self

4. Brand Fit
   + Brands they want to attract
   + A space to explore alignment between:
     - brand tone
     - creator personality
     - content direction
   + Frame as “who you want noticing you”, not sponsorship mechanics

IMPORTANT:
- Avoid corporate language
- Avoid long explanations
- Use short headers + one-line supporting text
- Let whitespace do the work

##For Research Chat Box
- Rename "Research Chat" into "Our Brainstorming Space" or "Our Collaborative Zone"
- Subtitle
    - This should clearly state that this is a creative, collaborative thinking space.
    - Tone: creative director energy, not chatbot energy.
    - Example direction (adapt as needed): “This is where you think like a creative director — with backup.”
- In the "Research Kickoff" section
    - Instead of saying "Drop a creator detail or target sponsor to map insight summaries, positioning, and assets in one place.", pick up where have been left off from the "Profile page", think like building a storyteling. Start with something like "Now moving on to the fun stuff, let me work my magic to drive your next moves in your creator journey"
    - Then add a short instructional copy/block explaining how to use this space pre-chat
        - This should:
            - Feel inviting, not instructional
            - Reduce intimidation
            - Encourage experimentation
        - Structure:
            - One short intro line
            - Followed by example prompts (not a paragraph)
            - Example prompt styles to include:
                - “Give me ideas for a brand deal with X”
                - “Help me make my content stand out”
                - “What worked best in my niche this month?”
                - “Draft 5 hooks for my next vlog”
        - Guidelines:
            - Keep it light
            - Keep it scannable
            - Do NOT over-explain how the AI works

#Constraints
- Do NOT change component structure
- Do NOT add new UI elements beyond text blocks
- Do NOT reduce clarity for style
- Maintain consistency with existing Research / Generate / Plan page tone

#Expected Outputs
- Updated copy only
- Clearer section naming
- More breathing room
- Creator-native language
- No logic or layout regressions
- Prioritize clarity over cleverness.
*/


/*
#Follow-up Context
This prompt extends the previous instruction.
The structure and layout already exist.
This task is about:
- example placeholder content
- tone calibration
- demonstrating how information should be broken down visually

Do NOT overfill the UI.
These are illustrative examples only.

#Task
##"Your Creative Blueprint" content
- Use the following as SAMPLE PLACEHOLDER CONTENT to guide hierarchy and tone.
- Do not render as a single paragraph.
- Each sub-area should feel scannable and calm.

1. Content Lanes
- Purpose: What this creator naturally shows up for.
- Example placeholder items:
    - Uni life & routines
    - Café hopping
    - Solo runs around the city
    - Quiet night resets
- Tone: Casual, human, recognisable.
- Visual Intent
    - Lane title = primary
    - One short supporting line underneath

2. Formats
- Purpose: How the creator prefers to tell stories.
- Example placeholder items:
    - Day-in-the-life vlog
    - Voiceover + B-roll
    - Camera-facing reflections
    - Photo dumps with captions
- Use: Chips, badges, or inline tags.

3. Recurring Series
- Purpose: These are the creator’s “recipes”. Repeatable ideas that build identity.
- Example placeholder items:
    - Runs I Almost Skipped
    - Sundays Reset With Me
    - Meals That Took 10 Minutes
    - Quiet Moments After 9PM
- Guidance: These should feel like branded rituals, not one-off posts.
- Visual Intent:
    - Series title as headline
    - One-line explanation beneath
    - Feels like a recognizable show format

4. Brand Fit
- Purpose: Signal which brands already align with this creator’s vibe.
- Example placeholder items:
    - Nike  
    Fits my running journey and everyday movement content.
    - Lululemon  
    Calm routines, wellness, lifestyle storytelling.
    - Apple  
    Clean visuals, productivity, creative workflows.
- Tone: Confident, alignment-first. Not salesy.
- Visual Intent:
    - Brand name
    - Short reason underneath (muted, optional)

##"Our Brainstorming Space" Conversation (Pseudo/Hypothetical)
- Use the following to seed example content for the chat experience. This is NOT hardcoded logic, just illustrative copy.
- Instruction shown above chat input: Before "Just start typing — we'll figure it out together.", add something like "Think out loud here. Ask for ideas, clarity, or creative direction."
- Example User Input:
    - Instead of "Looking for beauty brands that care about science-backed routines."
    - Replace with something like "I want a running series that doesn’t feel intimidating or try-hard."
- Example AI Response (Tone Reference)
“Yeah, totally get that.
What if running is just the backdrop, not the main character?
A few ideas that feel low-pressure:
1. ‘Runs I Almost Skipped’  
Honest, very relatable. People connect with the struggle more than the pace.
2. ‘One Run, One Thought’  
Short reflections while cooling down. Calm, repeatable, brand-safe.
3. ‘Running Days That Felt Like Therapy’  
Leans into emotion, not performance.
None of these need to be perfect or intense.
They work because they feel like real life.
Want to shape one of these into a weekly format?”
- Tone Rules
    - Friendly, supportive, creator-to-creator
    - Short paragraphs
    - No buzzwords
    - No authority voice
    - Encouraging, not instructional

#Design Intent
- Less text, more breathing room
- Clear hierarchy
- Scannable in under 3 seconds
- Editorial, not dashboard-like
- Feels safe to think out loud
- Everything should feel:
  - creator-native
  - confident
  - human

#Expected Output
- Sample placeholder content added to:
  - Your Creative Blueprint
  - Brainstorming chat area
- Clear visual hierarchy
- No logic changes
- No layout refactors
*/

#Generate page
/*
#GOAL
- Refine the "Generate" page so it feels like scrolling a personalised TikTok-style idea feed.
This page should feel alive, conversational, and creator-native — not analytical or salesy.
- The Generate page surfaces content concepts tailored to the creator’s:
    - Content Lanes
    - Formats
    - Recurring Series
    - Brand Fit
(from "Your Creative Blueprint" in Research)
- All changes are copy, naming, hierarchy, and light structural guidance only.
- Do NOT introduce new libraries or global styles.

#Constraints
- Do NOT change page-level layout or navigation
- Do NOT modify GeneratorNav
- Reuse existing Card, Badge, Tag, Button patterns
- Keep scroll behaviour intact
- Concepts should remain editable and persistent
- This page is guidance + inspiration, not instruction

#Tasks
##"Concept Feed" section
- Rename “Concept Feed” to “Your Idea Stream” or something similar but relate to personal touch
- Subtitle: “Fresh ideas made for you, tuned to your creative blueprint.”
- Intent:
    - Feels like a feed, not a results page.
    - Less ‘viral chasing’, more ‘this feels like you’.
    - Replicate the vibe of "For You" page of TikTok

- "Creator Spotlight"
    - each Creator Spotlight should surface information in a calm, low-pressure, scannable way
    - Rename Creator Spotlight to the actual concept name as the primary headline. It needs to be short, evocative, human
        - Example: instead of "Creator Spotlight #1", change to "Busy Girl Beach Reset"
    - Keep the timing (e.g. 2 mins watch), which acts as the expected time to film the content. Consider adding the level of difficulty based on previous users' performance (easy, medium and difficult and colour code as green, yellow and red)
    - Tags and Filters
        - All tags inside each Creator Spotlight must align with
    "Your Creative Blueprint" terminology.
        - Replace Idea, Theme, Strategy and Brand with 
            - Content Lane
            - Format
            - Recurring Series (if applicable)
            - Brand Fit (optional)
        - These tags:
            - Act as visual metadata
            - Also act as filters
            - Must match Vibe Picker values on the left (changed the wording to "Your Creative Blueprint" to match with the Research page) 
        - Example tag row:
            - [Content Lane: Café hopping]
            - [Format: Camera-facing reflection]
            - [Recurring Series: Quiet Moments After 9PM]
    - Instead of presenting the whole sentence in the body (markdown) as "## Hook for clip 1 High-energy storyline about the creator's latest post paired with brand-safe takeaways.
        - Bullet one
        - Bullet two
        **CTA**: Drop your CTA copy here."
    it should have these sub-areas
        - Theme:
            - short descriptor
            - Example: “Soft reset energy with end-of-day reflection”
        - Why this hits: 
            - give users the reason why this video will perform well for them
            - Example bullets:
                - Reset-style content is trending
                - Aesthetic B-roll = high save potential
                - Relatable burnout → calm payoff
        - Hook Options: 
            - short, bold, skimmable list. Note that this is only the suggestion, users can change based on their own style and preference
            - Example
                - “POV: you finally logged off”
                - “This reset fixed my mood”
                - “Come reset with me”
        - Storyboard: 
            - high-level beats only. No over-directing
            - Example
                - Arrival at beach
                - Quiet walk B-roll
                - One reflective line to camera
                - Sunset close
        - CTA Ideas: 
            - Optional, soft suggestion (depending on the context of the videos, if it's related to brand sponsors, campaigns or community encouragement)
            - Example
                - “Save for later”
                - “Which reset should I do next?”
                - “Comment ‘reset’”
        - Suggested Brand Fit (Optional)
            - only show if relevant. Give the reason why this content might draw those brands' attention
            - Example: "“Would naturally align with: Lululemon and WhiteFox because ...”
    - Apply this structure to all following "Creator Spotlight" concepts (i.e. "Creator Spotlight #2", "Creator Spotlight #3", etc)

##"Thought Process"
- Rename "Thought Process" into "Your Creative Notes"
- Subtitle: "Think out loud, I'm listening"
- Intent: This is a living feedback loop, not a form. This panel serves 3 purposes
    1. A place for creators to dump thoughts while scrolling
    2. A chat space to tweak or question a concept
    3. Signal input for the agent to learn creator preferences
- Instruction Above User Input: Replace the existing copy with something like "Jot reactions, tweak ideas, ask questions — I’ll use this to shape what comes next."
- Example User Inputs:
    - “This feels too polished”
    - “Can we make this more chaotic?”
    - “Should I wear gold or silver jewellery?”
    - “I like the idea but not the hook”
- Example AI Response Tone: 
    - Friendly, collaborative, creator-to-creator
    - “Gold works better here — it catches light in sunset shots.
I’ll lean more into that soft-glow aesthetic for the next idea.”

#Tone & Vibe Rules
- Conversational, not instructional
- Confident but gentle
- No buzzwords
- No growth-hacking language
- Feels like a creative partner, not an algorithm

#Expected Output
- “Concept Feed” renamed to “Your Idea Stream”
- Tags aligned with Your Creative Blueprint
- Concept cards feel skimmable, inspiring, low-pressure
- Right panel "Thought Process" (changed to "Your Creative Notes") feels like a creative buddy + memory system
- No breaking layout or logic changes
*/

Follow-Up Prompt
/*
#GOAL
- Update the Generate page so each Concept Drop shows its core creative details by default — without requiring users to click “Edit”.
- Creators should be able to understand, react to, and feel inspired by an idea within 2–3 seconds of scrolling.
- Editing remains available, but discovery comes first. Currently the concept structure (Why this hits, Hook Options, Storyboard, etc) only appears inside Edit mode. Each concept should surface
    - High-signal inspiration upfront
    - Deeper detail progressively
    - Edit mode only for customization

#Task
- By default (visible without clicking the Edit button), show these following sections inline inside each concept (apart from Concept Name and Theme already presented). These should be read-only, visually calm and clearly part of the feed experience
    - “Why this hits” (2–3 short bullets max)
    - 2–3 Hook options (stacked, lightweight)
    - Summary Storyboard to get users a feel-alike
- When the user click the Edit button, expand the concept (inline, not modal) and reveal
    - Full storyboard
    - CTA ideas (if applicable)
    - Suggested brand fit
    This expansion should:
    - Push content downward naturally
    - Preserve scroll context
    - Feel like unfolding a thought, not opening a form
    Note that editing should NOT be required to understand the idea and should feel secondary when users want to manually edit themselves, including copy tweaks, hook reqrites and for personal notes

#Visual Guidance
- Use spacing + typography hierarchy to separate:
  - “Why this hits”
  - “Hooks”
  - “Storyboard”
- Avoid heavy borders or background changes
- Use subtle dividers or opacity shifts only if needed
- Keep the feed breathable

#Tone Principle
Scrolling the Generate page should feel like: “I’m discovering ideas made for me” NOT “I need to open this to see what it is”

#Expected Output
- Creators understand the idea instantly
- Clicking Edit feels optional, not mandatory
- Feed feels rich, alive, and skim-friendly
- No layout breakage
- No new components or libraries
*/


#Plan Page
/*
#CONTEXT
- The Plan page currently allows users to schedule starred concepts via a calendar (left) and a list of saved/starred content (right).
- The structure is correct. This task enhances interaction, guidance, and clarity — NOT a redesign.

#GOAL
Transform the Plan page into a creator-friendly scheduling space that:
- Feels intuitive and low-effort
- Encourages better posting decisions
- Gently suggests timing + content fit
- Never over-promises performance

#Tasks
##1. Drag and Drop Scheduling
- Allow users to drag starred content cards directly onto the calendar
- Dropping a card on a date schedules it immediately
- Preserve existing “Reschedule” button as:
  - Secondary
  - Accessibility fallback
  - Keyboard / non-drag option
- DO NOT remove the button.

##2. Starred Content Section
- The right-hand list should ONLY display concepts the user has starred in the Generate page. 
- Ensure the following information is presented in each idea card
  - Concept Title
  - A one-line, creator-friendly short Summary (e.g. A calm night reset vlog with cafe visual)
  - Tags (compact chips)
    - Content Lane
    - Format
    - Recurring Series (if any)
    - Brand Fit (optional)
accurately reflect the actual generated concepts
- Next to the Concept Title and status (Scheduled or Unplanned), replace the "Edit" button icon with a small inline, subtle icon buttons for users to
    - Upload Video
    - Generate with Veo   
- No placeholder or random concepts

##3. AI Suggestions (Soft Guidance)
- Replace the looped circle icon next to “Reschedule” button with“Suggestion” icon (sparkle / clock / insight-style)
- On click, show a dropdown / popover (NOT modal) containing:
  - Suggested posting window (e.g. “Best around 7–9pm”)
  - Suggested day fit (e.g. “Performs better mid-week”)
  - Suggested frequency if it's a recurring series
  - Short reasoning (muted text)
  “Based on your formats + past saves”
- Tone:
    - Advisory, not predictive
    - No guarantees
    - No hard metrics

#UX Principles and Layout Rules
- Suggestions should feel optional
- Drag & drop should feel playful, not technical
- Information should reduce thinking, not add pressure
- Everything is editable, nothing is forced
- Keep existing two-column layout:
  - Calendar (left)
  - Starred content list (right)
- No new design systems
- Use existing spacing, cards, and components
- Mobile:
  - Stack naturally
  - Drag interaction degrades gracefully

#Expected Output
- Users can drag ideas onto the calendar effortlessly
- Each idea is recognizable at a glance
- AI suggestions feel like a friendly nudge
- Page feels calm, supportive, and creator-first
- Code remains modular and future-ready (uploads, Veo, analytics)

DO NOT refactor unrelated logic.
DO NOT introduce hard-coded performance claims.
*/

Follow-up prompt
/*
#CONTEXT
After implementing AI Suggestions on the Plan page, the current UI shows:
- An extra icon still appearing next to the Reschedule button
- The AI Suggestions trigger rendered on the LEFT side of the content card
- This creates visual crowding and breaks the intended action hierarchy.
- This task is a UI cleanup + intent clarification. NO new logic. NO new features.

#GOAL
Refine the content card actions so:
- AI Suggestions feel like a contextual, optional insight
- Primary actions remain clear and uncluttered
- Visual hierarchy feels calm and intuitive

#TASK
##1.REMOVE REDUNDANT ICON
- Remove the existing standalone icon that appears next to the right of the Reschedule button
- There should NOT be two adjacent icons competing for attention

##2. AI Suggestions button
- Place the AI Suggestions trigger on the RIGHT side of the action row
- Align it visually with the Reschedule button and "Publishing Date"
- Remove the text label "Suggestions"; instead, use icon-only affordance. The magic-wand-style sparkle icon itself should clearly imply insight, recommendation and timing hint. Avoid over-explaining.
- Clicking the icon reveals the AI suggestion popover, which should:
  - Anchor to the icon
  - Appear to the left or below (space-aware)
  - Contain the same soft guidance copy as before
- No modal. No full-width expansion.

#UI Principles
- Reduce visual noise
- Right-side = actions & controls
- Left-side = content & memory
- Icon over text for secondary insights
- Calm and clever

#Expected Output
- Clean action row
- One clear AI Suggestions icon on the right
- No redundant icons
- Better spacing and breathing room
- The card feels lighter and easier to scan

DO NOT:
- Add explanatory text
- Add tooltips unless already supported
- Change scheduling logic
*/

#Profile Page
/*
#CONTEXT
- This Profile page appears AFTER an AI conversational onboarding flow. The system has already:
    - Spoken with the creator to understand their goals, personality, vision
    - Analysed their TikTok account (with consent)
    - Scraped basic video metadata + thumbnails (future-ready)
- This page is NOT an analytics dashboard. It is a creator-facing identity + direction page. Think it like “Your creative mirror + north star.”
- DO NOT redesign the entire page.
- DO NOT add heavy metrics, charts, or dense copy.

#GOAL
- Evolve the Profile page from a static summary into a:
    - Clear creator identity snapshot
    - Light strategic guide
    - Emotionally affirming, conversational experience
- Tone:
    - Bold, warm, human, creator-friendly.
    - Short sentences. No jargon. No corporate language.

#TASK
#1. Account/Profile Header
- Keep the current layout and structure, which includes
    - Cover background
    - Avatar
    - Name, TikTok handle, follower count
    - Short bio paragraph
- Update the bio copy logic to enrich its meaning
    - Auto-generated from onboarding conversation + TikTok presence
    - Written like a creator bio, not a CV
    - 1–2 sentences max
    - Example vibe: “A fashionista turning everyday routines into calm and soft stories.”

##2. Creative DNA (Identity, not tags)
- Keep this as a distinct card. Replace simple labels with narrative framing. This section answers: “What kind of creator am I?”
- This section includes
    - Creator Type
        - One strong identity phrase
        - Example: “Calm Visual Educator”, “Relatable Lifestyle Storyteller”
    - Audience Personas
        - 2–3 groups their content resonates with most
        - Written like humans, not demographics
        - Example: “Aesthetic lovers”, “Quiet environment creatives”
    - Content Style/Taste
        - Why people follow them
        - Example traits: aesthetic framing, doodle overlays, soft pacing, bubbly sound design
    - Personality 
        - 3–5 traits
        - Friendly, curious, warm, thoughtful, etc.
        - Chips / badges are fine
- Keep copy light and scannable. Avoid paragraphs.

##3. Goals
- This section should feel like a creaive direction, NOT a task list
- Replace the current Goals content with
###1. Personal Brand Vision
    - One clear purpose statement
    - Example: “Showing fashion in a way that feels friendly and real through personalised animations and colours.”
###2. Target Audience
    - Who they are creating for right now
    - Short phrases, not bullet-heavy
###3. Current Stage vs Desired Direction
    - Gentle progress framing with a progress bar
    - Example: “Strong engagement, still growing reach.”
###4. Core Video Messages
    - 2–4 recurring ideas they communicate through content
    - Example: “Your life doesn’t have to look polished to be worthy of being shared.”
###5. Tone of Voice
    - How their videos feel
    - Example: calm, honest, visually-led, conversational
###6. 30-90D Strategy
    - Short, bold, creator-friendly guidance
    - Example:
        - Double down on visual explainers
        - Introduce one recurring series
        - Test 2 new formats without pressure
###7. Your TikTok Videos
    - Show thumbnails of TikTok videos users have dropped and shared
    - If not, show placeholders

##4. Superpowers and Growth Zones
- Keep existing card layout, visual style and tone
- Enhance each pillar with
    - Number of videos produced in this area (light, optional)
    - Quick observational insight:
        - “Consistently strong”
        - “Underused but promising”
        - “Occasional off-track experiments”
- Avoid judgmental language.
- Frame Growth Zones as opportunity, not weakness.

#UI Principles
- Prefer short blocks over long paragraphs
- Speak like a creative partner, not a platform
- Avoid analytics-heavy wording
- Keep it calm, encouraging, editorial
- This page should feel reassuring, not demanding

#Expected Output
- Updated Profile page copy and structure
- Same components, richer meaning
- Clear creator identity
- Clear creative direction
- Still concise, breathable, and human
*/

#Follow-up Profile
/*
#Context
- The Profile page structure is correct, but visual balance, hierarchy, and content alignment need refinement.
- This task is about layout tuning, spacing, and copy calibration, NOT adding new data sources or features.
- Do NOT:
    - Rebuild the page from scratch
    - Remove existing sections
    - Introduce new libraries or design systems

#Goals
##1. Balance the lower three sections (Goals, Superpowes and Growth Zones)
- Currently, Goals is too tall and causes imbalance.
- On desktop (lg+):
    - Use a 3-column layout where each section stretches evenly to the bottom of the card.
    - Internal scrolling is allowed ONLY inside the Goals section if content overflows.
- On mobile: Sections remain stacked vertically (current behavior is fine).
- Layout guidance
    - Wrap the three sections in a grid container:
        - grid-cols-1 by default
        - lg:grid-cols-3 on desktop
    - Each section should use flex-col + justify-between where appropriate.
    - Avoid leaving large empty vertical gaps in Superpowers or Growth Zones.

##2. Restructure Goals Content to reduce vertical density
- Goals content should feel scannable, not essay-like.
- Group related items into compact blocks:
    - Core Vision (1–2 lines max)
    - Current Stage (progress bar stays)
    - Core Video Messages (limit to 3 short bullets)
    - Tone of Voice (chips only)
    - 30–90 Day Strategy (max 3 bullets)
- Move “Your TikTok Videos” to the bottom and visually compress it.

##3. Creative DNA card - fix visual hierarchy and consistency
- Improve readability and alignment with other cards (Goals / Superpowers / Growth Zones).

Required changes:
- Remove low-contrast grey heading styles.
- Ensure consistent typography scale:
    - Heading (e.g. Creator Type, Audience Personas) = strong, prominent
    - Subheading of Creator Type (a.k.a Calm Visual Educator in this case) is in bold
    - Descriptions (e.g. content style sentence) = body text in black

- Align spacing between subsections (Creator Type, Audience Personas, Content Style, Personality).

##Content
- This profile should NO LONGER feel like a “UI/UX designer dashboard”.
- Adjust copy to reflect:
    - Lifestyle / routines / calm productivity
    - Visual-first storytelling
    - Research → Generate → Plan workflow
- Replace overly technical language with creator-native phrasing.
- Keep tone calm, warm, and human — not analytical.

#Layout Rules
- Maintain existing Card, CardHeader, CardContent components.
- No visible borders between the three lower sections.
- Use spacing, alignment, and hierarchy instead of dividers.
- Match visual rhythm used in Research / Generate / Plan pages.

#Expected Outcome
- Goals, Superpowers, and Growth Zones align evenly and fill the card height.
- Creative DNA card feels clear, readable, and visually consistent.
- Page feels balanced, calm, and creator-first — not lopsided or dashboard-heavy.
- TSX remains valid, modular, and ready for future data integrations.

#Important
Trust existing layout structure.
Only refactor layout and copy where necessary to achieve balance and consistency.
*/

#Conversation Onboarding
/*
#GOAL
- Introduce a new AI Conversation (Onboarding) page that lives before the Profile page and feels like a calm, creator-first chat with a trusted peer.
- The conversation should help Solvi understand the creator’s personality, taste, goals, and creative patterns — without asking them to over-explain or fill forms.
- Build trust through reflection and validation, not interrogation.
- Seamlessly transition users from this conversation into the Profile page.
- Refine the Profile page so it visually balances content and reinforces trust with confirmation prompts

#CONTEXT
- The profile, Research, Generate and Plan pages are currently in place on subsequent folders within 'app' of 'src'
- Users should now land on an AI Conversation page first.
- This page should follow the same visual system (dark mode, soft gradients, calm pacing) but use an aesthetic, calming chat-style layout (similar to attached images).
- This is NOT a generic chatbot. It should feel creator-friendly, warm, and observant.

#TASK
##1. AI Conversation Onboarding Page
- Create a new route + folder (same level as profile/research/generate/plan), e.g. `/conversation`.
- Implement the following step-based conversational flow:
1. Welcome + Name
- Open with a friendly, peer-level message:
    - “Hey! Welcome to Solvi.”
    - “Before we make anything, I want to understand you.”
    - “What can I call you?”
- Single text input
- Helper text: “Nickname, real name, or your TikTok handle”
2. Taste Discovery
- New screen/state after name is submitted
- Title: “Your taste says everything”
- Message: “Drop 3 videos that feel most you. They can be yours or creators that inspire you.”
- Include an upload / drop video button
- No analytics language, no pressure
3. AI Reflection + Validation
- After videos are uploaded, show an AI-generated reflection block:
    - Tone
    - Energy
    - Format bias
    - Emotional texture (optional)
- Intro text: “Here’s what I’m picking up from your taste:”
- Ask a single validation question:
  - “Am I reading this right?”
- Response options:
    - Yes
    - Partially
    - Not really
- If Partially or Not really, prompt: “Tell me more”
- After response, follow up with:
    - “Nice. What else do you like?”
    - Options: Upload more videos / Send a message / Skip
4. Content Performance 
- Screen 1:
    - “Now drop 3 videos that performed best for you”
    - Upload button
- Screen 2:
    - “Want to look at what didn’t land?”
    - “Send me 3 videos you think might be holding you back”
    - Upload button
5. Processing State
- Full-screen loading state
- Subtle animation (hourglass flip, soft pulse, orbiting dot)
- Copy examples (can vary):
    - “Building your profile…”
    - “Connecting the dots…”
    - “Making sense of your creative chaos ✨”
6. Completion + Transition
- Friendly confirmation state with a calm, positive tone:
    - “Sorted.”
    - “Time to explore your own zone.”
- Add a smiley face and a thumbs up to confirm
- Auto-Navigate user to Profile page
##2. Profile Page
- Keep the current visual and look of the page
- Only slightly making some adjustments egarding content
1. Card Layout Balance
- Goals, SuperPowers, and Growth Zones cards must:
    - Have equal height on web
    - Align visually in a row
- Allow internal scrolling per card (especially Goals)
- Add a subtle scroll affordance (gradient fade, soft shadow, or indicator) to signal more content
- On mobile, cards can stack naturally with no scroll indicator required
2. Trust Validation Section
- Under the three cards, add a confirmation prompt:
    - “Does this feel accurate?”
    - “Was I close?”
- Response options:
    - Yes
    - Somewhat
    - Not really
- If Somewhat or Not really selected, prompt user: "Tell me more" and kindly auto update based on users input. Recheck with users again through prompt: "Have I got this right this time?" until they select "Yes"
- This is for trust-building, not correction

#VISUAL GUIDANCE
- Keep typography, spacing, and color consistent with Profile / Research / Generate / Plan
- Avoid dashboard-like density
- Avoid heavy borders
- Use spacing, hierarchy, and subtle dividers only
- Conversation should feel slow, intentional, and human

#TONE PRINCIPLE
The experience should feel like “I’m being understood by someone who gets creators”, NOT “I’m onboarding into a tool”

#EXPECTED OUTCOME
- Users feel welcomed and seen before seeing insights
- Profile page feels earned, not generated
- Cards feel visually balanced and intentional
- Validation reinforces trust and authenticity
- No new libraries or heavy components
- No layout breakage
*/


#Follow-Up To redesign Onboarding Page
/*
#CONTEXT
- Redesigning the onboarding experience into a conversational AI ('conversation' folder) chat page that lives alongside Profile, Research, Generate, and Plan.
- This is NOT a generic AI prompt box. The agent leads the conversation proactively, like a thoughtful creative partner.
- The goal is to understand the creator’s taste, strengths, gaps, and intent — then generate a validated Profile page.
- The visual language must match the existing workspace:
    - Calm
    - Creator-centric
    - Minimal
    - Breathable
    - Trust-building
- No dramatic color shifts, no chatbot gimmicks, no dashboard-style analytics. 
- Conversation replaces multi-screen onboarding. Messages stack vertically like a chat feed. Each system message waits for user input before continuing.

#GOAL
- Create a conversational onboarding chat that feels like a creative peer, not a form or survey
- Let the AI observe patterns, propose insights, and ask for validation before moving forward
- Build trust through “Here’s what I’m seeing — am I close?” moments
- Ensure all key Profile insights (Goals, Superpowers, Growth Zones) are validated BEFORE the Profile page renders (still showing those information in the Profile page)
- Remove the need for post-Profile validation prompts

#TASK
##1. Welcome & Naming
- System message:
    - “Hey — welcome to Solvi.”
    - “Before we make anything, I want to understand you.”
    - “What should I call you?”
- User response: Free text (nickname, handle, anything)
- Persist name in state for future messages.

##2. Taste Discovery (Inspiration Upload)
- System message with 
    - Title-style emphasis (still in chat): “Your taste says a lot.”
    - Body:
        - “Drop 3 videos that feel *most you*.”
        - “They can be yours — or creators that really inspire you.”
- UI Requirement
    - Inline upload/drop component inside chat bubble
    - Accept video files
    - Visually lightweight, not a full modal

##3. Taste Analysis + Validation
- System message: “Here’s what I’m picking up from your taste:” and then display read-only analysis blocks inside the chat:
    - Tone
    - Energy
    - Format bias
    - (Optional) Emotional texture
with Follow-up question: “Am I reading this right?”
- User actions (buttons):
    - Yes
    - Not really: If “Not really”
        - Prompt: “Tell me more about what you’re aiming for.”
        - Update the analysis inline
        - Ask for validation again until confirmed

##4. Best Performing Videos → Superpowers
- System message: “Now send me 3 videos that performed best for you.”
    - Upload UI (same pattern as above).
    - After upload, system responds with: “Here’s where you naturally shine.”
    - Display Superpowers analysis as chat blocks:
        - Topic clusters you’re strong in
        - Hook patterns that work
        - Reasons viewers stick around
        - Personal brand / emotional pull
    - Validation question: “Does this feel accurate?”
    - Buttons:
        - Yes: If Yes
            - “Nice. Anything else you think you perform well at?”
            - Optional upload (clearly marked as optional)
            - Skip option visible
        - No: If No
            - Ask why
            - Update analysis
            - Re-validate before proceeding

##5. Underperforming Videos for Growth Zones
- System message:
    - “Want to look at what didn’t land?”
    - “Drop 3 videos you feel held you back.”
    - Upload UI.
    - Provide response with Growth Zones blocks:
        - Weak hooks
        - Format mismatch
        - Audience confusion
        - Off-pillar content
        - Timing / lighting / sound issues
    - Validation question: “Was I close?”
        - If Yes:
            - Optional: “Want me to look at more?”
            - Upload or skip
        - If No:
            - Ask for clarification
            - Update analysis
            - Re-validate

##6. Goal Synthesis
- System message: “Based on everything so far, here’s what I think you’re working toward:”
    - Display proposed Goals as concise bullets:
        - Creative direction
        - Audience intent
        - Growth focus
    - Actions:
        - Confirm
        - Edit (inline editable state)
- Once user confirmed then proceed to the loading page as it is now

##7. Transition to Profile
- Loading state:
    - Calm animation (dot, pulse, hourglass-style)
    - Copy examples:
    - “Putting the pieces together…”
    - “Shaping your creative map…”
- Completion message:
    - “All set. Sorted”
    - “Welcome to your creative space.”
- Then route to Profile page.

#8. PROFILE PAGE ADJUSTMENT
- Remove any post-hoc validation UI (e.g. “Does this feel accurate?” under Goals/Superpowers/Growth Zones)
- Assume all insights are already confirmed during onboarding
- Profile should feel like a reflection, not a questionnaire

#VISUAL GUIDANCE
- Chat bubbles aligned with existing typography scale
- System messages visually distinct but subtle
- Inline cards for analysis (not heavy borders)
- Generous vertical spacing
- No sudden screen jumps — conversation unfolds naturally
- Mobile-first, but desktop feels intentional (centered feed, max-width)
- Change colour visual styling to match with other pages

#TONE PRINCIPLES
- Peer-level, never instructional
- Curious, warm, slightly playful
- Confident but humble (“Here’s what I’m seeing”)
- Creator-native language over analytics jargon

#EXPECTED OUTPUT
- A new chat-based onboarding route
- Proactive AI-led conversation
- Insight → validation → refinement loop
- Smooth transition into Profile
- Profile feels earned, accurate, and personal
- No additional libraries
- No disruption to existing workspace layout
*/

#Follow-up #2
/*
#CONTEXT
The onboarding chat page already exists, but the current implementation feels too form-like, button-heavy, and prematurely reveals analysis.
We need to refine interaction patterns, sequencing, and feedback loops so the experience feels frictionless, conversational, and trustworthy.

This is NOT a wizard.
This is NOT a chatbot that waits passively.
The agent leads, observes, proposes, waits for validation, then continues.

The goal is to make the flow feel like texting a thoughtful creative partner.

#GOAL
- Remove unnecessary friction (submit buttons, manual “continue” steps)
- Make keyboard-first interaction the default (Enter = send / proceed)
- Ensure analysis only appears AFTER a visible thinking/loading phase
- Enforce correct sequencing: Taste then validate then best-performing videos then validate then weakest videos then validate then proposed goal then confirm and finally transition
- Replace UI-state labels (“Reviewed”, “Selected”, “Validated”) with natural conversation
- Make the agent feel proactive, not reactive

#KEY INTERACTION RULES (GLOBAL)
- Pressing Enter submits the current user input (name, text, upload step)
- Buttons are secondary affordances, not required to proceed
- The agent should automatically ask the next question when a step completes
- No “Continue”, “Reviewed”, or status buttons unless strictly necessary for accessibility

#TASKS BY STEP

## 1. Name Input (Frictionless)
- Current issue: User must type name AND click a submit button
- Fix:
    - Allow users to type their name and press Enter to submit
    - On Enter:
        - Render their message in the chat
        - Immediately trigger the agent’s next message
    - Keep button optional or hidden on desktop; Enter should be primary

## 2. Uploading Taste Videos (Clear Visual Feedback)
- Current issue:
    - Users upload videos but don’t clearly see what’s been sent
    - Flow feels ambiguous before analysis
- Fix:
    - After each upload, render a compact visual preview:
        - Thumbnail
        - Filename or short label
        - Small “✓ Added” affordance
    - Display uploaded items inline inside the chat before analysis
    - Allow:
        - Enter key OR
        - “Analyse videos” button
    to proceed (both should trigger the same handler)


## 3. Analysis Loading State (No Premature Results)
- Current issue:
    - Analysis placeholders (Tone, Energy, Format Bias) appear immediately
    - Breaks trust and illusion of thinking
- Fix:
    - Introduce a dedicated loading phase:
        - Subtle animation (soft pulse, hourglass flip, dot breathing)
        - Copy examples:
            - “Looking for patterns…”
            - “Reading between the frames…”
    - While loading:
        - Do NOT render analysis values
        - Render skeleton placeholders only
    - Only render analysis blocks AFTER loading completes
    - Add placeholder copy inside blocks:
        - “Analysing tone…”
        - “Reading energy cues…”
        - “Detecting format patterns…”

## 4. Taste Validation Loop (Explicit + Conversational)
- After analysis renders, the agent must ask: “Am I reading this right?”
- User options:
    - Yes
    - Partially
    - Not really
If “Partially” or “Not really”:
- Reveal an inline text input with placeholder: “Tell me more”
- On Enter:
    - Update the analysis content
    - Re-render updated insight
    - Ask validation again
- Loop continues until user selects “Yes”
If “Yes”:
- Agent asks: “Want to add more videos to refine this?”
- Make it clear this is optional
- Options:
    - Upload more
    - Skip

## 5. Best Performing Videos → Superpowers (Correct Sequencing)
- Current issue:
    - Superpowers appear BEFORE users upload best-performing videos
    - Extra buttons like “Reviewed taste analysis” appear unnecessarily
- Fix:
    - Agent must explicitly ask: “Now send me 3 videos that performed best for you.”
    - Do NOT generate superpowers until uploads are complete
    - After upload:
        - Show loading state
        - Then render Superpowers analysis
    - Superpowers should include pseudo-analysis like:
        - “Strong hooks in the first 2 seconds”
        - “Consistent themes viewers return for”
        - “Clear emotional promise”
    - Validation by asking: “Was I close?” with Options:
        - Yes
        - No
If Yes:
- Agent asks: “Nice. What else do you perform well at?”
- Optional upload, skippable

If No:
- Ask “Tell me more”
- Update analysis
- Re-validate until Yes

Remove:
- “Continue”
- “Validated superpowers”
- “Selected superpower”
- Any review-state buttons


## 6. Least Performing Videos → Growth Zones
Agent asks:
- “Want to see what didn’t land?”
- “Send 3 videos that felt off or underperformed.”

Flow mirrors Superpowers:
- Upload then loading then analysis then validation

Growth Zones analysis should include hypotheses like:
- “Hooks don’t match the promise”
- “Format may not fit audience expectations”
- “Timing or pacing issues”

Validation question: “Was I close?”

Yes:
- Optional: “Want me to look at more?”
No:
- Ask why then update then re-validate


## 7. Goal Proposal (Agent-Led, Not User-Written)
- Current issue: User is asked to write their goal manually
- Fix:
    - Agent must propose goals automatically: “Based on everything so far, I think your goal is:”
    - Display 2–4 concise bullet points
    - Actions:
        - Confirm
        - Edit (inline editable state)
    - No freeform question asking users to invent goals from scratch.


## 8. Final Transition (Full-Screen, Calm, Affirming)
After goal confirmation:
- Show full-screen loading state
- Soft animation
- Copy examples:
    - “Connecting the dots…”
    - “Making sense of your creative chaos…”

Then show a short confirmation moment:
- “All set.”
- “Your creative space is ready.”

Automatically redirect to Profile page.


#UI & EXPERIENCE PRINCIPLES
- Chat should feel like texting, not completing steps
- Fewer buttons, more flow
- Enter key is the primary interaction
- Analysis should feel thoughtful, not instant
- Validation builds trust — do not skip it

#EXPECTED OUTPUT
- A smoother, keyboard-first conversational flow
- Clear visual feedback for uploads
- No premature insights
- Agent-led sequencing that matches the intended narrative
- Fewer UI controls, more conversation
- Onboarding feels human, confident, and intentional
*/
