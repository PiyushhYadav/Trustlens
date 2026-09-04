DEMO_PLATFORMS = {
    "zomato": {
        "description": "India's largest food delivery platform, serving 300M+ orders across 1,000+ cities.",
        "sub_scores": {
            "policy": {"score": 18, "max": 20, "summary": "Clear data retention limits and minimal sharing."},
            "breach": {"score": 25, "max": 30, "summary": "One minor breach in 2021; well-handled."},
            "compliance": {"score": 18, "max": 20, "summary": "Fully DPDP Compliant", "compliant": True},
            "complaint": {"score": 12, "max": 15, "summary": "Low volume of privacy complaints."},
            "tracker": {"score": 10, "max": 15, "summary": "4 trackers detected (mostly analytics)."}
        },
        "action_steps": [
            "Opt out of personalized ads in the privacy settings.",
            "Review your saved payment methods."
        ],
        "trend": [70, 71, 72, 75, 76, 78, 80, 80, 81, 82, 83, 83]
    },
    "swiggy": {
        "description": "Leading on-demand delivery platform for food, groceries, and essential services.",
        "sub_scores": {
            "policy": {"score": 17, "max": 20, "summary": "Strong consent management."},
            "breach": {"score": 30, "max": 30, "summary": "No recorded breaches."},
            "compliance": {"score": 18, "max": 20, "summary": "Fully DPDP Compliant", "compliant": True},
            "complaint": {"score": 13, "max": 15, "summary": "Very few privacy complaints."},
            "tracker": {"score": 12, "max": 15, "summary": "3 trackers detected."}
        },
        "action_steps": [
            "Enable push notification limits.",
            "Request a copy of your account data for review."
        ],
        "trend": [80, 80, 81, 82, 85, 86, 88, 89, 90, 90, 90, 90]
    },
    "instagram": {
        "description": "Global photo and video sharing social networking service owned by Meta.",
        "sub_scores": {
            "policy": {"score": 10, "max": 20, "summary": "Vague third-party data sharing language."},
            "breach": {"score": 24, "max": 30, "summary": "No major recent breaches, but massive scraping incidents."},
            "compliance": {"score": 8, "max": 20, "summary": "Non-Compliant with some DPDP clauses", "compliant": False},
            "complaint": {"score": 7, "max": 15, "summary": "High volume of tracking and ad-related complaints."},
            "tracker": {"score": 3, "max": 15, "summary": "12 trackers detected sharing data with brokers."}
        },
        "action_steps": [
            "Disable ad personalization in Instagram settings.",
            "Revoke third-party app permissions.",
            "Turn on two-factor authentication."
        ],
        "trend": [61, 60, 59, 58, 55, 55, 54, 54, 53, 53, 52, 52]
    },
    "byjus": {
        "description": "Multinational educational technology company offering highly personalized learning programs.",
        "sub_scores": {
            "policy": {"score": 5, "max": 20, "summary": "Indefinite data retention clauses found."},
            "breach": {"score": 15, "max": 30, "summary": "Multiple data exposure incidents in recent years."},
            "compliance": {"score": 5, "max": 20, "summary": "Fails DPDP erasure and retention requirements", "compliant": False},
            "complaint": {"score": 5, "max": 15, "summary": "Extremely high complaints regarding spam and data misuse."},
            "tracker": {"score": 8, "max": 15, "summary": "8 trackers detected."}
        },
        "action_steps": [
            "Request immediate account deletion if unused.",
            "Revoke access to microphone and camera in device settings.",
            "Opt-out of telemarketing via DND registry."
        ],
        "trend": [50, 48, 45, 42, 40, 39, 39, 39, 38, 38, 38, 38]
    },
    "aarogya setu": {
        "description": "Indian COVID-19 contact tracing, syndromic mapping and self-assessment digital service.",
        "sub_scores": {
            "policy": {"score": 20, "max": 20, "summary": "Strict data minimization and sunset clauses."},
            "breach": {"score": 30, "max": 30, "summary": "No breaches. Data is encrypted and anonymized."},
            "compliance": {"score": 20, "max": 20, "summary": "Fully DPDP Compliant", "compliant": True},
            "complaint": {"score": 14, "max": 15, "summary": "Very few complaints, mostly tied to GPS requirement confusion."},
            "tracker": {"score": 12, "max": 15, "summary": "3 official govt analytics trackers detected, zero commercial brokers."}
        },
        "action_steps": [
            "Keep the app updated to the latest version.",
            "Data automatically deletes after 30 days."
        ],
        "trend": [95, 95, 96, 96, 96, 97, 98, 98, 99, 99, 100, 100]
    },
    "paytm": {
        "description": "Leading Indian multinational financial technology company specializing in digital payments.",
        "sub_scores": {
            "policy": {"score": 14, "max": 20, "summary": "Extensive data sharing with financial partners."},
            "breach": {"score": 22, "max": 30, "summary": "Minor third-party vendor leaks in the past."},
            "compliance": {"score": 8, "max": 20, "summary": "Non-compliant: Fails consent clauses for data sharing.", "compliant": False},
            "complaint": {"score": 10, "max": 15, "summary": "Moderate volume of telemarketing complaints."},
            "tracker": {"score": 8, "max": 15, "summary": "7 trackers detected (analytics and ad networks)."}
        },
        "action_steps": [
            "Opt out of promotional communications.",
            "Review connected third-party apps."
        ],
        "trend": [68, 67, 65, 62, 60, 60, 61, 62, 63, 63, 62, 62]
    },
    "flipkart": {
        "description": "Prominent Indian e-commerce company, headquartered in Bengaluru, providing a massive retail marketplace.",
        "sub_scores": {
            "policy": {"score": 16, "max": 20, "summary": "Clear policy, but broad affiliate sharing."},
            "breach": {"score": 30, "max": 30, "summary": "No recorded breaches."},
            "compliance": {"score": 18, "max": 20, "summary": "Fully DPDP Compliant", "compliant": True},
            "complaint": {"score": 12, "max": 15, "summary": "Low privacy complaints, mostly order-related."},
            "tracker": {"score": 10, "max": 15, "summary": "5 trackers detected (marketing focus)."}
        },
        "action_steps": [
            "Manage ad preferences in account settings.",
            "Limit location sharing to 'While Using'."
        ],
        "trend": [82, 82, 83, 84, 85, 85, 86, 87, 88, 88, 89, 89]
    }
}
