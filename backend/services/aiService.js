/**
 * ARCHITECTURAL BOUNDARY:
 * AI Orchestration Service for RESQNET backend.
 *
 * Serves as the central AI Orchestration layer in Node.js.
 * Pluggable Provider Architecture:
 * - Local Deterministic Engine (default, powered by priorityEngine.js)
 * - Remote FastAPI AI Service (optional microservice)
 * - Future extension slots for Breeth AI (memory/context), ElevenLabs (voice), and Gemini LLM.
 */

const axios = require('axios');
const { evaluateIncident } = require('./priorityEngine');
const { searchIncidentMemory, storeIncidentMemory } = require('./breethService');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Standardized AI Analysis Provider Interface
 * Accepts string input or structured object input.
 */
async function analyzeIncident(input) {
  let text = '';
  let locationHint = null;

  if (typeof input === 'string') {
    text = input;
  } else if (input && typeof input === 'object') {
    text = input.text || input.rawText || '';
    locationHint = input.locationHint || input.location || null;
  }

  if (!text || (typeof text === 'string' && !text.trim())) {
    text = 'Road accident reported';
  }

  let baseResult = null;

  // Provider Strategy Evaluation
  // 1. Try Remote Python FastAPI service if reachable
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/analyze`,
      { text, location_hint: locationHint },
      { timeout: 1500 }
    );

    if (response.data && response.data.priority) {
      const d = response.data;
      const pc = d.people_count ?? d.peopleCount ?? 1;
      const ps = d.priority_score ?? d.priorityScore ?? 4;
      const ii = d.injury_indicators || d.injuryIndicators || [];
      const ro = Boolean(d.road_obstruction ?? d.roadObstruction);
      const fs = Boolean(d.fire_smoke ?? d.fireSmoke);
      const ad = Boolean(d.access_difficulty ?? d.accessDifficulty);

      baseResult = {
        incidentType: d.incident_type || d.incidentType || 'Road Accident',
        location: d.location || locationHint || 'Mysore Road, Bengaluru',
        peopleCount: pc,
        injuryIndicators: ii,
        roadObstruction: ro,
        fireSmoke: fs,
        accessDifficulty: ad,
        priority: d.priority || 'HIGH',
        priorityScore: ps,
        priorityFactors: d.priority_factors || d.priorityFactors || [],
        reasoning: d.reasoning || [],
        disclaimer: d.disclaimer || 'Prototype emergency priority assessment — Decision support only, not a medical diagnosis.',
        source: 'FASTAPI_AI_MICROSERVICE',
        provider: 'PYTHON_FASTAPI'
      };
    }
  } catch (err) {
    // Gracefully fallback to local deterministic priority engine
  }

  // 2. Default Local Deterministic Priority Engine
  if (!baseResult) {
    const localResult = evaluateIncident(text, locationHint);
    baseResult = {
      ...localResult,
      source: 'DETERMINISTIC_PRIORITY_ENGINE',
      provider: 'NODE_LOCAL_ENGINE'
    };
  }

  // 3. Retrieve Breeth AI Incident Memory Context (Does NOT alter deterministic score)
  let corridorContext = null;
  try {
    corridorContext = await searchIncidentMemory(baseResult.location);
  } catch (err) {
    console.warn('[AI Orchestrator] Breeth context retrieval warning:', err.message);
  }

  return normalizeIntelligenceResult({
    ...baseResult,
    corridorContext
  });
}

/**
 * Ensures normalized dual key availability (camelCase and snake_case)
 * to prevent breaking legacy controllers or UI readers.
 */
function normalizeIntelligenceResult(data) {
  const pc = Number(data.peopleCount ?? data.people_count ?? 1);
  const ps = Number(data.priorityScore ?? data.priority_score ?? 4);
  const ii = data.injuryIndicators || data.injury_indicators || [];
  const ro = Boolean(data.roadObstruction ?? data.road_obstruction);
  const fs = Boolean(data.fireSmoke ?? data.fire_smoke);
  const ad = Boolean(data.accessDifficulty ?? data.access_difficulty);
  const it = data.incidentType || data.incident_type || 'Road Accident';

  return {
    incidentType: it,
    incident_type: it,
    location: data.location || 'Mysore Road, Bengaluru',
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
    priority: data.priority || 'HIGH',
    priorityScore: ps,
    priority_score: ps,
    priorityFactors: data.priorityFactors || data.priority_factors || [],
    reasoning: data.reasoning || [],
    corridorContext: data.corridorContext || null,
    historicalContext: data.corridorContext?.summary || null,
    disclaimer: data.disclaimer || 'Prototype emergency priority assessment — Decision support only, not a medical diagnosis.',
    source: data.source || 'DETERMINISTIC_ENGINE',
    provider: data.provider || 'NODE_ORCHESTRATOR'
  };
}

// Backwards-compatible alias exports
async function analyzeIncidentText(rawText) {
  return analyzeIncident(rawText);
}

function deterministicAnalyze(rawText) {
  return evaluateIncident(rawText);
}

module.exports = {
  analyzeIncident,
  analyzeIncidentText,
  deterministicAnalyze,
  normalizeIntelligenceResult
};

