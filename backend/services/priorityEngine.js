/**
 * Priority Scoring Engine
 * Transparent, explainable scoring algorithm for emergency coordination.
 * NOT a medical diagnosis.
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
  const hasInjuries = Array.isArray(injuryIndicators) && injuryIndicators.length > 0;
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

  // Score mapping:
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

module.exports = {
  calculatePriority
};
