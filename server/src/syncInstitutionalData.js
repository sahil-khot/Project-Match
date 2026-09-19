import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import StudentProfile from './models/StudentProfile.js';
import MentorProfile from './models/MentorProfile.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import Application from './models/Application.js';

dotenv.config();

const COLLEGE = "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati";
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project_match';

const DEPARTMENTS = [
  'Computer Engineering',
  'Artificial Intelligence & Data Science',
  'Information Technology',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electronics & Telecommunication Engineering',
  'Electrical Engineering'
];

const DEPT_SHORT = {
  'Computer Engineering': 'CE',
  'Artificial Intelligence & Data Science': 'AIDS',
  'Information Technology': 'IT',
  'Civil Engineering': 'CIVIL',
  'Mechanical Engineering': 'ME',
  'Electronics & Telecommunication Engineering': 'ENTC',
  'Electrical Engineering': 'EE'
};

const DEPT_FACULTY_TARGETS = {
  'Computer Engineering': 8,
  'Artificial Intelligence & Data Science': 7,
  'Information Technology': 7,
  'Civil Engineering': 7,
  'Mechanical Engineering': 7,
  'Electronics & Telecommunication Engineering': 7,
  'Electrical Engineering': 7
};

// Skill pools
const TOP_SKILLS_POOL = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning',
  'SQL', 'Java', 'Docker', 'Git', 'MongoDB', 'C++', 'Data Structures',
  'REST APIs', 'Deep Learning', 'HTML/CSS', 'TypeScript', 'IoT'
];

// Helper functions
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

const FIRST_NAMES_MALE = [
  'Aarav', 'Aditya', 'Akash', 'Akshay', 'Amit', 'Amol', 'Aniket', 'Anil', 'Anish', 'Ankit',
  'Arjun', 'Aryan', 'Ashish', 'Atharva', 'Ayush', 'Chinmay', 'Chirag', 'Darshan', 'Gaurav', 'Harsh',
  'Kunal', 'Mahesh', 'Manish', 'Mayur', 'Mihir', 'Nikhil', 'Nilesh', 'Omkar', 'Parth', 'Pranav',
  'Prasad', 'Prashant', 'Pratik', 'Rahul', 'Rajesh', 'Rohan', 'Rushikesh', 'Sachin', 'Sagar', 'Sahil',
  'Sanket', 'Shreyas', 'Shubham', 'Siddharth', 'Soham', 'Sujit', 'Suraj', 'Tushar', 'Vaibhav', 'Vedant',
  'Vikram', 'Vinayak', 'Vishal', 'Vivek', 'Yash', 'Yogesh', 'Abhishek', 'Bhushan', 'Dinesh', 'Karan'
];

const FIRST_NAMES_FEMALE = [
  'Aishwarya', 'Akanksha', 'Amruta', 'Ananya', 'Ankita', 'Anushka', 'Apurva', 'Archana', 'Bhagyashri', 'Bhakti',
  'Deepa', 'Devyani', 'Disha', 'Gauri', 'Ishita', 'Janhavi', 'Kalyani', 'Kanchan', 'Kavya', 'Komal',
  'Madhuri', 'Manasi', 'Manisha', 'Megha', 'Mrunali', 'Mugdha', 'Namrata', 'Neha', 'Nikita', 'Pallavi',
  'Poonam', 'Pooja', 'Pratiksha', 'Priyanka', 'Priya', 'Rashmi', 'Riya', 'Rucha', 'Rutuja', 'Sakshi',
  'Sanjana', 'Sejal', 'Shraddha', 'Shravani', 'Shruti', 'Sneha', 'Sonali', 'Supriya', 'Swati', 'Tejal',
  'Vaishali', 'Varsha', 'Vidya', 'Vrushali', 'Yamini', 'Yogita', 'Dipti', 'Esha', 'Chhaya', 'Arti'
];

const LAST_NAMES = [
  'Patil', 'Deshmukh', 'Jadhav', 'Shinde', 'Kulkarni', 'Pawar', 'Bhosale', 'Gaikwad', 'Mane', 'Salve',
  'More', 'Kale', 'Deshpande', 'Joshi', 'Kamble', 'Chavan', 'Thorat', 'Naikwadi', 'Sawant', 'Waghmare',
  'Khot', 'Kadam', 'Bankar', 'Sutar', 'Powar', 'Mahale', 'Yadav', 'Holkar', 'Maske', 'Dhole',
  'Kumbhar', 'Ghuge', 'Biradar', 'Shelar', 'Gade', 'Wagh', 'Lokhande', 'Pande', 'Parab', 'Jagtap'
];

