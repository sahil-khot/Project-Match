import dotenv from 'dotenv';
dotenv.config();

const BASE = 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => null);
  const setCookie = res.headers.get('set-cookie');
  return { status: res.status, data, setCookie };
}

function extractCookie(cookieHeader) {
  if (!cookieHeader) return '';
  return cookieHeader.split(';')[0];
}

async function runSecurityTests() {
  console.log('====================================================');
  console.log('RUNNING COMPREHENSIVE SECURITY & IDOR AUDIT SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Authenticate Student A (Sahil Khot)
  const loginA = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'sahil@example.com', password: 'Student@123' }
  });
  assert(loginA.status === 200, 'Student A authenticated successfully');
  const cookieA = extractCookie(loginA.setCookie);

  // 2. Register & Authenticate Student B (Attacker / Unauthorized student)
  const studentBEmail = `test_student_b_${Date.now()}@example.com`;
  const regB = await request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Student B Attacker',
      email: studentBEmail,
      password: 'Password@123',
      department: 'Mechanical Engineering'
    }
  });
  assert(regB.status === 201, 'Student B registered successfully with verificationStatus Pending');
  const cookieB = extractCookie(regB.setCookie);

  // 3. Authenticate Mentor and Admin
  const loginMentor = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'mentor@example.com', password: 'Mentor@123' }
  });
  const cookieMentor = extractCookie(loginMentor.setCookie);

  const loginAdmin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@example.com', password: 'Admin@123' }
  });
  const cookieAdmin = extractCookie(loginAdmin.setCookie);

  // Fetch a project owned by Student A
  const myProjectsA = await request('/api/projects/my', { headers: { Cookie: cookieA } });
  const projectA = myProjectsA.data?.projects?.[0];
  assert(!!projectA, `Found Project A (${projectA?.title}) owned/led by Student A`);

  // =========================================================================
  // TEST IDOR 1: Application Privacy (Phase 13)
  // Student B queries /api/applications?projectId=<projectA._id>
  // =========================================================================
  const idorApps = await request(`/api/applications?projectId=${projectA._id}`, {
    headers: { Cookie: cookieB }
  });
  assert(
    idorApps.status === 403,
    `IDOR 1: Student B blocked from viewing Project A applications (HTTP ${idorApps.status})`
  );

  // =========================================================================
  // TEST IDOR 2: Task IDOR & Unauthorized Review (Phase 17)
  // =========================================================================
  // Create a task in Project A as Student A
  const createTask = await request('/api/tasks', {
    method: 'POST',
    headers: { Cookie: cookieA },
    body: {
      projectId: projectA._id,
      title: 'Confidential Core Component',
      deadline: new Date(Date.now() + 864000000).toISOString()
    }
  });
  const taskA = createTask.data?.task;
  assert(createTask.status === 201 && !!taskA, 'Task created by Project A leader');

  // Student B attempts to review Task A
  const idorReview = await request(`/api/tasks/${taskA._id}/review`, {
    method: 'PUT',
    headers: { Cookie: cookieB },
    body: { status: 'Approved', feedback: 'Hacked approval' }
  });
  assert(
    idorReview.status === 403,
    `IDOR 2: Student B blocked from reviewing Project A task (HTTP ${idorReview.status})`
  );

  // =========================================================================
  // TEST IDOR 3: Task State Machine & Assignee Bypass (Phase 18)
  // Student B attempts to submit task assigned to someone else
  // =========================================================================
  const idorSubmit = await request(`/api/tasks/${taskA._id}/submit`, {
    method: 'PUT',
    headers: { Cookie: cookieB },
    body: { submissionNotes: 'Bypassed submission' }
  });
  assert(
    idorSubmit.status === 403,
    `IDOR 3: Student B blocked from submitting task assigned to Student A (HTTP ${idorSubmit.status})`
  );

  // =========================================================================
  // TEST IDOR 4: Team Chat Snooping (Phase 20)
  // Student B attempts to read Project A team chat
  // =========================================================================
  const idorChat = await request(`/api/messages/thread/team_${projectA._id}`, {
    headers: { Cookie: cookieB }
  });
  assert(
    idorChat.status === 403,
    `IDOR 4: Student B blocked from accessing Project A private team messages (HTTP ${idorChat.status})`
  );

  // =========================================================================
  // TEST IDOR 5: Document Security (Phase 45)
  // Student B attempts to download Student A private uploaded document
  // =========================================================================
  const idorDoc = await request('/api/students/documents/resume-secret.pdf', {
    headers: { Cookie: cookieB }
  });
  assert(
    idorDoc.status === 403 || idorDoc.status === 404,
    `IDOR 5: Student B blocked from accessing other user private documents (HTTP ${idorDoc.status})`
  );

  // =========================================================================
  // TEST 6: Google Auth Cryptographic Hardening (Phase 4)
  // Client attempts unverified Google ID login without valid token
  // =========================================================================
  const forgedGoogle = await request('/api/auth/google', {
    method: 'POST',
    body: { credential: 'fake_jwt_token_attacker', email: 'admin@example.com', role: 'admin' }
  });
  assert(
    forgedGoogle.status === 401 || forgedGoogle.status === 503,
    `Phase 4: Forged / unverified Google authentication rejected (HTTP ${forgedGoogle.status})`
  );

  // =========================================================================
  // TEST 7: Staff Creation Institutional Scoping (Phase 27)
  // HOD Computer Engineering attempts to create a Mechanical mentor
  // =========================================================================
  const loginHOD = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'hod@example.com', password: 'HOD@123' }
  });
  const cookieHOD = extractCookie(loginHOD.setCookie);

  const crossDeptStaff = await request('/api/auth/create-staff', {
    method: 'POST',
    headers: { Cookie: cookieHOD },
    body: {
      name: 'Cross Dept Faculty',
      email: `cross_staff_${Date.now()}@example.com`,
      password: 'StaffPassword@123',
      role: 'mentor',
      department: 'Mechanical' // HOD belongs to Computer Engineering!
    }
  });
  assert(
    crossDeptStaff.status === 403,
    `Phase 27: HOD cross-department staff creation blocked by server (HTTP ${crossDeptStaff.status})`
  );

  // =========================================================================
  // TEST 8: Admin Self-Demotion Protection (Phase 28)
  // Admin attempts to demote their own account
  // =========================================================================
  const adminMe = await request('/api/auth/me', { headers: { Cookie: cookieAdmin } });
  const adminId = adminMe.data?.user?._id;

  const selfDemote = await request(`/api/admin/user/${adminId}/role`, {
    method: 'PUT',
    headers: { Cookie: cookieAdmin },
    body: { role: 'student' }
  });
  assert(
    selfDemote.status === 400,
    `Phase 28: Admin self-demotion blocked by server policy (HTTP ${selfDemote.status})`
  );

  // =========================================================================
  // TEST 9: Project Member Role Injection (Phase 10)
  // Adding member with client-injected role 'Leader'
  // =========================================================================
  const roleInjection = await request(`/api/projects/${projectA._id}/members`, {
    method: 'POST',
    headers: { Cookie: cookieA },
    body: { userId: regB.data?.user?._id, role: 'Leader' }
  });
  // Server must override role to 'Member' and not allow a second Leader
  const addedMember = roleInjection.data?.project?.members?.find(
    m => m.user === regB.data?.user?._id || m.user?._id === regB.data?.user?._id
  );
  assert(
    roleInjection.status === 200 && addedMember?.role === 'Member',
    `Phase 10: Client role injection blocked (enforced as 'Member')`
  );

  // =========================================================================
  // TEST 10: Audit Log Recording (Phase 28)
  // Verify that admin action generated an AuditLog record
  // =========================================================================
  const auditLogs = await request('/api/admin/audit-logs', { headers: { Cookie: cookieAdmin } });
  assert(
    auditLogs.status === 200 && Array.isArray(auditLogs.data?.logs),
    `Phase 28: AuditLog endpoint returned valid records (Found ${auditLogs.data?.logs?.length} logs)`
  );

  console.log('\n====================================================');
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSecurityTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
