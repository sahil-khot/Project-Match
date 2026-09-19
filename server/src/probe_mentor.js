import mongoose from "mongoose";
import User from "./models/User.js";
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import Application from "./models/Application.js";

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/project_match");
  const studentCount = await User.countDocuments({ role: 'student' });
  const mentorCount = await User.countDocuments({ role: 'mentor' });
  const principalCount = await User.countDocuments({ role: 'principal' });
  const adminCount = await User.countDocuments({ role: 'admin' });
  const projectCount = await Project.countDocuments();
  const appCount = await Application.countDocuments();

  console.log('User counts:', { studentCount, mentorCount, principalCount, adminCount });
  console.log('Project count:', projectCount);
  console.log('Application count:', appCount);

  const studentDepts = await User.aggregate([
    { $match: { role: 'student' } },
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);
  console.log('Students by department:', studentDepts);

  const mentorDepts = await User.aggregate([
    { $match: { role: 'mentor' } },
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);
  console.log('Mentors by department:', mentorDepts);

  const projectDepts = await Project.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);
  console.log('Projects by department:', projectDepts);

  const projectStatuses = await Project.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  console.log('Projects by status:', projectStatuses);

  const allProjects = await Project.find({}).select('members creator groupLeader');
  const participantSet = new Set();
  allProjects.forEach(p => {
    if (p.creator) participantSet.add(p.creator.toString());
    if (p.groupLeader) participantSet.add(p.groupLeader.toString());
    if (Array.isArray(p.members)) {
      p.members.forEach(m => {
        const uid = m.user ? m.user.toString() : m.toString();
        participantSet.add(uid);
      });
    }
  });
  console.log(`Unique participants in projects: ${participantSet.size}`);

  process.exit(0);
}
run();
