import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, TrendingUp, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import recommendApi from '../services/recommendApi';

/**
 * SkillGapCard — Reusable component showing skill match/mismatch between student and project.
 * Props:
 *   projectId: string — MongoDB project ID (optional, if set will fetch from API)
 *   requiredSkills: string[] — project required skills (optional, if provided avoids extra fetch)
 *   compact: bool — if true, shows minimal chip view
 */
export default function SkillGapCard({ projectId, requiredSkills = [], compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (projectId || requiredSkills.length > 0) {
      fetchGap();
    }
  }, [projectId, requiredSkills.join(',')]);

  const fetchGap = async () => {
    setLoading(true);
    try {
      const res = await recommendApi.getSkillGap({ projectId, requiredSkills });
      if (res.success) setData(res);
    } catch (e) {}
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-[13px] text-[#A0A0A0] ${compact ? '' : 'mt-3'}`}>
        <div className="w-4 h-4 border-2 border-[#FF8A00]/40 border-t-[#FF8A00] rounded-full animate-spin" />
        Analyzing skill fit...
      </div>
    );
  }

  if (!data || (!data.matched?.length && !data.missing?.length)) return null;

  const matchPercent = data.matchPercent ?? 0;
  const matchColor = matchPercent >= 75 ? '#22C55E' : matchPercent >= 50 ? '#FF8A00' : '#EF4444';

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <span
          className="text-[12px] font-bold px-2.5 py-0.5 rounded-full border"
          style={{ color: matchColor, borderColor: matchColor + '40', backgroundColor: matchColor + '12' }}
        >
          {matchPercent}% skill match
        </span>
        {data.matched?.slice(0, 2).map(s => (
          <span key={s} className="flex items-center gap-1 text-[11px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full border border-[#22C55E]/25">
            <CheckCircle2 className="w-3 h-3" /> {s}
          </span>
        ))}
        {data.missing?.slice(0, 2).map(s => (
          <span key={s} className="flex items-center gap-1 text-[11px] text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full border border-[#EF4444]/25">
            <XCircle className="w-3 h-3" /> {s}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-[10px] p-4 mt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#FF8A00]" />
          <span className="text-[14px] font-bold text-[#F5F5F5]">Your Skill Fit</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[13px] text-[#A0A0A0] hover:text-[#F5F5F5] flex items-center gap-1 transition-colors"
        >
          {expanded ? 'Less' : 'Details'}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[#A0A0A0]">{data.matched?.length}/{data.requiredSkills?.length || 0} required skills</span>
          <span className="font-bold" style={{ color: matchColor }}>{matchPercent}% match</span>
        </div>
        <div className="w-full bg-[#2D2D2D] rounded-full h-2.5 border border-[#3A3A3A]">
          <div
            className="h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${matchPercent}%`, backgroundColor: matchColor }}
          />
        </div>
      </div>

      {/* Skill Chips */}
      <div className="flex flex-wrap gap-2">
        {data.matched?.slice(0, expanded ? undefined : 4).map(skill => (
          <span key={skill} className="flex items-center gap-1.5 text-[12px] text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/25 px-2.5 py-1 rounded-full font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> {skill}
          </span>
        ))}
        {data.missing?.slice(0, expanded ? undefined : 4).map(skill => (
          <span key={skill} className="flex items-center gap-1.5 text-[12px] text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/25 px-2.5 py-1 rounded-full font-medium">
            <XCircle className="w-3.5 h-3.5 flex-shrink-0" /> {skill}
          </span>
        ))}
      </div>

      {/* Learning Resources (expanded only) */}
      {expanded && data.resourceSuggestions?.length > 0 && (
        <div className="border-t border-[#3A3A3A] pt-3 space-y-2">
          <div className="flex items-center gap-2 text-[13px] text-[#A0A0A0] font-semibold">
            <BookOpen className="w-4 h-4 text-[#8B5CF6]" />
            Skills to learn
          </div>
          {data.resourceSuggestions.map(({ skill, resources }) => (
            <div key={skill} className="flex items-start gap-2.5">
              <span className="text-[12px] font-semibold text-[#F5F5F5] min-w-[100px]">{skill}</span>
              <div className="flex flex-wrap gap-1.5">
                {resources.map(r => (
                  <span key={r} className="text-[11px] text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 px-2 py-0.5 rounded-md">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
