import mongoose from "mongoose";
import User from "./models/User.js";
import StudentProfile from "./models/StudentProfile.js";
import MentorProfile from "./models/MentorProfile.js";
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import Application from "./models/Application.js";

const COLLEGE = "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati";

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/project_match");
  console.log("[Seed Mentor] Connected to MongoDB");

  // 1. Locate mentor accounts (both demo and institutional)
  const mentors = await User.find({
    email: { $in: ["mentor@example.com", "dr.amit.deshmukh@vkbiet.edu.in"] }
  });

  if (mentors.length === 0) {
    console.error("No mentor accounts found!");
    process.exit(1);
  }

  // Ensure mentor profile exists with rating 4.5
  for (const m of mentors) {
    await MentorProfile.findOneAndUpdate(
      { user: m._id },
      {
        user: m._id,
        designation: "Professor",
        department: "Computer Engineering",
        college: COLLEGE,
        rating: 4.5,
        reviewCount: 48,
        studentsMentoredCount: 32,
        expertise: ["AI/ML", "Deep Learning", "Python", "Cloud Architecture"]
      },
      { upsert: true, new: true }
    );
  }

  const primaryMentor = mentors[0];
  const allMentorIds = mentors.map(m => m._id);

  // 2. Helper to find or create students
  const studentDataList = [
    { name: "Rahul Sharma", email: "rahul.sharma@vkbiet.edu.in", dept: "Computer Engineering", cgpa: 8.8 },
    { Priya: "Priya Patil", name: "Priya Patil", email: "priya.patil@vkbiet.edu.in", dept: "Information Technology", cgpa: 8.9 },
    { name: "Akash Kulkarni", email: "akash.kulkarni@vkbiet.edu.in", dept: "Artificial Intelligence & Data Science", cgpa: 8.6 },
    { name: "Sneha Shetty", email: "sneha.shetty@vkbiet.edu.in", dept: "Computer Engineering", cgpa: 8.7 },
    { name: "Vivek Rane", email: "vivek.rane@vkbiet.edu.in", dept: "Electronics & Telecommunication Engineering", cgpa: 8.4 },
    { name: "Rahul Pawar", email: "rahul.pawar@vkbiet.edu.in", dept: "Computer Engineering", cgpa: 8.9 },
    { name: "Sneha Patil", email: "sneha.patil@vkbiet.edu.in", dept: "Information Technology", cgpa: 8.7 },
    { name: "Aditya Deshmukh", email: "aditya.deshmukh@vkbiet.edu.in", dept: "Artificial Intelligence & Data Science", cgpa: 8.5 },
    { name: "Tanvi Joshi", email: "tanvi.joshi@vkbiet.edu.in", dept: "Computer Engineering", cgpa: 9.1 },
    { name: "Rohan Shinde", email: "rohan.shinde@vkbiet.edu.in", dept: "Information Technology", cgpa: 8.3 },
  ];

  const studentUserMap = {};
  for (const s of studentDataList) {
    let u = await User.findOne({ email: s.email });
    if (!u) {
      u = await User.create({
        name: s.name,
        email: s.email,
        password: "Student@123",
        role: "student",
        department: s.dept,
        college: COLLEGE,
        verificationStatus: "Profile Verified"
      });
      await StudentProfile.create({
        user: u._id,
        department: s.dept,
        college: COLLEGE,
        cgpa: s.cgpa,
        year: 3,
        academicYear: "3rd Year",
        skills: ["React", "Python", "Node.js", "MongoDB", "Data Structures"]
      });
    }
    studentUserMap[s.name] = u;
  }

  // 3. Clean up existing tasks/projects previously seeded for these mentors to ensure exact state
  await Project.deleteMany({
    title: {
      $in: [
        "Smart Campus AI",
        "SolarSense AI",
        "MediTrack",
        "EcoLearn",
        "AgriConnect",
        "CyberShield",
        "RoboVision",
        "CloudFlow IoT",
        "AI Study Assistant",
        "Campus Navigator",
        "HealthMate"
      ]
    }
  });

  // 4. Create 8 Assigned Projects for the mentor
  const projectDefs = [
    {
      title: "Smart Campus AI",
      department: "Computer Engineering",
      domain: "AI/ML",
      description: "An automated intelligent campus management platform with real-time navigation and occupancy tracking.",
      progress: 72,
      teamSize: 4,
      openPositions: 0,
      status: "In Progress",
      leader: "Rahul Sharma",
      members: ["Rahul Sharma", "Priya Patil", "Akash Kulkarni", "Sneha Shetty"],
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop"
    },
    {
      title: "SolarSense AI",
      department: "Information Technology",
      domain: "IoT",
      description: "Predictive solar energy optimization and fault diagnostic engine using embedded sensors.",
      progress: 58,
      teamSize: 4,
      openPositions: 0,
      status: "In Progress",
      leader: "Priya Patil",
      members: ["Priya Patil", "Rahul Sharma", "Tanvi Joshi", "Rohan Shinde"],
      image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&h=200&fit=crop"
    },
    {
      title: "MediTrack",
      department: "Artificial Intelligence & Data Science",
      domain: "Healthcare AI",
      description: "Hospital workflow intelligence and patient vitals telemetry alerting platform.",
      progress: 41,
      teamSize: 4,
      openPositions: 0,
      status: "In Progress",
      leader: "Akash Kulkarni",
      members: ["Akash Kulkarni", "Sneha Shetty", "Vivek Rane", "Tanvi Joshi"],
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=200&fit=crop"
    },
    {
      title: "EcoLearn",
      department: "Computer Engineering",
      domain: "Web Development",
      description: "Gamified environmental literacy and sustainable lifestyle habit tracker for schools.",
      progress: 65,
      teamSize: 4,
      openPositions: 0,
      status: "In Progress",
      leader: "Sneha Shetty",
      members: ["Sneha Shetty", "Vivek Rane", "Rahul Sharma", "Rohan Shinde"],
      image: ""
    },
    {
      title: "AgriConnect",
      department: "Electronics & Telecommunication Engineering",
      domain: "IoT",
      description: "Precision smart agriculture irrigation and crop pathogen computer vision diagnostic.",
      progress: 50,
      teamSize: 4,
      openPositions: 0,
      status: "In Progress",
      leader: "Vivek Rane",
      members: ["Vivek Rane", "Akash Kulkarni", "Priya Patil", "Tanvi Joshi"],
      image: ""
    },
    {
      title: "CyberShield",
      department: "Information Technology",
      domain: "Cybersecurity",
      description: "Automated zero-trust packet inspector and credential stuffing defense gateway.",
      progress: 80,
      teamSize: 3,
      openPositions: 0,
      status: "In Progress",
      leader: "Rohan Shinde",
      members: ["Rohan Shinde", "Sneha Shetty", "Rahul Sharma"],
      image: ""
    },
    {
      title: "RoboVision",
      department: "Computer Engineering",
      domain: "Robotics",
      description: "Autonomous warehouse shelf navigation and package sorting mobile robot.",
      progress: 35,
      teamSize: 4,
      openPositions: 0,
      status: "In Progress",
      leader: "Tanvi Joshi",
      members: ["Tanvi Joshi", "Akash Kulkarni", "Vivek Rane", "Priya Patil"],
      image: ""
    },
    {
      title: "CloudFlow IoT",
      department: "Computer Engineering",
      domain: "Cloud",
      description: "Edge-to-cloud serverless telemetry ingestion pipeline and live anomaly dashboard.",
      progress: 90,
      teamSize: 3,
      openPositions: 0,
      status: "In Progress",
      leader: "Rahul Sharma",
      members: ["Rahul Sharma", "Sneha Shetty", "Tanvi Joshi"],
      image: ""
    }
  ];

  const createdProjects = {};

  for (const def of projectDefs) {
    const leaderUser = studentUserMap[def.leader];
    const memberDocs = def.members.map(name => ({
      user: studentUserMap[name]._id,
      role: name === def.leader ? "Leader" : "Member",
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }));

    // Create project assigned to primaryMentor (and demo mentor)
    const p = await Project.create({
      title: def.title,
      description: def.description,
      department: def.department,
      domain: def.domain,
      college: COLLEGE,
      techStack: ["React", "Python", "Node.js", "Docker"],
      requiredSkills: ["JavaScript", "Python"],
      teamSize: def.teamSize,
      openPositions: def.openPositions,
      creator: leaderUser._id,
      groupLeader: leaderUser._id,
      mentor: primaryMentor._id,
      members: memberDocs,
      status: def.status,
      progress: def.progress,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      image: def.image
    });

    createdProjects[def.title] = p;

    // Also replicate mentor assignment to all mentor accounts if multiple
    for (const otherMentor of mentors) {
      if (otherMentor._id.toString() !== primaryMentor._id.toString()) {
        // We ensure queries matching any mentor account find these
        p.mentor = otherMentor._id; // We'll link both via an updated query or ensure both can access
      }
    }
  }

  // To ensure BOTH demo mentor (mentor@example.com) and inst mentor (dr.amit.deshmukh@vkbiet.edu.in)
  // see the exact same 8 projects, let's assign 8 projects to each mentor or set up clean ownership:
  for (const m of mentors) {
    for (const def of projectDefs) {
      const leaderUser = studentUserMap[def.leader];
      const memberDocs = def.members.map(name => ({
        user: studentUserMap[name]._id,
        role: name === def.leader ? "Leader" : "Member",
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }));

      // Update or create specifically for this mentor
      const existing = await Project.findOne({ title: def.title, mentor: m._id });
      if (!existing) {
        await Project.create({
          title: def.title,
          description: def.description,
          department: def.department,
          domain: def.domain,
          college: COLLEGE,
          techStack: ["React", "Python", "Node.js", "Docker"],
          requiredSkills: ["JavaScript", "Python"],
          teamSize: def.teamSize,
          openPositions: def.openPositions,
          creator: leaderUser._id,
          groupLeader: leaderUser._id,
          mentor: m._id,
          members: memberDocs,
          status: def.status,
          progress: def.progress,
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          image: def.image
        });
      }
    }
  }

  console.log("[Seed Mentor] Created 8 Assigned Projects for mentors.");

  // 5. Create the 5 Tasks Awaiting Review matching the reference image
  // Rahul Sharma - Smart Campus AI - Frontend Login - 2 hours ago
  // Priya Patil - SolarSense AI - UI Improvements - 1 day ago
  // Akash Kulkarni - MediTrack - Database Schema - 2 days ago
  // Sneha Shetty - EcoLearn - API Integration - 2 days ago
  // Vivek Rane - AgriConnect - Model Training - 3 days ago

  const reviewTaskDefs = [
    {
      student: "Rahul Sharma",
      projectTitle: "Smart Campus AI",
      taskTitle: "Frontend Login",
      description: "Implement responsive login screen with role routing, session tokens, and accessible error alerts.",
      submissionNotes: "Completed the responsive form layout and attached screenshot previews. Tokens persist across page reloads.",
      hoursAgo: 2,
      deadline: new Date("2026-09-22T18:00:00.000Z"),
      status: "Submitted"
    },
    {
      student: "Priya Patil",
      projectTitle: "SolarSense AI",
      taskTitle: "UI Improvements",
      description: "Refactor energy yield graphs using Chart.js with responsive dark mode canvas styling.",
      submissionNotes: "Updated solar telemetry chart cards and optimized rerenders with useMemo.",
      hoursAgo: 24,
      deadline: new Date("2026-09-30T18:00:00.000Z"),
      status: "Submitted"
    },
    {
      student: "Akash Kulkarni",
      projectTitle: "MediTrack",
      taskTitle: "Database Schema",
      description: "Design MongoDB schemas for patient vitals, emergency alert thresholds, and doctor telemetry history.",
      submissionNotes: "Defined Mongoose models with compound indexes on patientId and timestamp.",
      hoursAgo: 48,
      deadline: new Date("2026-09-25T18:00:00.000Z"),
      status: "Submitted"
    },
    {
      student: "Sneha Shetty",
      projectTitle: "EcoLearn",
      taskTitle: "API Integration",
      description: "Connect climate quiz frontend to REST backend with score calculation and badge awards.",
      submissionNotes: "Integrated REST endpoints and handled loading skeletons and error states.",
      hoursAgo: 50,
      deadline: new Date("2026-10-05T18:00:00.000Z"),
      status: "Submitted"
    },
    {
      student: "Vivek Rane",
      projectTitle: "AgriConnect",
      taskTitle: "Model Training",
      description: "Fine-tune MobileNetV2 on 4,000 leaf pathogen images and benchmark inference latency.",
      submissionNotes: "Achieved 94.2% test accuracy on tomato late blight dataset with 32ms inference time.",
      hoursAgo: 72,
      deadline: new Date("2026-10-08T18:00:00.000Z"),
      status: "Submitted"
    }
  ];

  // Also seed the Upcoming Deadlines tasks:
  // Database Integration - Smart Campus AI - Sep 22, 2026 (3 days left)
  // Model Training - MediTrack - Sep 25, 2026 (6 days left)
  // Final Report Submission - SolarSense AI - Sep 30, 2026 (11 days left)
  const deadlineTaskDefs = [
    {
      student: "Rahul Sharma",
      projectTitle: "Smart Campus AI",
      taskTitle: "Database Integration",
      description: "Connect MongoDB models to API routes and ensure atomic transactions.",
      deadline: new Date("2026-09-22T23:59:59.000Z"),
      status: "In Progress"
    },
    {
      student: "Akash Kulkarni",
      projectTitle: "MediTrack",
      taskTitle: "Model Training",
      description: "Train risk prediction regression model on anonymized vitals stream.",
      deadline: new Date("2026-09-25T23:59:59.000Z"),
      status: "In Progress"
    },
    {
      student: "Priya Patil",
      projectTitle: "SolarSense AI",
      taskTitle: "Final Report Submission",
      description: "Compile technical report, architecture diagrams, and test coverage metrics.",
      deadline: new Date("2026-09-30T23:59:59.000Z"),
      status: "To Do"
    }
  ];

  for (const m of mentors) {
    // Delete old tasks for projects belonging to this mentor
    const mentorProjects = await Project.find({ mentor: m._id });
    const projectMap = {};
    mentorProjects.forEach(p => { projectMap[p.title] = p; });

    await Task.deleteMany({ project: { $in: mentorProjects.map(p => p._id) } });

    // Seed 5 Review Tasks
    for (const tDef of reviewTaskDefs) {
      const proj = projectMap[tDef.projectTitle];
      const student = studentUserMap[tDef.student];
      if (proj && student) {
        const submittedDate = new Date(Date.now() - tDef.hoursAgo * 60 * 60 * 1000);
        await Task.create({
          project: proj._id,
          title: tDef.taskTitle,
          description: tDef.description,
          assignedTo: student._id,
          createdBy: proj.creator,
          priority: "High",
          deadline: tDef.deadline,
          status: "Submitted",
          submissionNotes: tDef.submissionNotes,
          createdAt: submittedDate,
          updatedAt: submittedDate
        });
      }
    }

    // Seed Deadline Tasks
    for (const dDef of deadlineTaskDefs) {
      const proj = projectMap[dDef.projectTitle];
      const student = studentUserMap[dDef.student];
      if (proj && student) {
        await Task.create({
          project: proj._id,
          title: dDef.taskTitle,
          description: dDef.description,
          assignedTo: student._id,
          createdBy: proj.creator,
          priority: "High",
          deadline: dDef.deadline,
          status: dDef.status
        });
      }
    }
  }

  console.log("[Seed Mentor] Created tasks awaiting review and upcoming deadlines.");

  // 6. Seed Incoming Mentorship Requests matching the reference image:
  // 1. Rahul Pawar - Computer Engineering • CGPA: 8.9 - Project: AI Study Assistant
  //    "We would be grateful if you could mentor our project..." (2 hours ago)
  // 2. Sneha Patil - Information Technology • CGPA: 8.7 - Project: Campus Navigator
  //    "Our team would like your guidance for our final year project..." (1 day ago)
  // 3. Aditya Deshmukh - AIDS • CGPA: 8.5 - Project: HealthMate
  //    "We are working on a healthcare solution and would love..." (2 days ago)

  const requestDefs = [
    {
      studentName: "Rahul Pawar",
      projectTitle: "AI Study Assistant",
      domain: "Computer Engineering",
      coverNote: "We would be grateful if you could mentor our project on personalized learning paths and automated doubt-solving assistants.",
      hoursAgo: 2
    },
    {
      studentName: "Sneha Patil",
      projectTitle: "Campus Navigator",
      domain: "Information Technology",
      coverNote: "Our team would like your guidance for our final year project building an indoor BLE beacon and AR campus navigation app.",
      hoursAgo: 24
    },
    {
      studentName: "Aditya Deshmukh",
      projectTitle: "HealthMate",
      domain: "Artificial Intelligence & Data Science",
      coverNote: "We are working on a healthcare solution and would love your mentorship in medical data ethics and model validation.",
      hoursAgo: 48
    }
  ];

  // Clean old pending mentorship requests for these mentors
  await Application.deleteMany({
    mentor: { $in: allMentorIds },
    type: "Mentorship Request"
  });

  for (const m of mentors) {
    for (const rDef of requestDefs) {
      const applicant = studentUserMap[rDef.studentName];
      const appliedDate = new Date(Date.now() - rDef.hoursAgo * 60 * 60 * 1000);

      // Create dummy project for request if not exists
      let reqProject = await Project.findOne({ title: rDef.projectTitle });
      if (!reqProject) {
        reqProject = await Project.create({
          title: rDef.projectTitle,
          description: `Capstone project on ${rDef.projectTitle} led by ${rDef.studentName}`,
          department: rDef.domain,
          domain: "AI/ML",
          college: COLLEGE,
          creator: applicant._id,
          groupLeader: applicant._id,
          teamSize: 4,
          openPositions: 2,
          status: "Recruiting"
        });
      }

      await Application.create({
        applicant: applicant._id,
        sender: applicant._id,
        recipient: m._id,
        project: reqProject._id,
        mentor: m._id,
        type: "Mentorship Request",
        title: rDef.projectTitle,
        targetName: rDef.projectTitle,
        category: rDef.domain,
        coverNote: rDef.coverNote,
        status: "In Review",
        appliedDate: appliedDate,
        createdAt: appliedDate
      });
    }
  }

  console.log("[Seed Mentor] Created 3 Incoming Mentorship Requests.");
  console.log("\n✅ [Seed Mentor] ALL REFERENCE DATA SEEDED SUCCESSFULLY!");
  process.exit(0);
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
