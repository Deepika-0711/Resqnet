import re
from typing import Dict, Any, List

class IncidentAnalyzer:
    """
    Analyzes unstructured emergency text and extracts structured emergency variables.
    """
    LOCATION_KEYWORDS = {
        'mysore road': 'Mysore Road, Bengaluru',
        'silk board': 'Silk Board Junction, Bengaluru',
        'hebbal': 'Hebbal Flyover, Bengaluru',
        'outer ring road': 'Outer Ring Road, Marathahalli, Bengaluru',
        'electronic city': 'Electronic City Elevated Toll, Bengaluru',
        'koramangala': 'Koramangala 80 Feet Road, Bengaluru',
        'mg road': 'MG Road, Trinity Circle, Bengaluru',
        'indiranagar': '100 Feet Road, Indiranagar, Bengaluru'
    }

    NUMBER_MAP = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    }

    @classmethod
    def parse_text(cls, text: str) -> Dict[str, Any]:
        lowered = text.lower()

        # 1. Location extraction
        location = "Mysore Road, Bengaluru"
        for key, loc in cls.LOCATION_KEYWORDS.items():
            if key in lowered:
                location = loc
                break

        # 2. People count extraction
        people_count = 1
        num_pattern = r'(\d+|one|two|three|four|five|six|seven|eight)\s+(?:people|persons|passengers|victims|injured|patients)'
        match = re.search(num_pattern, lowered)
        if match:
            raw_val = match.group(1)
            people_count = cls.NUMBER_MAP.get(raw_val, int(raw_val) if raw_val.isdigit() else 1)
        elif 'three' in lowered or '3' in lowered:
            people_count = 3
        elif 'two' in lowered or '2' in lowered:
            people_count = 2
        elif 'multiple' in lowered or 'several' in lowered:
            people_count = 3

        # 3. Injury indicators
        injury_indicators: List[str] = []
        if any(w in lowered for w in ['injur', 'bleed', 'hurt', 'pain', 'fracture', 'trauma', 'wound']):
            if people_count > 1:
                injury_indicators.append("Multiple reported injuries")
            else:
                injury_indicators.append("Reported injury / trauma")

        if any(w in lowered for w in ['unconscious', 'faint', 'coma', 'unresponsive']):
            injury_indicators.append("Severe responsiveness alert")

        # 4. Road obstruction
        road_obstruction = any(w in lowered for w in [
            'block', 'obstruction', 'blocking', 'jam', 'traffic halt', 'overturn', 'pileup'
        ])

        # 5. Fire / smoke hazard
        fire_smoke = any(w in lowered for w in ['fire', 'smoke', 'flame', 'burning', 'blast', 'spark'])

        # 6. Access difficulty
        access_difficulty = any(w in lowered for w in ['trapped', 'pinned', 'crushed', 'jammed inside'])

        return {
            "incident_type": "Road Accident",
            "location": location,
            "people_count": people_count,
            "injury_indicators": injury_indicators if injury_indicators else ["None explicitly confirmed"],
            "road_obstruction": road_obstruction,
            "fire_smoke": fire_smoke,
            "access_difficulty": access_difficulty
        }
