import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loginWithGoogle, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggingInRole, setLoggingInRole] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const getSafeRedirect = (userRole) => {
    const roleKey = String(userRole || '').toLowerCase().trim();
    const rolePrefix = `/${roleKey}`;
    if (from && typeof from === 'string' && from.startsWith(rolePrefix) && !from.includes('/unauthorized')) {
      return from;
    }
    return getRoleDashboardPath(roleKey);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password.trim());
      if (res.success) {
        // Redirect according to authenticated database role without cross-role hijack
        navigate(getSafeRedirect(res.role), { replace: true });
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-Click Quick Login
  const handleQuickLogin = async (demoEmail, demoPassword, roleKey) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoggingInRole(roleKey);
    setLoading(true);
    try {
      const res = await login(demoEmail, demoPassword);
      if (res.success) {
        navigate(getSafeRedirect(res.role), { replace: true });
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred during login. Please try again.');
    } finally {
      setLoading(false);
      setLoggingInRole(null);
    }
  };

  // Google OAuth Handler
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const googleEmail = window.prompt('Enter your Google email to test "Continue with Google":', 'google.student@example.com');
      if (!googleEmail) {
        setGoogleLoading(false);
        return;
      }

      const res = await loginWithGoogle({
        email: googleEmail,
        name: googleEmail.split('@')[0].replace('.', ' '),
        googleId: `google_${Date.now()}`
      });

      if (res.success) {
        navigate(getRoleDashboardPath(res.role), { replace: true });
      } else {
        setError(res.message || 'Google authentication failed.');
      }
    } catch (err) {
      setError('Google authentication encountered an error.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-[#FF8A00] selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center px-4">
        {/* Brand Logo & Taglines */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/logo.png" alt="Project Match Logo" className="w-12 h-12 object-contain rounded-[10px]" />
          <span className="text-[28px] font-bold tracking-tight text-[#F5F5F5]">Project Match</span>
        </div>

        <p className="text-[16px] font-semibold text-[#FF8A00]">
          Where Ideas Find the Right Team
        </p>
        <p className="text-[14px] text-[#A0A0A0] mt-1">
          Campus collaboration & innovation workspace
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-[#262626] py-8 px-6 sm:px-8 border border-[#3A3A3A] rounded-[12px] shadow-xl space-y-5">
          <div className="border-b border-[#3A3A3A] pb-4">
            <h2 className="text-[22px] font-bold text-[#F5F5F5]">Sign In to Your Account</h2>
            <p className="text-[14.5px] text-[#A0A0A0] mt-1">
              Enter your credentials to access your personalized role console.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-[8px] flex items-start gap-2.5 text-[14px] text-[#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[15px] font-semibold text-[#A0A0A0] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] pl-10 pr-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[15px] font-semibold text-[#A0A0A0]">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] pl-10 pr-10 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#F5F5F5] transition-colors cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[44px] bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] rounded-[8px] text-[16px] font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#3A3A3A] w-full" />
            <span className="bg-[#262626] px-3 text-[13px] text-[#777777] uppercase tracking-wider font-semibold">
              Or
            </span>
            <div className="border-t border-[#3A3A3A] w-full" />
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full h-[44px] rounded-[8px] bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] text-[15px] font-semibold text-[#F5F5F5] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'Connecting with Google...' : 'Continue with Google'}</span>
          </button>

          {/* Registration link */}
          <div className="pt-1 text-center text-[14.5px] text-[#A0A0A0]">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#FF8A00] hover:underline">
              Create a Student Account
            </Link>
          </div>
        </div>

        {/* Instant 1-Click Demo Logins */}
        <div className="mt-4 p-4 bg-[#262626] border border-[#3A3A3A] rounded-[10px] text-[13.5px] text-[#A0A0A0] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[#F5F5F5] font-semibold text-[14px]">
              <Sparkles className="w-4 h-4 text-[#FF8A00]" />
              <span>Instant 1-Click Logins</span>
            </span>
            <span className="text-[11px] text-[#FF8A00] font-medium bg-[#FF8A00]/10 px-2 py-0.5 rounded-full border border-[#FF8A00]/30">
              ⚡ Click to Login Instantly
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12.5px] pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('sahil@example.com', 'Student@123', 'student')}
              className="text-left p-2.5 rounded bg-[#1F1F1F] hover:bg-[#2A2A2A] hover:border-[#FF8A00]/50 border border-[#333] transition flex flex-col justify-between cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-[#FF8A00] group-hover:text-[#FFAE42] flex items-center gap-1.5">
                  🎓 Student
                </span>
                {loggingInRole === 'student' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF8A00]" />
                ) : (
                  <span className="text-[11px] text-[#888] group-hover:text-[#FF8A00]">Login →</span>
                )}
              </div>
              <span className="text-[#F5F5F5] font-mono text-[11px] mt-1">sahil@example.com</span>
              <span className="text-[#666] text-[10.5px]">Pass: Student@123</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('mentor@example.com', 'Mentor@123', 'mentor')}
              className="text-left p-2.5 rounded bg-[#1F1F1F] hover:bg-[#2A2A2A] hover:border-[#FF8A00]/50 border border-[#333] transition flex flex-col justify-between cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-[#FF8A00] group-hover:text-[#FFAE42] flex items-center gap-1.5">
                  👨‍🏫 Mentor
                </span>
                {loggingInRole === 'mentor' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF8A00]" />
                ) : (
                  <span className="text-[11px] text-[#888] group-hover:text-[#FF8A00]">Login →</span>
                )}
              </div>
              <span className="text-[#F5F5F5] font-mono text-[11px] mt-1">mentor@example.com</span>
              <span className="text-[#666] text-[10.5px]">Pass: Mentor@123</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('principal@example.com', 'Principal@123', 'principal')}
              className="text-left p-2.5 rounded bg-[#1F1F1F] hover:bg-[#2A2A2A] hover:border-[#FF8A00]/50 border border-[#333] transition flex flex-col justify-between cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-[#FF8A00] group-hover:text-[#FFAE42] flex items-center gap-1.5">
                  👔 Principal
                </span>
                {loggingInRole === 'principal' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF8A00]" />
                ) : (
                  <span className="text-[11px] text-[#888] group-hover:text-[#FF8A00]">Login →</span>
                )}
              </div>
              <span className="text-[#F5F5F5] font-mono text-[11px] mt-1">principal@example.com</span>
              <span className="text-[#666] text-[10.5px]">Pass: Principal@123</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@example.com', 'Admin@123', 'admin')}
              className="text-left p-2.5 rounded bg-[#1F1F1F] hover:bg-[#2A2A2A] hover:border-[#FF8A00]/50 border border-[#333] transition flex flex-col justify-between cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-[#FF8A00] group-hover:text-[#FFAE42] flex items-center gap-1.5">
                  ⚙️ Administrator
                </span>
                {loggingInRole === 'admin' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF8A00]" />
                ) : (
                  <span className="text-[11px] text-[#888] group-hover:text-[#FF8A00]">Login →</span>
                )}
              </div>
              <span className="text-[#F5F5F5] font-mono text-[11px] mt-1">admin@example.com</span>
              <span className="text-[#666] text-[10.5px]">Pass: Admin@123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
