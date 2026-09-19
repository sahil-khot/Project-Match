import fetch from 'node-fetch'; // or global fetch in Node 18+

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== STARTING COMPREHENSIVE BACKEND AUTH TEST ===\n');
  let passCount = 0;
  let failCount = 0;

  const assert = (condition, name, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passCount++;
    } else {
      console.error(`❌ [FAIL] ${name} — ${details}`);
      failCount++;
    }
  };

  try {
    // Test 1: Health check
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'online', '1. Server Health Check');

    // Test 2: Reject incomplete registration
    const badReg = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'incomplete@test.com' })
    });
    assert(badReg.status === 400, '2. Incomplete Registration Rejected (400)');

    // Test 3: Reject password mismatch
    const mismatchReg = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: 'student_test_1@example.com',
        password: 'Password@123',
        confirmPassword: 'WrongPassword@123'
      })
    });
    assert(mismatchReg.status === 400, '3. Password Mismatch Rejected (400)');

    // Test 4: Successful Student Registration with Full Details
    const testEmail = `student_${Date.now()}@example.com`;
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Patel',
        email: testEmail,
        password: 'Student@123',
        confirmPassword: 'Student@123',
        college: 'Pimpri Chinchwad College of Engineering, Pune',
        department: 'Computer Engineering',
        academicYear: '3rd Year',
        studentId: 'PCCOE-COMP-2026-089',
        skills: ['React', 'Python', 'Node.js']
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.success && regData.user.role === 'student', '4. Student Registration (201 Created)');
    assert(!regData.user.password && !regData.user.passwordHash, '5. Password Hash NOT Exposed in Registration Response');

    // Check Set-Cookie header
    const cookieHeader = regRes.headers.get('set-cookie');
    assert(cookieHeader && cookieHeader.includes('pm_token'), '6. HTTP-Only Cookie pm_token Set on Registration');

    // Test 7: Privilege Escalation Prevention (User tries role: "admin" during registration)
    const adminHackEmail = `hacker_${Date.now()}@example.com`;
    const hackReg = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Malicious User',
        email: adminHackEmail,
        password: 'Hacker@123',
        role: 'admin' // Attempting privilege escalation
      })
    });
    const hackData = await hackReg.json();
    assert(hackData.user && hackData.user.role === 'student', '7. Privilege Escalation Blocked: Role Forced to "student"');

    // Test 8: Duplicate Email Registration Blocked
    const dupRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Student',
        email: testEmail,
        password: 'Student@123'
      })
    });
    assert(dupRes.status === 409, '8. Duplicate Email Blocked (409 Conflict)');

    // Test 9: Login with Invalid Password
    const badLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword@999' })
    });
    assert(badLogin.status === 401, '9. Invalid Password Rejected (401 Unauthorized)');

    // Test 10: Login with Seed Student Account
    const studentLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sahil@example.com', password: 'Student@123' })
    });
    const studentData = await studentLogin.json();
    assert(studentLogin.status === 200 && studentData.user.role === 'student', '10. Student Login Authenticated (sahil@example.com)');
    const studentToken = studentData.token;

    // Test 11: Login with Seed Mentor Account
    const mentorLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mentor@example.com', password: 'Mentor@123' })
    });
    const mentorData = await mentorLogin.json();
    assert(mentorLogin.status === 200 && mentorData.user.role === 'mentor', '11. Mentor Login Authenticated (mentor@example.com)');
    const mentorToken = mentorData.token;

    // Test 12: Login with Seed HOD Account
    const hodLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hod@example.com', password: 'HOD@123' })
    });
    const hodData = await hodLogin.json();
    assert(hodLogin.status === 200 && hodData.user.role === 'hod', '12. HOD Login Authenticated (hod@example.com)');

    // Test 13: Login with Seed Principal Account
    const principalLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'principal@example.com', password: 'Principal@123' })
    });
    const principalData = await principalLogin.json();
    assert(principalLogin.status === 200 && principalData.user.role === 'principal', '13. Principal Login Authenticated (principal@example.com)');

    // Test 14: Login with Seed Admin Account
    const adminLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' })
    });
    const adminData = await adminLogin.json();
    assert(adminLogin.status === 200 && adminData.user.role === 'admin', '14. Admin Login Authenticated (admin@example.com)');
    const adminToken = adminData.token;

    // Test 15: Session restoration via GET /api/auth/me
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user.email === 'sahil@example.com', '15. Current User Session Restoration (/api/auth/me)');
    assert(!meData.user.password && !meData.user.passwordHash, '16. Password NOT Exposed in /api/auth/me');

    // Test 17: Unauthenticated Request to Protected Route
    const unauthRes = await fetch(`${API_BASE}/auth/me`);
    assert(unauthRes.status === 401, '17. Unauthenticated Request Blocked (401)');

    // Test 18: RBAC: Student accessing Admin Dashboard
    const studentAdminRes = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(studentAdminRes.status === 403, '18. RBAC: Student Blocked from Admin Route (403 Forbidden)');

    // Test 19: RBAC: Mentor accessing Admin Dashboard
    const mentorAdminRes = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${mentorToken}` }
    });
    assert(mentorAdminRes.status === 403, '19. RBAC: Mentor Blocked from Admin Route (403 Forbidden)');

    // Test 20: RBAC: Admin accessing Admin Dashboard
    const adminAdminRes = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminAdminRes.status === 200, '20. RBAC: Admin Allowed on Admin Route (200 OK)');

    // Test 21: Logout clears cookie
    const logoutRes = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    const logoutCookie = logoutRes.headers.get('set-cookie');
    assert(logoutRes.status === 200 && logoutCookie && logoutCookie.includes('pm_token=;'), '21. Logout Clears Cookie (pm_token=;)');

    // Test 22: Google Auth Integration
    const googleTestEmail = `google_user_${Date.now()}@example.com`;
    const googleRes = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleTestEmail,
        name: 'Google Test User',
        googleId: `g_${Date.now()}`
      })
    });
    const googleData = await googleRes.json();
    assert(googleRes.status === 200 && googleData.user.role === 'student' && googleData.user.authProvider === 'google', '22. Google Auth Login / Default Student Account');

    console.log(`\n=== TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED ===\n`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
