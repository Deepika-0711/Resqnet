/**
 * ARCHITECTURAL BOUNDARY:
 * Deterministic Emergency Priority & NLP Extraction Engine.
 *
 * This module centralizes transparent, rule-based NLP extraction and emergency priority scoring.
 * It is completely deterministic, explainable, and offline-capable.
 * It provides decision support ONLY and does NOT make medical diagnoses.
 */

const LOCATION_KEYWORDS = [
  { key: 'mysore road', name: 'Mysore Road, Bengaluru' },
  { key: 'silk board', name: 'Silk Board Junction, Bengaluru' },
  { key: 'hebbal', name: 'Hebbal Flyover, Bengaluru' },
  { key: 'outer ring road', name: 'Outer Ring Road, Marathahalli, Bengaluru' },
  { key: 'marathahalli', name: 'Outer Ring Road, Marathahalli, Bengaluru' },
  { key: 'electronic city', name: 'Electronic City Elevated Toll, Bengaluru' },
  { key: 'koramangala', name: 'Koramangala 80 Feet Road, Bengaluru' },
  { key: 'mg road', name: 'MG Road, Trinity Circle, Bengaluru' },
  { key: 'indiranagar', name: '100 Feet Road, Indiranagar, Bengaluru' }
];

const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10
};

/**
 * Parses unstructured emergency text into structured incident variables.
 * @param {string} rawText
 * @param {string} [locationHint]
 * @returns {object} Extracted structured emergency variables
 */
function parseEmergencyText(rawText = '', locationHint = null) {
  const text = (rawText || '').toLowerCase();

  // 1. Location Extraction
  let location = locationHint || 'Mysore Road, Bengaluru';
  if (!locationHint) {
    for (const item of LOCATION_KEYWORDS) {
      if (text.includes(item.key)) {
        location = item.name;
        break;
      }
    }
  }

  // 2. People/Casualty Count Extraction
  let peopleCount = 1;
  const peopleMatch = text.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:people|persons|passengers|victims|injured|patients|riders)/i);
  if (peopleMatch) {
    const rawVal = peopleMatch[1].toLowerCase();
    peopleCount = NUMBER_WORDS[rawVal] || parseInt(rawVal, 10) || 1;
  } else if (text.includes('three') || text.includes(' 3 ') || text.includes('3 people') || text.includes('3 injured')) {
    peopleCount = 3;
  } else if (text.includes('two') || text.includes(' 2 ') || text.includes('2 people') || text.includes('2 injured')) {
    peopleCount = 2;
  } else if (text.includes('multiple people') || text.includes('several people') || text.includes('multiple victims')) {
    peopleCount = 3;
  }

  // 3. Injury Indicators
  const injuryIndicators = [];
  if (text.includes('injur') || text.includes('bleed') || text.includes('hurt') || text.includes('pain') || text.includes('fracture') || text.includes('trauma') || text.includes('wound') || text.includes('unconscious')) {
    if (peopleCount > 1) {
      injuryIndicators.push('Multiple reported injuries');
    } else {
      injuryIndicators.push('Reported trauma / injury');
    }
    if (text.includes('unconscious') || text.includes('critical') || text.includes('faint') || text.includes('coma')) {
      injuryIndicators.push('Severe responsiveness alert');
    }
  }

  // 4. Road Obstruction
  const roadObstruction = (
    text.includes('block') ||
    text.includes('obstruction') ||
    text.includes('jam') ||
    text.includes('overturned') ||
    text.includes('overturn') ||
    text.includes('traffic halt') ||
    text.includes('pileup')
  );

  // 5. Fire / Smoke Hazard
  const fireSmoke = (
    text.includes('fire') ||
    text.includes('smoke') ||
    text.includes('flame') ||
    text.includes('burning') ||
    text.includes('explosion') ||
    text.includes('spark')
  );

  // 6. Access Difficulty
  const accessDifficulty = (
    text.includes('trap') ||
    text.includes('pinned') ||
    text.includes('crushed') ||
    text.includes('jammed inside') ||
    text.includes('extricat')
  );

  return {
    incidentType: 'Road Accident',
    location,
    peopleCount,
    injuryIndicators: injuryIndicators.length > 0 ? injuryIndicators : ['None explicitly confirmed'],
    roadObstruction,
    fireSmoke,
    accessDifficulty
  };
}

/**
 * Evaluates transparent priority score and factor breakdown.
 * @param {object} params
 * @returns {object} Priority assessment
 */
function calculatePriority({ peopleCount = 1, injuryIndicators = [], roadObstruction = false, fireSmoke = false, accessDifficulty = false }) {
  let score = 0;
  const factors = [];

  // Multiple people factor (+2)
  if (peopleCount > 1) {
    score += 2;
    factors.push({ factor: 'Multiple people involved', points: 2, detail: `${peopleCount} people detected at scene` });
  } else {
    factors.push({ factor: 'Single person involved', points: 0, detail: '1 person detected' });
  }

  // Injury indicator factor (+3)
  const hasInjuries = Array.isArray(injuryIndicators) && injuryIndicators.length > 0 && !injuryIndicators.includes('None explicitly confirmed');
  if (hasInjuries) {
    score += 3;
    factors.push({ factor: 'Reported injury indicators', points: 3, detail: injuryIndicators.join(', ') });
  }

  // Road obstruction (+1)
  if (roadObstruction) {
    score += 1;
    factors.push({ factor: 'Road obstruction / vehicle blocking', points: 1, detail: 'Active traffic hazard / lane blockage' });
  }

  // Fire / Smoke hazard (+2)
  if (fireSmoke) {
    score += 2;
    factors.push({ factor: 'Fire / smoke hazard reported', points: 2, detail: 'High risk secondary hazard' });
  }

  // Difficult access / entrapped (+1)
  if (accessDifficulty) {
    score += 1;
    factors.push({ factor: 'Difficult access / entrapped victims', points: 1, detail: 'Extrication support needed' });
  }

  // Thresholds:
  // 0-1: LOW
  // 2-3: MODERATE
  // 4-5: HIGH
  // 6+: CRITICAL
  let level = 'LOW';
  if (score >= 6) {
    level = 'CRITICAL';
  } else if (score >= 4) {
    level = 'HIGH';
  } else if (score >= 2) {
    level = 'MODERATE';
  }

  return {
    score,
    level,
    factors,
    reasoning: factors.filter(f => f.points > 0).map(f => `${f.factor} (+${f.points})`),
    disclaimer: 'Prototype emergency priority assessment — Decision support only, not a medical diagnosis.'
  };
}

/**
 * Full deterministic evaluation wrapper
 */
function evaluateIncident(rawText, locationHint = null) {
  const parsed = parseEmergencyText(rawText, locationHint);
  const priorityData = calculatePriority(parsed);

  return {
    ...parsed,
    priority: priorityData.level,
    priorityScore: priorityData.score,
    priorityFactors: priorityData.factors,
    reasoning: priorityData.reasoning,
    disclaimer: priorityData.disclaimer
  };
}

module.exports = {
  parseEmergencyText,
  calculatePriority,
  evaluateIncident
};

