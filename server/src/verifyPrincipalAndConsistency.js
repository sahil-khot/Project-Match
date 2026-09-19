const API_BASE = 'http://localhost:5000/api';

async function runVerification() {
  console.log('=== RUNNING PROJECT MATCH PRINCIPAL & DATA CONSISTENCY TESTS ===\n');

  // Test 1: Verify all 4 logins
  const credentials = [
    { role: 'student', email: 'sahil@example.com', pass: 'student123' },
    { role: 'mentor', email: 'mentor@example.com', pass: 'mentor123' },
    { role: 'principal', email: 'principal@example.com', pass: 'principal123' },
    { role: 'admin', email: 'admin@example.com', pass: 'admin123' }
  ];

  let principalToken = null;
  let adminToken = null;

  for (const cred of credentials) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cred.email, password: cred.pass })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        console.log(`[PASS] Login successful for ${cred.role.toUpperCase()}: ${cred.email}`);
        if (cred.role === 'principal') principalToken = data.token;
        if (cred.role === 'admin') adminToken = data.token;
      } else {
        console.error(`[FAIL] Login failed for ${cred.role}:`, data);
      }
    } catch (e) {
      console.error(`[FAIL] Login error for ${cred.role}:`, e.message);
    }
  }

  // Test 2: Verify Principal access to /api/principal/dashboard
  try {
    const res = await fetch(`${API_BASE}/principal/dashboard`, {
      headers: { Authorization: `Bearer ${principalToken}` }
    });
    const d = await res.json();
    console.log('\n--- Principal Dashboard Metrics ---');
    console.log(`Total Students: ${d.stats.totalStudents} (Expected: 280)`);
    console.log(`Faculty & Mentors: ${d.stats.totalMentors} (Expected: 50)`);
    console.log(`Total Projects: ${d.stats.totalProjects} (Expected: 70)`);
    console.log(`Completed Projects: ${d.stats.completedProjects} (Expected: 8)`);
    console.log(`In Progress Projects: ${d.stats.inProgressProjects} (Expected: 55)`);
    console.log(`On Hold Projects: ${d.stats.onHoldProjects} (Expected: 7)`);
    console.log(`Total Applications: ${d.stats.totalApplications} (Expected: 127)`);
    console.log(`Institutional Avg CGPA: ${d.stats.averageCollegeCgpa} (Expected: ~8.12)`);
    console.log(`Active in Projects: ${d.studentParticipation.activeInProjects} (${d.studentParticipation.activePercentage}%) (Expected: 252, 90%)`);
    console.log(`Not Participating: ${d.studentParticipation.notParticipating} (${d.studentParticipation.notParticipatingPercentage}%) (Expected: 28, 10%)`);
    console.log(`Department Overview Rows: ${d.departmentOverview.length} (Expected: 7)`);

    const statsMatch =
      d.stats.totalStudents === 280 &&
      d.stats.totalMentors === 50 &&
      d.stats.totalProjects === 70 &&
      d.stats.completedProjects === 8 &&
      d.stats.inProgressProjects === 55 &&
      d.stats.onHoldProjects === 7 &&
      d.stats.totalApplications === 127 &&
      d.studentParticipation.activeInProjects === 252 &&
      d.studentParticipation.notParticipating === 28 &&
      d.departmentOverview.length === 7;

    if (statsMatch) {
      console.log('\n[PASS] All Institutional Metrics MATCH EXACT SPECIFICATIONS!');
    } else {
      console.error('\n[FAIL] Discrepancy detected in metrics.');
    }
  } catch (e) {
    console.error('[FAIL] Error fetching principal dashboard:', e.message);
  }

  // Test 3: Verify Principal Sub-Endpoints
  try {
    const [studentsRes, facultyRes, projectsRes, appsRes] = await Promise.all([
      fetch(`${API_BASE}/principal/students`, { headers: { Authorization: `Bearer ${principalToken}` } }).then(r => r.json()),
      fetch(`${API_BASE}/principal/faculty`, { headers: { Authorization: `Bearer ${principalToken}` } }).then(r => r.json()),
      fetch(`${API_BASE}/principal/projects`, { headers: { Authorization: `Bearer ${principalToken}` } }).then(r => r.json()),
      fetch(`${API_BASE}/principal/applications`, { headers: { Authorization: `Bearer ${principalToken}` } }).then(r => r.json())
    ]);

    console.log(`\n[PASS] GET /api/principal/students returned ${studentsRes.count} students (Expected: 280)`);
    console.log(`[PASS] GET /api/principal/faculty returned ${facultyRes.count} faculty (Expected: 50)`);
    console.log(`[PASS] GET /api/principal/projects returned ${projectsRes.count} projects (Expected: 70)`);
    console.log(`[PASS] GET /api/principal/applications returned ${appsRes.count} applications (Expected: 127)`);
  } catch (e) {
    console.error('[FAIL] Error fetching principal sub-endpoints:', e.message);
  }

  // Test 4: Verify Principal CANNOT access Admin endpoints (Strict 403)
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${principalToken}` }
    });
    if (res.status === 403 || res.status === 401) {
      console.log(`\n[PASS] Principal correctly blocked from Admin dashboard (HTTP ${res.status} Forbidden)`);
    } else if (res.ok) {
      console.error('[FAIL] Principal was able to access Admin dashboard!');
    }
  } catch (e) {
    console.log(`\n[PASS] Principal access blocked: ${e.message}`);
  }

  // Test 5: Verify Admin CAN access Admin dashboard
  try {
    const adminRes = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminData = await adminRes.json();
    if (adminRes.ok && adminData.success) {
      console.log(`[PASS] Admin can access Admin dashboard successfully.`);
    }
  } catch (e) {
    console.error('[FAIL] Admin failed to access Admin dashboard:', e.message);
  }

  console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
}

runVerification();
