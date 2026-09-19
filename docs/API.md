# Project Match — Canonical API Documentation

"Where Ideas Find the Right Team"

## Global Standards
- **Base URL**: `http://localhost:5000/api` (or environment-configured base)
- **Authentication**: Pure HTTP-Only Cookie (`pm_token`), strict SameSite, with Bearer token fallback in `Authorization` header.
- **Content-Type**: `application/json`
- **Standard Success Response**:
  ```json
  {
    "success": true,
    "data": { ... } // or named payload e.g. "projects", "user", "tasks"
  }
  ```
- **Standard Error Response**:
  ```json
  {
    "success": false,
    "message": "Descriptive human-readable explanation",
    "code": "ERROR_CODE_STRING"
  }
  ```
- **Pagination Structure**:
  ```json
  {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
  ```

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Auth**: None (Public, Rate Limited)
- **Role**: Public
- **Request**:
  ```json
  {
    "name": "Sahil Khot",
    "email": "sahil@example.com",
    "password": "Password@123",
    "confirmPassword": "Password@123",
    "department": "Computer Engineering",
    "college": "Pimpri Chinchwad College of Engineering, Pune"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Registration successful. Please verify your academic email.",
    "verificationStatus": "Pending",
    "user": { "_id": "...", "name": "...", "email": "...", "role": "student" }
  }
  ```
- **Errors**: 400 (Validation / Password policy / Missing fields), 409 (Email already registered), 429 (Rate limit exceeded).

### `POST /api/auth/login`
- **Auth**: None (Public, Rate Limited)
- **Role**: Public
- **Request**:
  ```json
  {
    "email": "sahil@example.com",
    "password": "Password@123"
  }
  ```
- **Response** (200 OK): Sets `pm_token` cookie.
  ```json
  {
    "success": true,
    "user": { "_id": "...", "email": "...", "role": "student", "department": "..." }
  }
  ```
- **Errors**: 400 (Missing fields), 401 (Invalid email or password), 403 (Account suspended), 429 (Rate limit).

### `POST /api/auth/google`
- **Auth**: None (Rate Limited)
- **Role**: Public
- **Request**:
  ```json
  {
    "credential": "<Google OAuth2 ID Token JWT>"
  }
  ```
- **Response** (200 OK): Verified cryptographically via `google-auth-library`. Sets HTTP-only cookie.
- **Errors**: 400 (Missing credential), 401 (Invalid/expired Google token), 503 (Server GOOGLE_CLIENT_ID unconfigured - unverified tokens rejected).

### `GET /api/auth/verify-email/:token`
- **Auth**: None
- **Response** (200 OK): Marks user `verificationStatus = 'Verified'`.
- **Errors**: 400 (Invalid or expired token).

### `POST /api/auth/forgot-password`
- **Auth**: None (Rate Limited)
- **Request**: `{ "email": "sahil@example.com" }`
- **Response** (200 OK): Constant-time response preventing account enumeration.
- **Errors**: 400, 429.

### `POST /api/auth/reset-password/:token`
- **Auth**: None
- **Request**: `{ "password": "NewPassword@123", "confirmPassword": "NewPassword@123" }`
- **Response** (200 OK): Updates password hash via bcrypt, invalidates reset token.
- **Errors**: 400 (Token invalid or passwords mismatch).

### `GET /api/auth/me`
- **Auth**: Required
- **Response** (200 OK): Current authenticated user and linked student/mentor profile.
- **Errors**: 401 (Unauthenticated).

### `POST /api/auth/logout`
- **Auth**: None
- **Response** (200 OK): Clears `pm_token` cookie.

### `POST /api/auth/create-staff`
- **Auth**: Required
- **Role**: `admin`, `principal`, `hod`
- **Request**:
  ```json
  {
    "name": "Dr. Amit Deshmukh",
    "email": "mentor@example.com",
    "password": "Password@123",
    "role": "mentor",
    "department": "Computer Engineering",
    "designation": "Assistant Professor"
  }
  ```
- **Response** (201 Created): Records `AuditLog` entry.
- **Errors**: 400, 403 (HOD attempting cross-department creation or creating non-mentor), 409.

---

## 2. Student Profiles (`/api/students`)

### `GET /api/students/profile`
- **Auth**: Required
- **Role**: `student`
- **Response** (200 OK): Returns logged-in student's full profile and completion percentage.

### `PUT /api/students/profile`
- **Auth**: Required
- **Role**: `student`
- **Request**: Editable academic and profile attributes (skills, interests, links, bio, CGPA).
- **Response** (200 OK): Updated student profile.

