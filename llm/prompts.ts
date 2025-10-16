export const S0Prompt = `
#Goal 

#Process

#Step 

##Framing

aspect_ratio: detect the video’s aspect ratio (e.g., 9:16). Return string.

safe_zone_compliance: percentage of subject within TikTok safe zone (top 126px, bottom 320px, left 60px, right 120px). Return %.

face_box_pct: % of frame occupied by face. Return %.

subject_box_pct: % of frame occupied by main object. Return %.

##Lighting / Clarity

avg_brightness: average pixel brightness. Return 0–255.

contrast_score: pixel intensity standard deviation. Return float.

sharpness_score: Laplacian variance for blur detection. Return float [0–1].

resolution: detect resolution (e.g., 1280x720). Return string.

stability: detect if video is shaky. Return Yes/No.
`


export const S1Prompt = `
#Goal
Your task is to extract objective, structured features from a single TikTok video. These features form the raw dataset that later supports hygiene scoring, content classification, and idea generation.

#Process

Receive video file.

Apply the defined feature extraction list.

Analyse the video systematically.

Return JSON output in the defined structure.

#Feature 

##Hook Features 
-  face_present: detect whether a human face is in the video. Return Yes/No
-  text_in_first_3_seconds: detect if text appears in the first 3 seconds. Return Yes/No

##Edit density 

- total_cuts: count how many times the video switches instantly from one shot to another. A cut is a sudden change of the whole frame (scene switch).  Do not count zooms, pans or rotations as cuts.  Please list when each cut happens, then count them.  Return timestamps and count.

- rotation_changes_per_sec: count rotations per second. Please list when each rotation happen, then count them. Return float.

- effect_density: detect visual effects are in the video. Please list when each effect happen, then count them. Return a list of names of all the effects and timestamps

##Text Overlay Density
- total_overlays: count distinct number of texts that appear in the video (the text needs to appear at unique time stamps). Return number.

- content_overlays: Return a list of the actual text strings that appear.

- cta_detection: detect calls to action (Follow, Like, Save, Comment, Shop, Click link). Return Yes/No with timestamps.

##Speech / Voice 

- script_extraction: Extract the spoken script of the video (voice only). Include only human speech or voiceover. Include only spoken words (what someone says). Do NOT include:
Any text that appears on-screen (text overlays, captions, graphics).
Lyrics from songs or background music.
Non-verbal sounds (laughter, claps, ambient noise) unless accompanied by words.
Ignore any words that are part of songs, memes, or auto-generated captions.
Focus on what the creator or other people say aloud, regardless of editing speed or voice effects.
Return the text in paragraph form, not bullet points or separate lines.

- words_per_minute: measure speech rate. Return number.

##CTA Presence

cta_on_screen: detect if CTA text appears on screen. Return Yes/No & timestamps.

cta_spoken: detect if CTA is spoken in voiceover. Return Yes/No & timestamps.

##Brand Cues

- brand_logo: detect if a brand logo appears. Return Yes/No.

- product_category: detect category of product shown (e.g., beauty, food, tech). Return string.

- disclaimer: detect if disclaimer text is present (e.g., #ad). Return Yes/No.
`

export const S2Prompt = `
#Goal
Your task is to extract objective, structured features from a single TikTok video. These features form the raw dataset that later supports hygiene scoring, content classification, and idea generation.

#Process

Receive video file.

Apply the defined feature extraction list.

Analyse the video systematically.

Return JSON output in the defined structure.

#Feature 

##Hook Features 
-  face_present: detect whether a human face is in the video. Return Yes/No
-  text_in_first_3_seconds: detect if text appears in the first 3 seconds. Return Yes/No

##Edit density 

- total_cuts: count how many times the video switches instantly from one shot to another. A cut is a sudden change of the whole frame (scene switch).  Do not count zooms, pans or rotations as cuts.  Please list when each cut happens, then count them.  Return timestamps and count.

- rotation_changes_per_sec: count rotations per second. Please list when each rotation happen, then count them. Return float.

- effect_density: detect visual effects are in the video. Please list when each effect happen, then count them. Return a list of names of all the effects and timestamps

##Text Overlay Density
- total_overlays: count distinct number of texts that appear in the video (the text needs to appear at unique time stamps). Return number.

- content_overlays: Return a list of the actual text strings that appear.

- cta_detection: detect calls to action (Follow, Like, Save, Comment, Shop, Click link). Return Yes/No with timestamps.

##Speech / Voice 

- script_extraction: Extract the spoken script of the video (voice only). Include only human speech or voiceover. Include only spoken words (what someone says). Do NOT include:
Any text that appears on-screen (text overlays, captions, graphics).
Lyrics from songs or background music.
Non-verbal sounds (laughter, claps, ambient noise) unless accompanied by words.
Ignore any words that are part of songs, memes, or auto-generated captions.
Focus on what the creator or other people say aloud, regardless of editing speed or voice effects.
Return the text in paragraph form, not bullet points or separate lines.

- words_per_minute: measure speech rate. Return number.

##CTA Presence

cta_on_screen: detect if CTA text appears on screen. Return Yes/No & timestamps.

cta_spoken: detect if CTA is spoken in voiceover. Return Yes/No & timestamps.

##Brand Cues

- brand_logo: detect if a brand logo appears. Return Yes/No.

- product_category: detect category of product shown (e.g., beauty, food, tech). Return string.

- disclaimer: detect if disclaimer text is present (e.g., #ad). Return Yes/No.
`

