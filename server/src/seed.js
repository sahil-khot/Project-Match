import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import StudentProfile from "./models/StudentProfile.js";
import MentorProfile from "./models/MentorProfile.js";
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import Application from "./models/Application.js";
import Message from "./models/Message.js";
import CommunityPost from "./models/CommunityPost.js";
import Notification from "./models/Notification.js";
import LeaderboardSnapshot from "./models/LeaderboardSnapshot.js";
import AuditLog from "./models/AuditLog.js";

dotenv.config();

const COLLEGE =
  "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/project_match";

// ─── DEPARTMENT DEFINITIONS ───────────────────────────────────────────────────
const DEPARTMENTS = [
  "Computer Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Electronics & Telecommunication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
];

const DEPT_SHORT = {
  "Computer Engineering": "CE",
  "Information Technology": "IT",
  "Artificial Intelligence & Data Science": "AIDS",
  "Electronics & Telecommunication Engineering": "ENTC",
  "Mechanical Engineering": "ME",
  "Civil Engineering": "CIVIL",
  "Electrical Engineering": "EE",
};

// ─── DEPARTMENT-SPECIFIC SKILL POOLS ──────────────────────────────────────────
const DEPT_SKILLS = {
  "Computer Engineering": {
    core: [
      "Java",
      "C++",
      "Python",
      "JavaScript",
      "Data Structures & Algorithms",
      "Operating Systems",
      "Computer Networks",
      "DBMS",
    ],
    tech: [
      "React",
      "Node.js",
      "MongoDB",
      "MySQL",
      "PostgreSQL",
      "Docker",
      "Git",
      "REST APIs",
      "GraphQL",
      "Redis",
    ],
    advanced: [
      "Kubernetes",
      "AWS",
      "Machine Learning",
      "Deep Learning",
      "Microservices",
      "System Design",
      "Blockchain",
      "TypeScript",
      "Next.js",
      "Spring Boot",
    ],
  },
  "Information Technology": {
    core: [
      "Java",
      "Python",
      "JavaScript",
      "SQL",
      "Networking",
      "Web Technologies",
      "Software Testing",
      "Database Management",
    ],
    tech: [
      "React",
      "Node.js",
      "Angular",
      "PHP",
      "Django",
      "Flask",
      "MySQL",
      "MongoDB",
      "Git",
      "Linux",
    ],
    advanced: [
      "Cloud Computing",
      "AWS",
      "Azure",
      "DevOps",
      "Cybersecurity",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Ethical Hacking",
      "Penetration Testing",
    ],
  },
  "Artificial Intelligence & Data Science": {
    core: [
      "Python",
      "Mathematics",
      "Statistics",
      "Linear Algebra",
      "Probability",
      "R",
      "SQL",
      "Data Structures",
    ],
    tech: [
      "Machine Learning",
      "Deep Learning",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Scikit-learn",
      "TensorFlow",
      "PyTorch",
      "Jupyter",
      "Tableau",
    ],
    advanced: [
      "NLP",
      "Computer Vision",
      "Generative AI",
      "LLMs",
      "Reinforcement Learning",
      "Time Series Analysis",
      "Big Data",
      "Spark",
      "MLOps",
      "Data Engineering",
    ],
  },
  "Electronics & Telecommunication Engineering": {
    core: [
      "C",
      "C++",
      "Embedded C",
      "Digital Electronics",
      "Analog Circuits",
      "Signal Processing",
      "Microcontrollers",
      "Communication Systems",
    ],
    tech: [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "MATLAB",
      "VLSI",
      "Verilog",
      "FPGA",
      "PCB Design",
      "Proteus",
      "LabVIEW",
    ],
    advanced: [
      "IoT",
      "5G Communication",
      "RF Design",
      "Antenna Design",
      "Image Processing",
      "Wireless Sensor Networks",
      "Edge Computing",
      "ROS",
      "Drone Technology",
    ],
  },
  "Mechanical Engineering": {
    core: [
      "Engineering Drawing",
      "Thermodynamics",
      "Fluid Mechanics",
      "Machine Design",
      "Manufacturing Processes",
      "Strength of Materials",
      "Kinematics",
    ],
    tech: [
      "AutoCAD",
      "SolidWorks",
      "CATIA",
      "ANSYS",
      "MATLAB",
      "Pro-E",
      "3D Modeling",
      "CAD/CAM",
      "FEA",
    ],
    advanced: [
      "Robotics",
      "CNC Programming",
      "Industry 4.0",
      "Additive Manufacturing",
      "3D Printing",
      "Automation",
      "PLC",
      "Drone Design",
      "Renewable Energy Systems",
    ],
  },
  "Civil Engineering": {
    core: [
      "Structural Analysis",
      "Concrete Technology",
      "Geotechnical Engineering",
      "Surveying",
      "Fluid Mechanics",
      "Environmental Engineering",
      "Transportation Engineering",
    ],
    tech: [
      "AutoCAD",
      "STAAD.Pro",
      "Revit",
      "ETABS",
      "SAP2000",
      "MATLAB",
      "ArcGIS",
      "Total Station",
      "Primavera",
    ],
    advanced: [
      "BIM",
      "Smart City Design",
      "Sustainable Construction",
      "Green Building",
      "Project Management",
      "Construction Management",
      "Urban Planning",
      "GIS Mapping",
    ],
  },
  "Electrical Engineering": {
    core: [
      "Circuit Theory",
      "Power Systems",
      "Electrical Machines",
      "Control Systems",
      "Signals & Systems",
      "Power Electronics",
      "Electromagnetic Theory",
    ],
    tech: [
      "MATLAB",
      "Simulink",
      "PLC Programming",
      "SCADA",
      "AutoCAD Electrical",
      "PSS/E",
      "ETAP",
      "LabVIEW",
      "Embedded Systems",
    ],
    advanced: [
      "Renewable Energy",
      "Smart Grid",
      "IoT",
      "Electric Vehicles",
      "Battery Management Systems",
      "Energy Storage",
      "Industrial Automation",
      "Drives & Motors",
    ],
  },
};

const DEPT_INTERESTS = {
  "Computer Engineering": [
    "Web Development",
    "AI/ML",
    "Game Development",
    "Open Source",
    "Competitive Programming",
    "Cloud Computing",
    "Cybersecurity",
    "Blockchain",
    "Mobile Development",
    "DevOps",
    "System Design",
    "Hackathons",
  ],
  "Information Technology": [
    "Web Development",
    "Cybersecurity",
    "Cloud Computing",
    "Data Science",
    "DevOps",
    "UI/UX Design",
    "Mobile Development",
    "Open Source",
    "Networking",
    "Product Management",
  ],
  "Artificial Intelligence & Data Science": [
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "Data Analytics",
    "Research",
    "AI Ethics",
    "Generative AI",
    "Reinforcement Learning",
    "Business Intelligence",
  ],
  "Electronics & Telecommunication Engineering": [
    "IoT",
    "Embedded Systems",
    "Robotics",
    "VLSI Design",
    "5G Technology",
    "Wireless Communication",
    "Drone Technology",
    "Hardware Design",
    "Signal Processing",
    "Smart Devices",
  ],
  "Mechanical Engineering": [
    "Robotics",
    "Automation",
    "Product Design",
    "Renewable Energy",
    "3D Printing",
    "Electric Vehicles",
    "Manufacturing",
    "Aerospace",
    "CAD Modeling",
    "Industry 4.0",
  ],
  "Civil Engineering": [
    "Structural Engineering",
    "Smart Cities",
    "Green Building",
    "Urban Planning",
    "Water Resources",
    "Transportation",
    "Sustainable Design",
    "Construction Tech",
    "GIS & Remote Sensing",
    "Disaster Management",
  ],
  "Electrical Engineering": [
    "Renewable Energy",
    "Electric Vehicles",
    "Smart Grid",
    "Power Electronics",
    "Automation",
    "IoT",
    "Energy Storage",
    "Industrial Control",
    "Robotics",
    "Wireless Power Transfer",
  ],
};

const DEPT_DOMAINS = {
  "Computer Engineering": [
    "Web Development",
    "AI/ML",
    "Mobile App",
    "Game Development",
    "Blockchain",
    "Cloud",
    "Cybersecurity",
    "IoT",
  ],
  "Information Technology": [
    "Web Development",
    "Cybersecurity",
    "Cloud",
    "DevOps",
    "Data Science",
    "Mobile App",
    "SaaS",
    "FinTech",
  ],
  "Artificial Intelligence & Data Science": [
    "AI/ML",
    "Data Science",
    "NLP",
    "Computer Vision",
    "Healthcare AI",
    "EdTech AI",
    "AgriTech",
  ],
  "Electronics & Telecommunication Engineering": [
    "IoT",
    "Embedded Systems",
    "Communication Systems",
    "Robotics",
    "VLSI",
    "Drone Tech",
    "Smart Devices",
  ],
  "Mechanical Engineering": [
    "Robotics",
    "Manufacturing",
    "Product Design",
    "Renewable Energy",
    "Automotive",
    "Aerospace",
    "Smart Manufacturing",
  ],
  "Civil Engineering": [
    "Smart Cities",
    "Green Building",
    "Infrastructure",
    "Structural Design",
    "Environmental",
    "Transportation",
    "Water Resources",
  ],
  "Electrical Engineering": [
    "Renewable Energy",
    "Smart Grid",
    "Electric Vehicles",
    "Power Systems",
    "Industrial Automation",
    "Energy Storage",
    "IoT",
  ],
};

const PREFERRED_ROLES = {
  "Computer Engineering": [
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "DevOps Engineer",
    "ML Engineer",
    "System Architect",
    "Team Lead",
  ],
  "Information Technology": [
    "Full Stack Developer",
    "Security Engineer",
    "Cloud Engineer",
    "QA Engineer",
    "UI/UX Designer",
    "Project Manager",
    "DevOps Engineer",
  ],
  "Artificial Intelligence & Data Science": [
    "ML Engineer",
    "Data Scientist",
    "Data Analyst",
    "AI Researcher",
    "Data Engineer",
    "NLP Engineer",
    "Computer Vision Engineer",
  ],
  "Electronics & Telecommunication Engineering": [
    "Hardware Engineer",
    "Embedded Systems Developer",
    "IoT Developer",
    "PCB Designer",
    "VLSI Engineer",
    "Signal Processing Engineer",
    "RF Engineer",
  ],
  "Mechanical Engineering": [
    "Mechanical Designer",
    "CAD Modeler",
    "Simulation Engineer",
    "Robotics Engineer",
    "Product Engineer",
    "Manufacturing Engineer",
  ],
  "Civil Engineering": [
    "Structural Engineer",
    "Geotechnical Engineer",
    "Environmental Engineer",
    "Urban Planner",
    "Project Manager",
    "Site Engineer",
  ],
  "Electrical Engineering": [
    "Power Systems Engineer",
    "Control Systems Engineer",
    "Embedded Developer",
    "Energy Analyst",
    "Automation Engineer",
    "EV Engineer",
  ],
};

// ─── REALISTIC INDIAN NAMES ────────────────────────────────────────────────────
const FIRST_NAMES_MALE = [
  "Aarav",
  "Aditya",
  "Akash",
  "Akshay",
  "Amit",
  "Amol",
  "Aniket",
  "Anil",
  "Anish",
  "Ankit",
  "Ankush",
  "Arjun",
  "Arnav",
  "Aryan",
  "Ashish",
  "Atharva",
  "Ayush",
  "Chinmay",
  "Chirag",
  "Darshan",
  "Devendra",
  "Dhruv",
  "Dinesh",
  "Gaurav",
  "Harsh",
  "Hrithik",
  "Karan",
  "Kartik",
  "Kunal",
  "Mahesh",
  "Manish",
  "Mayur",
  "Mihir",
  "Milind",
  "Mohit",
  "Nikhil",
  "Nilesh",
  "Omkar",
  "Parth",
  "Piyush",
  "Pranav",
  "Prasad",
  "Prashant",
  "Pratik",
  "Pushkar",
  "Rahul",
  "Raj",
  "Rajat",
  "Rajesh",
  "Rakesh",
  "Rohan",
  "Rushikesh",
  "Sachin",
  "Sagar",
  "Sahil",
  "Sandesh",
  "Sanket",
  "Shreyas",
  "Shubham",
  "Siddharth",
  "Soham",
  "Sujit",
  "Sunil",
  "Suraj",
  "Tushar",
  "Vaibhav",
  "Vedant",
  "Vikram",
  "Vinayak",
  "Vishal",
  "Vivek",
  "Yash",
  "Yogesh",
  "Abhishek",
  "Akshaj",
  "Bhushan",
  "Dhanraj",
  "Girish",
  "Hardik",
  "Ishaan",
  "Jayesh",
  "Kapil",
  "Kedar",
  "Lalit",
  "Makarand",
  "Nandan",
  "Ninad",
  "Onkar",
  "Pankaj",
  "Prasanna",
];

