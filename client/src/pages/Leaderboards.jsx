import React, { useState, useEffect } from "react";
import {
  Trophy,
  Users,
  FolderGit2,
  Building2,
  Calendar,
  ArrowUp,
  ArrowDown,
  Calculator,
  Loader2,
  Medal,
  TrendingUp,
  Award,
  Crown,
} from "lucide-react";
import leaderboardApi from "../services/leaderboardApi";

export default function Leaderboards() {
  const [rankBy, setRankBy] = useState("Overall College Rank");
  const [department, setDepartment] = useState("All");
  const [timeframe, setTimeframe] = useState("Academic Year 2024-25");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [rankBy, department]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await leaderboardApi.getLeaderboard(
        rankBy === "Department" ? "Departments" : "Students",
        department,
      );
      if (res?.success) {
        setData(res);
      }
    } catch (e) {
      console.error("Failed to load leaderboard:", e);
    } finally {
      setLoading(false);
    }
  };

  const topThree = data?.topThree || [];
  const topStudents = data?.topStudents || [];
  const formula = data?.formula || "Live normalized performance score";
  const personalRank = data?.myRanking?.individual?.rank;
  const departmentRank = data?.myRanking?.individual?.departmentRank;

  return (
    <div className="p-6 space-y-6 max-w-[1320px] mx-auto text-[#F5F5F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] lg:text-[32px] font-bold text-[#F5F5F5] tracking-tight leading-tight">
            Merit & Innovation Leaderboards
          </h1>
          <p className="text-[16px] text-[#A0A0A0] mt-1.5">
            Discover top performers, project contributors, and peer leaders
            based on verifiable milestones.
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#262626] border border-[#3A3A3A] rounded-[8px] text-[14px] text-[#A0A0A0] shrink-0">
          <Calendar className="w-4 h-4 text-[#777777]" />
          <span>{timeframe}</span>
        </div>
      </div>

      {/* Formula Transparency Banner */}
      <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[rgba(255,138,0,0.10)] border border-[rgba(255,138,0,0.30)] flex items-center justify-center text-[#FF8A00] shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="text-[14px] leading-relaxed">
            <span className="font-semibold text-[#F5F5F5]">
              Transparent Merit Formula:{" "}
            </span>
            <span className="text-[#A0A0A0] font-mono text-[13.5px]">
              {formula}
            </span>
          </div>
        </div>
        <span className="text-[13px] text-[#22C55E] font-semibold bg-[rgba(34,197,94,0.10)] px-3 py-1 rounded-full border border-[rgba(34,197,94,0.30)] whitespace-nowrap self-start sm:self-auto">
          Live MongoDB Aggregation
        </span>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-[#262626] border border-[#3A3A3A] rounded-[12px]">
        <div>
          <label className="block text-[14px] text-[#A0A0A0] mb-1.5 font-medium">
            Rank By
          </label>
          <select value={rankBy} onChange={(e) => setRankBy(e.target.value)} className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[15px] rounded-[8px] px-3.5 focus:outline-none focus:border-[#FF8A00]">
            <option>Department</option>
            <option>Overall College Rank</option>
          </select>
        </div>
        <div>
          <label className="block text-[14px] text-[#A0A0A0] mb-1.5 font-medium">
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[15px] rounded-[8px] px-3.5 focus:outline-none focus:border-[#FF8A00]"
          >
            <option value="All">All Departments</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Artificial Intelligence & Data Science">AI & DS (Artificial Intelligence & Data Science)</option>
            <option value="Electronics & Telecommunication Engineering">ENTC (Electronics & Telecommunication)</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#777777] bg-[#262626] border border-[#3A3A3A] rounded-[10px] flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#FF8A00] mb-2" />
          <span className="text-[16px] text-[#A0A0A0]">
            Calculating rankings from live contributions...
          </span>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {topThree.length > 0 && (() => {
            const rank1 = topThree.find((s) => s.rank === 1) || topThree[1] || topThree[0];
            const rank2 = topThree.find((s) => s.rank === 2) || topThree[0];
            const rank3 = topThree.find((s) => s.rank === 3) || topThree[2];

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-5 pb-2">
                {/* #2 Silver (Left) */}
                {rank2 && (
                  <div className="bg-[#262626] border border-[#3A3A3A] p-4 sm:p-5 rounded-[12px] flex flex-col items-center text-center relative order-2 md:order-1 hover:border-[#A8B0B8]/60 transition-all shadow-md">
                    <div className="w-8 h-8 rounded-full bg-[#A8B0B8] text-[#1A1A1A] font-black text-[14px] flex items-center justify-center mb-2.5 ring-2 ring-[#A8B0B8]/40 shadow-sm">
                      <Medal className="w-4 h-4" />
                    </div>
                    <div className="relative mb-2">
                      <img
                        src={rank2.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                        alt={rank2.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#A8B0B8] shadow"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-[#1A1A1A] border border-[#A8B0B8] text-[#A8B0B8] text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                        #2
                      </span>
                    </div>
                    <h3 className="text-[17px] font-bold text-[#F5F5F5] truncate max-w-full">
                      {rank2.name}
                    </h3>
                    <p className="text-[13px] text-[#A0A0A0] mt-0.5 truncate max-w-full">
                      {rank2.department}
                    </p>
                    <div className="mt-2 px-3 py-1 bg-[#1A1A1A] rounded-full border border-[#3A3A3A]">
                      <span className="text-[13px] text-[#A0A0A0] font-medium">Score: </span>
                      <span className="text-[#A8B0B8] font-bold text-[14px]">{rank2.score} pts</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center my-3 max-h-12 overflow-hidden">
                      {(rank2.skills || []).slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#1A1A1A] border border-[#3A3A3A] text-[12px] text-[#E0E0E0] rounded-[5px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-[#22C55E] font-semibold mt-auto pt-1">
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>{rank2.approvedTasks || 0} tasks approved</span>
                    </div>
                  </div>
                )}

                {/* #1 Gold (Center - Noticeably Larger, Elevated Podium Style) */}
                {rank1 && (
                  <div className="bg-gradient-to-b from-[#2e2316] via-[#262626] to-[#262626] border-2 border-[#FF8A00] p-6 sm:p-7 rounded-[14px] flex flex-col items-center text-center relative order-1 md:order-2 md:-translate-y-5 shadow-[0_0_30px_rgba(255,138,0,0.22)] ring-1 ring-[#FF8A00]/40 transition-transform">
                    {/* Crown & Badge */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF8A00] to-[#FFB020] text-[#1A1A1A] font-black text-[16px] flex items-center justify-center shadow-[0_0_15px_rgba(255,138,0,0.6)] ring-4 ring-[#1A1A1A]">
                        <Crown className="w-5 h-5 text-[#1A1A1A] fill-[#1A1A1A]" />
                      </div>
                    </div>

                    <div className="relative mt-2 mb-3">
                      <img
                        src={rank1.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
                        alt={rank1.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#FF8A00] shadow-[0_0_20px_rgba(255,138,0,0.35)]"
                      />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FF8A00] text-[#1A1A1A] text-[12px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Rank 1
                      </span>
                    </div>

                    <h3 className="text-[22px] sm:text-[24px] font-extrabold text-[#F5F5F5] tracking-tight mt-1">
                      {rank1.name}
                    </h3>
                    <p className="text-[14.5px] text-[#A0A0A0] mt-0.5">
                      {rank1.department}
                    </p>

                    <div className="mt-3 px-4 py-1.5 bg-[#1A1A1A] rounded-full border border-[#FF8A00]/50 shadow-inner">
                      <span className="text-[14px] text-[#A0A0A0] font-medium">Score: </span>
                      <span className="text-[#FF8A00] font-black text-[18px]">
                        {rank1.score} pts
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 justify-center my-4">
                      {(rank1.skills || []).slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[#1A1A1A] border border-[#FF8A00]/40 text-[13px] text-[#F5F5F5] rounded-[6px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-[15px] text-[#22C55E] font-bold mt-auto pt-1">
                      <ArrowUp className="w-4 h-4" />
                      <span>
                        {rank1.completedProjects || 0} projects completed
                      </span>
                    </div>
                  </div>
                )}

                {/* #3 Bronze (Right) */}
                {rank3 && (
                  <div className="bg-[#262626] border border-[#3A3A3A] p-4 sm:p-5 rounded-[12px] flex flex-col items-center text-center relative order-3 md:order-3 hover:border-[#CD7F32]/60 transition-all shadow-md">
                    <div className="w-8 h-8 rounded-full bg-[#CD7F32] text-[#F5F5F5] font-black text-[14px] flex items-center justify-center mb-2.5 ring-2 ring-[#CD7F32]/40 shadow-sm">
                      <Medal className="w-4 h-4" />
                    </div>
                    <div className="relative mb-2">
                      <img
                        src={rank3.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                        alt={rank3.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#CD7F32] shadow"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-[#1A1A1A] border border-[#CD7F32] text-[#CD7F32] text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                        #3
                      </span>
                    </div>
                    <h3 className="text-[17px] font-bold text-[#F5F5F5] truncate max-w-full">
                      {rank3.name}
                    </h3>
                    <p className="text-[13px] text-[#A0A0A0] mt-0.5 truncate max-w-full">
                      {rank3.department}
                    </p>
                    <div className="mt-2 px-3 py-1 bg-[#1A1A1A] rounded-full border border-[#3A3A3A]">
                      <span className="text-[13px] text-[#A0A0A0] font-medium">Score: </span>
                      <span className="text-[#CD7F32] font-bold text-[14px]">{rank3.score} pts</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center my-3 max-h-12 overflow-hidden">
                      {(rank3.skills || []).slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#1A1A1A] border border-[#3A3A3A] text-[12px] text-[#E0E0E0] rounded-[5px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-[#22C55E] font-semibold mt-auto pt-1">
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>CGPA: {rank3.cgpa}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Top Students Table */}
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] overflow-hidden">
            <div className="p-4.5 border-b border-[#3A3A3A] flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-[#F5F5F5]">
                Top Students Standings
              </h3>
              <span className="text-[14px] text-[#A0A0A0]">
                Showing 1–{topStudents.length} of{" "}
                {data?.totalStudents || topStudents.length} Students
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[15px]">
                <thead className="bg-[#1A1A1A] text-[#A0A0A0] border-b border-[#3A3A3A] text-[13px] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Year</th>
                    <th className="py-3.5 px-4">CGPA</th>
                    <th className="py-3.5 px-4">Tasks</th>
                    <th className="py-3.5 px-4">Projects</th>
                    <th className="py-3.5 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A3A3A]">
                  {topStudents.map((s) => (
                    <tr
                      key={s.id || s.rank}
                      className="hover:bg-[#2D2D2D] transition-colors h-[54px]"
                    >
                      <td className="py-3 px-4 text-center">
                        {s.rank === 1 ? (
                          <span className="inline-flex w-6 h-6 rounded-full bg-[#F59E0B] text-[#1A1A1A] font-extrabold text-[12px] items-center justify-center">
                            1
                          </span>
                        ) : s.rank === 2 ? (
                          <span className="inline-flex w-6 h-6 rounded-full bg-[#A8B0B8] text-[#1A1A1A] font-extrabold text-[12px] items-center justify-center">
                            2
                          </span>
                        ) : s.rank === 3 ? (
                          <span className="inline-flex w-6 h-6 rounded-full bg-[#CD7F32] text-[#F5F5F5] font-extrabold text-[12px] items-center justify-center">
                            3
                          </span>
                        ) : (
                          <span className="text-[#A0A0A0] font-semibold text-[14px]">
                            {s.rank}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatar}
                            alt={s.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#3A3A3A]"
                          />
                          <span className="font-semibold text-[#F5F5F5] text-[15px]">
                            {s.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#A0A0A0] text-[15px]">
                        {s.department}
                      </td>
                      <td className="py-3 px-4 text-[#777777] text-[14px]">
                        {s.year}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#F5F5F5] text-[15px]">
                        {s.cgpa}
                      </td>
                      <td className="py-3 px-4 text-[#A0A0A0] text-[15px]">
                        {s.approvedTasks ?? 0}
                      </td>
                      <td className="py-3 px-4 text-[#A0A0A0] text-[15px]">
                        {s.completedProjects ?? 0}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#FF8A00] text-[15px]">
                        {s.score} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <section className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-lg bg-[#FF8A00]/10 border border-[#FF8A00]/30 text-[#FF8A00] flex items-center justify-center"><Building2 className="w-5 h-5" /></div><div><h3 className="text-lg font-bold">Department Ranking</h3><p className="text-sm text-[#A0A0A0]">Most active departments, based on verified participation and project contribution.</p></div></div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {(data?.departmentRankings || []).map((item) => <div key={item.department} className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg p-4 flex items-center gap-3"><span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${item.rank === 1 ? 'bg-[#FF8A00] text-[#1A1A1A]' : 'bg-[#303030] text-[#F5F5F5]'}`}>#{item.rank}</span><div className="min-w-0 flex-1"><p className="font-semibold truncate">{item.department}</p><p className="text-xs text-[#A0A0A0] mt-1">{item.studentsActive} active students · {item.projects} projects</p></div><span className="text-sm font-bold text-[#FF8A00]">{item.activityScore}</span></div>)}
            </div>
          </section>

          {/* Your Rankings: Two-column cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#262626] border border-[#3A3A3A] p-5.5 rounded-[10px] flex items-center justify-between">
              <div>
                <span className="text-[14px] text-[#A0A0A0] uppercase tracking-wider font-semibold">
                  Your Rank (Individual)
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="text-[32px] font-extrabold text-[#FF8A00]">
                    {personalRank ? `#${personalRank}` : "—"}
                  </span>
                </div>
                <p className="text-[14px] text-[#777777] mt-1">
                  Department rank: {departmentRank ? `#${departmentRank}` : "—"}
                </p>
              </div>
              <div className="w-13 h-13 rounded-[8px] bg-[rgba(255,138,0,0.10)] border border-[rgba(255,138,0,0.30)] flex items-center justify-center text-[#FF8A00]">
                <Award className="w-7 h-7" />
              </div>
            </div>

            <div className="bg-[#262626] border border-[#3A3A3A] p-5.5 rounded-[10px] flex items-center justify-between">
              <div>
                <span className="text-[14px] text-[#A0A0A0] uppercase tracking-wider font-semibold">
                  Your Team Rank
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="text-[32px] font-extrabold text-[#FF8A00]">
                    {departmentRank ? `#${departmentRank}` : "—"}
                  </span>
                </div>
                <p className="text-[14px] text-[#777777] mt-1">
                  Live department ranking from MongoDB
                </p>
              </div>
              <div className="w-13 h-13 rounded-[8px] bg-[rgba(255,138,0,0.10)] border border-[rgba(255,138,0,0.30)] flex items-center justify-center text-[#FF8A00]">
                <TrendingUp className="w-7 h-7" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
