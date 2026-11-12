"""
backend/tests/conftest.py

Shared pytest configuration and fixtures for TrustLens backend tests.
Sets up dummy Gemini API keys in the environment before any backend module is imported
to prevent missing-key errors in CI or offline testing.
"""

import os
import sys
from pathlib import Path

# Ensure dummy keys are set before any backend modules are imported
os.environ.setdefault("GEMINI_API_KEY", "AIzaSyDummyKeyForCITestingOnly")
os.environ.setdefault("GOOGLE_API_KEY", "AIzaSyDummyKeyForCITestingOnly")

# Add the repository root to sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