const FIRST_NAMES_FEMALE = [
  "Aishwarya",
  "Akanksha",
  "Amruta",
  "Ananya",
  "Ankita",
  "Anushka",
  "Apurva",
  "Archana",
  "Bhagyashri",
  "Bhakti",
  "Deepa",
  "Devyani",
  "Disha",
  "Garima",
  "Gauri",
  "Ishita",
  "Isha",
  "Janhavi",
  "Kalyani",
  "Kanchan",
  "Kavya",
  "Ketaki",
  "Komal",
  "Kriti",
  "Madhuri",
  "Manasi",
  "Manisha",
  "Megha",
  "Mrunali",
  "Mugdha",
  "Namrata",
  "Neha",
  "Nikita",
  "Pallavi",
  "Poonam",
  "Pooja",
  "Pratiksha",
  "Priyanka",
  "Priya",
  "Rashmi",
  "Riya",
  "Rucha",
  "Rujuta",
  "Rutuja",
  "Sakshi",
  "Sanjana",
  "Sejal",
  "Shraddha",
  "Shravani",
  "Shruti",
  "Sneha",
  "Sonali",
  "Supriya",
  "Swati",
  "Tejal",
  "Trisha",
  "Urvashi",
  "Vaishali",
  "Varsha",
  "Veda",
  "Vidya",
  "Vrushali",
  "Yamini",
  "Yogita",
  "Yukta",
  "Arti",
  "Chhaya",
  "Dipti",
  "Esha",
  "Falguni",
];

const LAST_NAMES = [
  "Patil",
  "Deshmukh",
  "Jadhav",
  "Shinde",
  "Kulkarni",
  "Pawar",
  "Bhosale",
  "Gaikwad",
  "Mane",
  "Salve",
  "More",
  "Kale",
  "Deshpande",
  "Joshi",
  "Kamble",
  "Chavan",
  "Thorat",
  "Naikwadi",
  "Sawant",
  "Waghmare",
  "Khot",
  "Kadam",
  "Bankar",
  "Sutar",
  "Powar",
  "Mahale",
  "Yadav",
  "Holkar",
  "Maske",
  "Dhole",
  "Kumbhar",
  "Ghuge",
  "Biradar",
  "Nale",
  "Shelar",
  "Gade",
  "Wagh",
  "Lokhande",
  "Pande",
  "Parab",
  "Nimkar",
  "Jagtap",
  "Khandare",
  "Mohite",
  "Shelke",
  "Bhalerao",
  "Mukadam",
  "Raut",
  "Nimbalkar",
  "Gavhane",
];

const MENTOR_TITLES = ["Dr.", "Prof.", "Prof. Dr."];
const MENTOR_DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Senior Lecturer",
];

