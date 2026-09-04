def calculate_score(sub_scores, action_steps, trend, description=""):
    """
    Computes the final 0-100 composite score from the given sub-scores,
    determines the grade, and packages the final payload.
    """
    total_score = sum(signal["score"] for signal in sub_scores.values())

    if total_score >= 80:
        grade = "A"
        grade_desc = "Trustworthy"
    elif total_score >= 60:
        grade = "B"
        grade_desc = "Acceptable"
    elif total_score >= 40:
        grade = "C"
        grade_desc = "Caution"
    elif total_score >= 20:
        grade = "D"
        grade_desc = "Risky"
    else:
        grade = "F"
        grade_desc = "Avoid"

    # Ensure the single source of truth: the most recent trend data point
    # must always exactly match the calculated current score.
    if trend and len(trend) > 0:
        trend[-1] = total_score

    return {
        "score": total_score,
        "grade": grade,
        "grade_desc": grade_desc,
        "dpdp_compliant": sub_scores["compliance"].get("compliant", False),
        "signals": sub_scores,
        "action_steps": action_steps,
        "trend": trend,
        "description": description
    }
