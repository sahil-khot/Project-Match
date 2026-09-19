import React, { useState } from "react";
import {
  X,
  FolderGit2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import projectApi from "../services/projectApi";

export default function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problemStatement: "",
    goals: "",
    domain: "Artificial Intelligence",
    techStack: "React, Node.js, Python, MongoDB",
    requiredSkills: "Frontend Development, REST APIs, Git",
    teamSize: 4,
    openPositions: 3,
    deadline: "2026-11-30",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg("");
      const payload = {
        ...formData,
        techStack: formData.techStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        requiredSkills: formData.requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        teamSize: Number(formData.teamSize),
        openPositions: Number(formData.openPositions),
      };

      const res = await projectApi.createProject(payload);
      if (res?.success) {
        setSuccess(true);
        if (onProjectCreated) onProjectCreated(res.project);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res?.message || "Project creation failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.message || "Error creating project. Please check required fields.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-xl p-6 relative shadow-2xl my-8 text-[#F5F5F5]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 bg-[rgba(34,197,94,0.15)] text-[#22C55E] rounded-full flex items-center justify-center mx-auto border border-[rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-[20px] font-bold text-[#F5F5F5]">
              Project Published Successfully!
            </h3>
            <p className="text-[15px] text-[#A0A0A0]">
              Your project is now visible on the Explore Projects board and
              recruiting applicants.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-[15px]">
            <div>
              <div className="flex items-center gap-2 text-[#FF8A00]">
                <FolderGit2 className="w-4 h-4" />
                <span className="text-[13px] font-bold uppercase tracking-wider">
                  New Project Proposal
                </span>
              </div>
              <h2 className="text-[22px] font-bold text-[#F5F5F5] mt-1">
                Post a Project & Recruit Collaborators
              </h2>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-[8px] text-[14px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[#A0A0A0] font-medium mb-1.5">
                Project Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., AgriDrone — Autonomous Crop Disease Detection System"
                className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Domain
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                >
                  <option value="Artificial Intelligence">
                    Artificial Intelligence
                  </option>
                  <option value="Web Development">Web Development</option>
                  <option value="Internet of Things (IoT)">
                    Internet of Things (IoT)
                  </option>
                  <option value="CleanTech / Energy">CleanTech / Energy</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="FinTech">FinTech</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Target Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#A0A0A0] font-medium mb-1.5">
                Short Description
              </label>
              <textarea
                rows={2}
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="High-level overview of what the project aims to accomplish..."
                className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] p-3 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
              />
            </div>

            <div>
              <label className="block text-[#A0A0A0] font-medium mb-1.5">
                Problem Statement
              </label>
              <textarea
                rows={2}
                value={formData.problemStatement}
                onChange={(e) =>
                  setFormData({ ...formData, problemStatement: e.target.value })
                }
                placeholder="What specific societal or technical pain point is addressed?"
                className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] p-3 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) =>
                    setFormData({ ...formData, techStack: e.target.value })
                  }
                  placeholder="Python, React, PyTorch, ESP32"
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>

              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Required Skills Needed
                </label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) =>
                    setFormData({ ...formData, requiredSkills: e.target.value })
                  }
                  placeholder="UI Design, Embedded C++, Cloud Deployment"
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Total Team Size
                </label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={formData.teamSize}
                  onChange={(e) =>
                    setFormData({ ...formData, teamSize: e.target.value })
                  }
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">
                  Open Spots Recruiting
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.openPositions}
                  onChange={(e) =>
                    setFormData({ ...formData, openPositions: e.target.value })
                  }
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3A3A3A]">
              <button
                type="button"
                onClick={onClose}
                className="h-[44px] px-5 rounded-[8px] text-[16px] font-medium text-[#A0A0A0] hover:text-[#F5F5F5] bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-[44px] bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] px-6 rounded-[8px] font-bold text-[16px] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                {loading ? "Publishing..." : "Publish Project"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
