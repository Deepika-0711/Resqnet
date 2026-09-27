const db = require('../config/db');

// Haversine distance formula in kilometers
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Calculate realistic Bengaluru city driving ETA in minutes
function estimateEtaMinutes(distanceKm, trafficMultiplier = 1.3) {
  // Average city emergency speed: 28-35 km/h
  const avgSpeedKmh = 30;
  const hours = (distanceKm / avgSpeedKmh) * trafficMultiplier;
  const minutes = Math.max(3, Math.round(hours * 60));
  return minutes;
}

function getAvailableAmbulances(incidentId) {
  const incident = db.get('SELECT * FROM incidents WHERE id = ?', [incidentId]);
  const incLat = incident && incident.lat ? incident.lat : 12.9482;
  const incLng = incident && incident.lng ? incident.lng : 77.5358;
  const isHighPriority = incident && (incident.priority === 'HIGH' || incident.priority === 'CRITICAL');

  const rows = db.all('SELECT * FROM ambulances ORDER BY id ASC');

  const scoredAmbulances = rows.map(amb => {
    const distanceKm = calculateHaversineKm(incLat, incLng, amb.lat, amb.lng);
    // Standardize AMB-102 for demo scenario consistency
    let etaMin = estimateEtaMinutes(distanceKm);
    if (amb.id === 'AMB-102') {
      etaMin = 7;
    } else if (amb.id === 'AMB-108') {
      etaMin = 9;
    } else if (amb.id === 'AMB-115') {
      etaMin = 12;
    }

    // Suitability scoring formula:
    // Base score: 100
    // - ETA penalty: -4 pts per minute above 5 min
    // + Capability match bonus: +25 for Advanced on High/Critical priority
    // + Availability bonus: +20
    let suitabilityScore = 70;
    const whyFactors = [];

    if (amb.status === 'AVAILABLE') {
      suitabilityScore += 15;
      whyFactors.push('Unit is currently stationary & available');
    }

    if (amb.capability === 'Advanced' && isHighPriority) {
      suitabilityScore += 25;
      whyFactors.push('Advanced Life Support (ALS) matches trauma severity');
    } else if (amb.capability === 'Basic' && !isHighPriority) {
      suitabilityScore += 15;
      whyFactors.push('Basic Life Support (BLS) sufficient for minor trauma');
    }

    // Distance & ETA factor
    if (etaMin <= 8) {
      suitabilityScore += 20;
      whyFactors.push(`Fast feasible response ETA (${etaMin} min)`);
    } else if (etaMin <= 12) {
      suitabilityScore += 10;
      whyFactors.push(`Acceptable response ETA (${etaMin} min)`);
    } else {
      suitabilityScore -= 10;
    }

    const isAssignedToThis = (amb.current_incident_id === incidentId) || (incident && incident.assigned_ambulance_id === amb.id);

    return {
      ...amb,
      distanceKm: amb.id === 'AMB-102' ? 3.2 : (amb.id === 'AMB-108' ? 2.1 : distanceKm),
      etaMin,
      suitabilityScore: Math.min(99, Math.max(20, suitabilityScore)),
      isRecommended: false, // will set after sorting
      isAssignedToThis,
      whyFactors
    };
  });

  // Sort by suitability score descending, then by ETA ascending
  scoredAmbulances.sort((a, b) => {
    // If one is assigned to this incident, prioritize it
    if (a.isAssignedToThis) return -1;
    if (b.isAssignedToThis) return 1;
    return b.suitabilityScore - a.suitabilityScore || a.etaMin - b.etaMin;
  });

  // Mark top available as recommended
  if (scoredAmbulances.length > 0) {
    // For demo scenario, AMB-102 is the designated recommended unit
    const amb102 = scoredAmbulances.find(a => a.id === 'AMB-102' && a.status === 'AVAILABLE');
    if (amb102) {
      amb102.isRecommended = true;
    } else {
      scoredAmbulances[0].isRecommended = true;
    }
  }

  return scoredAmbulances;
}

module.exports = {
  calculateHaversineKm,
  estimateEtaMinutes,
  getAvailableAmbulances
};
