# 🤝 Project Match

> **Where Ideas Find the Right Team.**  
> A comprehensive, full-stack campus collaboration platform designed to empower students, faculty mentors, and academic administrators to turn ambitious engineering concepts into reality.

[![GitHub Repo](https://img.shields.io/badge/GitHub-sahil--khot%2FProject--Match-181717?logo=github&logoColor=white)](https://github.com/sahil-khot/Project-Match)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas%20(Cloud)-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20API-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 💡 The Story Behind Project Match

In every college corridor and laboratory, there’s an engineer with an ambitious IoT build looking for a dashboard developer, a data science student needing a sleek web frontend, or a designer with an interface mockup waiting for a backend architect.

Too often, exceptional capstones and hackathon projects never launch simply because finding the right teammates across departments is messy, unorganized, and left to luck.

**Project Match** was built to solve this challenge. It replaces haphazard WhatsApp groups and notice board flyers with an intelligent, structured, and transparent campus ecosystem where students pitch concepts, recruit cross-disciplinary peers, track formal milestones, and collaborate closely with assigned faculty mentors.

---

## ✨ Key Features & Role Experiences

### 🎓 1. Student Workspace
* **Smart Teammate Matchmaking**: Recommends peers based on complementary technical stacks, department, graduation year, and availability with clear **Match Scores**.
* **Skill Gap Analysis**: Visualizes missing domain requirements for any project and highlights ideal candidate profiles.
* **Project Lifecycle Management**: Full workflow through structured stages: `Idea` ➔ `Recruiting` ➔ `In Progress` ➔ `Completed`.
* **Milestone & Task Board**: Assign responsibilities, set deadlines, and submit deliverables with attachments and review cycles.
* **Fair Gamified Leaderboard**: Grounded ranking system driven by real engineering output:
  $$\text{Score} = (\text{CGPA} \times 10) + (\text{Approved Tasks} \times 15) + (\text{Completed Projects} \times 25) + (\text{Community Posts} \times 5)$$
* **Real-time Collaboration & Community**: Direct messaging, team chat rooms, and a campus-wide feed to showcase launches and milestones.

---

### 🧑‍🏫 2. Faculty Mentor Suite
* **Assigned Projects Console**: Centralized hub to oversee student capstone teams and track project health.
* **Mentorship Requests**: Review, accept, or decline incoming mentorship requests from student project leaders.
* **Task Review System**: Formally inspect task submissions, review notes/attachments, and approve or request revisions.
* **Student & Team Directory**: Deep-dive into student profiles, departmental distribution, and team progress.

---

### 🏛️ 3. Principal Institutional Governance
* **College-Wide KPIs**: Live macro-level metrics spanning active projects, student participation, and mentor allocations.
* **Cross-Departmental Analytics**: Benchmark research & development activity across Computer, AI&DS, IT, ENTC, Electrical, Mechanical, and Civil engineering.
* **Institutional Innovation Insights**: Track multi-disciplinary collaboration rates and intellectual property creation.

---

### 👑 4. System Administration Hub
* **Admin SubViews**: Dedicated control center for institutional user management, role delegation, and account status.
* **Audit Trail Inspection**: Cryptographically tracked administrative logs for security-critical actions and permission changes.
* **Platform Health Monitoring**: System uptime, active connections, and database sync status.

---

### 🤖 5. Integrated AI Co-Pilot (Powered by Google Gemini)
* **Architecture & Tech Stack Advisor**: Brainstorms software architecture, database schemas, and libraries tailored to the problem statement.
* **Campus-Grounded Recommendations**: Uses live project and student profile context to suggest optimal team balance.
* **Problem Statement Refinement**: Formulates clear project scopes, phases, and milestones.

---

### 👁️ 6. High-Legibility Typography Design
* Designed with modern reading standards (inspired by ChatGPT large-text ergonomics).
* **16px baseline** typography with clear visual hierarchy, eliminating cramped fonts.
* Fully styled in a sleek dark theme with high-contrast LeetCode-inspired palettes.

---

## 🛠️ Architecture & Tech Stack

```
Project Match
├── client/                               # Frontend Single Page Application
│   ├── src/
│   │   ├── components/                   # Navigation, Header, Modals, Shells
│   │   ├── context/                      # AuthContext (JWT + Session State)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx             # Unified student & overview dashboard
│   │   │   ├── ExploreProjects.jsx       # Project discovery & filters
│   │   │   ├── FindTeammates.jsx         # Candidate recommendation cards
│   │   │   ├── FindMentor.jsx            # Faculty directory & request modal
│   │   │   ├── MyProjects.jsx            # Project workspace & task board
│   │   │   ├── Messages.jsx              # Real-time direct & team chat
│   │   │   ├── Leaderboards.jsx          # Historical rankings & podiums
│   │   │   ├── AIAssistant.jsx           # Google Gemini AI Co-Pilot
│   │   │   ├── Profile.jsx               # Student/Mentor portfolio
│   │   │   ├── MentorDashboard.jsx       # Mentor console overview
│   │   │   ├── MentorAssignedProjects.jsx# Mentor assigned projects view
│   │   │   ├── MentorStudentsTeams.jsx   # Mentor student teams breakdown
│   │   │   ├── MentorTaskReviews.jsx     # Formal task submission reviews
│   │   │   ├── MentorMentorshipRequests.jsx # Mentorship request management
│   │   │   ├── PrincipalDashboard.jsx    # Institutional analytics
│   │   │   ├── PrincipalInstitutionalViews.jsx # Department comparisons
│   │   │   ├── AdminDashboard.jsx        # Admin overview
│   │   │   └── AdminSubViews.jsx         # User & audit log management suite
│   │   └── services/                     # Axios API clients & interceptors
│   └── vite.config.js                    # Vite configuration with API proxy
│
├── server/                               # Backend RESTful API
│   ├── src/
│   │   ├── config/                       # MongoDB Atlas Mongoose connection
│   │   ├── middleware/                   # JWT auth, rate limiters, upload guards
│   │   ├── models/                       # Schemas (User, Project, Task, Profile, etc.)
│   │   ├── routes/                       # Auth, Projects, Students, Mentors, AI, Roles
│   │   ├── seed.js                       # Comprehensive campus database seeder
│   │   └── server.js                     # Express server entry point
│   └── uploads/                          # Secure document and asset storage
│
└── docs/                                 # Documentation & API Specifications
    └── API.md                            # Comprehensive REST API contracts
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router v7, Lucide Icons |
| **Backend** | Node.js (ES Modules), Express 4.21, Mongoose 8.9 |
| **Database** | MongoDB Atlas (Cloud Cluster with Multi-Region Replica Set) |
| **Artificial Intelligence** | Google Gemini API (`@google/genai` 2.22) |
| **Security** | HTTP-Only Cookies, JWT, Helmet, Express Rate Limit, BcryptJS, IDOR guards |

---

## 🚦 Quick Start & Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [Git](https://git-scm.com/)
* A free [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)

---

### 1. Clone the Repository
```bash
git clone https://github.com/sahil-khot/Project-Match.git
cd Project-Match
```

---

### 2. Backend Configuration & Setup

```bash
cd server
npm install
```

Create your `server/.env` file:
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/project_match?retryWrites=true&w=majority

# Security Keys
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

#### (Optional) Seed Sample Campus Data
To populate your Atlas database with realistic students, mentors, projects, tasks, and historical leaderboard snapshots:
```bash
npm run seed
```

#### Launch the Backend Server
```bash
npm run dev
```
> API will run live at: **http://localhost:5000**  
> Health check: **http://localhost:5000/api/health**

---

### 3. Frontend Configuration & Setup

In a new terminal window:
```bash
cd client
npm install
```

Create your `client/.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=
```

#### Launch the Frontend Dev Server
```bash
npm run dev
```
> Open your browser at: **http://localhost:3000**

---

## 🔑 Quick Demo Login Credentials

You can test every role immediately using these pre-seeded accounts:

| Role | Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Student** | `sahil@example.com` | `Student@123` | Pitch projects, search teammates, chat, submit tasks, AI co-pilot |
| **Mentor** | `mentor@example.com` | `Mentor@123` | Review task deliverables, accept mentorship requests, oversee teams |
| **Principal** | `principal@example.com` | `Principal@123` | Institutional R&D analytics, cross-department comparison charts |
| **Admin** | `admin@example.com` | `Admin@123` | Full user management, role delegation, security audit log inspection |

---

## 🔒 Security Architecture

Project Match implements production-grade security patterns:
* **HttpOnly & SameSite Cookies**: JWTs are stored in secure cookies (`pm_token`) to mitigate client-side XSS exploitation.
* **Strict IDOR Prevention**: Task review approvals, project edits, and document access verify explicit user ownership and role hierarchy before execution.
* **Tiered Rate Limiting**: Dedicated rate-limiting windows prevent brute-force attacks on authentication, community posts, and Gemini AI queries.
* **Helmet & CORS Protections**: HTTP security headers configured with environment-aware origin verification.
* **Path Traversal Defense**: Strict sanitization of filenames for uploaded documents and project media.

---

## 📖 API Documentation

Detailed contracts for all endpoints, payload schemas, and response formats are available in [`docs/API.md`](docs/API.md).

Key Route Groups:
* `/api/auth` — Registration, login, Google OAuth, session state
* `/api/students` — Profiles, skills, match recommendations
* `/api/projects` — Lifecycle, team applications, invitations
* `/api/tasks` — Milestones, submission uploads, approval reviews
* `/api/messages` — Direct chat and team project messaging
* `/api/leaderboards` — Calculated rankings and historical snapshot tracking
* `/api/ai` — Google Gemini contextual brainstorming
* `/api/roles` — Mentor, Principal, and Administrator governance endpoints

---

## 🤝 Contributing

Contributions from students, educators, and open-source developers are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'feat: Add NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for campus innovators and future builders.<br/>
  <b>Project Match</b> — <i>Where Ideas Find the Right Team.</i>
</p>
