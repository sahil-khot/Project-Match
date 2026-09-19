import React from 'react';
import {
  BookOpen,
  FileCode,
  Download,
  ExternalLink,
  Code2,
  FolderGit2,
  Cpu,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function Resources() {
  const resourceCategories = [
    {
      title: 'Project Templates & Documentation',
      description: 'Official IEEE capstone synopsis format, SRS documentation templates, and design system guides.',
      items: [
        { name: 'Capstone Synopsis & Abstract Template (IEEE Format)', type: 'DOCX / LaTeX', size: '1.2 MB' },
        { name: 'Software Requirements Specification (SRS) Blueprint', type: 'PDF / Markdown', size: '850 KB' },
        { name: 'Project Pitch Deck Template (10-Slide Investor Standard)', type: 'PPTX / Figma', size: '4.5 MB' }
      ]
    },
    {
      title: 'Development Kits & Boilerplates',
      description: 'Production-ready starters for fast prototyping during hackathons.',
      items: [
        { name: 'Fullstack AI Starter (FastAPI + React 18 + Tailwind)', type: 'GitHub Repo', link: 'https://github.com' },
        { name: 'IoT Edge Telemetry Boilerplate (ESP32 / MQTT / Node.js)', type: 'GitHub Repo', link: 'https://github.com' },
        { name: 'Web3 Decentralized Identity Starter (Solidity / ethers.js)', type: 'GitHub Repo', link: 'https://github.com' }
      ]
    },
    {
      title: 'Academic & Hackathon Grants',
      description: 'National and institutional innovation funds available for vetted Project Match teams.',
      items: [
        { name: 'Smart India Hackathon (SIH) 2026 Problem Statements', type: 'Official Portal', link: 'https://sih.gov.in' },
        { name: 'PCCOE Innovation & Incubation Seed Grant (Up to ₹50,000)', type: 'Institutional PDF', size: '2.1 MB' },
        { name: 'AICTE Student Research Fellowship Guidelines', type: 'Govt Portal', link: 'https://aicte-india.org' }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1320px] mx-auto text-[#F5F5F5]">
      {/* Header */}
      <div>
        <h1 className="text-[28px] lg:text-[32px] font-bold text-[#F5F5F5] tracking-tight leading-tight">
          Resources & Toolkits
        </h1>
        <p className="text-[16px] text-[#A0A0A0] mt-1.5">
          Hand-picked documentation templates, boilerplate repositories, and grant guidelines to accelerate your projects.
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#262626] to-[#2D2D2D] border border-[#3A3A3A] rounded-[14px] p-6 sm:p-7 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#FF8A00]/10 border border-[#FF8A00]/30 flex items-center justify-center shrink-0"><BookOpen className="w-6 h-6 text-[#FF8A00]" /></div>
        <div><p className="text-xs font-bold text-[#FF8A00] uppercase tracking-wider">Resource hub</p><p className="text-[#D4D4D4] mt-1">Curated templates, starter kits and opportunities to move a project from idea to demo.</p></div>
      </div>

      {/* Categories */}
      <div className="space-y-7">
        {resourceCategories.map((cat, idx) => (
          <div key={idx} className="bg-[#262626] border border-[#3A3A3A] rounded-[14px] p-6 sm:p-7 space-y-6 shadow-card">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#FF8A00]/10 border border-[#FF8A00]/30 flex items-center justify-center shrink-0"><FolderGit2 className="w-5 h-5 text-[#FF8A00]" /></div>
              <div>
              <h2 className="text-[18px] font-bold text-[#F5F5F5] flex items-center gap-2.5">
                <FolderGit2 className="w-5 h-5 text-[#FF8A00]" />
                <span>{cat.title}</span>
              </h2>
              <p className="text-[15px] text-[#A0A0A0] mt-1">{cat.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {cat.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-[#1A1A1A] border border-[#3A3A3A] hover:border-[#FF8A00]/45 rounded-[12px] p-5 flex flex-col justify-between min-h-[190px] transition-all group"
                >
                  <div>
                    <h3 className="text-[16px] font-bold text-[#F5F5F5] group-hover:text-[#FF8A00] transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-[13.5px] text-[#777777] mt-1.5">{item.type} {item.size ? `· ${item.size}` : ''}</p>
                  </div>

                  <button className="mt-4 w-full h-[42px] rounded-[8px] bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] text-[#F5F5F5] text-[15px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    {item.link ? (
                      <>
                        <span>Open Link</span>
                        <ExternalLink className="w-4 h-4 text-[#FF8A00]" />
                      </>
                    ) : (
                      <>
                        <span>Download</span>
                        <Download className="w-4 h-4 text-[#FF8A00]" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