### `GET /api/students/profile/:id`
- **Auth**: Required
- **Role**: Any authenticated user
- **Response** (200 OK): Public student portfolio view.

### `GET /api/students/teammates`
- **Auth**: Optional/Required
- **Query**: `skills`, `department`, `year`, `availability`, `search`, `page`, `limit`
- **Response** (200 OK): Paginated student candidates with calculated `matchScore` and `matchReasons`.

### `GET /api/students/documents/:filename`
- **Auth**: Required
- **Role**: Owner student or authorized faculty (`mentor`, `hod`, `principal`, `admin`)
- **Errors**: 403 (IDOR attempt: unauthorized student attempting to download peer document).

---

## 3. Projects (`/api/projects`)

### `GET /api/projects/explore` and `GET /api/projects`
- **Auth**: Public / Optional
- **Query**: `domain`, `status`, `search`, `page`, `limit`
- **Response** (200 OK): Paginated list of active/recruiting projects.

### `GET /api/projects/my`
- **Auth**: Required
- **Role**: `student`
- **Response** (200 OK): Projects created, led, or joined by current user.

### `POST /api/projects`
- **Auth**: Required
- **Role**: `student`
- **Request**:
  ```json
  {
    "title": "SolarSense AI",
    "description": "...",
    "domain": "Artificial Intelligence",
    "techStack": ["Python", "React"],
    "requiredSkills": ["PyTorch", "Tailwind"],
    "teamSize": 4,
    "deadline": "2025-11-30"
  }
  ```
- **Response** (201 Created): Project initialized with creator as `Leader` and `openPositions = teamSize - 1`.

### `PUT /api/projects/:id`
- **Auth**: Required
- **Role**: Project Creator, Group Leader, or Admin
- **Errors**: 403 (Unauthorized editor).

### `PUT /api/projects/:id/status`
- **Auth**: Required
- **Role**: Project Leader, Mentor, or Admin
- **Request**: `{ "status": "Active" }`
- **Allowed Transitions**:
  - `Idea` -> `Recruiting`, `Archived`
  - `Recruiting` -> `Active`, `Idea`, `Archived`
  - `Active` -> `In Progress`, `Completed`, `Archived`
  - `In Progress` -> `Completed`, `Active`, `Archived`
  - `Completed` -> `Archived`
- **Errors**: 400 (Invalid transition), 403.

### `POST /api/projects/:id/members`
- **Auth**: Required
- **Role**: Project Leader or Admin
- **Request**: `{ "userId": "..." }`
- **Response** (200 OK): Adds student member (client role injection ignored; defaults to `Member`), decrements `openPositions`.

### `DELETE /api/projects/:id/members/:memberId`
- **Auth**: Required
- **Role**: Project Leader, Member themselves (leaving), or Admin
- **Behavior**: Auto-transfers leadership if leader leaves; unassigns pending tasks cleanly without corrupting history; increments `openPositions`.

### `POST /api/projects/:id/assign-mentor`
- **Auth**: Required
- **Role**: Project Leader or Admin
- **Request**: `{ "mentorId": "..." }`
- **Validation**: Verifies mentor account exists, is active, and possesses role `mentor`. Records `AuditLog`.

---

## 4. Applications (`/api/applications`)

### `GET /api/applications/my`
- **Auth**: Required
- **Role**: `student`
- **Response** (200 OK): Current student's submitted project applications and mentorship requests.

### `GET /api/applications`
- **Auth**: Required
- **Query**: `projectId`, `type`, `status`, `page`, `limit`
- **Privacy Enforcement**: Students can ONLY view applications for projects they lead, or their own applications. Mentors only view applications for projects they mentor or requests directed to them.

### `POST /api/applications`
- **Auth**: Required
- **Role**: `student`
- **Request**:
  ```json
  {
    "projectId": "...",
    "coverNote": "...",
    "tags": ["Frontend"]
  }
  ```
- **Response** (201 Created): Duplicate active applications prevented via compound unique database index.
- **Errors**: 400 (Project full / closed / applicant already member), 409 (Active application exists).

### `PUT /api/applications/:id/status`
- **Auth**: Required
- **Role**: Target Project Leader, Target Mentor, or Admin (Student may only withdraw)
- **Request**: `{ "status": "Accepted", "feedback": "Welcome to the team!" }`
- **Atomicity**: Atomic `$inc: { openPositions: -1 }` with `$push` to project members, preventing concurrency race conditions.

---

## 5. Tasks & Milestone Lifecycle (`/api/tasks`)

