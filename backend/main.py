from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.demo_data import DEMO_PLATFORMS
from backend.scoring_engine import calculate_score
from backend.cache_manager import init_db, get_cached_score, set_cached_score
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

# Allow CORS for localhost and deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for the demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/score")
def get_score(platform: str):
    # Normalize input
    normalized_platform = platform.strip().lower()

    # 1. Check cache first
    cached_data = get_cached_score(normalized_platform)
    if cached_data:
        return cached_data

    # 2. Check explicitly hardcoded fast-path (Phase 1 / Demo Day logic)
    if normalized_platform in DEMO_PLATFORMS:
        demo_entry = DEMO_PLATFORMS[normalized_platform]
        
        # In Phase 1, we pass the mock sub-scores directly to the real engine
        final_result = calculate_score(
            sub_scores=demo_entry["sub_scores"],
            action_steps=demo_entry["action_steps"],
            trend=demo_entry["trend"],
            description=demo_entry.get("description", "")
        )
        
        # Cache the calculated payload
        set_cached_score(normalized_platform, final_result)
        return final_result

    # 3. Graceful missing state for unknown platforms
    return {
        "status": "pending",
        "message": "Live Analysis Pending",
        "platform": normalized_platform
    }