const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face'
];

const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
];

// Exact 10 project definitions per department = 70 total
const PROJECTS_CONFIG = {
  'Computer Engineering': [
    { title: 'SolarSense AI', status: 'In Progress', progress: 72, stack: ['Python', 'Machine Learning', 'React', 'Node.js'] },
    { title: 'Smart Campus Navigation', status: 'In Progress', progress: 60, stack: ['React', 'IoT', 'Maps API'] },
    { title: 'EcoTrack Campus', status: 'In Progress', progress: 45, stack: ['React', 'Node.js', 'IoT', 'MongoDB'] },
    { title: 'SecureVote Campus', status: 'In Progress', progress: 55, stack: ['React', 'Node.js', 'Cryptography'] },
    { title: 'RailSafe Vision', status: 'Completed', progress: 100, stack: ['Python', 'OpenCV', 'TensorFlow'] },
    { title: 'StudyCircle', status: 'In Progress', progress: 68, stack: ['React', 'Socket.io', 'Node.js'] },
    { title: 'SafeSteps Safety App', status: 'In Progress', progress: 40, stack: ['React Native', 'Firebase', 'Maps API'] },
    { title: 'ExamGuard Proctor', status: 'On Hold', progress: 25, stack: ['Python', 'OpenCV', 'Flask'] },
    { title: 'CodeReview Buddy', status: 'In Progress', progress: 50, stack: ['Python', 'LLMs', 'React'] },
    { title: 'Smart Irrigation System', status: 'In Progress', progress: 80, stack: ['IoT', 'Node.js', 'React', 'Sensors'] }
  ],
  'Artificial Intelligence & Data Science': [
    { title: 'AgriSense Vision', status: 'In Progress', progress: 65, stack: ['TensorFlow', 'Python', 'React Native'] },
    { title: 'HealthAI Diagnostics', status: 'In Progress', progress: 50, stack: ['Python', 'TensorFlow', 'Flask', 'React'] },
    { title: 'NLP Study Planner', status: 'In Progress', progress: 45, stack: ['Python', 'NLP', 'React', 'MongoDB'] },
    { title: 'SoilSmart Analytics', status: 'Completed', progress: 100, stack: ['Python', 'Pandas', 'React', 'ML'] },
    { title: 'VoiceDoc Medical', status: 'In Progress', progress: 35, stack: ['Python', 'NLP', 'Speech Recognition'] },
    { title: 'WasteSort AI', status: 'In Progress', progress: 58, stack: ['Python', 'TensorFlow', 'React'] },
    { title: 'MediTrack Healthcare', status: 'Completed', progress: 100, stack: ['React', 'Node.js', 'MongoDB', 'AI/ML'] },
    { title: 'LegalEase Marathi NLP', status: 'In Progress', progress: 60, stack: ['Python', 'NLP', 'React'] },
    { title: 'AgroPredict Yield Model', status: 'In Progress', progress: 42, stack: ['Python', 'Scikit-learn', 'FastAPI'] },
    { title: 'FinInsight Credit ML', status: 'On Hold', progress: 20, stack: ['Python', 'XGBoost', 'PostgreSQL'] }
  ],
  'Information Technology': [
    { title: 'CyberShield IDS', status: 'In Progress', progress: 70, stack: ['Python', 'ML', 'Wireshark', 'React'] },
    { title: 'FinTrack Student', status: 'In Progress', progress: 62, stack: ['React', 'FastAPI', 'PostgreSQL'] },
    { title: 'CampusCare Queue', status: 'In Progress', progress: 48, stack: ['React', 'Node.js', 'MongoDB'] },
    { title: 'MediRoute Emergency', status: 'In Progress', progress: 52, stack: ['Flutter', 'Firebase', 'Maps API'] },
    { title: 'FarmLink Marketplace', status: 'Completed', progress: 100, stack: ['React', 'Node.js', 'MongoDB'] },
    { title: 'SkillSprint Learning', status: 'In Progress', progress: 64, stack: ['React', 'FastAPI', 'PostgreSQL'] },
    { title: 'CampusBus Live Tracker', status: 'In Progress', progress: 75, stack: ['React', 'Node.js', 'Maps API'] },
    { title: 'Placement Prep Coach', status: 'In Progress', progress: 58, stack: ['React', 'Node.js', 'MongoDB'] },
    { title: 'CloudLocker SafeVault', status: 'On Hold', progress: 18, stack: ['AWS', 'Node.js', 'React'] },
    { title: 'EduSync College LMS', status: 'In Progress', progress: 45, stack: ['React', 'TypeScript', 'GraphQL'] }
  ],
  'Civil Engineering': [
    { title: 'SmartStruct BIM Monitor', status: 'In Progress', progress: 60, stack: ['Revit', 'Python', 'IoT', 'React'] },
    { title: 'WaterWise Sentinel', status: 'In Progress', progress: 55, stack: ['IoT', 'Python', 'React'] },
    { title: 'FloodAlert Baramati', status: 'In Progress', progress: 72, stack: ['IoT', 'Python', 'GIS'] },
    { title: 'RoadCrack Vision AI', status: 'Completed', progress: 100, stack: ['Python', 'OpenCV', 'Flutter'] },
    { title: 'GreenConcrete Strength Lab', status: 'In Progress', progress: 40, stack: ['MATLAB', 'Excel', 'Sensors'] },
    { title: 'RainHarvest GIS Mapper', status: 'In Progress', progress: 65, stack: ['GIS', 'Python', 'WebMaps'] },
    { title: 'TrafficFlow Signal Plan', status: 'In Progress', progress: 50, stack: ['Python', 'Simulation', 'CAD'] },
    { title: 'UrbanDrainage HydroModel', status: 'On Hold', progress: 22, stack: ['HEC-RAS', 'GIS', 'Python'] },
    { title: 'SeismicBridge Telemetry', status: 'In Progress', progress: 68, stack: ['STAAD.Pro', 'Sensors', 'IoT'] },
    { title: 'EcoPave Recycled Roads', status: 'In Progress', progress: 45, stack: ['Materials Lab', 'Python', 'GIS'] }
  ],
  'Mechanical Engineering': [
    { title: 'AutoBot Robotic Arm', status: 'In Progress', progress: 70, stack: ['Python', 'ROS', 'Arduino', 'SolidWorks'] },
    { title: 'EV Fleet Battery Planner', status: 'In Progress', progress: 58, stack: ['Python', 'React', 'Optimization'] },
    { title: 'ManufactureFlow IIoT', status: 'In Progress', progress: 64, stack: ['IoT', 'Python', 'React', 'PLC'] },
    { title: 'BioWaste Energy Converter', status: 'Completed', progress: 100, stack: ['Arduino', 'IoT', 'Python'] },
    { title: 'SolarDryer Agro Produce', status: 'In Progress', progress: 52, stack: ['Thermal Eng', 'Sensors', 'IoT'] },
    { title: 'HydroDrone Pipe Inspector', status: 'In Progress', progress: 44, stack: ['ROS', 'SolidWorks', 'Python'] },
    { title: 'AeroBlade Wind Turbine', status: 'In Progress', progress: 62, stack: ['ANSYS Fluent', 'CAD', 'Python'] },
    { title: 'SmartCNC Wear Predictor', status: 'On Hold', progress: 20, stack: ['ML', 'Vibration Sensors', 'Python'] },
    { title: 'ThermalCool EV Pack', status: 'In Progress', progress: 48, stack: ['CFD', 'Thermal Analysis', 'Python'] },
    { title: 'QuadRobo Rough Terrain', status: 'In Progress', progress: 66, stack: ['Robotics', 'C++', 'Kinematics'] }
  ],
  'Electronics & Telecommunication Engineering': [
    { title: 'DroneCrop Multispectral', status: 'In Progress', progress: 74, stack: ['Python', 'GIS', 'IoT', 'Drones'] },
    { title: 'LabAsset RFID Tracker', status: 'In Progress', progress: 58, stack: ['RFID', 'Node.js', 'MongoDB'] },
    { title: 'SmartHelmet Miner Safety', status: 'In Progress', progress: 65, stack: ['ESP32', 'Sensors', 'React'] },
    { title: 'LoRaMesh Rural Connect', status: 'Completed', progress: 100, stack: ['LoRa', 'Embedded C', 'React'] },
    { title: 'WearableECG Patch', status: 'In Progress', progress: 50, stack: ['BLE', 'Signal Processing', 'Flutter'] },
    { title: 'OpticalFiber Sentry', status: 'In Progress', progress: 62, stack: ['OTDR', 'Python', 'Embedded C'] },
    { title: '5G SmartAntenna Beamformer', status: 'In Progress', progress: 46, stack: ['MATLAB', 'FPGA', 'Verilog'] },
    { title: 'AudioNoise Filter ASIC', status: 'On Hold', progress: 24, stack: ['VLSI', 'Verilog', 'DSP'] },
    { title: 'MicroRadar Collision Avoid', status: 'In Progress', progress: 70, stack: ['Radar RF', 'Microcontroller', 'C'] },
    { title: 'GroundStation CubeSat', status: 'In Progress', progress: 55, stack: ['SDR', 'Python', 'Radio Comm'] }
  ],
  'Electrical Engineering': [
    { title: 'Smart Grid Substation Monitor', status: 'In Progress', progress: 68, stack: ['MATLAB', 'Python', 'Simulink', 'SCADA'] },
    { title: 'EV Charging Load Optimizer', status: 'In Progress', progress: 60, stack: ['Power Systems', 'Python', 'IoT'] },
    { title: 'AirQuality Micro Sensor Grid', status: 'In Progress', progress: 54, stack: ['Arduino', 'MQTT', 'React'] },
    { title: 'Microgrid Solar Forecast', status: 'Completed', progress: 100, stack: ['MATLAB', 'Python', 'Machine Learning'] },
    { title: 'BatteryHealth BMS Telemetry', status: 'In Progress', progress: 72, stack: ['BMS', 'CAN Bus', 'Python'] },
    { title: 'SolarInverter Fault AI', status: 'In Progress', progress: 48, stack: ['DSP', 'Python', 'Power Electronics'] },
    { title: 'Substation Transformer Watch', status: 'In Progress', progress: 64, stack: ['Thermal Imaging', 'IoT', 'React'] },
    { title: 'WindTurbine Pitch Controller', status: 'On Hold', progress: 16, stack: ['Control Systems', 'PLC', 'MATLAB'] },
    { title: 'HomeEnergy Smart Hub', status: 'In Progress', progress: 50, stack: ['Zigbee', 'Node.js', 'React'] },
    { title: 'SmartStreetlight Cluster', status: 'In Progress', progress: 76, stack: ['IoT', 'Sensors', 'Dashboard'] }
  ]
};

