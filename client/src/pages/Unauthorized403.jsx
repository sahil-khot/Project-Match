import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized403() {
  const { user, role, logout, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleGoDashboard = () => {
    navigate(getRoleDashboardPath(role));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-8 max-w-md w-full text-center space-y-5 relative shadow-xl z-10">
        {/* Shield Icon */}
        <div className="w-14 h-14 rounded-[10px] bg-red-500/10 border border-red-500/30 text-[#EF4444] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Status code & title */}
        <div>
          <span className="text-[13px] font-mono font-bold tracking-widest uppercase px-3 py-1.5 rounded-[4px] bg-red-500/10 text-[#EF4444] border border-red-500/30">
            HTTP 403 · FORBIDDEN
          </span>
          <h1 className="text-[26px] font-bold text-[#F5F5F5] tracking-tight mt-3">Access Denied</h1>
          <p className="text-[15px] text-[#A0A0A0] mt-2 leading-relaxed">
            You don't have permission to access this page. Your account role is{' '}
            <span className="font-semibold capitalize text-[#FF8A00]">
              {role || 'unauthenticated'}
            </span>
            , which does not have privileges for this console.
          </p>
        </div>

        {/* User Info chip if logged in */}
        {user && (
          <div className="p-3.5 bg-[#1A1A1A] rounded-[8px] border border-[#3A3A3A] text-left flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#262626] border border-[#3A3A3A] text-[#FF8A00] font-bold text-[14px] flex items-center justify-center">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'PM'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[#F5F5F5] truncate">{user.name}</p>
              <p className="text-[13.5px] text-[#A0A0A0] truncate">{user.email}</p>
            </div>
            <span className="text-[12.5px] font-mono capitalize px-2.5 py-1 rounded-[4px] bg-[#262626] text-[#FF8A00] border border-[#3A3A3A]">
              {role}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleGoDashboard}
            className="w-full h-[44px] bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] rounded-[8px] text-[15px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full h-[44px] rounded-[8px] text-[15px] font-semibold bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#777777]" />
            <span>Sign In with Different Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
