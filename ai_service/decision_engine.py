from typing import Dict, Any, List

class DecisionEngine:
    """
    Transparent scoring engine for emergency priority and resource suitability.
    """
    @staticmethod
    def assess_priority(extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        score = 0
        factors: List[Dict[str, Any]] = []

        people_count = extracted_data.get('people_count', 1)
        if people_count > 1:
            score += 2
            factors.append({"factor": "Multiple people involved", "points": 2, "detail": f"{people_count} individuals"})
        else:
            factors.append({"factor": "Single individual involved", "points": 0, "detail": "1 individual"})

        injuries = extracted_data.get('injury_indicators', [])
        if injuries and injuries != ["None explicitly confirmed"]:
            score += 3
            factors.append({"factor": "Reported injuries", "points": 3, "detail": ", ".join(injuries)})

        if extracted_data.get('road_obstruction', False):
            score += 1
            factors.append({"factor": "Road obstruction", "points": 1, "detail": "Hazardous road blockage"})

        if extracted_data.get('fire_smoke', False):
            score += 2
            factors.append({"factor": "Fire / smoke alert", "points": 2, "detail": "Active fire threat"})

        if extracted_data.get('access_difficulty', False):
            score += 1
            factors.append({"factor": "Difficult rescue access", "points": 1, "detail": "Extrication tools required"})

        # Thresholds:
        # 0-1: LOW
        # 2-3: MODERATE
        # 4-5: HIGH
        # 6+: CRITICAL
        if score >= 6:
            priority = "CRITICAL"
        elif score >= 4:
            priority = "HIGH"
        elif score >= 2:
            priority = "MODERATE"
        else:
            priority = "LOW"

        reasoning = [f"{f['factor']} (+{f['points']})" for f in factors if f['points'] > 0]

        return {
            "priority": priority,
            "priority_score": score,
            "priority_factors": factors,
            "reasoning": reasoning,
            "disclaimer": "Prototype emergency priority assessment — Not a medical diagnosis."
        }
