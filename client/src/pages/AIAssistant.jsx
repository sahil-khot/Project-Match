import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  BookOpen,
  Users,
  Compass,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import aiApi from "../services/aiApi";
import studentApi from "../services/studentApi";

export default function AIAssistant({ setActiveTab, onOpenOnboarding }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const storageKey = `pm_ai_chat_history_${user?._id || "default"}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(`pm_ai_chat_history_${user?._id || "default"}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load chat history from localStorage", e);
    }
    return [
      {
        id: 1,
        sender: "ai",
        text: `Hi ${user?.name || "there"}! I'm your Project Match AI assistant. I have live access to verified projects, active faculty mentors, and student skills across campus. I can recommend project ideas, skill gap analysis, teammate discovery, and task breakdowns. What would you like to explore today?`,
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.warn("Could not save chat history to localStorage", e);
    }
  }, [messages, storageKey]);

  const handleClearChat = () => {
    const fresh = [
      {
        id: Date.now(),
        sender: "ai",
        text: `Chat cleared! What would you like to explore or build next, ${user?.name ? user.name.split(" ")[0] : "there"}?`,
      },
    ];
    setMessages(fresh);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  };
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    studentApi
      .getProfile()
      .then((res) => {
        if (res?.success && res.profile) {
          setProfile(res.profile);
        }
      })
      .catch(() => {});
  }, []);

  const handleSend = async (userText) => {
    const query = userText || input;
    if (!query.trim()) return;
    setInput("");

    const userMessage = { id: Date.now(), sender: "user", text: query };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const validHistory = nextMessages
        .filter((m) => !m.isError && m.text)
        .slice(-6)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const res = await aiApi.chat(query, validHistory);
      if (res?.success) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: "ai", text: res.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            isError: true,
            text:
              res?.message ||
              "Unable to process your request at this moment. Please try again.",
          },
        ]);
      }
    } catch (e) {
      console.error("AI chat error:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          isError: true,
          text:
            e.message ||
            "AI service temporarily unavailable. Please verify your connection or try a different query.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    {
      title: "Find Teammates",
      desc: "Find teammates with React and Python skills for an AI project",
      icon: Users,
    },
    {
      title: "Find Faculty Mentors",
      desc: "Recommend faculty mentors specializing in Machine Learning and IoT",
      icon: Compass,
    },
    {
      title: "Brainstorm Projects",
      desc: "Generate 3 high-impact capstone project ideas for smart healthcare",
      icon: Sparkles,
    },
    {
      title: "Break Down Project Tasks",
      desc: "Create a sprint-by-sprint task breakdown for a web application project",
      icon: BookOpen,
    },
  ];

  const userInitials = (user?.name || "ME")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const renderAssistantText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeBlockContent = [];
    const elements = [];

    lines.forEach((line, index) => {
      // Toggle code block
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="bg-[#141414] border border-[#333333] rounded-[6px] p-3 text-[13px] font-mono text-[#E0E0E0] overflow-x-auto my-2"
            >
              <code>{codeBlockContent.join("\n")}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockContent = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Horizontal separator
      if (line.trim() === "---" || line.trim() === "***") {
        elements.push(
          <hr key={`hr-${index}`} className="border-[#3A3A3A] my-3" />
        );
        return;
      }

      // Headers
      if (line.startsWith("### ")) {
        elements.push(
          <h4 key={`h4-${index}`} className="text-[16px] font-bold text-[#FF8A00] mt-3 mb-1">
            {line.replace(/^###\s+/, "")}
          </h4>
        );
        return;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h3 key={`h3-${index}`} className="text-[17px] font-bold text-[#FFFFFF] mt-3 mb-1.5 border-b border-[#3A3A3A]/50 pb-1">
            {line.replace(/^##\s+/, "")}
          </h3>
        );
        return;
      }
      if (line.startsWith("# ")) {
        elements.push(
          <h2 key={`h2-${index}`} className="text-[19px] font-extrabold text-[#FFFFFF] mt-4 mb-2">
            {line.replace(/^#\s+/, "")}
          </h2>
        );
        return;
      }

      // List items
      const isList = /^[-*]\s+/.test(line);
      const isNumbered = /^\d+\.\s+/.test(line);
      let content = line;
      if (isList) content = line.replace(/^[-*]\s+/, "");
      if (isNumbered) content = line.replace(/^\d+\.\s+/, "");

      // Parse bold **text** and inline `code`
      const segments = content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      const rendered = segments.map((seg, sIdx) => {
        if (seg.startsWith("**") && seg.endsWith("**")) {
          return (
            <strong key={sIdx} className="text-[#FFFFFF] font-bold">
              {seg.slice(2, -2)}
            </strong>
          );
        }
        if (seg.startsWith("`") && seg.endsWith("`")) {
          return (
            <code key={sIdx} className="bg-[#1C1C1C] text-[#FF8A00] px-1.5 py-0.5 rounded text-[13px] font-mono border border-[#3A3A3A]">
              {seg.slice(1, -1)}
            </code>
          );
        }
        return seg;
      });

      elements.push(
        <div
          key={`line-${index}`}
          className={`${
            isList
              ? 'pl-4 before:content-["•"] before:text-[#FF8A00] before:mr-2.5'
              : isNumbered
              ? "pl-4"
              : ""
          } min-h-[1.4rem]`}
        >
          {isNumbered && (
            <span className="text-[#FF8A00] font-semibold mr-1.5">
              {line.match(/^\d+\./)?.[0]}
            </span>
          )}
          {rendered}
        </div>
      );
    });

    // Handle open code block if not closed
    if (inCodeBlock && codeBlockContent.length > 0) {
      elements.push(
        <pre
          key="code-unclosed"
          className="bg-[#141414] border border-[#333333] rounded-[6px] p-3 text-[13px] font-mono text-[#E0E0E0] overflow-x-auto my-2"
        >
          <code>{codeBlockContent.join("\n")}</code>
        </pre>
      );
    }

    return elements;
  };

  return (
    <div className="h-[calc(100vh-5rem)] p-6 max-w-[1360px] mx-auto flex gap-5 text-[#F5F5F5]">
      {/* Left Pane: Interactive Chat Interface */}
      <div className="flex-1 bg-[#262626] border border-[#3A3A3A] rounded-[10px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-[70px] px-6 border-b border-[#3A3A3A] flex items-center justify-between bg-[#262626]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[8px] bg-[rgba(255,138,0,0.12)] border border-[rgba(255,138,0,0.35)] flex items-center justify-center text-[#FF8A00]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#F5F5F5] flex items-center gap-2.5">
                <span>Project Match AI</span>
                <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[rgba(255,138,0,0.12)] text-[#FF8A00] border border-[rgba(255,138,0,0.30)] font-bold">
                  Beta
                </span>
              </h2>
              <p className="text-[14px] text-[#A0A0A0]">
                Grounded in real campus projects, mentors, and student profiles
              </p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#2D2D2D] hover:bg-[#333333] border border-[#3A3A3A] hover:border-[#FF8A00]/40 text-[#A0A0A0] hover:text-[#F5F5F5] text-[13px] font-medium transition-colors cursor-pointer"
            title="Clear and start new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#1A1A1A]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "ai" && (
                <div
                  className={`w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5 ${
                    m.isError
                      ? "bg-red-500/20 border border-red-500/30 text-red-400"
                      : "bg-[rgba(255,138,0,0.12)] border border-[rgba(255,138,0,0.35)] text-[#FF8A00]"
                  }`}
                >
                  {m.isError ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-[10px] text-[16px] space-y-1.5 leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#3D2510] border border-[rgba(255,138,0,0.35)] text-[#F5F5F5] rounded-tr-none"
                    : m.isError
                      ? "bg-red-500/10 text-red-300 border border-red-500/30 rounded-tl-none whitespace-pre-line"
                      : "bg-[#2D2D2D] text-[#F5F5F5] border border-[#3A3A3A] rounded-tl-none"
                }`}
              >
                {m.sender === "ai" ? renderAssistantText(m.text) : m.text}
              </div>

              {m.sender === "user" && (
                <div className="w-9 h-9 rounded-[8px] bg-[#262626] border border-[#3A3A3A] text-[#FF8A00] font-bold text-[14px] flex items-center justify-center shrink-0 mt-0.5">
                  {userInitials}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-[15px] text-[#A0A0A0]">
              <div className="w-8 h-8 rounded-[6px] bg-[rgba(255,138,0,0.15)] text-[#FF8A00] flex items-center justify-center animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span>
                Searching real campus records and formulating recommendations...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Floating Row */}
        <div className="p-3 bg-[#262626] border-t border-[#3A3A3A] flex gap-2.5 overflow-x-auto">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.desc)}
              className="h-[40px] px-3.5 rounded-[8px] bg-[#2D2D2D] border border-[#3A3A3A] hover:border-[#FF8A00]/40 text-[14px] text-[#A0A0A0] hover:text-[#F5F5F5] whitespace-nowrap transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <qp.icon className="w-4 h-4 text-[#FF8A00]" />
              <span>{qp.title}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="h-[70px] px-4 border-t border-[#3A3A3A] bg-[#262626] flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI: 'Find teammates for Web3 project' or 'Recommend faculty mentors'..."
            className="flex-1 h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] placeholder-[#777777] text-[16px] rounded-[8px] px-4 focus:outline-none focus:border-[#FF8A00] transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-[44px] px-5 bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] rounded-[8px] font-bold text-[16px] flex items-center justify-center gap-2 disabled:opacity-40 shrink-0 transition-colors shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Right Sidebar: Context and Tips Widgets */}
      <div className="w-[310px] space-y-4 shrink-0 hidden lg:block">
        {/* My Context */}
        <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#F5F5F5] uppercase tracking-wider">
              My Context
            </h3>
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="text-[13px] text-[#FF8A00] hover:underline font-semibold cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>
          <div className="space-y-2.5 text-[15px]">
            <div className="p-3 bg-[#1A1A1A] rounded-[8px] border border-[#3A3A3A]">
              <span className="text-[#777777] text-[13px] block font-medium mb-0.5">
                Branch & Year
              </span>
              <span className="font-semibold text-[#F5F5F5]">
                {profile?.department || user?.department || "Engineering"} ·{" "}
                {profile?.currentYear || "Undergraduate"}
              </span>
            </div>
            <div className="p-3 bg-[#1A1A1A] rounded-[8px] border border-[#3A3A3A]">
              <span className="text-[#777777] text-[13px] block font-medium mb-0.5">
                Key Skills
              </span>
              <span className="font-semibold text-[#F5F5F5]">
                {(profile?.skills || ["React", "Node.js", "Python"])
                  .slice(0, 4)
                  .join(", ")}
              </span>
            </div>
            <div className="p-3 bg-[#1A1A1A] rounded-[8px] border border-[#3A3A3A]">
              <span className="text-[#777777] text-[13px] block font-medium mb-0.5">
                College
              </span>
              <span className="font-semibold text-[#FF8A00] truncate block">
                {profile?.college || user?.college || "Campus Member"}
              </span>
            </div>
          </div>
        </div>

        {/* Grounding Transparency */}
        <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-[#22C55E]">
            <CheckCircle2 className="w-5 h-5" />
            <h4 className="text-[16px] font-bold text-[#F5F5F5]">
              Verified Grounding
            </h4>
          </div>
          <p className="text-[14px] text-[#A0A0A0] leading-relaxed">
            Queries live database collections for students, projects, and
            faculty mentors to prevent hallucinating users.
          </p>
        </div>

        {/* AI Tips */}
        <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-[#F59E0B]">
            <Lightbulb className="w-5 h-5" />
            <h4 className="text-[16px] font-bold text-[#F5F5F5]">
              Prompting Tips
            </h4>
          </div>
          <p className="text-[14px] text-[#A0A0A0] leading-relaxed">
            Mention the specific technology or branch you are interested in
            (e.g., "Recommend projects using Flutter and Firebase").
          </p>
        </div>
      </div>
    </div>
  );
}