### `GET /api/tasks` and `GET /api/tasks/project/:projectId`
- **Auth**: Required
- **Privacy Enforcement**: Rejects non-members/unauthorized viewers with 403 Forbidden.

### `POST /api/tasks`
- **Auth**: Required
- **Role**: Project Creator, Group Leader, or Assigned Mentor
- **Request**: `{ "projectId": "...", "title": "...", "assignedTo": "...", "deadline": "..." }`
- **Response** (201 Created): Initializes task in `To Do` state and recalculates project progress.

### `PUT /api/tasks/:id/submit`
- **Auth**: Required
- **Role**: Task Assignee
- **Request**: `{ "submissionNotes": "...", "submissionAttachment": "..." }`
- **State Transition**: `To Do` / `In Progress` / `Changes Requested` -> `Submitted`. Notifies leader/mentor.

### `PUT /api/tasks/:id/review`
- **Auth**: Required
- **Role**: Project Leader or Mentor
- **Request**: `{ "status": "Approved" | "Changes Requested", "feedback": "..." }`
- **Response** (200 OK): Updates task state and recalculates project completion percentage.

### `PUT /api/tasks/:id/status`
- **Auth**: Required
- **State Machine**: Enforces strict transitions per role. Students cannot jump arbitrary states or self-approve.

### `DELETE /api/tasks/:id`
- **Auth**: Required
- **Role**: Project Leader, Mentor, or Admin
- **Behavior**: Deletes task and cleanly updates project progress.

---

## 6. Real-Time Messages (`/api/messages`)

### `GET /api/messages/conversations`
- **Auth**: Required
- **Response** (200 OK): Recent threads with unread counts and dynamic online status (computed from `lastSeen`).

### `GET /api/messages/thread/:conversationId`
- **Auth**: Required
- **Query**: `page`, `limit`
- **Privacy Enforcement**: Direct messages require caller to be participant; team chats require caller to be project member/mentor/admin.

### `POST /api/messages`
- **Auth**: Required (Rate Limited)
- **Request**:
  ```json
  {
    "recipientId": "...", // for DM
    "projectId": "...",   // for Team chat
    "content": "Hello team!"
  }
  ```
- **Security**: Server strictly generates canonical `conversationId` (`dm_user1_user2` or `team_projectId`), rejecting client forged IDs.

---

## 7. Leaderboards & Analytics (`/api/leaderboards`)

### `GET /api/leaderboards`
- **Auth**: Optional / Authenticated
- **Query**: `category`, `department`
- **Formula**: `Score = (CGPA * 10) + (Approved Tasks * 15) + (Completed Projects * 25) + (Community Posts * 5, max 50)`
- **Ranking Delta**: Derived from real `LeaderboardSnapshot` history (`rankChange = prevRank - currentRank`), never artificial modulo math.
- **My Ranking**: Returns authentic user position or `null` if unranked (never defaults to #1).

---

## 8. AI Assistant (`/api/ai`)

### `POST /api/ai/chat`
- **Auth**: Required (Rate Limited via `aiLimiter`)
- **Request**: `{ "message": "Find compatible teammates with React and Python skills." }`
- **Security**: Server-side Google Gemini GenAI SDK (`gemini-2.5-flash`) with database-grounded system instruction. API key never exposed to client. Enforces max 2000 character prompt.

---

## 9. Governance & Role Dashboards (`/api/roles`)

### `GET /api/roles/mentor/dashboard`
- **Auth**: Required (Role: `mentor`, `admin`)
- **Response** (200 OK): Mentees, assigned projects, pending task reviews, mentorship requests.

### `GET /api/roles/hod/dashboard`
- **Auth**: Required (Role: `hod`, `admin`)
- **Boundary**: Strictly locked to HOD's department.

### `GET /api/roles/principal/dashboard`
- **Auth**: Required (Role: `principal`, `admin`)
- **Scope**: College-wide metrics and departmental breakdowns.

### `GET /api/roles/admin/dashboard`
- **Auth**: Required (Role: `admin`)
- **Response** (200 OK): Platform-wide users, roles, projects, applications, and activity.

### `PUT /api/roles/admin/user/:id/role`
- **Auth**: Required (Role: `admin`)
- **Protection**: Prevents admin self-demotion. Logs to `AuditLog`.

### `PUT /api/roles/admin/user/:id/status`
- **Auth**: Required (Role: `admin`)
- **Protection**: Prevents admin self-deactivation. Logs to `AuditLog`.

### `GET /api/roles/admin/audit-logs`
- **Auth**: Required (Role: `admin`)
- **Response** (200 OK): Paginated administrative audit trail.