// Avatar pools from Unsplash (real working URLs)
const MALE_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&h=150&fit=crop&crop=face",
];
const FEMALE_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
];

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
function pick(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

function rand(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCgpa(dept, year) {
  // Realistic CGPA distribution: centered around 7.5–8.5
  const base = 6.5 + Math.random() * 3;
  return Math.min(10, Math.max(5.0, Math.round(base * 100) / 100));
}

function generateSkillsForStudent(dept, experienceLevel, interests) {
  const pool = DEPT_SKILLS[dept];
  const coreCount =
    experienceLevel === "Beginner"
      ? 3
      : experienceLevel === "Intermediate"
        ? 5
        : 6;
  const techCount =
    experienceLevel === "Beginner"
      ? 2
      : experienceLevel === "Intermediate"
        ? 4
        : 6;
  const advCount =
    experienceLevel === "Beginner"
      ? 0
      : experienceLevel === "Intermediate"
        ? 2
        : 4;

  const skills = [
    ...pick(pool.core, coreCount),
    ...pick(pool.tech, techCount),
    ...pick(pool.advanced, advCount),
  ];

  // Cross-department skill sharing where realistic
  if (interests.includes("AI/ML") || interests.includes("Machine Learning")) {
    if (!skills.includes("Python")) skills.push("Python");
    if (!skills.includes("Machine Learning")) skills.push("Machine Learning");
  }
  if (
    interests.includes("Web Development") ||
    interests.includes("Full Stack Developer")
  ) {
    if (!skills.includes("React")) skills.push("React");
    if (!skills.includes("Node.js")) skills.push("Node.js");
  }
  if (
    interests.includes("IoT") &&
    dept !== "Electronics & Telecommunication Engineering"
  ) {
    skills.push("IoT");
  }

  return [...new Set(skills)];
}

function generateBio(name, dept, skills, interests) {
  const firstName = name.split(" ")[0];
  const deptShort = DEPT_SHORT[dept] || dept;
  const interestStr = interests.slice(0, 2).join(" and ");
  const skillStr = skills.slice(0, 3).join(", ");
  const bios = [
    `${firstName} is a passionate ${deptShort} student with a keen interest in ${interestStr}. Skilled in ${skillStr}, always looking to collaborate on impactful projects.`,
    `Engineering student specializing in ${dept}. Loves working on real-world problems using ${skillStr}. Currently exploring ${interestStr}.`,
    `A curious mind from ${dept}. Active in hackathons, open-source, and building projects. Proficient in ${skillStr}.`,
    `Dedicated ${deptShort} student with experience in ${skillStr}. Passionate about ${interestStr} and team-based innovation.`,
    `${firstName} enjoys building solutions that matter. Background in ${skillStr} with a focus on ${interestStr}.`,
  ];
  return pick(bios);
}

let usedEmails = new Set();
let usedNames = new Set();

function generateEmail(name, dept, idx) {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);
  const deptCode = DEPT_SHORT[dept]?.toLowerCase() || "ce";
  let email = `${clean}.${deptCode}${idx}@vkbiet.edu.in`;
  let attempts = 0;
  while (usedEmails.has(email)) {
    attempts++;
    email = `${clean}${attempts}.${deptCode}${idx}@vkbiet.edu.in`;
  }
  usedEmails.add(email);
  return email;
}

function generateStudentName(dept, gender, usedNamesArr) {
  const firstPool = gender === "male" ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;
  let firstName, lastName, fullName;
  let attempts = 0;
  do {
    firstName = pick(firstPool);
    lastName = pick(LAST_NAMES);
    fullName = `${firstName} ${lastName}`;
    attempts++;
  } while (usedNamesArr.includes(fullName) && attempts < 100);
  usedNamesArr.push(fullName);
  return { firstName, lastName, fullName };
}

// ─── PROJECT DATA ─────────────────────────────────────────────────────────────
const PROJECT_TEMPLATES = [
  {
    title: "SolarSense AI",
    description:
      "AI-based solar energy prediction and optimization platform for campus microgrids using weather ML models.",
    domain: "AI/ML",
    dept: "Computer Engineering",
    stack: ["Python", "Machine Learning", "React", "Node.js", "MongoDB"],
    skills: ["Python", "Machine Learning", "React"],
    teamSize: 4,
    status: "Active",
    progress: 65,
  },
  {
    title: "Smart Campus Navigation",
    description:
      "Indoor navigation system using IoT beacons and augmented maps for the college campus.",
    domain: "IoT",
    dept: "Computer Engineering",
    stack: ["React", "IoT", "Maps API", "Bluetooth LE"],
    skills: ["React", "IoT", "Embedded Systems"],
    teamSize: 4,
    status: "Recruiting",
    progress: 30,
  },
  {
    title: "AgriSense Vision",
    description:
      "AI-based crop disease detection using computer vision on mobile devices for farmers.",
    domain: "AI/ML",
    dept: "Artificial Intelligence & Data Science",
    stack: ["TensorFlow", "Python", "React Native", "Computer Vision"],
    skills: ["Computer Vision", "Python", "Deep Learning"],
    teamSize: 4,
    status: "Active",
    progress: 50,
  },
  {
    title: "EcoTrack Campus",
    description:
      "Sustainability tracker for carbon footprint and lab resource efficiency using IoT sensors.",
    domain: "Sustainability",
    dept: "Computer Engineering",
    stack: ["React", "Node.js", "IoT", "MongoDB"],
    skills: ["React", "Node.js", "IoT"],
    teamSize: 3,
    status: "Recruiting",
    progress: 20,
  },
  {
    title: "HealthAI Diagnostics",
    description:
      "ML-powered health diagnostics assistant for early disease detection from medical images.",
    domain: "Healthcare AI",
    dept: "Artificial Intelligence & Data Science",
    stack: ["Python", "TensorFlow", "Flask", "React"],
    skills: ["Machine Learning", "Python", "Data Science"],
    teamSize: 5,
    status: "Active",
    progress: 40,
  },
  {
    title: "Smart Grid Monitor",
    description:
      "Real-time power grid monitoring and anomaly detection using SCADA and ML analytics.",
    domain: "Smart Grid",
    dept: "Electrical Engineering",
    stack: ["MATLAB", "Python", "Simulink", "SCADA"],
    skills: ["MATLAB", "Python", "Power Systems"],
    teamSize: 4,
    status: "Recruiting",
    progress: 15,
  },
  {
    title: "AutoBot Arm",
    description:
      "Programmable robotic arm with computer vision for automated warehouse operations.",
    domain: "Robotics",
    dept: "Mechanical Engineering",
    stack: ["Python", "ROS", "Arduino", "Computer Vision", "SolidWorks"],
    skills: ["Robotics", "Python", "Arduino"],
    teamSize: 4,
    status: "Active",
    progress: 55,
  },
  {
    title: "SmartStruct BIM",
    description:
      "BIM-integrated structural health monitoring platform for smart buildings using IoT sensors.",
    domain: "Smart Cities",
    dept: "Civil Engineering",
    stack: ["Revit", "Python", "IoT", "React"],
    skills: ["BIM", "Structural Design", "IoT"],
    teamSize: 4,
    status: "Recruiting",
    progress: 10,
  },
  {
    title: "CyberShield",
    description:
      "AI-powered network intrusion detection system with real-time threat analysis and alerting.",
    domain: "Cybersecurity",
    dept: "Information Technology",
    stack: ["Python", "ML", "Wireshark", "Flask", "React"],
    skills: ["Cybersecurity", "Python", "Machine Learning"],
    teamSize: 4,
    status: "Active",
    progress: 45,
  },
  {
    title: "FinTrack Student",
    description:
      "Personal finance tracker with AI-driven budgeting insights tailored for college students.",
    domain: "FinTech",
    dept: "Information Technology",
    stack: ["React", "FastAPI", "PostgreSQL", "Python"],
    skills: ["React", "Python", "SQL"],
    teamSize: 3,
    status: "Recruiting",
    progress: 25,
  },
  {
    title: "NLP Study Planner",
    description:
      "AI study planner using NLP to generate personalized learning paths from syllabus documents.",
    domain: "AI/ML",
    dept: "Artificial Intelligence & Data Science",
    stack: ["Python", "NLP", "React", "MongoDB", "LLMs"],
    skills: ["NLP", "Python", "LLMs"],
    teamSize: 4,
    status: "Active",
    progress: 35,
  },
  {
    title: "EV Charging Optimizer",
    description:
      "Smart EV charging station management system with load balancing and renewable integration.",
    domain: "Electric Vehicles",
    dept: "Electrical Engineering",
    stack: ["MATLAB", "Python", "IoT", "React"],
    skills: ["Power Systems", "MATLAB", "IoT"],
    teamSize: 4,
    status: "Recruiting",
    progress: 20,
  },
  {
    title: "SoilSmart Analytics",
    description:
      "Soil health analytics platform using sensor data and ML for precision agriculture recommendations.",
    domain: "AgriTech",
    dept: "Artificial Intelligence & Data Science",
    stack: ["Python", "Pandas", "React", "IoT", "ML"],
    skills: ["Machine Learning", "Python", "Data Science"],
    teamSize: 4,
    status: "Completed",
    progress: 100,
  },
  {
    title: "Traffic Flow AI",
    description:
      "AI-based traffic signal optimization for smart city intersections using computer vision.",
    domain: "Smart Cities",
    dept: "Computer Engineering",
    stack: ["Python", "Computer Vision", "React", "Node.js"],
    skills: ["Computer Vision", "Python", "React"],
    teamSize: 5,
    status: "Active",
    progress: 60,
  },
  {
    title: "VoiceDoc Medical",
    description:
      "Voice-enabled medical documentation assistant using speech recognition and NLP for doctors.",
    domain: "Healthcare AI",
    dept: "Artificial Intelligence & Data Science",
    stack: ["Python", "NLP", "Speech Recognition", "React"],
    skills: ["NLP", "Python", "Machine Learning"],
    teamSize: 4,
    status: "Recruiting",
    progress: 5,
  },
];

// A broader, realistic discovery catalogue. These are deliberately varied so
// Explore Projects exposes approximately 40 meaningful projects after seeding.
PROJECT_TEMPLATES.push(...[
  ["CampusCare Queue", "Healthcare", "Information Technology", ["React", "Node.js", "MongoDB"], ["React", "Node.js"]],
  ["WaterWise Sentinel", "Sustainability", "Civil Engineering", ["IoT", "Python", "React"], ["IoT", "Python"]],
  ["RailSafe Vision", "AI/ML", "Computer Engineering", ["Python", "OpenCV", "TensorFlow"], ["Computer Vision", "Python"]],
  ["MediRoute", "Healthcare", "Information Technology", ["Flutter", "Firebase", "Maps API"], ["Flutter", "Firebase"]],
  ["WasteSort AI", "Sustainability", "Artificial Intelligence & Data Science", ["Python", "TensorFlow", "React"], ["Machine Learning", "Python"]],
  ["FarmLink Marketplace", "AgriTech", "Information Technology", ["React", "Node.js", "MongoDB"], ["React", "MongoDB"]],
  ["DroneCrop Mapper", "AgriTech", "Electronics & Telecommunication Engineering", ["Python", "GIS", "IoT"], ["Python", "IoT"]],
  ["SecureVote Campus", "Cybersecurity", "Computer Engineering", ["React", "Node.js", "Cryptography"], ["Cybersecurity", "React"]],
  ["SkillSprint", "EdTech", "Information Technology", ["React", "FastAPI", "PostgreSQL"], ["React", "Python"]],
  ["AirQuality Grid", "IoT", "Electrical Engineering", ["Arduino", "MQTT", "React"], ["Embedded Systems", "IoT"]],
  ["Heritage AR Walk", "Smart Cities", "Computer Engineering", ["Unity", "C#", "ARCore"], ["UI/UX", "C#"]],
  ["CodeReview Buddy", "Developer Tools", "Artificial Intelligence & Data Science", ["Python", "LLMs", "React"], ["Python", "NLP"]],
  ["FloodAlert Network", "Smart Cities", "Civil Engineering", ["IoT", "Python", "GIS"], ["IoT", "Data Analysis"]],
  ["EV Fleet Planner", "Electric Vehicles", "Mechanical Engineering", ["Python", "React", "Optimization"], ["Python", "Data Analysis"]],
  ["LabAsset Tracker", "IoT", "Electronics & Telecommunication Engineering", ["RFID", "Node.js", "MongoDB"], ["IoT", "Node.js"]],
  ["StudyCircle", "EdTech", "Computer Engineering", ["React", "Socket.io", "Node.js"], ["React", "Node.js"]],
  ["RoadCrack Insight", "Smart Cities", "Civil Engineering", ["Python", "Computer Vision", "Flutter"], ["Python", "Computer Vision"]],
  ["LegalEase Marathi", "NLP", "Artificial Intelligence & Data Science", ["Python", "NLP", "React"], ["NLP", "Python"]],
  ["Microgrid Forecast", "Sustainability", "Electrical Engineering", ["MATLAB", "Python", "Machine Learning"], ["MATLAB", "Machine Learning"]],
  ["ManufactureFlow", "Industry 4.0", "Mechanical Engineering", ["IoT", "Python", "React"], ["IoT", "Python"]],
  ["Placement Prep Coach", "EdTech", "Information Technology", ["React", "Node.js", "MongoDB"], ["React", "Node.js"]],
  ["SafeSteps", "Social Impact", "Computer Engineering", ["React Native", "Firebase", "Maps API"], ["React Native", "Firebase"]],
  ["BioWaste Converter", "Sustainability", "Mechanical Engineering", ["Arduino", "IoT", "Python"], ["Arduino", "IoT"]],
  ["CampusBus Live", "Smart Cities", "Information Technology", ["React", "Node.js", "Maps API"], ["React", "Node.js"]],
  ["ExamGuard", "Cybersecurity", "Computer Engineering", ["Python", "OpenCV", "Flask"], ["Python", "Cybersecurity"]],
].map(([title, domain, dept, stack, skills], index) => ({
  title,
  description: `${title} is a student-built ${domain.toLowerCase()} solution focused on a practical campus or community challenge, with a measurable prototype and collaborative delivery plan.`,
  domain,
  dept,
  stack,
  skills,
  teamSize: 4,
  status: index % 5 === 0 ? "Active" : index % 7 === 0 ? "Completed" : "Recruiting",
  progress: index % 7 === 0 ? 100 : 15 + ((index * 11) % 65),
})));

// ─── MENTOR DATA ──────────────────────────────────────────────────────────────
const MENTOR_TEMPLATES = [
  // Computer Engineering (8 mentors)
  {
    name: "Dr. Amit Deshmukh",
    designation: "Professor",
    dept: "Computer Engineering",
    exp: 18,
    expertise: ["AI/ML", "Deep Learning", "Python", "Research"],
    subjects: ["Artificial Intelligence", "Machine Learning", "Data Science"],
    research: ["Neural Networks", "Computer Vision", "Explainable AI"],
    domains: ["AI/ML", "Data Science", "NLP"],
    rating: 4.9,
    reviews: 48,
    mentored: 32,
    officeHours: "Mon/Wed, 10:00 AM–12:00 PM",
    bio: "Passionate about AI and its real-world applications. Guiding innovative AI/ML capstone projects since 2006.",
  },
  {
    name: "Prof. Sneha Joshi",
    designation: "Associate Professor",
    dept: "Computer Engineering",
    exp: 12,
    expertise: [
      "Cybersecurity",
      "Networks",
      "Ethical Hacking",
      "System Security",
    ],
    subjects: ["Network Security", "Cryptography", "Cybersecurity"],
    research: [
      "Intrusion Detection",
      "Network Forensics",
      "Zero-Trust Architecture",
    ],
    domains: ["Cybersecurity", "Networking", "Cloud Security"],
    rating: 4.9,
    reviews: 41,
    mentored: 26,
    officeHours: "Tue/Thu, 11:00 AM–1:00 PM",
    bio: "Open to mentoring in cybersecurity, networking, and secure system design.",
  },
  {
    name: "Dr. Karan Shah",
    designation: "Assistant Professor",
    dept: "Computer Engineering",
    exp: 8,
    expertise: [
      "Mobile App Development",
      "UI/UX",
      "Product Design",
      "React Native",
    ],
    subjects: [
      "Mobile Computing",
      "Human Computer Interaction",
      "Software Engineering",
    ],
    research: ["Usability Engineering", "Cross-Platform Development"],
    domains: ["Mobile App", "UI/UX", "Web Development"],
    rating: 4.8,
    reviews: 27,
    mentored: 19,
    officeHours: "Mon/Fri, 3:00 PM–5:00 PM",
    bio: "Enjoys mentoring mobile and user-centric product solutions.",
  },
  {
    name: "Prof. Rahul Pawar",
    designation: "Assistant Professor",
    dept: "Computer Engineering",
    exp: 7,
    expertise: ["Full Stack Development", "DevOps", "Cloud", "Microservices"],
    subjects: ["Web Technologies", "Cloud Computing", "Software Architecture"],
    research: ["Serverless Architecture", "Container Orchestration"],
    domains: ["Web Development", "Cloud", "DevOps"],
    rating: 4.7,
    reviews: 22,
    mentored: 15,
    officeHours: "Wed/Thu, 2:00 PM–4:00 PM",
    bio: "Dedicated to helping students build production-ready full stack and cloud applications.",
  },
  {
    name: "Dr. Priya Kulkarni",
    designation: "Associate Professor",
    dept: "Computer Engineering",
    exp: 14,
    expertise: ["Blockchain", "Distributed Systems", "Cryptography"],
    subjects: ["Distributed Computing", "Blockchain Technology"],
    research: ["Smart Contracts", "Decentralized Applications", "DeFi"],
    domains: ["Blockchain", "Web3", "FinTech"],
    rating: 4.6,
    reviews: 18,
    mentored: 12,
    officeHours: "Tue/Fri, 10:00 AM–12:00 PM",
    bio: "Research focus on blockchain, distributed systems and decentralized applications.",
  },
  {
    name: "Prof. Sanjay Naikwadi",
    designation: "Assistant Professor",
    dept: "Computer Engineering",
    exp: 6,
    expertise: [
      "Competitive Programming",
      "Data Structures",
      "Algorithms",
      "Problem Solving",
    ],
    subjects: [
      "Data Structures & Algorithms",
      "Algorithm Design",
      "Competitive Programming",
    ],
    research: ["Algorithm Optimization", "Graph Theory"],
    domains: ["Software Development", "AI/ML"],
    rating: 4.8,
    reviews: 35,
    mentored: 24,
    officeHours: "Daily, 12:00 PM–1:00 PM",
    bio: "Passionate about teaching algorithms and preparing students for coding competitions.",
  },
  {
    name: "Dr. Meera Bhosale",
    designation: "Professor",
    dept: "Computer Engineering",
    exp: 20,
    expertise: ["Computer Graphics", "Game Development", "VR/AR", "OpenGL"],
    subjects: ["Computer Graphics", "Virtual Reality", "Game Programming"],
    research: ["Real-time Rendering", "Augmented Reality Applications"],
    domains: ["Game Development", "VR/AR", "Simulation"],
    rating: 4.5,
    reviews: 14,
    mentored: 10,
    officeHours: "Mon/Thu, 9:00 AM–11:00 AM",
    bio: "Expert in computer graphics, VR/AR, and game engine development.",
  },
  {
    name: "Prof. Vijay Wagh",
    designation: "Assistant Professor",
    dept: "Computer Engineering",
    exp: 5,
    expertise: ["Database Systems", "SQL", "NoSQL", "Data Engineering"],
    subjects: ["Database Management Systems", "Big Data", "Data Warehousing"],
    research: ["Query Optimization", "Distributed Databases"],
    domains: ["Data Engineering", "Web Development", "Cloud"],
    rating: 4.6,
    reviews: 20,
    mentored: 14,
    officeHours: "Tue/Thu, 3:00 PM–5:00 PM",
    bio: "Helping students build robust data-driven applications and systems.",
  },

  // Information Technology (7 mentors)
  {
    name: "Prof. Neha Kulkarni",
    designation: "Associate Professor",
    dept: "Information Technology",
    exp: 11,
    expertise: ["Web Development", "Cloud Computing", "System Design", "Agile"],
    subjects: [
      "Cloud Computing",
      "Full Stack Development",
      "Software Project Management",
    ],
    research: ["Cloud Migration", "SaaS Architecture"],
    domains: ["Web Development", "Cloud", "SaaS"],
    rating: 4.8,
    reviews: 36,
    mentored: 28,
    officeHours: "Mon/Wed, 11:00 AM–1:00 PM",
    bio: "Loves working with students on full-stack and cloud-based solutions.",
  },
  {
    name: "Dr. Anand Gaikwad",
    designation: "Associate Professor",
    dept: "Information Technology",
    exp: 13,
    expertise: [
      "Cybersecurity",
      "Ethical Hacking",
      "Penetration Testing",
      "Digital Forensics",
    ],
    subjects: ["Information Security", "Ethical Hacking", "Digital Forensics"],
    research: ["APT Detection", "Malware Analysis", "Security Automation"],
    domains: ["Cybersecurity", "DevSecOps", "Cloud Security"],
    rating: 4.7,
    reviews: 29,
    mentored: 21,
    officeHours: "Tue/Thu, 10:00 AM–12:00 PM",
    bio: "Guiding students in cybersecurity, ethical hacking, and secure software development.",
  },
  {
    name: "Prof. Pooja Sawant",
    designation: "Assistant Professor",
    dept: "Information Technology",
    exp: 6,
    expertise: ["DevOps", "CI/CD", "Docker", "Kubernetes", "Jenkins"],
    subjects: [
      "DevOps Engineering",
      "Cloud Infrastructure",
      "Containerization",
    ],
    research: ["Infrastructure as Code", "Platform Engineering"],
    domains: ["DevOps", "Cloud", "Web Development"],
    rating: 4.7,
    reviews: 24,
    mentored: 16,
    officeHours: "Wed/Fri, 2:00 PM–4:00 PM",
    bio: "Passionate about DevOps culture, automation, and cloud-native development.",
  },
  {
    name: "Dr. Suresh Kamble",
    designation: "Professor",
    dept: "Information Technology",
    exp: 17,
    expertise: ["Big Data", "Hadoop", "Spark", "Data Warehousing"],
    subjects: ["Big Data Analytics", "Data Science", "Database Management"],
    research: ["Distributed Data Processing", "Real-time Analytics"],
    domains: ["Data Engineering", "Data Science", "Cloud"],
    rating: 4.6,
    reviews: 21,
    mentored: 17,
    officeHours: "Mon/Thu, 9:00 AM–11:00 AM",
    bio: "Expert in big data ecosystems and enterprise data platforms.",
  },
  {
    name: "Prof. Rasika Holkar",
    designation: "Assistant Professor",
    dept: "Information Technology",
    exp: 5,
    expertise: ["UI/UX Design", "Figma", "User Research", "Product Management"],
    subjects: ["Human Computer Interaction", "Product Design", "Web Design"],
    research: ["UX Research Methods", "Accessibility Design"],
    domains: ["UI/UX", "Web Development", "Mobile App"],
    rating: 4.8,
    reviews: 30,
    mentored: 22,
    officeHours: "Tue/Fri, 11:00 AM–1:00 PM",
    bio: "Helping students create beautiful, user-centered digital products.",
  },
  {
    name: "Dr. Nilesh Thorat",
    designation: "Associate Professor",
    dept: "Information Technology",
    exp: 10,
    expertise: [
      "Software Testing",
      "Quality Assurance",
      "Test Automation",
      "SDLC",
    ],
    subjects: [
      "Software Testing & QA",
      "Agile Methodologies",
      "Software Quality",
    ],
    research: ["Test Automation Frameworks", "AI in Testing"],
    domains: ["Software Quality", "DevOps", "Web Development"],
    rating: 4.5,
    reviews: 16,
    mentored: 11,
    officeHours: "Mon/Wed/Fri, 12:00 PM–1:00 PM",
    bio: "Focused on software quality, test automation, and agile project management.",
  },
  {
    name: "Prof. Dipti Mane",
    designation: "Assistant Professor",
    dept: "Information Technology",
    exp: 7,
    expertise: [
      "Machine Learning",
      "Python",
      "Data Analysis",
      "Predictive Analytics",
    ],
    subjects: ["Machine Learning", "Python Programming", "Statistical Methods"],
    research: ["Predictive Modeling", "Feature Engineering"],
    domains: ["Data Science", "AI/ML", "FinTech"],
    rating: 4.7,
    reviews: 25,
    mentored: 18,
    officeHours: "Thu/Fri, 3:00 PM–5:00 PM",
    bio: "Guiding students to apply ML and data science in real-world projects.",
  },

  // AI & Data Science (8 mentors)
  {
    name: "Dr. Rajashri Deshpande",
    designation: "Professor",
    dept: "Artificial Intelligence & Data Science",
    exp: 16,
    expertise: ["Deep Learning", "Computer Vision", "TensorFlow", "Research"],
    subjects: ["Deep Learning", "Computer Vision", "Neural Networks"],
    research: ["Object Detection", "Semantic Segmentation", "Medical Imaging"],
    domains: ["AI/ML", "Healthcare AI", "Computer Vision"],
    rating: 4.9,
    reviews: 52,
    mentored: 38,
    officeHours: "Mon/Wed/Fri, 10:00 AM–12:00 PM",
    bio: "Research in deep learning and computer vision with 50+ publications. Love guiding student research.",
  },
  {
    name: "Prof. Sachin Parab",
    designation: "Associate Professor",
    dept: "Artificial Intelligence & Data Science",
    exp: 9,
    expertise: ["NLP", "LLMs", "Text Mining", "Transformer Models"],
    subjects: [
      "Natural Language Processing",
      "Text Analytics",
      "Information Retrieval",
    ],
    research: ["Multilingual NLP", "Sentiment Analysis", "Question Answering"],
    domains: ["NLP", "AI/ML", "EdTech"],
    rating: 4.8,
    reviews: 38,
    mentored: 27,
    officeHours: "Tue/Thu, 10:00 AM–12:00 PM",
    bio: "NLP researcher helping students build intelligent language-based applications.",
  },
  {
    name: "Dr. Varsha Bankar",
    designation: "Assistant Professor",
    dept: "Artificial Intelligence & Data Science",
    exp: 7,
    expertise: ["Data Engineering", "ETL Pipelines", "Spark", "Airflow"],
    subjects: ["Data Engineering", "Big Data Systems", "Cloud Analytics"],
    research: ["Real-time Data Pipelines", "Data Quality"],
    domains: ["Data Engineering", "Cloud", "AI/ML"],
    rating: 4.7,
    reviews: 22,
    mentored: 15,
    officeHours: "Wed/Fri, 2:00 PM–4:00 PM",
    bio: "Passionate about building scalable data infrastructure for AI applications.",
  },
  {
    name: "Prof. Omkar Kadam",
    designation: "Assistant Professor",
    dept: "Artificial Intelligence & Data Science",
    exp: 6,
    expertise: [
      "Reinforcement Learning",
      "Robotics",
      "Game AI",
      "Optimization",
    ],
    subjects: ["Reinforcement Learning", "Autonomous Systems", "AI Algorithms"],
    research: ["Multi-Agent Systems", "Policy Gradient Methods"],
    domains: ["AI/ML", "Robotics", "Game Development"],
    rating: 4.6,
    reviews: 17,
    mentored: 11,
    officeHours: "Mon/Thu, 3:00 PM–5:00 PM",
    bio: "Exploring the frontiers of reinforcement learning and autonomous decision-making.",
  },
  {
    name: "Dr. Madhuri Jadhav",
    designation: "Associate Professor",
    dept: "Artificial Intelligence & Data Science",
    exp: 12,
    expertise: ["MLOps", "Model Deployment", "Cloud ML", "Kubernetes"],
    subjects: ["MLOps & Deployment", "Production AI Systems", "Cloud ML"],
    research: ["Model Monitoring", "Drift Detection", "Automated ML"],
    domains: ["AI/ML", "DevOps", "Cloud"],
    rating: 4.8,
    reviews: 31,
    mentored: 23,
    officeHours: "Tue/Fri, 11:00 AM–1:00 PM",
    bio: "Bridging the gap between research models and production AI systems.",
  },
  {
    name: "Prof. Kedar Nimkar",
    designation: "Assistant Professor",
    dept: "Artificial Intelligence & Data Science",
    exp: 5,
    expertise: [
      "Business Intelligence",
      "Tableau",
      "Power BI",
      "Data Visualization",
    ],
    subjects: [
      "Data Visualization",
      "Business Analytics",
      "Statistical Analysis",
    ],
    research: ["Narrative Visualization", "Dashboarding for Decision Support"],
    domains: ["Data Science", "FinTech", "Business Intelligence"],
    rating: 4.7,
    reviews: 26,
    mentored: 20,
    officeHours: "Mon/Wed, 1:00 PM–3:00 PM",
    bio: "Helping students turn raw data into compelling visual stories and business insights.",
  },
  {
    name: "Dr. Amruta Shelar",
    designation: "Associate Professor",
    dept: "Artificial Intelligence & Data Science",
    exp: 11,
    expertise: ["Generative AI", "GANs", "Diffusion Models", "Creative AI"],
    subjects: ["Generative Models", "Advanced Deep Learning", "AI Ethics"],
    research: ["Image Synthesis", "Controllable Generation", "AI Fairness"],
    domains: ["Generative AI", "AI/ML", "Creative Tech"],
    rating: 4.9,
    reviews: 44,
    mentored: 30,
    officeHours: "Thu/Fri, 9:00 AM–11:00 AM",
    bio: "Exploring generative AI, creative technology, and ethical AI development.",
  },
  {
    name: "Prof. Ganesh Raut",
    designation: "Assistant Professor",
    dept: "Artificial Intelligence & Data Science",
    exp: 8,
    expertise: [
      "Time Series Analysis",
      "Forecasting",
      "Signal Processing",
      "IoT Analytics",
    ],
    subjects: [
      "Time Series Forecasting",
      "Signal Processing",
      "Sensor Data Analytics",
    ],
    research: ["Predictive Maintenance", "Anomaly Detection in Sensors"],
    domains: ["AI/ML", "IoT", "Manufacturing"],
    rating: 4.6,
    reviews: 19,
    mentored: 13,
    officeHours: "Tue/Thu, 2:00 PM–4:00 PM",
    bio: "Specializing in time series forecasting and IoT sensor data analysis.",
  },

  // ENTC (7 mentors)
  {
    name: "Dr. Rohan Patil",
    designation: "Assistant Professor",
    dept: "Electronics & Telecommunication Engineering",
    exp: 9,
    expertise: [
      "IoT",
      "Embedded Systems",
      "Hardware Design",
      "Prototype Development",
    ],
    subjects: ["Internet of Things", "Embedded Systems", "Microcontrollers"],
    research: [
      "Wireless Sensor Networks",
      "Edge Computing",
      "Smart Agriculture IoT",
    ],
    domains: ["IoT", "Embedded Systems", "Smart Devices"],
    rating: 4.6,
    reviews: 24,
    mentored: 18,
    officeHours: "Mon/Wed, 2:00 PM–4:00 PM",
    bio: "Interested in guiding hardware and IoT based innovative projects.",
  },
  {
    name: "Prof. Ashish Kale",
    designation: "Associate Professor",
    dept: "Electronics & Telecommunication Engineering",
    exp: 13,
    expertise: ["VLSI Design", "Verilog", "FPGA", "Digital IC Design"],
    subjects: [
      "VLSI Design",
      "Digital Electronics",
      "Hardware Description Languages",
    ],
    research: ["Low-Power VLSI", "Hardware Accelerators for AI", "SoC Design"],
    domains: ["VLSI", "Embedded Systems", "AI Hardware"],
    rating: 4.7,
    reviews: 28,
    mentored: 19,
    officeHours: "Tue/Thu, 10:00 AM–12:00 PM",
    bio: "VLSI design expert guiding students in hardware design and FPGA implementation.",
  },
  {
    name: "Dr. Suchita Bhalerao",
    designation: "Professor",
    dept: "Electronics & Telecommunication Engineering",
    exp: 19,
    expertise: [
      "Signal Processing",
      "Communication Systems",
      "5G",
      "Antenna Design",
    ],
    subjects: [
      "Digital Signal Processing",
      "Wireless Communication",
      "Antenna Theory",
    ],
    research: ["MIMO Systems", "Cognitive Radio", "Beamforming"],
    domains: ["Communication Systems", "5G", "Wireless Tech"],
    rating: 4.8,
    reviews: 36,
    mentored: 25,
    officeHours: "Mon/Thu, 9:00 AM–11:00 AM",
    bio: "Expert in signal processing and modern wireless communication systems.",
  },
  {
    name: "Prof. Deepak Gade",
    designation: "Assistant Professor",
    dept: "Electronics & Telecommunication Engineering",
    exp: 6,
    expertise: [
      "Drone Technology",
      "UAV Design",
      "Flight Controllers",
      "Computer Vision",
    ],
    subjects: ["Unmanned Aerial Vehicles", "Robotics", "Control Systems"],
    research: [
      "Autonomous Drones",
      "Swarm Robotics",
      "Aerial Image Processing",
    ],
    domains: ["Drone Tech", "Robotics", "IoT"],
    rating: 4.7,
    reviews: 21,
    mentored: 14,
    officeHours: "Wed/Fri, 11:00 AM–1:00 PM",
    bio: "Pioneering drone technology and autonomous UAV research with students.",
  },
  {
    name: "Dr. Lata Shinde",
    designation: "Associate Professor",
    dept: "Electronics & Telecommunication Engineering",
    exp: 10,
    expertise: [
      "PCB Design",
      "Analog Circuits",
      "Power Electronics",
      "EDA Tools",
    ],
    subjects: [
      "Electronic Circuit Design",
      "Power Electronics",
      "PCB Fabrication",
    ],
    research: ["High-Frequency PCB Design", "GaN Power Devices"],
    domains: ["Hardware Design", "Power Electronics", "IoT"],
    rating: 4.5,
    reviews: 18,
    mentored: 12,
    officeHours: "Tue/Thu, 1:00 PM–3:00 PM",
    bio: "Guiding students in electronic circuit design and PCB fabrication.",
  },
  {
    name: "Prof. Anil Mukadam",
    designation: "Assistant Professor",
    dept: "Electronics & Telecommunication Engineering",
    exp: 7,
    expertise: ["Image Processing", "Computer Vision", "MATLAB", "Python"],
    subjects: [
      "Digital Image Processing",
      "Computer Vision Applications",
      "MATLAB for Engineers",
    ],
    research: ["Medical Image Analysis", "Document Recognition"],
    domains: ["Computer Vision", "AI/ML", "Healthcare AI"],
    rating: 4.6,
    reviews: 20,
    mentored: 14,
    officeHours: "Mon/Fri, 3:00 PM–5:00 PM",
    bio: "Applying computer vision and image processing to solve real-world engineering challenges.",
  },
  {
    name: "Dr. Vaibhav Sutar",
    designation: "Associate Professor",
    dept: "Electronics & Telecommunication Engineering",
    exp: 11,
    expertise: ["ROS", "Robotics", "Autonomous Systems", "Mechatronics"],
    subjects: ["Robotics Engineering", "Mechatronics", "Autonomous Navigation"],
    research: ["SLAM", "Human-Robot Interaction", "Robotic Manipulation"],
    domains: ["Robotics", "IoT", "AI/ML"],
    rating: 4.7,
    reviews: 26,
    mentored: 18,
    officeHours: "Wed/Thu, 10:00 AM–12:00 PM",
    bio: "Guiding students in robotics, autonomous systems, and mechatronics.",
  },

  // Mechanical Engineering (7 mentors)
  {
    name: "Dr. Vivek Sharma",
    designation: "Professor",
    dept: "Mechanical Engineering",
    exp: 22,
    expertise: ["Renewable Energy", "CAD", "Simulation", "Sustainable Design"],
    subjects: [
      "Thermodynamics",
      "Energy Systems",
      "Renewable Energy Technologies",
    ],
    research: ["Solar Thermal Systems", "Wind Energy Optimization", "Biomass"],
    domains: ["Renewable Energy", "Product Design", "Sustainability"],
    rating: 4.7,
    reviews: 30,
    mentored: 20,
    officeHours: "Mon/Wed, 11:00 AM–1:00 PM",
    bio: "Passionate about sustainable technologies and real-world problem solving.",
  },
  {
    name: "Prof. Mahesh Dhole",
    designation: "Associate Professor",
    dept: "Mechanical Engineering",
    exp: 14,
    expertise: ["Robotics", "CNC", "Manufacturing", "Automation", "PLC"],
    subjects: [
      "Industrial Robotics",
      "Manufacturing Processes",
      "CNC Technology",
    ],
    research: ["Flexible Manufacturing Systems", "Collaborative Robots"],
    domains: ["Robotics", "Manufacturing", "Automation"],
    rating: 4.8,
    reviews: 34,
    mentored: 24,
    officeHours: "Tue/Thu, 10:00 AM–12:00 PM",
    bio: "Expert in manufacturing automation and industrial robotics.",
  },
  {
    name: "Dr. Sangeeta Lokhande",
    designation: "Associate Professor",
    dept: "Mechanical Engineering",
    exp: 12,
    expertise: ["FEA", "ANSYS", "Structural Analysis", "Product Design"],
    subjects: ["Finite Element Analysis", "CAD/CAM", "Structural Mechanics"],
    research: ["Topology Optimization", "Additive Manufacturing Design"],
    domains: ["Product Design", "Manufacturing", "Aerospace"],
    rating: 4.6,
    reviews: 22,
    mentored: 15,
    officeHours: "Mon/Thu, 2:00 PM–4:00 PM",
    bio: "Guiding students in advanced product design and structural analysis.",
  },
  {
    name: "Prof. Kishor Nimbalkar",
    designation: "Assistant Professor",
    dept: "Mechanical Engineering",
    exp: 8,
    expertise: [
      "3D Printing",
      "Additive Manufacturing",
      "Rapid Prototyping",
      "Materials Science",
    ],
    subjects: [
      "Additive Manufacturing",
      "Manufacturing Technology",
      "Materials Science",
    ],
    research: ["Bio-inspired Structures", "Composite Material Printing"],
    domains: ["3D Printing", "Product Design", "Manufacturing"],
    rating: 4.7,
    reviews: 25,
    mentored: 17,
    officeHours: "Wed/Fri, 1:00 PM–3:00 PM",
    bio: "Pushing the boundaries of additive manufacturing and rapid prototyping.",
  },
  {
    name: "Dr. Pradeep Tupe",
    designation: "Professor",
    dept: "Mechanical Engineering",
    exp: 24,
    expertise: ["Fluid Mechanics", "CFD", "ANSYS Fluent", "Turbomachinery"],
    subjects: [
      "Fluid Mechanics",
      "Computational Fluid Dynamics",
      "Turbomachinery",
    ],
    research: ["Aerodynamics", "Turbine Optimization", "Flow Control"],
    domains: ["Aerospace", "Renewable Energy", "Automotive"],
    rating: 4.5,
    reviews: 16,
    mentored: 11,
    officeHours: "Tue/Thu, 9:00 AM–11:00 AM",
    bio: "CFD and fluid mechanics expert with industrial project experience.",
  },
  {
    name: "Prof. Rekha Gavhane",
    designation: "Assistant Professor",
    dept: "Mechanical Engineering",
    exp: 6,
    expertise: [
      "Electric Vehicles",
      "Automotive Design",
      "Vehicle Dynamics",
      "Battery Systems",
    ],
    subjects: [
      "Automotive Engineering",
      "Electric Vehicles",
      "Vehicle Dynamics",
    ],
    research: ["EV Powertrain", "Lightweight Automotive Structures"],
    domains: ["Electric Vehicles", "Automotive", "Manufacturing"],
    rating: 4.8,
    reviews: 28,
    mentored: 20,
    officeHours: "Mon/Wed/Fri, 12:00 PM–1:30 PM",
    bio: "Focused on electric vehicle technology and sustainable automotive design.",
  },
  {
    name: "Dr. Bhushan Waghmare",
    designation: "Associate Professor",
    dept: "Mechanical Engineering",
    exp: 15,
    expertise: [
      "Heat Transfer",
      "Thermal Engineering",
      "Heat Exchangers",
      "HVAC",
    ],
    subjects: [
      "Heat & Mass Transfer",
      "Thermal Engineering",
      "Refrigeration & AC",
    ],
    research: [
      "Solar Thermal Storage",
      "PCM Heat Storage",
      "Industrial Heat Recovery",
    ],
    domains: ["Renewable Energy", "Manufacturing", "Sustainability"],
    rating: 4.6,
    reviews: 20,
    mentored: 13,
    officeHours: "Tue/Thu, 2:00 PM–4:00 PM",
    bio: "Research in thermal engineering and renewable energy heat systems.",
  },

  // Civil Engineering (6 mentors)
  {
    name: "Dr. Prakash Salve",
    designation: "Professor",
    dept: "Civil Engineering",
    exp: 21,
    expertise: [
      "Structural Engineering",
      "RCC Design",
      "STAAD.Pro",
      "Seismic Analysis",
    ],
    subjects: [
      "Structural Analysis",
      "RCC Design",
      "Advanced Structural Engineering",
    ],
    research: ["Seismic Resilient Structures", "Fiber Reinforced Concrete"],
    domains: ["Structural Design", "Infrastructure", "Smart Cities"],
    rating: 4.7,
    reviews: 28,
    mentored: 20,
    officeHours: "Mon/Wed, 10:00 AM–12:00 PM",
    bio: "Structural engineering expert with focus on earthquake-resistant design.",
  },
  {
    name: "Prof. Archana Bhosale",
    designation: "Associate Professor",
    dept: "Civil Engineering",
    exp: 11,
    expertise: ["BIM", "Revit", "Smart Buildings", "Green Construction"],
    subjects: [
      "Building Information Modeling",
      "Construction Management",
      "Green Building",
    ],
    research: ["BIM for Sustainability", "Smart Infrastructure"],
    domains: ["Smart Cities", "Green Building", "Infrastructure"],
    rating: 4.8,
    reviews: 32,
    mentored: 23,
    officeHours: "Tue/Thu, 11:00 AM–1:00 PM",
    bio: "BIM specialist guiding students in smart and sustainable construction.",
  },
  {
    name: "Dr. Nitin Jagtap",
    designation: "Associate Professor",
    dept: "Civil Engineering",
    exp: 13,
    expertise: [
      "Geotechnical Engineering",
      "Soil Mechanics",
      "Foundation Design",
      "Ground Improvement",
    ],
    subjects: [
      "Geotechnical Engineering",
      "Foundation Engineering",
      "Soil Testing",
    ],
    research: ["Expansive Soils", "Liquefaction", "Geosynthetics"],
    domains: ["Structural Design", "Infrastructure", "Environmental"],
    rating: 4.5,
    reviews: 17,
    mentored: 12,
    officeHours: "Mon/Thu, 2:00 PM–4:00 PM",
    bio: "Geotechnical expert specializing in soil behavior and foundation systems.",
  },
  {
    name: "Prof. Swati Shinde",
    designation: "Assistant Professor",
    dept: "Civil Engineering",
    exp: 7,
    expertise: [
      "Transportation Engineering",
      "Traffic Analysis",
      "Highway Design",
      "GIS",
    ],
    subjects: [
      "Transportation Engineering",
      "Traffic Engineering",
      "Highway Engineering",
    ],
    research: [
      "Smart Traffic Management",
      "Pedestrian Safety",
      "GIS-based Planning",
    ],
    domains: ["Transportation", "Smart Cities", "Urban Planning"],
    rating: 4.7,
    reviews: 23,
    mentored: 16,
    officeHours: "Wed/Fri, 10:00 AM–12:00 PM",
    bio: "Focused on smart transportation systems and urban mobility solutions.",
  },
  {
    name: "Dr. Hemant Powar",
    designation: "Professor",
    dept: "Civil Engineering",
    exp: 18,
    expertise: [
      "Water Resources",
      "Hydraulics",
      "Watershed Management",
      "GIS Hydrology",
    ],
    subjects: [
      "Water Resources Engineering",
      "Hydraulics",
      "Environmental Engineering",
    ],
    research: [
      "Drought Prediction",
      "Flood Management",
      "Rainwater Harvesting",
    ],
    domains: ["Water Resources", "Environmental", "Sustainability"],
    rating: 4.6,
    reviews: 19,
    mentored: 13,
    officeHours: "Tue/Thu, 9:00 AM–11:00 AM",
    bio: "Water resources engineer working on sustainable water management projects.",
  },
  {
    name: "Prof. Dipti Khandare",
    designation: "Assistant Professor",
    dept: "Civil Engineering",
    exp: 5,
    expertise: [
      "Environmental Engineering",
      "Waste Management",
      "Green Infrastructure",
      "Sustainability",
    ],
    subjects: [
      "Environmental Engineering",
      "Solid Waste Management",
      "Green Building Design",
    ],
    research: [
      "Urban Solid Waste",
      "Phytoremediation",
      "Carbon Footprint Assessment",
    ],
    domains: ["Environmental", "Sustainability", "Smart Cities"],
    rating: 4.8,
    reviews: 26,
    mentored: 18,
    officeHours: "Mon/Wed/Fri, 12:00 PM–1:00 PM",
    bio: "Guiding eco-conscious students in environmental engineering and green design.",
  },

  // Electrical Engineering (7 mentors)
  {
    name: "Dr. Suresh Jadhav",
    designation: "Professor",
    dept: "Electrical Engineering",
    exp: 20,
    expertise: ["Power Systems", "Smart Grid", "ETAP", "Power Flow Analysis"],
    subjects: [
      "Power Systems Analysis",
      "Smart Grid Technology",
      "FACTS Devices",
    ],
    research: [
      "Renewable Integration in Grid",
      "Power Quality",
      "Micro-grid Control",
    ],
    domains: ["Smart Grid", "Renewable Energy", "Power Systems"],
    rating: 4.7,
    reviews: 29,
    mentored: 20,
    officeHours: "Mon/Wed, 10:00 AM–12:00 PM",
    bio: "Power systems expert with focus on smart grid and renewable energy integration.",
  },
  {
    name: "Prof. Kavita Holkar",
    designation: "Associate Professor",
    dept: "Electrical Engineering",
    exp: 12,
    expertise: [
      "Electric Vehicles",
      "Battery Management",
      "Power Electronics",
      "Converters",
    ],
    subjects: ["Electric Vehicles", "Power Electronics", "Battery Systems"],
    research: [
      "EV Charging Infrastructure",
      "BMS Algorithms",
      "Vehicle to Grid",
    ],
    domains: ["Electric Vehicles", "Power Electronics", "Energy Storage"],
    rating: 4.8,
    reviews: 33,
    mentored: 24,
    officeHours: "Tue/Thu, 11:00 AM–1:00 PM",
    bio: "Driving EV technology research and sustainable transportation solutions.",
  },
  {
    name: "Dr. Ramesh Kumbhar",
    designation: "Associate Professor",
    dept: "Electrical Engineering",
    exp: 15,
    expertise: ["Industrial Automation", "PLC", "SCADA", "Industrial IoT"],
    subjects: ["Industrial Automation", "PLC Programming", "Process Control"],
    research: ["Industry 4.0", "Predictive Maintenance", "Digital Twins"],
    domains: ["Industrial Automation", "IoT", "Smart Manufacturing"],
    rating: 4.6,
    reviews: 21,
    mentored: 15,
    officeHours: "Mon/Thu, 2:00 PM–4:00 PM",
    bio: "Industrial automation specialist guiding smart manufacturing and IIoT projects.",
  },
  {
    name: "Prof. Yogita Pande",
    designation: "Assistant Professor",
    dept: "Electrical Engineering",
    exp: 6,
    expertise: [
      "Renewable Energy",
      "Solar PV",
      "Wind Energy",
      "Energy Storage",
    ],
    subjects: [
      "Renewable Energy Systems",
      "Solar Technology",
      "Energy Storage Systems",
    ],
    research: [
      "Off-Grid Solar Systems",
      "Hybrid Microgrids",
      "MPPT Algorithms",
    ],
    domains: ["Renewable Energy", "Smart Grid", "Sustainability"],
    rating: 4.7,
    reviews: 24,
    mentored: 17,
    officeHours: "Wed/Fri, 10:00 AM–12:00 PM",
    bio: "Renewable energy researcher helping students design sustainable energy systems.",
  },
  {
    name: "Dr. Kishor Deshpande",
    designation: "Professor",
    dept: "Electrical Engineering",
    exp: 23,
    expertise: [
      "Control Systems",
      "MATLAB/Simulink",
      "Robust Control",
      "Signal Processing",
    ],
    subjects: [
      "Control Systems Engineering",
      "Advanced Control",
      "MATLAB Simulation",
    ],
    research: ["Adaptive Control", "Nonlinear Control", "Optimal Control"],
    domains: ["Control Systems", "Robotics", "AI/ML"],
    rating: 4.5,
    reviews: 15,
    mentored: 10,
    officeHours: "Tue/Thu, 9:00 AM–11:00 AM",
    bio: "Control systems theorist with applications in robotics and autonomous systems.",
  },
  {
    name: "Prof. Ranjit Gade",
    designation: "Assistant Professor",
    dept: "Electrical Engineering",
    exp: 7,
    expertise: ["Embedded Systems", "Microcontrollers", "ARM Cortex", "RTOS"],
    subjects: [
      "Embedded Systems",
      "Microcontroller Programming",
      "Real-Time Operating Systems",
    ],
    research: ["Low-Power Embedded Systems", "IoT Security"],
    domains: ["Embedded Systems", "IoT", "Robotics"],
    rating: 4.7,
    reviews: 23,
    mentored: 16,
    officeHours: "Mon/Wed/Fri, 1:00 PM–2:30 PM",
    bio: "Embedded systems expert bridging hardware and software in IoT applications.",
  },
  {
    name: "Dr. Nandini Bhagekar",
    designation: "Associate Professor",
    dept: "Electrical Engineering",
    exp: 11,
    expertise: [
      "Power Electronics",
      "Inverters",
      "Drives",
      "Harmonic Analysis",
    ],
    subjects: [
      "Power Electronics",
      "Electrical Drives",
      "Advanced Power Electronics",
    ],
    research: [
      "Multilevel Inverters",
      "Motor Drive Optimization",
      "Active Power Filters",
    ],
    domains: [
      "Power Electronics",
      "Electric Vehicles",
      "Industrial Automation",
    ],
    rating: 4.6,
    reviews: 18,
    mentored: 12,
    officeHours: "Tue/Thu, 3:00 PM–5:00 PM",
    bio: "Power electronics researcher specializing in drives and converter design.",
  },
];

// ─── MAIN SEED FUNCTION ────────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("[Seed] Connected to MongoDB. Clearing existing data...");

    await Promise.all([
      User.deleteMany(),
      StudentProfile.deleteMany(),
      MentorProfile.deleteMany(),
      Project.deleteMany(),
      Task.deleteMany(),
      Application.deleteMany(),
      Message.deleteMany(),
      CommunityPost.deleteMany(),
      Notification.deleteMany(),
      LeaderboardSnapshot.deleteMany(),
      AuditLog.deleteMany(),
    ]);
    console.log("[Seed] All existing data cleared.");

    // ── 1. Create Admin ──────────────────────────────────────────────────────
    const adminUser = await User.create({
      name: "System Administrator",
      email: "admin@vkbiet.edu.in",
      password: "Admin@123",
      role: "admin",
      department: "Platform Operations",
      college: COLLEGE,
      verificationStatus: "Institution Verified",
      avatar: MALE_AVATARS[7],
    });
    console.log("[Seed] Admin created.");

    // ── 2. Create Principal ──────────────────────────────────────────────────
    const principalUser = await User.create({
      name: "Dr. Suresh Narayan Joshi",
      email: "principal@vkbiet.edu.in",
      password: "Principal@123",
      role: "principal",
      department: "Administration",
      college: COLLEGE,
      verificationStatus: "Institution Verified",
      avatar: MALE_AVATARS[5],
    });
    console.log("[Seed] Principal created.");



    // ── 4. Create 50 Mentors ─────────────────────────────────────────────────
    const mentorUserMap = {}; // dept → [userId]
    const allMentorUserIds = [];
    for (const dept of DEPARTMENTS) mentorUserMap[dept] = [];

    for (let i = 0; i < MENTOR_TEMPLATES.length; i++) {
      const m = MENTOR_TEMPLATES[i];
      const isFemale =
        m.name.startsWith("Prof. S") ||
        m.name.startsWith("Dr. S") ||
        m.name.startsWith("Prof. P") ||
        m.name.startsWith("Dr. P") ||
        m.name.startsWith("Prof. N") ||
        m.name.startsWith("Dr. N") ||
        m.name.startsWith("Prof. R") ||
        m.name.startsWith("Dr. R") ||
        m.name.startsWith("Prof. D") ||
        m.name.startsWith("Dr. D") ||
        m.name.startsWith("Prof. M") ||
        m.name.startsWith("Dr. M") ||
        m.name.startsWith("Prof. A") ||
        m.name.startsWith("Dr. A") ||
        m.name.startsWith("Prof. K") ||
        m.name.startsWith("Dr. K") ||
        m.name.startsWith("Prof. L") ||
        m.name.startsWith("Dr. L") ||
        m.name.startsWith("Prof. Y") ||
        m.name.startsWith("Dr. V");

      const firstName = m.name.split(" ").slice(-2, -1)[0];
      const emailName = m.name
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .replace(/\s+/g, ".")
        .slice(0, 20);
      const email = `${emailName}@vkbiet.edu.in`;

      const avatarPool = isFemale ? FEMALE_AVATARS : MALE_AVATARS;
      const avatar = avatarPool[i % avatarPool.length];

      const u = await User.create({
        name: m.name,
        email,
        password: "Mentor@123",
        role: "mentor",
        department: m.dept,
        college: COLLEGE,
        verificationStatus: "Institution Verified",
        avatar,
      });

      await MentorProfile.create({
        user: u._id,
        designation: m.designation,
        department: m.dept,
        college: COLLEGE,
        expertise: m.expertise,
        subjects: m.subjects,
        researchAreas: m.research,
        researchInterests: m.research,
        preferredProjectDomains: m.domains,
        experienceYears: m.exp,
        officeHours: m.officeHours,
        availabilityStatus: Math.random() > 0.25 ? "Available" : "Busy",
        rating: m.rating,
        reviewCount: m.reviews,
        studentsMentoredCount: m.mentored,
        bio: m.bio,
        profileVerified: true,
      });

      mentorUserMap[m.dept].push(u._id);
      allMentorUserIds.push(u._id);
    }
    console.log(`[Seed] ${MENTOR_TEMPLATES.length} Mentors created.`);

    // ── 5. Primary Test Student: Sahil Khot ──────────────────────────────────
    const sahil = await User.create({
      name: "Sahil Khot",
      email: "sahilkhot1152005@gmail.com",
      password: "Student@123",
      role: "student",
      department: "Computer Engineering",
      college: COLLEGE,
      verificationStatus: "Profile Verified",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    });

    await StudentProfile.create({
      user: sahil._id,
      phone: "+91 98765 43210",
      dob: "March 15, 2005",
      location: "Baramati, Pune, Maharashtra",
      college: COLLEGE,
      department: "Computer Engineering",
      semester: "6th Semester",
      year: 3,
      currentYear: "3rd Year",
      graduationYear: "2027",
      cgpa: 9.12,
      bio: "Passionate about building innovative solutions using AI and web technologies. Always excited to collaborate, learn and create real impact.",
      quote: "Ideas are powerful. Teams make them real.",
      skills: [
        "Java",
        "Python",
        "C++",
        "JavaScript",
        "React",
        "Node.js",
        "MongoDB",
        "MySQL",
        "Machine Learning",
        "HTML",
        "CSS",
        "Git",
        "Docker",
        "Firebase",
      ],
      technicalSkills: [
        "React",
        "Node.js",
        "Python",
        "Machine Learning",
        "Docker",
        "MongoDB",
        "REST APIs",
      ],
      softSkills: [
        "Leadership",
        "Communication",
        "Team Collaboration",
        "Problem Solving",
      ],
      interests: [
        "Artificial Intelligence",
        "Web Development",
        "Open Source",
        "Cloud Computing",
        "Hackathons",
        "Startups",
      ],
      preferredDomains: ["AI/ML", "Web Development", "Cloud"],
      experienceLevel: "Intermediate",
      hackathonExperience: true,
      hackathonCount: 5,
      researchExperience: true,
      internshipExperience: true,
      projectsCompleted: 4,
      projectsInProgress: 2,
      preferredRoles: ["Full Stack Developer", "ML Engineer", "Team Lead"],
      lookingFor: [
        "Teammates",
        "Hackathons",
        "Real-world Projects",
        "Mentorship",
      ],
      availability: "Available",
      weeklyHours: 15,
      preferredTeamSize: 4,
      preferredProjectTypes: ["AI/ML Systems", "Full Stack SaaS", "Hackathons"],
      socialLinks: {
        github: "github.com/sahilkhot",
        linkedin: "linkedin.com/in/sahilkhot",
        portfolio: "portfolio-sahilkhot.vercel.app",
        email: "sahil.khot@vkbiet.edu.in",
      },
      profileCompletion: 92,
      rankIndividual: 21,
      rankDepartment: 5,
      rankOverall: 8,
      submissionsCount: 804,
      activeDays: 96,
      maxStreak: 90,
      isOnline: true,
      achievements: [
        {
          title: "Top 10 Overall Rank (AY 2025–26)",
          category: "Academic",
          year: "2026",
          icon: "trophy",
        },
        {
          title: "AWS Certified Cloud Practitioner",
          category: "Certification",
          year: "2024",
          icon: "aws",
        },
        {
          title: "Best Project — VKBIET Expo 2025",
          category: "Award",
          year: "2025",
          icon: "medal",
        },
        {
          title: "Google Cloud Generative AI Certification",
          category: "Certification",
          year: "2024",
          icon: "cloud",
        },
      ],
      certifications: [
        {
          title: "AWS Certified Cloud Practitioner",
          issuer: "Amazon Web Services",
          year: "2024",
        },
        { title: "Google Cloud Generative AI", issuer: "Google", year: "2024" },
        {
          title: "Meta React Developer Certificate",
          issuer: "Meta",
          year: "2023",
        },
      ],
      pinnedProjects: [
        {
          title: "SolarSense AI",
          description:
            "AI-based solar energy prediction and optimization platform.",
          status: "Completed",
          date: "Sep 2026",
          tags: ["Python", "Machine Learning", "React"],
          image:
            "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=300",
        },
        {
          title: "Smart Campus Navigation",
          description: "Indoor navigation system using IoT and ML beacons.",
          status: "Completed",
          date: "Jul 2026",
          tags: ["React", "IoT", "Maps API"],
          image:
            "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=300",
        },
        {
          title: "Project Match Platform",
          description:
            "AI-powered academic collaboration platform built with MERN stack.",
          status: "In Progress",
          date: "Oct 2026",
          tags: ["React", "Node.js", "AI/ML", "MongoDB"],
          image:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300",
        },
      ],
    });
    console.log("[Seed] Primary student Sahil Khot created.");

    // ── 6. Generate 280 Students (40 per department) ──────────────────────────
    console.log("[Seed] Generating 280 students across 7 departments...");
    const allStudentUsers = [];
    const allStudentProfiles = [];
    const usedNamesArr = ["Sahil Khot"];
    usedEmails.add("sahilkhot1152005@gmail.com");

    const YEAR_LABELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
    const AVAILABILITY_OPTIONS = [
      "Available",
      "Available for Projects",
      "Available for Team",
      "Busy",
      "Not Available",
    ];
    const EXP_LEVELS = ["Beginner", "Intermediate", "Advanced"];

    let globalStudentIdx = 0;

    for (const dept of DEPARTMENTS) {
      const deptStudents = [];
      const deptProfiles = [];

      const studentsPerDepartment = dept === "Computer Engineering" ? 39 : 40;
      for (let i = 0; i < studentsPerDepartment; i++) {
        const gender = Math.random() > 0.42 ? "male" : "female";
        const { fullName } = generateStudentName(dept, gender, usedNamesArr);
        const yearNum = [1, 1, 2, 2, 3, 3, 3, 4, 4, 4][i % 10]; // distribution across years
        const yearLabel = YEAR_LABELS[yearNum - 1];
        const expLevel =
          yearNum <= 1
            ? "Beginner"
            : yearNum === 2
              ? pick(EXP_LEVELS.slice(0, 2))
              : yearNum === 3
                ? pick(EXP_LEVELS.slice(1))
                : "Advanced";
        const cgpa = generateCgpa(dept, yearNum);
        const interests = pick(DEPT_INTERESTS[dept], randInt(2, 5));
        const domains = pick(DEPT_DOMAINS[dept], randInt(1, 3));
        const skills = generateSkillsForStudent(dept, expLevel, interests);
        const roles = pick(PREFERRED_ROLES[dept], randInt(1, 3));
        const hackathon = Math.random() > 0.55;
        const research = Math.random() > 0.7;
        const internship = Math.random() > 0.65;
        const email = generateEmail(fullName, dept, globalStudentIdx);
        const avatarPool = gender === "male" ? MALE_AVATARS : FEMALE_AVATARS;
        const avatar = avatarPool[globalStudentIdx % avatarPool.length];
        const availability =
          AVAILABILITY_OPTIONS[
            Math.floor(Math.random() * AVAILABILITY_OPTIONS.length)
          ];
        const weeklyHours = randInt(5, 30);

        const u = await User.create({
          name: fullName,
          email,
          password: "Student@123",
          role: "student",
          department: dept,
          college: COLLEGE,
          verificationStatus:
            Math.random() > 0.3 ? "Profile Verified" : "Pending",
          avatar,
        });

        const semester = `${yearNum * 2 - (Math.random() > 0.5 ? 0 : 1)}th Semester`;
        const profile = await StudentProfile.create({
          user: u._id,
          location:
            pick([
              "Baramati",
              "Pune",
              "Nashik",
              "Solapur",
              "Kolhapur",
              "Aurangabad",
              "Satara",
              "Mumbai",
              "Nagpur",
              "Latur",
            ]) + ", Maharashtra",
          college: COLLEGE,
          department: dept,
          semester,
          year: yearNum,
          currentYear: yearLabel,
          graduationYear: String(2024 + (5 - yearNum)),
          cgpa,
          bio: generateBio(fullName, dept, skills, interests),
          skills,
          technicalSkills: skills.slice(0, Math.ceil(skills.length * 0.6)),
          softSkills: pick(
            [
              "Communication",
              "Teamwork",
              "Leadership",
              "Problem Solving",
              "Critical Thinking",
              "Time Management",
              "Creativity",
              "Adaptability",
            ],
            randInt(2, 4),
          ),
          interests,
          preferredDomains: domains,
          experienceLevel: expLevel,
          hackathonExperience: hackathon,
          hackathonCount: hackathon ? randInt(1, 6) : 0,
          researchExperience: research,
          internshipExperience: internship,
          projectsCompleted: randInt(0, 5),
          projectsInProgress: randInt(0, 2),
          preferredRoles: roles,
          lookingFor: pick(
            [
              "Teammates",
              "Mentorship",
              "Hackathons",
              "Real-world Projects",
              "Open Source",
              "Research",
            ],
            randInt(1, 3),
          ),
          availability,
          weeklyHours,
          preferredTeamSize: randInt(2, 6),
          preferredProjectTypes: domains,
          socialLinks: {
            github:
              Math.random() > 0.3
                ? `github.com/${fullName.toLowerCase().replace(" ", "")}`
                : "",
            linkedin:
              Math.random() > 0.4
                ? `linkedin.com/in/${fullName.toLowerCase().replace(" ", "-")}`
                : "",
            portfolio:
              Math.random() > 0.7
                ? `${fullName.toLowerCase().replace(" ", "")}.dev`
                : "",
            email,
          },
          profileCompletion: randInt(40, 95),
          rankOverall: null,
          submissionsCount: randInt(10, 500),
          activeDays: randInt(5, 200),
          maxStreak: randInt(1, 60),
          isOnline: Math.random() > 0.5,
        });

        allStudentUsers.push(u);
        allStudentProfiles.push({ user: u, profile });
        deptStudents.push(u);
        deptProfiles.push(profile);
        globalStudentIdx++;
      }
    }
    allStudentUsers.push(sahil); // include Sahil in overall list
    console.log(
      `[Seed] 279 generated students created; Sahil Khot completes the 280-student Computer Engineering cohort.`,
    );

    // ── 7. Create Projects with real memberships ──────────────────────────────
    console.log("[Seed] Creating projects...");
    const createdProjects = [];
    const mentorUserIdForDept = (dept) => {
      const pool = mentorUserMap[dept] || allMentorUserIds;
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const studentsByDept = {};
    for (const dept of DEPARTMENTS) {
      studentsByDept[dept] = allStudentUsers.filter(
        (u) => u.department === dept && u.role === "student",
      );
    }
    studentsByDept["Computer Engineering"].push(sahil);

    for (let i = 0; i < PROJECT_TEMPLATES.length; i++) {
      const tmpl = PROJECT_TEMPLATES[i];
      const deptStudents =
        studentsByDept[tmpl.dept] ||
        allStudentUsers.filter((u) => u.role === "student");
      const creator = deptStudents[i % deptStudents.length] || sahil;
      const mentorId = mentorUserIdForDept(tmpl.dept);

      // Build team members
      const availableMembers = deptStudents.filter(
        (u) => u._id.toString() !== creator._id.toString(),
      );
      const memberCount = Math.min(
        tmpl.teamSize - 1,
        availableMembers.length,
        3,
      );
      const memberUsers = pick(availableMembers, memberCount);
      const membersArr = [
        {
          user: creator._id,
          role: "Leader",
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        ...(Array.isArray(memberUsers) ? memberUsers : [memberUsers]).map(
          (u) => ({
            user: u._id,
            role: "Member",
            joinedAt: new Date(
              Date.now() - randInt(5, 25) * 24 * 60 * 60 * 1000,
            ),
          }),
        ),
      ];

      const openPos = Math.max(0, tmpl.teamSize - membersArr.length);

      const proj = await Project.create({
        title: tmpl.title,
        description: tmpl.description,
        domain: tmpl.domain,
        department: tmpl.dept,
        college: COLLEGE,
        techStack: tmpl.stack,
        requiredSkills: tmpl.skills,
        teamSize: tmpl.teamSize,
        openPositions: openPos,
        creator: creator._id,
        groupLeader: creator._id,
        mentor: mentorId,
        members: membersArr,
        status: tmpl.status,
        progress: tmpl.progress,
        deadline: new Date(Date.now() + randInt(15, 90) * 24 * 60 * 60 * 1000),
        image: `https://images.unsplash.com/photo-${1509391365360 + i * 1000}?w=500`,
      });
      createdProjects.push({ proj, creator, members: membersArr });
    }
    console.log(`[Seed] ${createdProjects.length} projects created.`);

    // Use first project as the main Sahil project
    const mainProjectId = createdProjects[0]?.proj?._id;

    // ── 8. Create Tasks ───────────────────────────────────────────────────────
    if (mainProjectId) {
      await Task.create([
        {
          project: mainProjectId,
          title: "Train solar radiance regression model",
          description:
            "Fine-tune historical solar irradiation dataset with XGBoost and evaluate RMSE.",
          assignedTo: allStudentUsers[1]?._id || sahil._id,
          createdBy: sahil._id,
          priority: "High",
          deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: "Approved",
          submissionNotes: "Achieved RMSE of 0.042 on validation split.",
          mentorFeedback: "Excellent results!",
          reviewer: allMentorUserIds[0],
          reviewedAt: new Date(),
        },
        {
          project: mainProjectId,
          title: "Implement frontend dashboard & energy telemetry graphs",
          description:
            "Build responsive charts displaying real-time power generation vs battery storage.",
          assignedTo: sahil._id,
          createdBy: sahil._id,
          priority: "High",
          deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: "Completed",
        },
        {
          project: mainProjectId,
          title: "Build real-time sensor ingestion API",
          description: "Develop REST endpoint for IoT solar array controllers.",
          assignedTo: allStudentUsers[0]?._id || sahil._id,
          createdBy: sahil._id,
          priority: "Medium",
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: "In Progress",
        },
        {
          project: mainProjectId,
          title: "Prepare final project expo demo & presentation",
          description:
            "Slide deck and live deployment for College Project Expo.",
          assignedTo: sahil._id,
          createdBy: sahil._id,
          priority: "Urgent",
          deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          status: "To Do",
        },
      ]);
    }

    // ── 9. Create Applications ────────────────────────────────────────────────
    if (createdProjects.length >= 2) {
      await Application.create([
        {
          applicant: sahil._id,
          project: createdProjects[0].proj._id,
          type: "Project Application",
          title: createdProjects[0].proj.title,
          targetName: "VKBIET Solar Lab",
          category: "Project Application",
          tags: ["AI/ML", "Sustainability", "Python"],
          status: "Accepted",
          appliedDate: new Date("2026-09-10"),
        },
        {
          applicant: sahil._id,
          project: createdProjects[1].proj._id,
          type: "Project Application",
          title: createdProjects[1].proj.title,
          targetName: "VKBIET Tech Club",
          category: "Team Application",
          tags: ["IoT", "Embedded Systems"],
          status: "In Review",
          appliedDate: new Date("2026-09-08"),
        },
        {
          applicant: sahil._id,
          mentor: allMentorUserIds[0],
          type: "Mentorship Request",
          title: "Request for AI/ML Mentorship",
          targetName: MENTOR_TEMPLATES[0].name,
          category: "Mentorship Request",
          tags: ["Machine Learning", "Research", "Career Guidance"],
          status: "In Review",
          appliedDate: new Date("2026-09-05"),
        },
      ]);
    }

    // ── 10. Create Messages ───────────────────────────────────────────────────
    if (allStudentUsers.length >= 2) {
      const convId = `dm_${[sahil._id, allStudentUsers[0]._id].sort().join("_")}`;
      await Message.create([
        {
          sender: allStudentUsers[0]._id,
          recipient: sahil._id,
          conversationId: convId,
          content: `Hey Sahil! I saw your profile on Project Match. Your work on SolarSense AI looks amazing!`,
          read: true,
          createdAt: new Date(Date.now() - 60000 * 25),
        },
        {
          sender: allStudentUsers[0]._id,
          recipient: sahil._id,
          conversationId: convId,
          content: `Are you open to collaborating on the Smart Campus Navigation project?`,
          read: true,
          createdAt: new Date(Date.now() - 60000 * 23),
        },
        {
          sender: sahil._id,
          recipient: allStudentUsers[0]._id,
          conversationId: convId,
          content: `Hi! Yes, that sounds like a great project. Tell me more about the tech stack you're planning?`,
          read: true,
          createdAt: new Date(Date.now() - 60000 * 20),
        },
        {
          sender: allStudentUsers[0]._id,
          recipient: sahil._id,
          conversationId: convId,
          content: `We're using React, IoT sensors with Raspberry Pi, and Google Maps API for indoor positioning.`,
          read: false,
          createdAt: new Date(Date.now() - 60000 * 10),
        },
      ]);
    }

    // ── 11. Create Notifications ──────────────────────────────────────────────
    await Notification.create([
      {
        recipient: sahil._id,
        type: "message",
        title: `New Message from ${allStudentUsers[0]?.name || "a student"}`,
        message:
          "Are you open to collaborating on the Smart Campus Navigation project?",
        read: false,
      },
      {
        recipient: sahil._id,
        type: "application",
        title: "Application Accepted",
        message: `Your application for ${createdProjects[0]?.proj?.title || "project"} was accepted!`,
        read: false,
      },
      {
        recipient: sahil._id,
        type: "task",
        title: "Task Due Soon",
        message: "Prepare final project expo demo is due in 12 days.",
        read: true,
      },
    ]);

    // ── 12. Create 20 Community Posts Across Diverse Genres ───────────────────
    const rawCommunityPosts = [
      {
        title: "Looking for ML teammates for AI Study Planner",
        category: "Project Ideas",
        tags: ["AI/ML", "Web Development", "Team Building"],
        content: "Building an AI-powered study planner using NLP and fine-tuned transformers to generate personalized learning paths from syllabus PDFs. Looking for 2-3 motivated teammates with Python/ML and React skills to collaborate for upcoming national hackathons!"
      },
      {
        title: "Hackathon team wanted — Smart India Hackathon 2027",
        category: "Hackathons",
        tags: ["Hackathons", "Smart Cities", "Team Building"],
        content: "SIH 2027 problem statements are out! Our team has 3 members with strong backend and hardware experience. Looking for a frontend specialist (React/Tailwind) and an AI/ML researcher to tackle smart traffic and urban flood monitoring."
      },
      {
        title: "PyTorch vs TensorFlow: Best starting point for Deep Learning in 2026?",
        category: "Tech Help",
        tags: ["AI/ML", "PyTorch", "TensorFlow"],
        content: "Starting research on computer vision for drone imaging. Should our team standardize on PyTorch or TensorFlow/Keras? Would appreciate insights on ecosystem tooling, deployment onto edge devices (Jetson Nano), and current industry trends."
      },
      {
        title: "Research internship openings at Pune Innovation Hub",
        category: "Opportunities",
        tags: ["Opportunities", "Internships", "Research"],
        content: "Pune Tech Innovation Hub is accepting applications for Summer 2026 Student Research Interns in Autonomous Robotics, Edge AI, and Decentralized Systems. Stipend provided with letter of recommendation. Applications close next Friday!"
      },
      {
        title: "Ideas for reducing college lab electricity consumption using IoT",
        category: "Project Ideas",
        tags: ["IoT", "Sustainability", "Embedded Systems"],
        content: "Our team is designing a smart current-monitoring network using ESP32 nodes and MQTT to detect idle computer lab benches and automatically trigger sleep cycles. Looking for ideas on non-invasive current sensors (SCT-013) and dashboard visualization."
      },
      {
        title: "Weekly Open-Source Contribution Circle — Beginner to Advanced",
        category: "Team Building",
        tags: ["Open Source", "Git", "Web Development"],
        content: "Starting a weekly campus GitHub contribution group! We will walk through finding 'good first issue' labels, understanding CI/CD checks, PR etiquette, and maintaining open-source libraries. All engineering branches are welcome."
      },
      {
        title: "Need help optimizing MongoDB compound indexes for live telemetry",
        category: "Tech Help",
        tags: ["Tech Help", "MongoDB", "Backend"],
        content: "Our smart campus vehicle tracking project streams GPS coordinates every 5 seconds. As data surpassed 250k records, dashboard queries got sluggish. Seeking advice on ESR rule (Equality, Sort, Range) compound indexes and TTL collections."
      },
      {
        title: "EthIndia Web3 Hackathon: Seeking Smart Contract Security Auditor",
        category: "Hackathons",
        tags: ["Hackathons", "Blockchain", "Web Development"],
        content: "Participating in EthIndia next month with an academic credential verification dApp built on Polygon and IPFS. We have the frontend and contracts drafted, looking for a peer experienced with Foundry and Slither to test reentrancy edge-cases."
      },
      {
        title: "Fine-Tuning Llama 3 with LoRA on Single GPU — Architecture Notes",
        category: "AI/ML",
        tags: ["AI/ML", "LLM", "Python"],
        content: "Successfully fine-tuned Llama-3-8B on domain-specific engineering lecture notes using Unsloth and 4-bit QLoRA on an RTX 3060. Documented loss curves, memory footprint, and quantization tradeoffs. Happy to share notebook link and benchmark dataset."
      },
      {
        title: "Migrating from Tailwind v3 to v4 in Vite & React 18",
        category: "Web Development",
        tags: ["Web Development", "Tailwind", "React"],
        content: "Recently tested the new Tailwind v4 CSS-first configuration engine on a major project. Compilation is nearly 5x faster with @theme directives, but certain arbitrary utility classes need adjustments. Here are key migration gotchas to watch out for."
      },
      {
        title: "Google Summer of Code (GSoC) 2027 Preparation & Proposal Guide",
        category: "Opportunities",
        tags: ["Opportunities", "GSoC", "Open Source"],
        content: "Drafting a comprehensive guide on reaching out to open-source organization mentors, submitting initial pull requests before organization announcements, and structuring a winning technical proposal. AMA in comments!"
      },
      {
        title: "Building an accessible LeetCode-inspired UI Design System in Figma",
        category: "Tech Help",
        tags: ["UI/UX", "Web Development", "Design System"],
        content: "Looking for feedback on our dark mode color tokens (#1A1A1A, #262626, #FF8A00 accents). Ensuring WCAG AAA contrast ratio (7:1) for text elements while keeping that sleek coding aesthetic. What tools do you use to test screen-reader compliance?"
      },
      {
        title: "ESP32 LoRaWAN mesh network for agricultural moisture sensing",
        category: "Project Ideas",
        tags: ["IoT", "Project Ideas", "Hardware"],
        content: "Proposing a final-year project connecting remote sugarcane fields to a central gateway using 868MHz LoRa mesh nodes without cellular data dependency. Looking for ENTC and Mechanical teammates for PCB design and solar enclosure fabrication."
      },
      {
        title: "Automated Campus Shuttle Live Tracking System",
        category: "Team Building",
        tags: ["Team Building", "Mobile App", "Maps API"],
        content: "Building a progressive web app for real-time tracking of college buses using driver smartphone GPS and WebSockets. Need a React Native developer and a student interested in testing driver-side battery efficiency."
      },
      {
        title: "Docker Rootless & Kubernetes Pod Security Standards in Student Labs",
        category: "Tech Help",
        tags: ["Tech Help", "DevOps", "Docker"],
        content: "Configuring multi-tenant container isolation for student project deployment on campus servers. How do you enforce non-root user execution and prevent namespace breakouts without breaking container image builds?"
      },
      {
        title: "Road Crack & Pothole Detection with YOLOv11 and Edge TPU",
        category: "AI/ML",
        tags: ["AI/ML", "Computer Vision", "Civil Engineering"],
        content: "Collaborating across Computer and Civil Engineering to benchmark YOLOv11 on local asphalt road footage captured via smartphone dashcams. Achieving 48 FPS on Raspberry Pi 5 with Coral USB Accelerator. Seeking diverse road datasets."
      },
      {
        title: "Competitive Programming Study Group — Codeforces & LeetCode Hard",
        category: "Team Building",
        tags: ["Team Building", "Algorithms", "Competitive Programming"],
        content: "Starting a focused study group for Div 2 / Div 1 contest prep. Solving 5 DP and graph problems weekly, followed by Sunday post-contest code reviews and editorial dissection. Candidates aiming for ICPC regionals are encouraged to join."
      },
      {
        title: "Hardware-in-the-Loop CAN Bus Simulation for Electric Vehicles",
        category: "Project Ideas",
        tags: ["Project Ideas", "Embedded Systems", "Electric Vehicles"],
        content: "Developing a prototype ECU test bench simulating motor RPM, battery management state-of-charge, and regenerative braking over CAN 2.0B bus protocol. Looking for Electrical and ENTC students enthusiastic about EV firmware."
      },
      {
        title: "Technical Portfolio Review Checklist that Landed 4 Offers",
        category: "Opportunities",
        tags: ["Opportunities", "Career", "Portfolio"],
        content: "Key takeaways from my hiring season: 1) Include live URLs not just GitHub repos. 2) Document architecture decisions and tradeoffs. 3) Embed a 60-second Loom demo video. 4) Highlight measurable performance benchmarks. Happy to review peer portfolios!"
      },
      {
        title: "Zero-Knowledge Proofs (ZK-SNARKs) in Academic Credential Verification",
        category: "Tech Help",
        tags: ["Tech Help", "Cryptography", "Blockchain"],
        content: "Exploring Circom and snarkjs to generate zk-proofs that verify a student meets a minimum CGPA threshold without revealing their exact marksheet to external recruiters. Let's discuss verification gas costs and circuit optimization!"
      }
    ];

    const postColors = ["bg-indigo-500", "bg-emerald-500", "bg-blue-500", "bg-pink-500", "bg-amber-500", "bg-teal-500", "bg-purple-500"];
    const postTimeStrings = [
      "10 minutes ago", "45 minutes ago", "2 hours ago", "4 hours ago", "6 hours ago",
      "12 hours ago", "1 day ago", "1 day ago", "2 days ago", "2 days ago",
      "3 days ago", "3 days ago", "4 days ago", "5 days ago", "6 days ago",
      "1 week ago", "1 week ago", "2 weeks ago", "2 weeks ago", "3 weeks ago"
    ];

    const communityDocs = rawCommunityPosts.map((p, idx) => {
      const authorUser = allStudentUsers[idx % allStudentUsers.length] || sahil;
      const now = Date.now();
      const postDate = new Date(now - (idx + 1) * 3600 * 1000 * (idx > 6 ? 12 : 2));
      return {
        author: authorUser._id,
        authorName: authorUser.name,
        initialLetter: (authorUser.name || 'S')[0].toUpperCase(),
        initialColor: postColors[idx % postColors.length],
        title: p.title,
        content: p.content,
        category: p.category,
        tags: p.tags,
        relativeTime: postTimeStrings[idx],
        likes: [allStudentUsers[(idx + 1) % allStudentUsers.length]?._id, sahil._id].filter(Boolean).slice(0, (idx % 3) + 1),
        comments: idx % 2 === 0 ? [
          {
            author: sahil._id,
            authorName: sahil.name,
            text: "Great initiative! Really interested in contributing to this.",
            createdAt: new Date(postDate.getTime() + 1800000)
          }
        ] : [],
        createdAt: postDate,
        updatedAt: postDate
      };
    });

    await CommunityPost.create(communityDocs);

    // ── 13. Final Count Verification ─────────────────────────────────────────
    const finalStudentCount = await User.countDocuments({ role: "student" });
    const finalMentorCount = await User.countDocuments({ role: "mentor" });
    const finalPrincipalCount = await User.countDocuments({
      role: "principal",
    });
    const finalProjectCount = await Project.countDocuments();
    const finalCommunityCount = await CommunityPost.countDocuments();

    console.log("\n[Seed] ✅ SEED COMPLETED SUCCESSFULLY!");
    console.log("─".repeat(50));
    console.log(`  Students:    ${finalStudentCount} (target: 280)`);
    console.log(
      `  Mentors:     ${finalMentorCount} (target: ${MENTOR_TEMPLATES.length})`,
    );
    console.log(`  Principal:   ${finalPrincipalCount} (target: 1)`);
    console.log(`  Projects:    ${finalProjectCount}`);
    console.log(`  Community:   ${finalCommunityCount} (target: 20)`);
    console.log("─".repeat(50));
    console.log("\n  TEST ACCOUNTS:");
    console.log("  Student:    sahilkhot1152005@gmail.com / Student@123");
    console.log("  Mentor:     dr.amit.deshmukh@vkbiet.edu.in / Mentor@123");
    console.log("  Principal:  principal@vkbiet.edu.in / Principal@123");
    console.log("  Admin:      admin@vkbiet.edu.in / Admin@123");
    console.log("─".repeat(50));

    if (
      finalStudentCount !== 280 ||
      finalMentorCount !== 50 ||
      finalPrincipalCount !== 1
    ) {
      throw new Error(
        `Seed count verification failed: students=${finalStudentCount}, mentors=${finalMentorCount}, principals=${finalPrincipalCount}`,
      );
    }

    process.exit(0);
  } catch (error) {
    console.error(`[Seed] ❌ FAILED: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedDatabase();
