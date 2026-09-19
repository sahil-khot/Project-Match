import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while session is being verified to prevent UI flickering.
  // NEVER show 403 while authentication is still loading.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center space-y-3 select-none text-[#F5F5F5]">
        <div className="w-10 h-10 border-2 border-[#FF8A00] border-t-transparent rounded-full animate-spin" />
        <p className="text-[15px] text-[#A0A0A0] font-medium">Verifying Project Match security credentials...</p>
      </div>
    );
  }

  // If not authenticated, redirect to Login preserving origin path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize role comparison (case-insensitive & trimmed)
  const userRole = (role || user?.role || '').toLowerCase().trim();
  const normalizedAllowedRoles = allowedRoles.map((r) => String(r).toLowerCase().trim());

  // If role is genuinely not allowed for this route, redirect to 403 Access Denied
  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
