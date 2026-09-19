import mongoose from 'mongoose';
import User from './models/User.js';
import StudentProfile from './models/StudentProfile.js';
import MentorProfile from './models/MentorProfile.js';

const COLLEGE = "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati";

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/project_match');

  // 1. Student
  let s = await User.findOne({ email: 'sahil@example.com' });
  if (!s) {
    s = await User.create({
      name: 'Sahil Khot',
      email: 'sahil@example.com',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Engineering',
      college: COLLEGE,
      verificationStatus: 'Profile Verified'
    });
    await StudentProfile.create({
      user: s._id,
      department: 'Computer Engineering',
      year: 3,
      cgpa: 9.12,
      skills: ['React', 'Node.js', 'Python', 'Machine Learning', 'MongoDB']
    });
    console.log('Created sahil@example.com');
  }

  // 2. Mentor
  let me = await User.findOne({ email: 'mentor@example.com' });
  if (!me) {
    me = await User.create({
      name: 'Dr. Amit Deshmukh',
      email: 'mentor@example.com',
      password: 'Mentor@123',
      role: 'mentor',
      department: 'Computer Engineering',
      college: COLLEGE,
      verificationStatus: 'Institution Verified'
    });
    await MentorProfile.create({
      user: me._id,
      designation: 'Professor',
      department: 'Computer Engineering',
      expertise: ['AI/ML', 'Deep Learning', 'Python', 'Research']
    });
    console.log('Created mentor@example.com');
  }

  // Remove any legacy hod@example.com if present
  await User.deleteOne({ email: 'hod@example.com' });

  // 3. Principal
  let p = await User.findOne({ email: 'principal@example.com' });
  if (!p) {
    p = await User.create({
      name: 'Dr. Suresh Narayan Joshi',
      email: 'principal@example.com',
      password: 'Principal@123',
      role: 'principal',
      department: 'Administration',
      college: COLLEGE,
      verificationStatus: 'Institution Verified'
    });
    console.log('Created principal@example.com');
  }

  // 4. Admin
  let a = await User.findOne({ email: 'admin@example.com' });
  if (!a) {
    a = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Platform Operations',
      college: COLLEGE,
      verificationStatus: 'Institution Verified'
    });
    console.log('Created admin@example.com');
  }

  console.log('All 4 demo accounts ready!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
