import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Star,
  Users,
  Award,
  Search,
  Filter,
  CheckCircle,
  MessageSquare,
  Clock,
  Send,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  Bot,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mentorApi from "../services/mentorApi";
import recommendApi from "../services/recommendApi";

export default function FindMentor({ setActiveTab }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [stats, setStats] = useState({
    totalFaculty: 0,
    subjectsCovered: 0,
    availableNow: 0,
    averageRating: 5.0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");

  // Mentorship request modal
  const [requestMentor, setRequestMentor] = useState(null);
  const [requestNote, setRequestNote] = useState("");
  const [requestSubject, setRequestSubject] = useState("");
  const [requestedSuccess, setRequestedSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [aiRecommended, setAIRecommended] = useState([]);
  const [aiLoading, setAILoading] = useState(false);

  useEffect(() => {
    fetchMentors();
    fetchAIRecommended();
  }, [selectedDept, selectedAvailability]);

  const fetchAIRecommended = async () => {
    setAILoading(true);
    try {
      const data = await recommendApi.recommendMentors({});
      if (data.success) setAIRecommended(data.recommendations || []);
    } catch (e) {
    } finally {
      setAILoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const res = await mentorApi.getMentors({
        department: selectedDept,
        availability: selectedAvailability,
        search: searchQuery,
      });
      if (res?.success) {
        setMentors(res.mentors || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (e) {
      console.error("Failed to load mentors:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter((m) => {
    const q = searchQuery.toLowerCase();
    const name = m.user?.name?.toLowerCase() || "";
    const dept = m.department?.toLowerCase() || "";
    const exp = m.expertise?.some((e) => e.toLowerCase().includes(q));
    return name.includes(q) || dept.includes(q) || exp;
  });

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!requestMentor) return;
    try {
      setSubmitting(true);
      setErrorMessage("");
      const mentorUserId =
        requestMentor.user?._id || requestMentor.user?.id || requestMentor._id;
      const res = await mentorApi.sendRequest({
        mentorId: mentorUserId,
        subject: requestSubject || "Project Mentorship Request",
        message: requestNote,
        coverNote: requestNote,
      });

      if (res?.success) {
        setRequestedSuccess(true);
        setTimeout(() => {
          setRequestMentor(null);
          setRequestedSuccess(false);
          setRequestNote("");
          setRequestSubject("");
        }, 1800);
      } else {
        setErrorMessage(res?.message || "Request failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Error sending mentorship request.");
    } finally {
      setSubmitting(false);
    }
  };

  const departments = [
    "All",
    "Computer Engineering",
    "Information Technology",
    "Artificial Intelligence & Data Science",
    "Electronics & Telecommunication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ];

  const handleMessage = (mentorUser) => {
    const recipientId = mentorUser?._id || mentorUser?.id;
    if (!recipientId) return;
    navigate(`/${user?.role || "student"}/messages?recipient=${encodeURIComponent(recipientId)}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1320px] mx-auto text-[#F5F5F5]">
      {/* Header */}
      <div>
        <h1 className="text-[28px] lg:text-[32px] font-bold text-[#F5F5F5] tracking-tight leading-tight">
          Find a Faculty Mentor
        </h1>
        <p className="text-[16px] text-[#A0A0A0] mt-1.5">
          Connect with experienced professors and advisors to guide your
          research and capstone projects.
        </p>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-5 flex items-center gap-4 shadow-card min-h-[108px]">
          <div className="w-11 h-11 rounded-[8px] bg-[rgba(255,138,0,0.10)] border border-[rgba(255,138,0,0.30)] flex items-center justify-center text-[#FF8A00] shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[28px] font-bold text-[#F5F5F5] leading-none">
              {stats.totalFaculty || mentors.length}
            </p>
            <p className="text-[14px] text-[#A0A0A0] mt-1 font-medium">
              Faculty Mentors
            </p>
          </div>
        </div>

        <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-5 flex items-center gap-4 shadow-card min-h-[108px]">
          <div className="w-11 h-11 rounded-[8px] bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[28px] font-bold text-[#F5F5F5] leading-none">
              {stats.subjectsCovered}
            </p>
            <p className="text-[14px] text-[#A0A0A0] mt-1 font-medium">
              Subjects Covered
            </p>
          </div>
        </div>

        <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-5 flex items-center gap-4 shadow-card min-h-[108px]">
          <div className="w-11 h-11 rounded-[8px] bg-[rgba(34,197,94,0.10)] border border-[rgba(34,197,94,0.30)] flex items-center justify-center text-[#22C55E] shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[28px] font-bold text-[#22C55E] leading-none">
              {stats.availableNow}
            </p>
            <p className="text-[14px] text-[#A0A0A0] mt-1 font-medium">
              Available Now
            </p>
          </div>
        </div>

        <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-5 flex items-center gap-4 shadow-card min-h-[108px]">
          <div className="w-11 h-11 rounded-[8px] bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[28px] font-bold text-[#F5F5F5] leading-none">
              {stats.averageRating}
            </p>
            <p className="text-[14px] text-[#A0A0A0] mt-1 font-medium">
              Average Rating
            </p>
          </div>
        </div>
      </div>
      {/* AI Recommended Mentors Section */}
      {(aiLoading || aiRecommended.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#FF8A00]/10 border border-[#FF8A00]/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#FF8A00]" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#F5F5F5]">
                AI Recommended for You
              </h3>
              <p className="text-[12px] text-[#A0A0A0]">
                Based on your profile skills, interests, and domain
              </p>
            </div>
          </div>
          {aiLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-[140px] bg-[#262626] border border-[#3A3A3A] rounded-[10px] animate-pulse"
                  />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {aiRecommended.slice(0, 5).map((mentor, idx) => (
                <div
                  key={mentor.mentorId || idx}
                  className="bg-[#262626] border border-[#FF8A00]/20 rounded-[10px] p-4 space-y-2.5 hover:border-[#FF8A00]/40 transition-colors"
                >
                  {/* Match badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-extrabold px-2 py-0.5 rounded-full bg-[#FF8A00]/15 text-[#FF8A00] border border-[#FF8A00]/30">
                      {mentor.matchScore}% match
                    </span>
                    <span className="text-[10px] font-bold text-[#A0A0A0]">
                      #{idx + 1}
                    </span>
                  </div>
                  {/* Avatar + name */}
                  <div className="flex items-center gap-2.5">
                    {mentor.avatar ? (
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-9 h-9 rounded-[8px] object-cover border border-[#3A3A3A] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-[8px] bg-[#FF8A00]/15 flex items-center justify-center text-[#FF8A00] font-bold flex-shrink-0">
                        {mentor.name?.[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#F5F5F5] truncate">
                        {mentor.name}
                      </p>
                      <p className="text-[11px] text-[#A0A0A0] truncate">
                        {mentor.designation}
                      </p>
                    </div>
                  </div>
                  {/* Why this match */}
                  {mentor.reasons?.[0] && (
                    <p className="text-[11px] text-[#D4D4D4] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#22C55E] flex-shrink-0" />
                      {mentor.reasons[0]}
                    </p>
                  )}
                  {/* Expertise chips */}
                  <div className="flex flex-wrap gap-1">
                    {(mentor.matchedExpertise || mentor.expertise || [])
                      .slice(0, 2)
                      .map((e) => (
                        <span
                          key={e}
                          className="text-[10px] bg-[#1A1A1A] text-[#A0A0A0] border border-[#3A3A3A] px-2 py-0.5 rounded-md"
                        >
                          {e}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] p-5 space-y-4 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="w-5 h-5 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mentor by name, expertise (e.g. Deep Learning, IoT, Cloud)..."
              className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] placeholder-[#777777] text-[16px] rounded-[8px] pl-10 pr-3.5 focus:outline-none focus:border-[#FF8A00] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#777777] shrink-0" />
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[16px] rounded-[8px] px-3.5 focus:outline-none focus:border-[#FF8A00] transition-colors"
            >
              <option value="All">All Availability</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 text-[14px]">
          <span className="text-[#777777] font-medium whitespace-nowrap">
            Department:
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-1.5 rounded-[6px] whitespace-nowrap transition-all text-[14px] font-medium cursor-pointer ${
                selectedDept === dept
                  ? "bg-[#FF8A00] text-[#1A1A1A] font-semibold"
                  : "bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#3A3A3A]"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Mentor Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#777777] bg-[#262626] border border-[#3A3A3A] rounded-[10px] flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#FF8A00] mb-2.5" />
          <span className="text-[15px] text-[#A0A0A0]">
            Loading faculty mentors...
          </span>
        </div>
      ) : filteredMentors.length === 0 ? (
        <div className="p-12 text-center text-[#A0A0A0] bg-[#262626] border border-[#3A3A3A] rounded-[10px]">
          <GraduationCap className="w-10 h-10 mx-auto text-[#777777] mb-2.5" />
          <p className="text-[18px] font-semibold text-[#F5F5F5]">
            No mentors found
          </p>
          <p className="text-[14px] text-[#777777] mt-1">
            Try selecting another department or clearing search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor._id}
              className="bg-[#262626] border border-[#3A3A3A] hover:border-[#FF8A00]/45 rounded-[10px] p-6 flex flex-col justify-between transition-all group shadow-card"
            >
              <div className="space-y-4">
                {/* Header Profile */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#3A3A3A] text-[#FF8A00] font-bold text-[15px] flex items-center justify-center shrink-0 overflow-hidden">
                    {mentor.user?.avatar ? (
                      <img
                        src={mentor.user.avatar}
                        alt={mentor.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {mentor.user?.name
                          ? mentor.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                          : "DR"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-[16px] font-semibold text-[#F5F5F5] group-hover:text-[#FF8A00] transition-colors truncate">
                        {mentor.user?.name || "Faculty Mentor"}
                      </h3>
                      <span className="flex items-center gap-1 text-[12px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded-[4px] border border-[#F59E0B]/20 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                        <span>{mentor.rating || "5.0"}</span>
                      </span>
                    </div>
                    <p className="text-[13.5px] text-[#FF8A00] font-medium truncate">
                      {mentor.designation || "Faculty Advisor"}
                    </p>
                    <p className="text-[13px] text-[#A0A0A0] truncate">
                      {mentor.department}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-[14px] text-[#A0A0A0] line-clamp-2 leading-relaxed">
                  {mentor.bio ||
                    "Advising engineering students on technical architectures, research papers, and project implementations."}
                </p>

                {/* Expertise tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {(mentor.expertise || []).slice(0, 3).map((skill, i) => (
                    <span
                      key={i}
                      className="text-[12.5px] px-2.5 py-0.5 rounded-[4px] bg-[#1A1A1A] text-[#F5F5F5] border border-[#3A3A3A]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Meta & Actions */}
              <div className="pt-3.5 mt-3.5 border-t border-[#3A3A3A] space-y-3">
                <div className="flex items-center justify-between text-[13px] text-[#A0A0A0]">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#777777]" />
                    <span>{mentor.studentsMentoredCount ?? 0} Mentees</span>
                  </div>
                  <span
                    className={`text-[12.5px] font-medium flex items-center gap-1.5 ${
                      mentor.availabilityStatus === "Available"
                        ? "text-[#22C55E]"
                        : mentor.availabilityStatus === "Busy"
                          ? "text-[#F59E0B]"
                          : "text-[#777777]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        mentor.availabilityStatus === "Available"
                          ? "bg-[#22C55E]"
                          : mentor.availabilityStatus === "Busy"
                            ? "bg-[#F59E0B]"
                            : "bg-[#777777]"
                      }`}
                    />
                    {mentor.availabilityStatus || "Available"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMessage(mentor.user)}
                    className="flex-1 h-[40px] rounded-[8px] text-[14px] font-semibold bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] text-[#F5F5F5] transition-colors text-center cursor-pointer"
                  >
                    Message
                  </button>
                  <button
                    onClick={() => {
                      setRequestMentor(mentor);
                      setErrorMessage("");
                    }}
                    className="flex-1 h-[40px] rounded-[8px] text-[14px] font-bold bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] transition-all text-center flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span>Request</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mentorship Request Modal */}
      {requestMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-lg p-6 relative shadow-2xl text-[#F5F5F5]">
            <button
              onClick={() => setRequestMentor(null)}
              className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {requestedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-[rgba(34,197,94,0.15)] text-[#22C55E] rounded-full flex items-center justify-center mx-auto border border-[rgba(34,197,94,0.3)]">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#F5F5F5]">
                  Mentorship Request Sent!
                </h3>
                <p className="text-[15px] text-[#A0A0A0] max-w-sm mx-auto">
                  {requestMentor.user?.name} has received your request and will
                  review your project requirements.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-4">
                <div>
                  <span className="text-[12px] font-bold text-[#FF8A00] uppercase tracking-wider">
                    Mentorship Request
                  </span>
                  <h3 className="text-[20px] font-bold text-[#F5F5F5] mt-1">
                    Request Guidance from {requestMentor.user?.name}
                  </h3>
                  <p className="text-[14px] text-[#A0A0A0] mt-0.5">
                    {requestMentor.designation} · {requestMentor.department}
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-[8px] text-[14px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[14px] font-medium text-[#A0A0A0] mb-1.5">
                    Project Subject / Scope
                  </label>
                  <input
                    type="text"
                    required
                    value={requestSubject}
                    onChange={(e) => setRequestSubject(e.target.value)}
                    placeholder="e.g. AI-Powered Medical Diagnosis System"
                    className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#A0A0A0] mb-1.5">
                    Project Summary & Guidance Needed
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="Provide details about your project scope, target tech stack, and the specific guidance you are looking for..."
                    className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] p-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRequestMentor(null)}
                    className="h-[42px] px-5 rounded-[8px] text-[15px] text-[#A0A0A0] hover:text-[#F5F5F5] bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-[42px] bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] px-6 rounded-[8px] text-[16px] font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                  >
                    {submitting ? "Submitting..." : "Send Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
