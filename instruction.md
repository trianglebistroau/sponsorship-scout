ok i need you to rewrite for me the onboarding/conversation page logic, instead of using websocket to depending on langgraph backend, we will be using only 2, 


@app.post("/api/v1/onboarding/videos", response_model=AnalyzeVideosResponse)
async def analyze_onboarding_videos(request: AnalyzeVideosRequest):
    """
    Analyze a list of videos using the specified mode.

    Args:
        request: video_urls (list of TikTok/YouTube URLs or Gemini file IDs)
                 mode ("taste", "performance", or "low_performance")

    Returns:
        Plain-text analysis result from Gemini
    """
    if not request.video_urls:
        raise HTTPException(status_code=400, detail="video_urls must not be empty")

    try:
        result = await analyze_videos(request.video_urls, request.mode)
        return AnalyzeVideosResponse(mode=request.mode, analysis=result)
    except Exception as e:
        logger.error(f"Video analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")


@app.post("/api/v1/onboarding/profile", response_model=ProfileSynthesisResponse)
async def synthesize_creator_profile(request: ProfileSynthesisRequest):
    """
    Synthesize a CreatorProfileNew directly from pre-computed analysis data.
    Reuses the PROFILE_MODULE initialized at server startup.
    """
    if not request.username:
        raise HTTPException(status_code=400, detail="username must not be empty")
    if not request.taste_profile:
        raise HTTPException(status_code=400, detail="taste_profile must not be empty")

    if PROFILE_MODULE is None:
        raise HTTPException(status_code=503, detail="Profile synthesis module not initialized")

    try:
        taste_json = json.dumps(request.taste_profile)
        performance_json = json.dumps(request.performance_insights) if request.performance_insights else "{}"
        low_performance_json = json.dumps(request.low_performance_insights) if request.low_performance_insights else "{}"
        goal_json = json.dumps(request.creative_goal) if request.creative_goal else "{}"

        result = PROFILE_MODULE(
            username=request.username,
            taste_profile=taste_json,
            performance_insights=performance_json,
            low_performance_insights=low_performance_json,
            creative_goal=goal_json,
        )
        profile_dict = json.loads(result.creator_profile)
        profile = CreatorProfileNew(**profile_dict)
        return ProfileSynthesisResponse(username=request.username, profile=profile.model_dump())
    except Exception as e:
        logger.error(f"Profile synthesis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Profile synthesis failed: {str(e)}")

next we have a flow like this:
1. user gets to upload all 3 types of videos (  3 vids per types), taste, low and performance synotaniously, all these will be send to the backend to analyse 
2. while backend is analysing we can have a loading screen, waiting
3. until the analyse is finished, we need to send the new data back to the backend for profile, then when creating a new profile, transfer them back when they wanted

we will not be using any chatbot here, we just want a simple step to analyse users profile.
