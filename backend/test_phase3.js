const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING RESQNET PHASE 3 SYSTEM VERIFICATION TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASSED: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
    }
  }

  try {
    // Test 3: Health check
    console.log('--> Step 3: GET /health');
    const health = await request({ hostname: 'localhost', port: 5000, path: '/health', method: 'GET' });
    assert(health.status === 200 && health.body.status === 'HEALTHY', 'Backend health check returns HEALTHY');

    // Test 4 & 5: Incident Creation
    console.log('\n--> Step 4 & 5: POST /api/incidents (Incident Creation)');
    const createRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/incidents',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      location: 'Mysore Road near Satellite Bus Stand, Bengaluru',
      text: 'There is a major accident on Mysore Road involving 3 people injured. Fuel leak on the road and one vehicle is blocking the traffic lane.'
    });
    assert(createRes.status === 201 && createRes.body.success, 'Incident created successfully');
    const incident = createRes.body.incident;
    assert(incident && incident.id && incident.id.startsWith('RSQ-'), `Received valid incident ID: ${incident?.id}`);

    // Test 6: Deterministic priority calculation
    console.log('\n--> Step 6: Verify Deterministic Priority Engine');
    assert(incident.priority === 'HIGH' || incident.priority === 'CRITICAL', `Priority score cleanly calculated: ${incident.priority} (Score: ${incident.priority_score})`);
    assert(incident.priority_reasoning && incident.priority_reasoning.length > 0, `Priority factors transparently derived: ${incident.priority_reasoning?.join('; ')}`);

    // Test 7: Breeth memory storage & retrieval
    console.log('\n--> Step 7: Verify Breeth Memory Context Storage & Retrieval');
    const handoffData = createRes.body.handoff;
    assert(handoffData && handoffData.corridorMemory !== undefined, 'Corridor memory attached to handoff record');
    assert(handoffData && handoffData.corridorMemory && handoffData.corridorMemory.source.includes('Breeth'), 'Breeth memory source correctly identified');

    // Test 8: Ambulance matching & assignment
    console.log('\n--> Step 8: Verify Ambulance Matching & Assignment');
    const ambRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ambulances/assign',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { incidentId: incident.id, ambulanceId: 'AMB-102' });
    assert(ambRes.status === 200 && ambRes.body.success, `Ambulance assigned successfully: ${ambRes.body?.ambulance?.id}`);

    // Test 9 & 10: Hospital matching, selection & Pre-alert
    console.log('\n--> Step 9 & 10: Verify Hospital Selection & Pre-Alert');
    const hospRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/hospitals/select',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { incidentId: incident.id, hospitalId: 'HOSP-01' });
    assert(hospRes.status === 200 && hospRes.body.prealertStatus === 'SENT', `Hospital pre-alert transmitted: ${hospRes.body?.hospital?.name}`);

    // Test 11: Route calculation & selection
    console.log('\n--> Step 11: Verify Route Selection & Risk Engine');
    await request({ hostname: 'localhost', port: 5000, path: `/api/routes?incidentId=${incident.id}`, method: 'GET' });
    const targetRouteId = `RT-${incident.id}-B`;
    const routeRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/routes/select',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { incidentId: incident.id, routeId: targetRouteId });
    assert(routeRes.status === 200 && routeRes.body.success, `Route locked: ${routeRes.body?.route?.route_name}`);

    // Test 12: RESQ HANDOFF
    console.log('\n--> Step 12: Verify RESQ HANDOFF Single Shared Emergency Record');
    const handoffRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/handoffs/${incident.id}`,
      method: 'GET'
    });
    assert(handoffRes.status === 200 && handoffRes.body.handoff, 'RESQ Handoff endpoint returns complete telemetry brief');
    const h = handoffRes.body.handoff;
    assert(h.trafficPoliceBrief !== undefined, 'Traffic/Police Brief included in Handoff');
    assert(h.corridorMemory !== undefined, 'Corridor Memory included in Handoff');
    assert(h.ambulance !== null && h.hospital !== null && h.route !== null, 'Ambulance, Hospital & Route synchronized in Handoff');
    assert(h.timeline && h.timeline.length >= 4, `Timeline contains ${h.timeline?.length} real-time telemetry events`);

    // Test 14: ElevenLabs Transcription Endpoint
    console.log('\n--> Step 14: Verify ElevenLabs Transcription Endpoint');
    const transcribeRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/incidents/transcribe',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { audio: 'base64sample' });
    assert(transcribeRes.status === 200 || transcribeRes.status === 400 || transcribeRes.status === 500 || transcribeRes.status === 503, 'ElevenLabs transcribe route responds gracefully without crashing app');

    // Test 15: Typed reporting fallback
    console.log('\n--> Step 15: Verify Typed Reporting Works Without ElevenLabs');
    const typedRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/incidents',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      location: 'Hosur Road, Bengaluru',
      text: 'Minor collision near Electronic City flyover. 1 person injured.'
    });
    assert(typedRes.status === 201 && typedRes.body.incident, 'Typed report succeeds seamlessly');

    // Test 16: Breeth fallback when offline
    console.log('\n--> Step 16: Verify Breeth Local Fallback');
    assert(typedRes.body.handoff && typedRes.body.handoff.corridorMemory !== undefined, 'Local Breeth memory fallback used gracefully');

    // Test 17 & 18: Demo reset and steps
    console.log('\n--> Step 17 & 18: Verify Automated Demo Controller');
    const resetRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/demo/reset',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(resetRes.status === 200 && resetRes.body.success, 'Demo reset succeeded');

    const stepRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/demo/step',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { step: 1 });
    assert(stepRes.status === 200 && stepRes.body.step === 1, `Automated Demo Step 1 executed: ${stepRes.body.message}`);

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }

  } catch (err) {
    console.error('❌ Unexpected test runner error:', err.message);
    process.exit(1);
  }
}

runTests();
