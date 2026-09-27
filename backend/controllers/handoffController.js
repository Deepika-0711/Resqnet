const { getHandoff, syncHandoff } = require('../services/handoffService');

function getHandoffByIncidentId(req, res, next) {
  try {
    const { incidentId } = req.params;
    let handoff = getHandoff(incidentId);

    if (!handoff) {
      // Attempt to sync if incident exists
      handoff = syncHandoff(incidentId);
    }

    if (!handoff) {
      return res.status(404).json({ error: `No handoff found for incident ${incidentId}` });
    }

    return res.json({
      success: true,
      handoff
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHandoffByIncidentId
};
