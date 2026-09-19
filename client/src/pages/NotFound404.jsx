import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFound404() {
  const { user, role, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    if (user) {
      navigate(getRoleDashboardPath(role));
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-8 max-w-md w-full text-center space-y-5 relative shadow-xl z-10">
        {/* Compass Icon */}
        <div className="w-14 h-14 rounded-[10px] bg-[rgba(255,138,0,0.12)] border border-[rgba(255,138,0,0.30)] text-[#FF8A00] flex items-center justify-center mx-auto">
          <Compass className="w-7 h-7" />
        </div>

        {/* 404 badge & Title */}
        <div>
          <span className="text-[13px] font-mono font-bold tracking-widest uppercase px-3 py-1.5 rounded-[4px] bg-[rgba(255,138,0,0.12)] text-[#FF8A00] border border-[rgba(255,138,0,0.30)]">
            HTTP 404 · NOT FOUND
          </span>
          <h1 className="text-[26px] font-bold text-[#F5F5F5] tracking-tight mt-3">Page Not Found</h1>
          <p className="text-[15px] text-[#A0A0A0] mt-2 leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:flex-1 h-[44px] px-4 rounded-[8px] text-[15px] font-semibold bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <button
            onClick={handleBackToDashboard}
            className="w-full sm:flex-1 h-[44px] bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] rounded-[8px] text-[15px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>{user ? 'Dashboard' : 'Go to Login'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
