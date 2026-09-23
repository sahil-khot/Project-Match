import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Building2,
  GraduationCap,
  Calendar,
  Hash,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college:
      "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati",
    department: "Computer Engineering",
    academicYear: "3rd Year (2025–2027)",
    studentId: "",
    skills: "React, Node.js, Python",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const departments = [
    "Computer Engineering",
    "Information Technology",
    "Electronics & Telecommunication",
    "Artificial Intelligence & Data Science",
    "Mechanical Engineering",
    "Civil Engineering",
  ];

  const academicYears = [
    "1st Year (2026–2030)",
    "2nd Year (2025–2029)",
    "3rd Year (2025–2027)",
    "4th Year (2024–2026)",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your institutional email address.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify your password.");
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      });

      if (res.success) {
        navigate(getRoleDashboardPath(res.role || "student"), {
          replace: true,
        });
      } else {
        setError(res.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred during account creation.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-[#FF8A00] selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10 text-center px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img
            src="/logo.png"
            alt="Project Match Logo"
            className="w-12 h-12 object-contain rounded-[10px]"
          />
          <span className="text-[28px] font-bold tracking-tight text-[#F5F5F5]">
            Project Match
          </span>
        </div>
        <p className="text-[16px] text-[#FF8A00] font-semibold tracking-wide uppercase">
          Student Account Registration
        </p>
        <p className="text-[14px] text-[#A0A0A0] mt-1">
          Join your campus innovation ecosystem and connect with
          cross-functional teams.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-[#262626] py-8 px-6 sm:px-8 border border-[#3A3A3A] rounded-[12px] shadow-xl space-y-5">
          <div className="border-b border-[#3A3A3A] pb-4">
            <h2 className="text-[22px] font-bold text-[#F5F5F5]">
              Create Your Student Account
            </h2>
            <p className="text-[14.5px] text-[#A0A0A0] mt-1">
              Public registration creates a student profile. Staff and mentor
              accounts are issued by institutional administration.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-[8px] flex items-start gap-2.5 text-[14px] text-[#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[15px] font-semibold text-[#A0A0A0] mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Sahil Khot"
                    className="w-full h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] pl-10 pr-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-[#A0A0A0] mb-1.5">
                  Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="student@pccoepune.org"
                    className="w-full h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] pl-10 pr-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[15px] font-semibold text-[#A0A0A0] mb-1.5">
                  Password (min. 6 chars) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••••••"
                    className="w-full h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] pl-10 pr-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-[#A0A0A0] mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••••••"
                    className="w-full h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] pl-10 pr-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* College & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[15px] font-semibold text-[#A0A0A0] mb-1.5">
                  College / Institution
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) =>
                      setFormData({ ...formData, college: e.target.value })
                    }
                    className="w-full h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] pl-10 pr-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-[#A0A0A0] mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] pl-10 pr-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00] transition-colors"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Academic Year & Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[15px] font-semibold text-[#A0A0A0] mb-1.5">
                  Academic Year
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.academicYear}
                    onChange={(e) =>
                      setFormData({ ...formData, academicYear: e.target.value })
                    }
                    className="w-full h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] pl-10 pr-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00] transition-colors"
                  >
                    {academicYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-[#A0A0A0] mb-1.5">
                  Student Enrollment ID
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                    placeholder="e.g., PCCOE-2026-COMP-042"
                    className="w-full h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] pl-10 pr-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-[15px] font-semibold text-[#A0A0A0] mb-1.5">
                Key Skills (comma separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
                placeholder="React, Node.js, Python, Machine Learning"
                className="w-full h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[44px] bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] rounded-[8px] font-bold text-[16px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 transition-colors shadow-sm"
            >
              <span>
                {loading
                  ? "Creating Student Profile..."
                  : "Complete Registration"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>


          <div className="pt-1 text-center text-[14.5px] text-[#A0A0A0]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#FF8A00] hover:underline"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
