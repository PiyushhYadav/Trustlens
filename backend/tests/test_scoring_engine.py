"""
backend/tests/test_scoring_engine.py

Unit tests for TrustLens scoring engine.
Verifies score calculations, grading bands, bounds clamping,
trend generation, and DPDP compliance signals.
"""

import pytest
from backend.scoring_engine import calculate_score


def _make_sub_scores(breach=20, policy=15, compliance=18, complaint=10, tracker=12):
    return {
        "breach": {
            "score": breach,
            "max": 30,
            "summary": "Breach test summary",
            "source": "test",
            "verified": True,
        },
        "policy": {
            "score": policy,
            "max": 20,
            "summary": "Policy test summary",
            "source": "test",
            "verified": True,
        },
        "compliance": {
            "score": compliance,
            "max": 25,
            "summary": "Compliance test summary",
            "source": "test",
            "verified": True,
            "compliant": True,
            "issues": [],
        },
        "complaint": {
            "score": complaint,
            "max": 15,
            "summary": "Complaint test summary",
            "source": "test",
            "verified": True,
        },
        "tracker": {
            "score": tracker,
            "max": 15,
            "summary": "Tracker test summary",
            "source": "test",
            "verified": True,
        },
    }


class TestGradeThresholds:
    def test_grade_a(self):
        # 25 + 18 + 22 + 12 + 13 = 90 -> Grade A
        sub = _make_sub_scores(breach=25, policy=18, compliance=22, complaint=12, tracker=13)
        res = calculate_score(sub, [])
        assert res["grade"] == "A"
        assert res["grade_desc"] == "Trustworthy"
        assert res["score"] >= 80

    def test_grade_b(self):
        # 20 + 12 + 15 + 8 + 10 = 65 -> Grade B
        sub = _make_sub_scores(breach=20, policy=12, compliance=15, complaint=8, tracker=10)
        res = calculate_score(sub, [])
        assert res["grade"] == "B"
        assert res["grade_desc"] == "Acceptable"
        assert 60 <= res["score"] < 80

    def test_grade_c(self):
        # 12 + 8 + 12 + 6 + 7 = 45 -> Grade C
        sub = _make_sub_scores(breach=12, policy=8, compliance=12, complaint=6, tracker=7)
        res = calculate_score(sub, [])
        assert res["grade"] == "C"
        assert res["grade_desc"] == "Caution"
        assert 40 <= res["score"] < 60

    def test_grade_d(self):
        # 8 + 5 + 8 + 4 + 5 = 30 -> Grade D
        sub = _make_sub_scores(breach=8, policy=5, compliance=8, complaint=4, tracker=5)
        res = calculate_score(sub, [])
        assert res["grade"] == "D"
        assert res["grade_desc"] == "Risky"
        assert 20 <= res["score"] < 40

    def test_grade_f(self):
        # 2 + 2 + 2 + 2 + 2 = 10 -> Grade F
        sub = _make_sub_scores(breach=2, policy=2, compliance=2, complaint=2, tracker=2)
        res = calculate_score(sub, [])
        assert res["grade"] == "F"
        assert res["grade_desc"] == "Avoid"
        assert res["score"] < 20


class TestScoreClamping:
    def test_sub_score_cannot_exceed_max(self):
        sub = _make_sub_scores()
        sub["breach"]["score"] = 999  # max is 30
        res = calculate_score(sub, [])
        assert res["signals"]["breach"]["score"] == 30

    def test_sub_score_cannot_be_negative(self):
        sub = _make_sub_scores()
        sub["tracker"]["score"] = -25
        res = calculate_score(sub, [])
        assert res["signals"]["tracker"]["score"] == 0

    def test_total_score_capped_at_100(self):
        sub = _make_sub_scores(breach=50, policy=50, compliance=50, complaint=50, tracker=50)
        res = calculate_score(sub, [])
        assert res["score"] == 100

    def test_total_score_floored_at_zero(self):
        sub = _make_sub_scores(breach=-10, policy=-10, compliance=-10, complaint=-10, tracker=-10)
        res = calculate_score(sub, [])
        assert res["score"] == 0


class TestPayloadStructure:
    def test_required_payload_keys(self):
        res = calculate_score(_make_sub_scores(), [])
        expected_keys = {
            "score",
            "grade",
            "grade_desc",
            "dpdp_compliant",
            "signals",
            "action_steps",
            "trend",
            "description",
            "sources",
            "analyzed_at",
        }
        assert expected_keys.issubset(res.keys())

    def test_trend_generation(self):
        info = {"display_name": "TestPlatform", "category": "social"}
        res = calculate_score(_make_sub_scores(), [], platform_info=info)
        assert len(res["trend"]) == 12
        assert res["trend"][-1] == res["score"]

    def test_custom_trend_preserved(self):
        sub = _make_sub_scores()
        expected_total = sum(s["score"] for s in sub.values())
        custom_trend = [60, 62, 64, 65, 68, 70, 72, 73, 75, 76, 78, 90]
        res = calculate_score(sub, [], trend=custom_trend)
        # First 11 months are preserved, 12th is locked to current total_score
        assert res["trend"][:11] == custom_trend[:11]
        assert res["trend"][-1] == expected_total

    def test_sources_attribution(self):
        res = calculate_score(_make_sub_scores(), [])
        assert "sources" in res
        for signal_name in ("breach", "policy", "compliance", "complaint", "tracker"):
            assert signal_name in res["sources"]
            assert "source" in res["sources"][signal_name]
            assert "verified" in res["sources"][signal_name]


class TestActionStepsAndAlternatives:
    def test_explicit_action_steps(self):
        actions = ["Turn off location tracking", "Review privacy settings"]
        res = calculate_score(_make_sub_scores(), actions)
        assert res["action_steps"] == actions

    def test_auto_generated_action_steps(self):
        # When subscores are low, default action steps are generated
        sub = _make_sub_scores(tracker=4, policy=6, breach=10)
        res = calculate_score(sub, [])
        assert len(res["action_steps"]) > 0

    def test_safe_alternative_suggestion(self):
        # A platform in 'food' category with low score should suggest Swiggy
        sub = _make_sub_scores(breach=5, policy=5, compliance=5, complaint=5, tracker=5)
        info = {"display_name": "BadFoodApp", "category": "food delivery"}
        res = calculate_score(sub, [], platform_info=info)
        assert res["alternative"] is not None
        assert res["alternative"]["platform"] == "Swiggy"