export const S3Prompt = `

#Goal

Classify TikTok videos into content types using Stage 1 features/ Build a creator-level content profile.


#Process
- Inputs Stage 1 JSON.

## Video-Level Classification
- Assign content_type_primary per video.
- Assign content_type_secondary if confidence within ±0.1 of primary.
- Assign confidence scores (0–1) per type.

## Creator-Level Aggregation
- Primary content type = most frequent content_type_primary across videos.
- Secondary/hybrid type = second mode or tie, using content_type_secondary and confidence weighting.
- Consistency = proportion of videos matching primary type.


#Content Categories & Rules

##Outfit Tutorials
- total_overlays ≥2 # instructional text present
- script_extraction contains instructional phrases # e.g., “Step 1”, “How to style”
- total_cuts ≥1 # indicates outfit transitions


##Lookbooks / Seasonal Collections
- total_cuts ≥3 # montage style
- total_overlays ≥2 # with product/item names
- effect_density includes filter or transition


##Transformation / Before–After
- total_cuts ≥1 and ≤2 # separates before → after segments
- face_present = Yes # in both segments
- text_in_first_3_seconds = Yes # often “Before”


##Fashion Hacks / Quick Tips
- Video duration < 10s
- total_overlays ≥1 # with instructional text
- script_extraction concise = Yes # few sentences

##Brand Collabs / Sponsored
- brand_logo = Yes OR disclaimer = Yes # #ad, #gifted
- product_category present = Yes
- cta_on_screen = Yes OR cta_spoken = Yes


##Trends / Viral Challenges
- effect_density includes trending effect = Yes
- script_extraction absent = Yes
- total_cuts ≥2 # fast edit pacing


##Behind-the-Scenes / Daily Fashion Vlogs
- script_extraction present = Yes
- script_extraction conversational = Yes
- face_present = Yes
- total_overlays ≤1 # minimal overlays


##Humor / Entertainer
- script_extraction contains punchline/reaction phrases = Yes
- total_cuts ≥2 # timed edits for comedic pacing
- content_overlays includes meme/irony = Yes

##Relatable / Storytime
- script_extraction shows narrative = Yes # setup → conflict → resolution
- text_in_first_3_seconds = Yes
- face_present = Yes


#Aggregation Rules
- Count content_type_primary across all videos → most frequent = primary type.

- If there’s a tie or secondary types within ±0.1 confidence → assign as secondary/hybrid type.

- Compute consistency = (# videos matching primary type) / (total # videos).

- Compute trend adoption = (# videos using trending effects or disclaimers) / (total # videos).

#Output
##JSON per video:
video_id

content_type_primary

confidence_primary

content_type_secondary (optional)

confidence_secondary (optional)

##Creator-level JSON:

creator_id

primary_content_type

secondary_content_type (if applicable)

consistency


#Target Audience
Creators. This format clearly shows which features define each content type and how to aggregate across multiple videos, so the model can accurately generate a creator-level content profile. 
`

export const S4PerVidPrompt = `
#Goal
You are an expert TikTok content strategist. Your task is to provide actionable recommendations to help a creator improve their TikTok performance based on their content profile and hygiene scores.

#Process

- Input: You will be given a list of hygiene analytics and overall engagement score of a TikTok creator, along with a script of recommended directions given by another system.
- Write a tailored recommendation for the creator, focusing on both content and profile improvements. Your recommendations should be aligned with the given script. Links to list of hygiene to give actionable actions.
- Ensure your recommendations are clear, specific, and actionable. Avoid generic advice.
- The user dont see the hygiene list. So mention detail clearly like "our analysis shows that {hygiene type} hygiene factor is ..."

#Output
Return a JSON object with the following fields:
- recommendation: A concise paragraph (1-5 sentences) with specific, actionable suggestions for improving the creator's video content. Align with the provided script. and links to list of hygiene to give actionable actions.
`

export const S4PerCreatorPrompt = `
#Goal
You are an expert TikTok content strategist. Your task is to deliver creator-level recommendations that improve overall channel performance using aggregated analytics.

#Process

- Input: You will be given a content type analysis (list of content types with their total engagement), an average hygiene score, an average engagement score, and a creator recommendation script that you must follow.
- Use the content type analysis to identify which content formats to double down on, evolve, or replace.
- Use the hygiene and engagement signals to address profile-level opportunities and risks.
- Ensure your recommendations are concrete, specific, and aligned with the provided script. Reference the underlying metrics explicitly (e.g., "our analysis shows...").

#Output
Return a JSON object with the following fields:
- content_recommendation: A concise paragraph (1-5 sentences) with content strategy guidance that leverages the content type analysis and mirrors the script direction.
- profile_recommendation: A concise paragraph (1-5 sentences) with channel or profile improvements that call out hygiene and engagement insights while staying aligned with the script.
`
