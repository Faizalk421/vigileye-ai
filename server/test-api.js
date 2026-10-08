const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting VigilEye AI Full-Stack Automated API Verification...');
  let testsPassed = 0;
  let testsTotal = 0;

  const test = async (name, fn) => {
    testsTotal++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      testsPassed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} ->`, err.message);
    }
  };

  // 1. Health check
  await test('GET /health', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error('Health check failed');
  });

  // 2. Login as Demo User (Faizal)
  let userToken = '';
  await test('POST /auth/login (Demo User)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'faizal@vigileye.ai',
        password: 'Password@12345!'
      })
    });
    const data = await res.json();
    if (!data.data?.accessToken) throw new Error('No access token returned: ' + data.message);
    userToken = data.data.accessToken;
  });

  // 3. Login as Admin
  let adminToken = '';
  await test('POST /auth/login (Admin User)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'admin@vigileye.ai',
        password: 'Admin@12345!'
      })
    });
    const data = await res.json();
    if (!data.data?.accessToken) throw new Error('No admin access token: ' + data.message);
    if (data.data.user.role !== 'ADMIN') throw new Error('Role is not ADMIN');
    adminToken = data.data.accessToken;
  });

  // 4. User profile me
  await test('GET /users/me', async () => {
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    if (data.data.username !== 'faizal') throw new Error('Username mismatch');
  });

  // 5. Update user settings
  await test('PUT /users/settings', async () => {
    const res = await fetch(`${BASE_URL}/users/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        earThreshold: 0.22,
        alarmVolume: 0.85
      })
    });
    const data = await res.json();
    if (data.data.earThreshold !== 0.22) throw new Error('Settings update mismatch');
  });

  // 6. Analytics overview
  await test('GET /analytics/overview', async () => {
    const res = await fetch(`${BASE_URL}/analytics/overview`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    if (!data.data.today || !data.data.lifetime) throw new Error('Missing overview sections');
  });

  // 7. Analytics charts
  await test('GET /analytics/charts (7d)', async () => {
    const res = await fetch(`${BASE_URL}/analytics/charts?range=7d`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    if (!Array.isArray(data.data.chartData)) throw new Error('Chart data is not an array');
  });

  // 8. Reports
  await test('GET /analytics/reports (weekly)', async () => {
    const res = await fetch(`${BASE_URL}/analytics/reports?period=weekly`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    if (!data.data.summary) throw new Error('Report summary missing');
  });

  // 9. Session Creation
  await test('POST /sessions (Create Session)', async () => {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        durationSeconds: 120,
        blinkCount: 35,
        averageBlinkRate: 17.5,
        drowsinessCount: 1,
        longestClosureSeconds: 1.8,
        avgEAR: 0.32,
        minEAR: 0.14,
        deviceName: 'Test Camera Device',
        events: [
          {
            durationSeconds: 1.8,
            earAtTrigger: 0.14,
            notes: 'Automated test alarm event'
          }
        ]
      })
    });
    const data = await res.json();
    if (!data.data?.id) throw new Error('Failed to create session: ' + data.message);
  });

  // 10. Get Sessions
  await test('GET /sessions', async () => {
    const res = await fetch(`${BASE_URL}/sessions`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    if (!Array.isArray(data.data.sessions)) throw new Error('Sessions array missing');
  });

  // 11. Notifications
  await test('GET /notifications', async () => {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    if (!Array.isArray(data.data.notifications)) throw new Error('Notifications missing');
  });

  // 12. Admin Overview
  await test('GET /admin/overview', async () => {
    const res = await fetch(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.data.stats) throw new Error('Admin stats missing');
  });

  // 13. Admin Users
  await test('GET /admin/users', async () => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!Array.isArray(data.data.users)) throw new Error('Admin users missing');
  });

  // 14. RBAC Protection
  await test('RBAC Security: Normal user blocked from /admin/overview (Expect 403)', async () => {
    const res = await fetch(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (res.status === 403) {
      return; // Success! Blocked with 403
    }
    throw new Error(`Expected 403 status code, got ${res.status}`);
  });

  console.log(`\n🎉 Verification Summary: ${testsPassed} / ${testsTotal} tests passed!`);
}

runTests().catch(console.error);
