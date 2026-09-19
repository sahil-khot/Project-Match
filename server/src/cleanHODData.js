import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';

async function cleanupHOD() {
  await connectDB();

  console.log('--- Cleaning up HOD records from MongoDB ---');
  const hodCount = await User.countDocuments({ role: 'hod' });
  console.log(`Found ${hodCount} users with role 'hod'.`);

  if (hodCount > 0) {
    const deleted = await User.deleteMany({ role: 'hod' });
    console.log(`Deleted ${deleted.deletedCount} HOD user documents.`);
  }

  // Verify and ensure default demo accounts for the 4 official roles exist
  const roles = [
    { email: 'sahil@example.com', password: 'Student@123', name: 'Sahil Khot', role: 'student', department: 'Computer Engineering' },
    { email: 'mentor@example.com', password: 'Mentor@123', name: 'Dr. Amit Deshmukh', role: 'mentor', department: 'Computer Engineering' },
    { email: 'principal@example.com', password: 'Principal@123', name: 'Dr. Suresh Narayan Joshi', role: 'principal', department: 'Administration' },
    { email: 'admin@example.com', password: 'Admin@123', name: 'System Administrator', role: 'admin', department: 'Administration' }
  ];

  for (const r of roles) {
    let u = await User.findOne({ email: r.email }).select('+password');
    if (!u) {
      u = await User.create({
        name: r.name,
        email: r.email,
        password: r.password,
        role: r.role,
        department: r.department,
        verificationStatus: 'Verified',
        isActive: true
      });
      console.log(`Created demo user: ${r.email} (${r.role})`);
    } else {
      u.name = r.name;
      u.role = r.role;
      u.password = r.password; // pre-save will re-hash
      u.isActive = true;
      await u.save();
      console.log(`Updated and refreshed demo user: ${r.email} (${r.role})`);
    }
  }

  const remainingRoles = await User.distinct('role');
  console.log('Current roles in database:', remainingRoles);
  console.log('Cleanup completed successfully.');
  process.exit(0);
}

cleanupHOD().catch(err => {
  console.error('HOD cleanup error:', err);
  process.exit(1);
});
