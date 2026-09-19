import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, FileText, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import notificationApi from '../services/notificationApi';

export default function Header({ onOpenOnboarding }) {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'PM';
    const parts = name.split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#1A1A1A] border-b border-[#3A3A3A] px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Search Bar */}
      <div className="relative w-full max-w-[460px]">
        <Search className="w-5 h-5 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={role === 'admin' ? "Search for users, projects, or anything..." : "Search for people, projects, or skills..."}
          className="w-full h-[44px] bg-[#262626] border border-[#3A3A3A] text-[#F5F5F5] text-[16px] rounded-[8px] pl-11 pr-16 focus:outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00]/20 transition-colors placeholder:text-[#777777]"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-2 py-0.5 rounded-[4px] border border-[#3A3A3A] bg-[#2D2D2D] text-[12px] text-[#A0A0A0] font-mono select-none">
          <span>Ctrl</span>
          <span>K</span>
        </div>
      </div>

      {/* Right Section: [notification] [avatar] [name] [role] [chevron] */}
      <div className="flex items-center gap-3.5">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-[42px] h-[42px] rounded-[8px] bg-[#262626] border border-[#3A3A3A] hover:border-[#FF8A00]/40 flex items-center justify-center text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF8A00] rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 bg-[#262626] border border-[#3A3A3A] rounded-[10px] shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-2.5 mb-2.5">
                <span className="text-[14px] font-semibold text-[#F5F5F5]">Notifications ({unreadCount} unread)</span>
                {unreadCount > 0 && (
                  <span
                    onClick={handleMarkAllRead}
                    className="text-[13px] text-[#FF8A00] hover:underline cursor-pointer"
                  >
                    Mark all as read
                  </span>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.read && handleMarkAsRead(n._id)}
                      className={`p-3 rounded-[8px] border text-[14px] cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-[#1A1A1A]/40 border-transparent text-[#A0A0A0]'
                          : 'bg-[#2D2D2D] border-[#3A3A3A] text-[#F5F5F5]'
                      }`}
                    >
                      <p className="font-semibold text-[15px]">{n.title}</p>
                      <p className="text-[13px] text-[#A0A0A0] mt-0.5">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[14px] text-[#777777] text-center py-4">No notifications yet</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Menu: [avatar] [name] [role] [chevron] */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-2.5 py-1.5 rounded-[8px] hover:bg-[#262626] border border-transparent hover:border-[#3A3A3A] transition-colors cursor-pointer"
          >
            {/* Avatar with role-based initials */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-[#3A3A3A]"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full border border-[#3A3A3A] flex items-center justify-center font-bold text-[14px] ${
                  role === 'principal'
                    ? 'bg-[#4C1D95] text-[#FFFFFF]'
                    : role === 'admin'
                    ? 'bg-[#78350F] text-[#FDE68A]'
                    : 'bg-[#2D2D2D] text-[#FF8A00]'
                }`}
              >
                {role === 'admin' ? 'SA' : getInitials(user?.name)}
              </div>
            )}

            {/* Name and Subtle Role Subtitle */}
            <div className="text-left hidden sm:block">
              <p className="text-[16px] font-semibold text-[#F5F5F5] leading-tight truncate max-w-[170px]">
                {role === 'admin' ? (user?.name || 'System Administrator') : (user?.name || 'Student')}
              </p>
              <p className="text-[13px] text-[#A0A0A0] capitalize leading-none mt-1">
                {role === 'admin' ? 'Admin' : (role || 'Student')}
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-[#777777]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#262626] border border-[#3A3A3A] rounded-[10px] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2.5 border-b border-[#3A3A3A] mb-1">
                <p className="text-[15px] font-semibold text-[#F5F5F5]">{user?.name}</p>
                <p className="text-[13px] text-[#A0A0A0] truncate">{user?.email}</p>
                <span className="inline-block mt-1.5 text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/30 capitalize">
                  {role}
                </span>
              </div>

              <div className="space-y-1 text-[14px]">
                <button
                  onClick={() => { setShowUserMenu(false); navigate(`/${role}/profile`); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#2D2D2D] transition-colors"
                >
                  <User className="w-4 h-4 text-[#A0A0A0]" />
                  <span>My Profile</span>
                </button>
                {onOpenOnboarding && (
                  <button
                    onClick={() => { setShowUserMenu(false); onOpenOnboarding(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#2D2D2D] transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#A0A0A0]" />
                    <span>Edit Academic Onboarding</span>
                  </button>
                )}
                <button
                  onClick={() => { setShowUserMenu(false); navigate(`/${role}/settings`); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#2D2D2D] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#A0A0A0]" />
                  <span>Settings</span>
                </button>
                <div className="border-t border-[#3A3A3A] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-[#EF4444]" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
