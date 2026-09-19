import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Award,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import studentApi from "../services/studentApi";

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    dob: "",
    location: "",
    college:
      user?.college ||
      "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati",
    department: user?.department || "Computer Engineering",
    currentYear: "3rd Year",
    graduationYear: "2026",
    cgpa: "",
    bio: "",
    quote: "",
    skills: [],
    interests: [],
    availability: "Available",
    github: "",
    linkedin: "",
    portfolio: "",
    resumeFile: null,
    marksheetFile: null,
  });

  const [existingDocs, setExistingDocs] = useState({
    resume: null,
    marksheet: null,
  });
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      studentApi
        .getProfile()
        .then((res) => {
          if (res?.success && res.profile) {
            const p = res.profile;
            setFormData((prev) => ({
              ...prev,
              name: p.user?.name || user?.name || prev.name,
              phone: p.phone || "",
              dob: p.dob || "",
              location: p.location || "",
              college: p.college || user?.college || prev.college,
              department: p.department || user?.department || prev.department,
              currentYear: p.currentYear || prev.currentYear,
              graduationYear: p.graduationYear || prev.graduationYear,
              cgpa: p.cgpa ? String(p.cgpa) : "",
              bio: p.bio || "",
              quote: p.quote || "",
              skills: p.skills || [],
              interests: p.interests || [],
              availability: p.availability || "Available",
              github: p.socialLinks?.github || "",
              linkedin: p.socialLinks?.linkedin || "",
              portfolio: p.socialLinks?.portfolio || "",
            }));
            setExistingDocs({
              resume: p.resume || null,
              marksheet: p.marksheet || null,
            });
          }
        })
        .catch((err) =>
          console.error("Failed to load profile for onboarding:", err),
        );
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({
          ...formData,
          skills: [...formData.skills, skillInput.trim()],
        });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleAddInterest = (e) => {
    if (e.key === "Enter" && interestInput.trim()) {
      e.preventDefault();
      if (!formData.interests.includes(interestInput.trim())) {
        setFormData({
          ...formData,
          interests: [...formData.interests, interestInput.trim()],
        });
      }
      setInterestInput("");
    }
  };

  const removeInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Submit Profile details
      const profilePayload = {
        name: formData.name,
        phone: formData.phone,
        dob: formData.dob,
        location: formData.location,
        college: formData.college,
        department: formData.department,
        currentYear: formData.currentYear,
        graduationYear: formData.graduationYear,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
        bio: formData.bio,
        quote: formData.quote,
        skills: formData.skills,
        interests: formData.interests,
        availability: formData.availability,
        socialLinks: {
          github: formData.github,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          email: user?.email,
        },
      };

      const profileRes = await studentApi.updateProfile(profilePayload);

      // 2. Upload documents if selected
      if (formData.resumeFile || formData.marksheetFile) {
        const fileData = new FormData();
        if (formData.resumeFile) fileData.append("resume", formData.resumeFile);
        if (formData.marksheetFile)
          fileData.append("marksheet", formData.marksheetFile);

        await studentApi.uploadDocuments(fileData);
      }

      if (profileRes?.success || profileRes.data?.success) {
        const updatedName = formData.name || user?.name;
        setUser({ ...user, name: updatedName });
        window.dispatchEvent(new CustomEvent("profileUpdated", { detail: profileRes.profile || profileRes.data?.profile }));
        if (onComplete) onComplete();
        onClose();
      } else {
        setErrorMsg(profileRes?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.message || "Error updating profile. Please verify your details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Personal" },
    { num: 2, label: "Academic" },
    { num: 3, label: "Documents" },
    { num: 4, label: "Skills" },
    { num: 5, label: "Interests" },
    { num: 6, label: "Links & Bio" },
    { num: 7, label: "Review" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#F5F5F5]">
        {/* Header */}
        <div className="p-6 border-b border-[#3A3A3A] flex items-center justify-between bg-[#262626]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[8px] bg-[rgba(255,138,0,0.12)] border border-[rgba(255,138,0,0.30)] flex items-center justify-center text-[#FF8A00]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#F5F5F5]">
                Student Profile Setup
              </h2>
              <p className="text-[14px] text-[#A0A0A0]">
                Step {step} of 7 • Build your verified academic identity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#777777] hover:text-[#F5F5F5] p-1.5 rounded-[6px] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Bar */}
        <div className="px-6 py-3.5 bg-[#1A1A1A] border-b border-[#3A3A3A] flex items-center justify-between overflow-x-auto">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full text-[13px] font-bold flex items-center justify-center transition-colors ${
                  step === s.num
                    ? "bg-[#FF8A00] text-[#1A1A1A]"
                    : step > s.num
                      ? "bg-[rgba(34,197,94,0.15)] text-[#22C55E] border border-[rgba(34,197,94,0.3)]"
                      : "bg-[#2D2D2D] text-[#777777] border border-[#3A3A3A]"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-[13.5px] hidden sm:inline ${step === s.num ? "text-[#F5F5F5] font-semibold" : "text-[#777777]"}`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-[8px] text-[14px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-[15px]">
          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-[18px] font-bold text-[#F5F5F5]">
                Personal Information
              </h3>
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your full legal name"
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A0A0A0] font-medium mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+91 9876543210"
                    className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A0A0] font-medium mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    placeholder="DD/MM/YYYY"
                    className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Location / City
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
            </div>
          )}

          {/* Step 2: Academic */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-[18px] font-bold text-[#F5F5F5]">
                Academic Details
              </h3>
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  College / Institution
                </label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) =>
                    setFormData({ ...formData, college: e.target.value })
                  }
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Department / Branch
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                >
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Electronics & Telecommunication Engineering">Electronics & Telecommunication Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A0A0A0] font-medium mb-1.5">
                    Current Year
                  </label>
                  <select
                    value={formData.currentYear}
                    onChange={(e) =>
                      setFormData({ ...formData, currentYear: e.target.value })
                    }
                    className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#A0A0A0] font-medium mb-1.5">
                    CGPA (out of 10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) =>
                      setFormData({ ...formData, cgpa: e.target.value })
                    }
                    placeholder="e.g. 8.85"
                    className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents Upload */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-[18px] font-bold text-[#F5F5F5]">
                Document Verification & Upload
              </h3>
              <p className="text-[14px] text-[#A0A0A0]">
                Upload your resume and marksheet for secure, authenticated
                document access and verified profile status.
              </p>

              {/* Resume Card */}
              <div className="p-4.5 border border-dashed border-[#3A3A3A] rounded-[10px] bg-[#1A1A1A] hover:border-[#FF8A00]/50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-bold text-[#F5F5F5]">
                      Upload Resume (PDF, DOCX)
                    </p>
                    <p className="text-[13.5px] text-[#A0A0A0] mt-0.5">
                      {formData.resumeFile
                        ? formData.resumeFile.name
                        : existingDocs.resume
                          ? "Current Resume: Uploaded & Verified"
                          : "No resume uploaded yet"}
                    </p>
                  </div>
                  <label className="cursor-pointer h-[40px] px-4 bg-[rgba(255,138,0,0.12)] hover:bg-[rgba(255,138,0,0.20)] text-[#FF8A00] border border-[rgba(255,138,0,0.30)] rounded-[8px] text-[14px] font-bold flex items-center gap-2 transition-colors shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resumeFile: e.target.files[0],
                        })
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Marksheet Card */}
              <div className="p-4.5 border border-dashed border-[#3A3A3A] rounded-[10px] bg-[#1A1A1A] hover:border-[#FF8A00]/50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-bold text-[#F5F5F5]">
                      Upload Latest Marksheet (PDF, PNG, JPG)
                    </p>
                    <p className="text-[13.5px] text-[#A0A0A0] mt-0.5">
                      {formData.marksheetFile
                        ? formData.marksheetFile.name
                        : existingDocs.marksheet
                          ? "Current Marksheet: Uploaded & Verified"
                          : "No marksheet uploaded yet"}
                    </p>
                  </div>
                  <label className="cursor-pointer h-[40px] px-4 bg-[rgba(255,138,0,0.12)] hover:bg-[rgba(255,138,0,0.20)] text-[#FF8A00] border border-[rgba(255,138,0,0.30)] rounded-[8px] text-[14px] font-bold flex items-center gap-2 transition-colors shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          marksheetFile: e.target.files[0],
                        })
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Skills */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-[18px] font-bold text-[#F5F5F5]">
                Skills & Technologies
              </h3>
              <p className="text-[14px] text-[#A0A0A0]">
                Add technical and soft skills. Type a skill and click Add or
                press Enter.
              </p>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="e.g. React, Python, Docker..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  className="flex-1 h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (skillInput.trim()) {
                      if (!formData.skills.includes(skillInput.trim())) {
                        setFormData({
                          ...formData,
                          skills: [...formData.skills, skillInput.trim()],
                        });
                      }
                      setSkillInput("");
                    }
                  }}
                  className="h-[42px] px-5 bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] font-bold rounded-[8px] text-[15px] cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {formData.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A] border border-[#3A3A3A] rounded-[6px] text-[14px] text-[#F5F5F5]"
                  >
                    {s}
                    <button
                      onClick={() => removeSkill(s)}
                      className="text-[#777777] hover:text-[#EF4444] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Interests & Availability */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-[18px] font-bold text-[#F5F5F5]">
                Interests & Availability
              </h3>
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Collaboration Availability
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) =>
                    setFormData({ ...formData, availability: e.target.value })
                  }
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                >
                  <option value="Available">Available</option>
                  <option value="Available for Projects">
                    Available for Projects
                  </option>
                  <option value="Busy">Busy</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Domains of Interest (press enter)
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="e.g. AI/ML, Web3, Cloud, Robotics..."
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={handleAddInterest}
                    className="flex-1 h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (interestInput.trim()) {
                        if (
                          !formData.interests.includes(interestInput.trim())
                        ) {
                          setFormData({
                            ...formData,
                            interests: [
                              ...formData.interests,
                              interestInput.trim(),
                            ],
                          });
                        }
                        setInterestInput("");
                      }
                    }}
                    className="h-[42px] px-5 bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] font-bold rounded-[8px] text-[15px] cursor-pointer transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.interests.map((i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2D2D2D] border border-[#3A3A3A] rounded-[6px] text-[14px] text-[#D4D4D4]"
                    >
                      {i}
                      <button
                        onClick={() => removeInterest(i)}
                        className="text-[#777777] hover:text-[#EF4444] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Links & Bio */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-[18px] font-bold text-[#F5F5F5]">
                Social Links & Bio
              </h3>
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  GitHub Profile Link
                </label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) =>
                    setFormData({ ...formData, github: e.target.value })
                  }
                  placeholder="github.com/username"
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  LinkedIn Profile Link
                </label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin: e.target.value })
                  }
                  placeholder="linkedin.com/in/username"
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Portfolio Link
                </label>
                <input
                  type="text"
                  value={formData.portfolio}
                  onChange={(e) =>
                    setFormData({ ...formData, portfolio: e.target.value })
                  }
                  placeholder="portfolio-domain.com"
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Personal Quote
                </label>
                <input
                  type="text"
                  value={formData.quote}
                  onChange={(e) =>
                    setFormData({ ...formData, quote: e.target.value })
                  }
                  placeholder="e.g. Ideas are powerful. Teams make them real."
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Professional Bio
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell potential teammates about your interests, project focus, and technical background..."
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] p-3 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
            </div>
          )}

          {/* Step 7: Review & Finalize */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="p-4.5 bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.30)] rounded-[10px] flex items-center gap-3.5">
                <CheckCircle2 className="w-6 h-6 text-[#22C55E] shrink-0" />
                <div>
                  <h4 className="text-[16px] font-bold text-[#F5F5F5]">
                    Profile Ready for Final Submission
                  </h4>
                  <p className="text-[13.5px] text-[#22C55E]">
                    Your details will be synchronized with the central Project
                    Match database.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-[#1A1A1A] border border-[#3A3A3A] rounded-[10px] space-y-2.5 text-[15px]">
                <div className="flex justify-between py-1.5 border-b border-[#3A3A3A]">
                  <span className="text-[#A0A0A0]">Name:</span>
                  <span className="font-semibold text-[#F5F5F5]">
                    {formData.name || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#3A3A3A]">
                  <span className="text-[#A0A0A0]">Department:</span>
                  <span className="font-semibold text-[#F5F5F5]">
                    {formData.department}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#3A3A3A]">
                  <span className="text-[#A0A0A0]">CGPA:</span>
                  <span className="font-semibold text-[#FF8A00]">
                    {formData.cgpa || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#3A3A3A]">
                  <span className="text-[#A0A0A0]">
                    Skills ({formData.skills.length}):
                  </span>
                  <span className="text-[#F5F5F5]">
                    {formData.skills.slice(0, 4).join(", ")}
                    {formData.skills.length > 4 ? "..." : ""}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#A0A0A0]">Availability:</span>
                  <span className="text-[#22C55E] font-semibold">
                    {formData.availability}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4.5 bg-[#262626] border-t border-[#3A3A3A] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="h-[42px] px-5 rounded-[8px] text-[15px] font-semibold text-[#F5F5F5] bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="h-[42px] px-6 rounded-[8px] text-[15px] font-bold text-[#1A1A1A] bg-[#FF8A00] hover:bg-[#FF9E2C] flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="h-[42px] px-7 rounded-[8px] text-[15px] font-bold text-[#1A1A1A] bg-[#FF8A00] hover:bg-[#FF9E2C] flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Saving Profile..." : "Complete Profile"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
