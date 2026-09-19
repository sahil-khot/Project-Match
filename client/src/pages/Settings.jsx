import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  User,
  Shield,
  Moon,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [teamInvites, setTeamInvites] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-[850px] mx-auto text-[#F5F5F5]">
      {/* Header */}
      <div>
        <h1 className="text-[28px] lg:text-[32px] font-bold text-[#F5F5F5] tracking-tight leading-tight">
          Account & Preferences
        </h1>
        <p className="text-[16px] text-[#A0A0A0] mt-1.5">
          Manage your notifications, privacy visibility, and account credentials.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account Details */}
        <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] p-6 space-y-4">
          <h2 className="text-[18px] font-bold text-[#F5F5F5] flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#FF8A00]" />
            <span>Profile Credentials</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[15px]">
            <div>
              <label className="block text-[#A0A0A0] mb-1.5 font-medium">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || 'Sahil Khot'}
                className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[#A0A0A0] cursor-not-allowed text-[16px]"
              />
            </div>
            <div>
              <label className="block text-[#A0A0A0] mb-1.5 font-medium">Institutional Email</label>
              <input
                type="email"
                disabled
                value={user?.email || 'sahil@example.com'}
                className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[#A0A0A0] cursor-not-allowed text-[16px]"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] p-6 space-y-4">
          <h2 className="text-[18px] font-bold text-[#F5F5F5] flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#FF8A00]" />
            <span>Notification Preferences</span>
          </h2>

          <div className="space-y-3.5">
            <label className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-[8px] border border-[#3A3A3A] cursor-pointer hover:border-[#FF8A00]/40 transition-colors">
              <div>
                <p className="font-semibold text-[#F5F5F5] text-[16px]">Email Alerts for Team Invitations</p>
                <p className="text-[14px] text-[#A0A0A0] mt-0.5">Receive an email whenever someone invites you to join a project.</p>
              </div>
              <input
                type="checkbox"
                checked={teamInvites}
                onChange={(e) => setTeamInvites(e.target.checked)}
                className="w-5 h-5 accent-[#FF8A00]"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-[8px] border border-[#3A3A3A] cursor-pointer hover:border-[#FF8A00]/40 transition-colors">
              <div>
                <p className="font-semibold text-[#F5F5F5] text-[16px]">Mentor Task Feedback</p>
                <p className="text-[14px] text-[#A0A0A0] mt-0.5">Receive instant alerts when a mentor reviews or approves your submitted tasks.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#FF8A00]"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-[15px] text-[#22C55E] flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5" /> Preferences saved successfully!
            </span>
          ) : <span />}

          <button
            type="submit"
            className="h-[44px] px-6 bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] rounded-[8px] text-[16px] font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
