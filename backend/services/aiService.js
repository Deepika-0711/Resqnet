const axios = require('axios');
const { calculatePriority } = require('./priorityEngine');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Deterministic rule-based fallback NLP extraction
 */
function deterministicAnalyze(rawText) {
  const text = (rawText || '').toLowerCase();

  // Extract People Count
  let peopleCount = 1;
  const numberWords = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6 };
  const peopleMatch = text.match(/(\d+|one|two|three|four|five|six)\s+(people|persons|passengers|victims|injured|riders)/i);
  if (peopleMatch) {
    const rawVal = peopleMatch[1].toLowerCase();
    peopleCount = numberWords[rawVal] || parseInt(rawVal, 10) || 1;
  } else if (text.includes('three') || text.includes('3')) {
    peopleCount = 3;
  } else if (text.includes('multiple people') || text.includes('several people')) {
    peopleCount = 3;
  }

  // Extract Location
  let location = 'Mysore Road, Bengaluru';
  if (text.includes('mysore road')) {
    location = 'Mysore Road, Bengaluru';
  } else if (text.includes('silk board')) {
    location = 'Silk Board Junction, Bengaluru';
  } else if (text.includes('hebbal')) {
    location = 'Hebbal Flyover, Bengaluru';
  } else if (text.includes('outer ring road') || text.includes('marathahalli')) {
    location = 'Outer Ring Road, Marathahalli, Bengaluru';
  } else if (text.includes('electronic city')) {
    location = 'Electronic City Elevated Toll, Bengaluru';
  } else if (text.includes('koramangala')) {
    location = 'Koramangala 80 Feet Road, Bengaluru';
  } else if (text.includes('mg road')) {
    location = 'MG Road, Trinity Circle, Bengaluru';
  }

  // Extract Injury Indicators
  const injuryIndicators = [];
  if (text.includes('injur') || text.includes('bleeding') || text.includes('hurt') || text.includes('unconscious')) {
    if (peopleCount > 1) {
      injuryIndicators.push('Multiple reported injuries');
    } else {
      injuryIndicators.push('Reported trauma / injury');
    }
    if (text.includes('unconscious') || text.includes('critical')) {
      injuryIndicators.push('Severe trauma indicators');
    }
  }

  // Extract Road Obstruction
  const roadObstruction = (
    text.includes('block') ||
    text.includes('obstruction') ||
    text.includes('jam') ||
    text.includes('overturned') ||
    text.includes('traffic halted') ||
    text.includes('blocking the road')
  );

  // Extract Fire / Smoke
  const fireSmoke = (
    text.includes('fire') ||
    text.includes('smoke') ||
    text.includes('burning') ||
    text.includes('explosion') ||
    text.includes('flames')
  );

  // Extract Access Difficulty
  const accessDifficulty = (
    text.includes('trap') ||
    text.includes('pinned') ||
    text.includes('crushed') ||
    text.includes('extricat')
  );

  // Calculate priority score & factors
  const priorityResult = calculatePriority({
    peopleCount,
    injuryIndicators,
    roadObstruction,
    fireSmoke,
    accessDifficulty
  });

  return {
    incidentType: 'Road Accident',
    location,
    peopleCount,
    injuryIndicators: injuryIndicators.length > 0 ? injuryIndicators : ['None confirmed by witness'],
    roadObstruction,
    fireSmoke,
    accessDifficulty,
    priority: priorityResult.level,
    priorityScore: priorityResult.score,
    priorityFactors: priorityResult.factors,
    reasoning: priorityResult.reasoning,
    source: 'RULE_BASED_ENGINE',
    disclaimer: priorityResult.disclaimer
  };
}

/**
 * AI analysis service with graceful Python FastAPI integration & fallback
 */
async function analyzeIncidentText(rawText) {
  try {
    // Attempt request to Python FastAPI AI service
    const response = await axios.post(
      `${AI_SERVICE_URL}/analyze`,
      { text: rawText },
      { timeout: 1800 }
    );

    if (response.data && response.data.priority) {
      const d = response.data;
      const pc = d.people_count ?? d.peopleCount ?? 1;
      const ps = d.priority_score ?? d.priorityScore ?? 4;
      const ii = d.injury_indicators || d.injuryIndicators || [];
      const ro = Boolean(d.road_obstruction ?? d.roadObstruction);
      const fs = Boolean(d.fire_smoke ?? d.fireSmoke);
      const ad = Boolean(d.access_difficulty ?? d.accessDifficulty);

      return {
        incidentType: d.incident_type || d.incidentType || 'Road Accident',
        incident_type: d.incident_type || d.incidentType || 'Road Accident',
        location: d.location || 'Mysore Road, Bengaluru',
        peopleCount: pc,
        people_count: pc,
        injuryIndicators: ii,
        injury_indicators: ii,
        roadObstruction: ro,
        road_obstruction: ro,
        fireSmoke: fs,
        fire_smoke: fs,
        accessDifficulty: ad,
        access_difficulty: ad,
        priority: d.priority || 'HIGH',
        priorityScore: ps,
        priority_score: ps,
        priorityFactors: d.priority_factors || d.priorityFactors || [],
        reasoning: d.reasoning || [],
        disclaimer: d.disclaimer || 'AI-assisted estimation. Non-medical triage only.',
        source: 'FASTAPI_AI_SERVICE'
      };
    }
  } catch (err) {
    // Graceful fallback to deterministic rule-based NLP engine
    console.log(`[AI Service] FastAPI service not reachable (${err.message}). Using deterministic fallback engine.`);
  }

  const fb = deterministicAnalyze(rawText);
  return {
    ...fb,
    incident_type: fb.incidentType,
    people_count: fb.peopleCount,
    injury_indicators: fb.injuryIndicators,
    road_obstruction: fb.roadObstruction,
    fire_smoke: fb.fireSmoke,
    access_difficulty: fb.accessDifficulty,
    priority_score: fb.priorityScore
  };
}

module.exports = {
  analyzeIncidentText,
  deterministicAnalyze
};