async function syncAll() {
  console.log('--- Starting Project Match Institutional Data Synchronization ---');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB project_match.');

  // Clean collections completely
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    MentorProfile.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Application.deleteMany({})
  ]);
  console.log('Cleared existing User, Profile, Project, Task, Application collections.');

  // 1. Create 1 Principal Account
  const principal = await User.create({
    name: 'Dr. Suresh Narayan Joshi',
    email: 'principal@example.com',
    password: 'Principal@123',
    role: 'principal',
    department: 'Administration',
    college: COLLEGE,
    verificationStatus: 'Institution Verified',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  });
  console.log('Created Principal: principal@example.com');

  // 2. Create 1 Admin Account
  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
    department: 'Platform Operations',
    college: COLLEGE,
    verificationStatus: 'Institution Verified',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });
  console.log('Created Admin: admin@example.com');

  // 3. Create 50 Mentors across 7 departments
  // Computer Engineering: 8, AIDS: 7, IT: 7, Civil: 7, Mech: 7, ENTC: 7, EE: 7 => Total 50
  console.log('Generating 50 Mentors...');
  const mentorsByDept = {};
  const allMentors = [];
  let mentorGlobalIdx = 0;

  for (const dept of DEPARTMENTS) {
    mentorsByDept[dept] = [];
    const count = DEPT_FACULTY_TARGETS[dept];
    const deptCode = DEPT_SHORT[dept].toLowerCase();

    for (let i = 0; i < count; i++) {
      let name, email;
      // Primary demo mentor in Computer Engineering index 0
      if (dept === 'Computer Engineering' && i === 0) {
        name = 'Dr. Amit Deshmukh';
        email = 'mentor@example.com';
      } else {
        const isMale = (mentorGlobalIdx % 2 === 0);
        const first = isMale ? FIRST_NAMES_MALE[mentorGlobalIdx % FIRST_NAMES_MALE.length] : FIRST_NAMES_FEMALE[mentorGlobalIdx % FIRST_NAMES_FEMALE.length];
        const last = LAST_NAMES[mentorGlobalIdx % LAST_NAMES.length];
        const prefix = (mentorGlobalIdx % 3 === 0) ? 'Dr.' : 'Prof.';
        name = `${prefix} ${first} ${last}`;
        email = `faculty.${deptCode}${i + 1}@vkbiet.edu.in`;
      }

      const isMaleAvatar = (mentorGlobalIdx % 2 === 0);
      const avatarList = isMaleAvatar ? MALE_AVATARS : FEMALE_AVATARS;
      const avatar = avatarList[mentorGlobalIdx % avatarList.length];

      const user = await User.create({
        name,
        email,
        password: 'Mentor@123',
        role: 'mentor',
        department: dept,
        college: COLLEGE,
        verificationStatus: 'Institution Verified',
        avatar
      });

      await MentorProfile.create({
        user: user._id,
        designation: (i === 0 || i === 1) ? 'Professor' : (i < 4 ? 'Associate Professor' : 'Assistant Professor'),
        department: dept,
        college: COLLEGE,
        expertise: ['AI/ML', 'System Design', 'Cloud Computing', 'Research'],
        experienceYears: randInt(6, 22),
        rating: randFloat(4.4, 4.9, 1),
        studentsMentoredCount: randInt(10, 35),
        profileVerified: true
      });

      mentorsByDept[dept].push(user);
      allMentors.push(user);
      mentorGlobalIdx++;
    }
  }
  console.log(`Created exactly ${allMentors.length} faculty/mentors across 7 departments.`);

  // 4. Create 280 Students across 7 departments (exactly 40 per department)
  console.log('Generating 280 Students (40 per department)...');
  const studentsByDept = {};
  const allStudents = [];
  let studentGlobalIdx = 0;

  for (const dept of DEPARTMENTS) {
    studentsByDept[dept] = [];
    const deptCode = DEPT_SHORT[dept].toLowerCase();

    for (let i = 0; i < 40; i++) {
      let name, email;
      let cgpa;

      // Primary demo student in Computer Engineering index 0
      if (dept === 'Computer Engineering' && i === 0) {
        name = 'Sahil Khot';
        email = 'sahil@example.com';
        cgpa = 9.12;
      } else {
        const isMale = (studentGlobalIdx % 2 === 0);
        const first = isMale ? FIRST_NAMES_MALE[studentGlobalIdx % FIRST_NAMES_MALE.length] : FIRST_NAMES_FEMALE[studentGlobalIdx % FIRST_NAMES_FEMALE.length];
        const last = LAST_NAMES[studentGlobalIdx % LAST_NAMES.length];
        name = `${first} ${last}`;
        email = `student.${deptCode}${i + 1}@vkbiet.edu.in`;
        // Target departmental averages:
        // CE: 8.21, AIDS: 8.08, IT: 8.12, Civil: 7.96, Mech: 8.05, ENTC: 8.18, EE: 7.99
        // overall ~8.12
        const baseAverages = {
          'Computer Engineering': 8.21,
          'Artificial Intelligence & Data Science': 8.08,
          'Information Technology': 8.12,
          'Civil Engineering': 7.96,
          'Mechanical Engineering': 8.05,
          'Electronics & Telecommunication Engineering': 8.18,
          'Electrical Engineering': 7.99
        };
        const target = baseAverages[dept] || 8.10;
        cgpa = randFloat(Math.max(6.8, target - 0.9), Math.min(9.8, target + 0.9), 2);
      }

      const isMaleAvatar = (studentGlobalIdx % 2 === 0);
      const avatarList = isMaleAvatar ? MALE_AVATARS : FEMALE_AVATARS;
      const avatar = avatarList[studentGlobalIdx % avatarList.length];

      const user = await User.create({
        name,
        email,
        password: 'Student@123',
        role: 'student',
        department: dept,
        college: COLLEGE,
        verificationStatus: 'Profile Verified',
        avatar
      });

      // Sample skills
      const shuffledSkills = [...TOP_SKILLS_POOL].sort(() => 0.5 - Math.random());
      const studentSkills = shuffledSkills.slice(0, randInt(4, 7));

      await StudentProfile.create({
        user: user._id,
        college: COLLEGE,
        department: dept,
        year: (i % 4) + 1,
        currentYear: `${(i % 4) + 1}rd Year`,
        cgpa,
        skills: studentSkills,
        technicalSkills: studentSkills,
        softSkills: ['Teamwork', 'Communication', 'Problem Solving']
      });

      studentsByDept[dept].push(user);
      allStudents.push(user);
      studentGlobalIdx++;
    }
  }
  console.log(`Created exactly ${allStudents.length} students (40 in each of the 7 departments).`);

  // 5. Create 70 Projects (exactly 10 in each department)
  console.log('Generating 70 Projects (10 per department)...');
  const allCreatedProjects = [];
  const participatingStudentIds = new Set();
  let projectGlobalIdx = 0;

  for (const dept of DEPARTMENTS) {
    const deptProjectsConfig = PROJECTS_CONFIG[dept];
    const deptStudents = studentsByDept[dept]; // 40 students
    const deptMentors = mentorsByDept[dept]; // 7 or 8 mentors

    for (let pIdx = 0; pIdx < 10; pIdx++) {
      const pConf = deptProjectsConfig[pIdx];
      // Ensure exactly 36 students per department participate across the 10 projects
      // Project 0-8 take 4 students each = 36 students (indices 0..35)
      // Project 9 overlaps with already assigned students (0, 4, 8, 12)
      // Indices 36, 37, 38, 39 (4 students per department) are not participating
      // Total participating: 7 * 36 = 252. Total not participating: 7 * 4 = 28. Total: 280.
      let leaderIdx, m1Idx, m2Idx, m3Idx;
      if (pIdx < 9) {
        leaderIdx = pIdx * 4;
        m1Idx = pIdx * 4 + 1;
        m2Idx = pIdx * 4 + 2;
        m3Idx = pIdx * 4 + 3;
      } else {
        leaderIdx = 0;
        m1Idx = 4;
        m2Idx = 8;
        m3Idx = 12;
      }

      const leader = deptStudents[leaderIdx];
      const member1 = deptStudents[m1Idx];
      const member2 = deptStudents[m2Idx];
      const member3 = deptStudents[m3Idx];

      const teamMembers = [
        { user: leader._id, role: 'Leader', joinedAt: new Date(Date.now() - 30 * 86400000) },
        { user: member1._id, role: 'Member', joinedAt: new Date(Date.now() - 25 * 86400000) },
        { user: member2._id, role: 'Member', joinedAt: new Date(Date.now() - 20 * 86400000) },
        { user: member3._id, role: 'Member', joinedAt: new Date(Date.now() - 15 * 86400000) }
      ];

      teamMembers.forEach(m => participatingStudentIds.add(m.user.toString()));

      const assignedMentor = deptMentors[pIdx % deptMentors.length];
      const deadlineDays = [3, 6, 8, 10, 13, 20, 30, 45, 60, 90][pIdx];
      const deadline = new Date(Date.now() + deadlineDays * 86400000);

      const project = await Project.create({
        title: pConf.title,
        description: `${pConf.title} is an innovative institutional capstone project in ${dept} with measurable engineering impact.`,
        domain: pConf.stack[0] || 'Engineering',
        department: dept,
        college: COLLEGE,
        techStack: pConf.stack,
        requiredSkills: pConf.stack.slice(0, 3),
        teamSize: teamMembers.length,
        openPositions: (pConf.status === 'In Progress' && pIdx % 3 === 0) ? 1 : 0,
        creator: leader._id,
        groupLeader: leader._id,
        mentor: assignedMentor._id,
        members: teamMembers,
        status: pConf.status,
        progress: pConf.progress,
        deadline,
        image: `https://images.unsplash.com/photo-${1509391365360 + projectGlobalIdx * 1000}?w=500`
      });

      allCreatedProjects.push(project);
      projectGlobalIdx++;
    }
  }
  console.log(`Created exactly ${allCreatedProjects.length} projects (10 in each of the 7 departments).`);
  console.log(`Participating students: ${participatingStudentIds.size}, Not participating: ${280 - participatingStudentIds.size}`);

  // 6. Create Milestones & Tasks for Upcoming Deadlines matching reference screenshot
  console.log('Generating Tasks & Deadlines...');
  const keyDeadlines = [
    { title: 'SolarSense AI — Final Report', projectKeyword: 'SolarSense', daysLeft: 3 },
    { title: 'MediTrack — Model Training', projectKeyword: 'MediTrack', daysLeft: 6 },
    { title: 'AgriConnect — Final Presentation', projectKeyword: 'AgriSense', daysLeft: 8 },
    { title: 'Campus Navigator — Documentation', projectKeyword: 'Campus Navigation', daysLeft: 10 },
    { title: 'EcoLearn — Demo Submission', projectKeyword: 'EcoTrack', daysLeft: 13 }
  ];

  for (const kd of keyDeadlines) {
    const proj = allCreatedProjects.find(p => p.title.toLowerCase().includes(kd.projectKeyword.toLowerCase())) || allCreatedProjects[0];
    await Task.create({
      project: proj._id,
      title: kd.title,
      description: `Deliverable milestone review for ${proj.title}.`,
      assignedTo: proj.creator,
      createdBy: proj.creator,
      reviewer: proj.mentor,
      priority: kd.daysLeft <= 3 ? 'Urgent' : (kd.daysLeft <= 8 ? 'High' : 'Medium'),
      deadline: new Date(Date.now() + kd.daysLeft * 86400000),
      status: 'In Progress'
    });
  }

  // 7. Create Applications (Matching reference numbers: 127 total applications)
  console.log('Generating Applications...');
  let totalAppsCount = 0;
  const usedAppPairs = new Set();

  for (let i = 0; i < allCreatedProjects.length; i++) {
    const proj = allCreatedProjects[i];
    const applicant = allStudents[(i * 3 + 1) % allStudents.length];
    const key = `${applicant._id}_${proj._id}`;
    if (!usedAppPairs.has(key)) {
      usedAppPairs.add(key);
      await Application.create({
        title: `Application for ${proj.title}`,
        project: proj._id,
        applicant: applicant._id,
        type: 'Project Application',
        role: 'Full Stack Contributor',
        status: (i % 3 === 0) ? 'Pending' : (i % 3 === 1 ? 'Accepted' : 'In Review'),
        appliedDate: new Date(Date.now() - randInt(1, 20) * 86400000),
        notes: `Interested in contributing to ${proj.title}.`
      });
      totalAppsCount++;
    }
  }

  let attempt = 0;
  while (totalAppsCount < 127 && attempt < 500) {
    attempt++;
    const proj = allCreatedProjects[attempt % allCreatedProjects.length];
    const applicant = allStudents[(attempt * 7) % allStudents.length];
    const key = `${applicant._id}_${proj._id}`;
    if (!usedAppPairs.has(key)) {
      usedAppPairs.add(key);
      await Application.create({
        title: `Collaboration Request for ${proj.title}`,
        project: proj._id,
        applicant: applicant._id,
        type: 'Project Application',
        role: 'Collaborator',
        status: (totalAppsCount % 4 === 0) ? 'Accepted' : 'Pending',
        appliedDate: new Date(Date.now() - randInt(1, 30) * 86400000),
        notes: 'Applying for institutional capstone team opening.'
      });
      totalAppsCount++;
    }
  }
  console.log(`Created ${totalAppsCount} applications.`);

  // 8. Verification Checks
  const finalStudents = await User.countDocuments({ role: 'student' });
  const finalMentors = await User.countDocuments({ role: 'mentor' });
  const finalProjects = await Project.countDocuments();
  const finalApps = await Application.countDocuments();
  const inProgressProjects = await Project.countDocuments({ status: 'In Progress' });
  const completedProjects = await Project.countDocuments({ status: 'Completed' });
  const onHoldProjects = await Project.countDocuments({ status: 'On Hold' });

  console.log('\n--- Final Institutional Verification ---');
  console.log(`Total Students: ${finalStudents} (Target: 280)`);
  console.log(`Total Mentors: ${finalMentors} (Target: 50)`);
  console.log(`Total Projects: ${finalProjects} (Target: 70)`);
  console.log(`Projects by Status: In Progress=${inProgressProjects}, Completed=${completedProjects}, On Hold=${onHoldProjects} (Sum: ${inProgressProjects + completedProjects + onHoldProjects})`);
  console.log(`Total Applications: ${finalApps}`);
  console.log('--- Database Synchronization Complete! ---');

  process.exit(0);
}

syncAll().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
