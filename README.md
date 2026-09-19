# 🚀 Project Match

### Where Ideas Find the Right Team

> A full-stack MERN platform that helps students discover projects, find compatible teammates, collaborate with teams, connect with faculty mentors, and manage academic projects through a unified platform.

[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/API-Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/ODM-Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Objectives](#-objectives)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Role-Based Access Control](#-role-based-access-control)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Architecture](#-project-architecture)
- [Application Workflow](#-application-workflow)
- [Database Architecture](#-database-architecture)
- [Authentication & Security](#-authentication--security)
- [AI & Machine Learning](#-ai--machine-learning)
- [Major Modules](#-major-modules)
- [Institutional Dataset](#-institutional-dataset)
- [Dashboard Architecture](#-dashboard-architecture)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Project](#-running-the-project)
- [Git Workflow](#-git-workflow)
- [Screenshots](#-screenshots)
- [API Architecture](#-api-architecture)
- [Testing Checklist](#-testing-checklist)
- [Security Considerations](#-security-considerations)
- [Future Scope](#-future-scope)
- [Project Limitations](#-project-limitations)
- [Learning Outcomes](#-learning-outcomes)
- [Why Project Match?](#-why-project-match)
- [Author](#-author)
- [License](#-license)

---

# 📖 Overview

Project Match is a full-stack academic collaboration platform designed to solve a common problem in engineering colleges: **finding suitable teammates and managing student projects efficiently**.

Students often have different:

- Technical skills
- Academic backgrounds
- Departments
- Interests
- Project experience
- Availability
- Areas of specialization

Project Match provides a centralized environment where students can discover projects, find teammates, collaborate with teams, communicate with mentors, manage tasks, and track project progress.

The platform also provides dedicated interfaces for:

- 👨‍🎓 Students
- 👨‍🏫 Mentors
- 🏛️ Principal
- 🛡️ Administrators

Each role receives permissions and functionality appropriate to its responsibility.

---

# ❗ Problem Statement

College project collaboration is often managed through informal communication channels such as:

- WhatsApp groups
- Classroom discussions
- Spreadsheets
- Manual team formation
- Personal contacts

This creates several problems:

1. Students struggle to find teammates with complementary skills.
2. Project opportunities are difficult to discover.
3. Faculty mentorship requests are difficult to organize.
4. Project tasks and deadlines are often tracked manually.
5. Communication is scattered across different platforms.
6. Faculty members have limited visibility into project progress.
7. Institutional authorities lack centralized project analytics.
8. There is no unified system for managing the complete project lifecycle.

Project Match addresses these problems through one integrated platform.

---

# 🎯 Objectives

The primary objectives of Project Match are:

- Build a centralized student collaboration platform.
- Help students discover suitable project opportunities.
- Help students find teammates based on skills and interests.
- Support structured project team formation.
- Connect students with faculty mentors.
- Provide task assignment and tracking.
- Enable direct and team communication.
- Provide project progress monitoring.
- Provide institutional-level analytics.
- Implement secure authentication and authorization.
- Integrate AI/ML-based assistance.
- Build a scalable MERN-based architecture.

---

# ✨ Key Features

## 👨‍🎓 Student Features

Students can:

- Register and authenticate securely.
- Create and manage their academic profile.
- Add department and academic year.
- Add CGPA.
- Add technical skills.
- Add interests.
- Add project experience.
- Set availability.
- Explore available projects.
- Search and filter projects.
- Find potential teammates.
- View student profiles.
- Apply to projects.
- Create projects.
- Form project teams.
- Assign a team leader.
- Request faculty mentorship.
- Communicate with teammates.
- Send direct messages.
- Participate in team conversations.
- Receive notifications.
- Create and manage project tasks.
- Track deadlines.
- Submit completed tasks.
- View mentor feedback.
- Participate in community discussions.
- Explore learning resources.
- View leaderboards.
- Use the AI Assistant.

---

# 👨‍🏫 Mentor Features

A Mentor represents a faculty member responsible for guiding student projects.

Mentors can:

- View mentor dashboard.
- View assigned projects.
- View assigned student teams.
- Receive mentorship requests.
- Accept or decline mentorship requests.
- Review student task submissions.
- Provide structured feedback.
- Track project progress.
- View project milestones.
- Communicate with students.
- Participate in project discussions.
- Manage mentor profile.

### Mentor Scope

Mentors are **faculty project guides**, not institutional administrators.

They do not have unrestricted access to:

- System settings
- All user accounts
- Institutional configuration
- Platform security
- Arbitrary account deletion
- Global project administration

Their access is restricted to their mentoring responsibilities.

---

# 🏛️ Principal Features

The Principal receives an institutional-level view of Project Match.

The Principal dashboard provides visibility into:

- Total students
- Faculty mentors
- Projects
- Applications
- Completed projects
- Institutional CGPA
- Department statistics
- Student participation
- Project status
- Department project output
- Student skills
- Institutional activity
- Upcoming deadlines

The Principal primarily performs **institutional oversight and analytics**, rather than day-to-day project management.

---

# 🛡️ Admin Features

The Admin is responsible for the operation and governance of the platform.

Admin functionality includes:

- User management
- Project monitoring
- Application monitoring
- Reports
- System logs
- Platform settings
- System health
- Account activation/deactivation
- User activity monitoring
- Project statistics
- Application statistics
- Role distribution

The Admin Console is intentionally separated from student and mentor workflows.

---

# 🔐 Role-Based Access Control

Project Match contains four application roles:

```text
Student
Mentor
Principal
Admin
