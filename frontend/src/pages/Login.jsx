import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Mail, Lock, ArrowRight, BookOpen, LogIn, 
  ArrowLeft, AlertCircle, KeyRound, Check, Hash 
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

const Login = () => {
  const navigate = useNavigate();
  
  // States
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP Flow States
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  // --- 1. LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadToast = toast.loading('Logging in...');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.dismiss(loadToast);
      toast.success(`Welcome back!`);
      
      setTimeout(() => {
        if (res.data.user.is_admin) navigate('/admin');
        else navigate('/dashboard');
      }, 1000);
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err.response?.data?.error || 'Connection Refused: Check Backend');
    } finally {
      setLoading(false);
    }
  };

  // --- 2. SEND OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadToast = toast.loading('Sending OTP...');
    try {
      await api.post('/auth/forgot-password', { email });
      toast.dismiss(loadToast);
      toast.success("OTP sent to your email!");
      setView('otp'); // Switch to OTP input view
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error("Failed to send OTP. Check email or backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. VERIFY OTP & RESET ---
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadToast = toast.loading('Reseting Password...');
    try {
      // We send Email + OTP + New Password together
      await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
      toast.dismiss(loadToast);
      toast.success("Password Changed! Please Login.");
      setTimeout(() => {
        setView('login');
        setPassword('');
        setOtp('');
        setNewPassword('');
      }, 2000);
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err.response?.data?.error || "Invalid OTP or Expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-center" />

        <div className="flex w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
          
          {/* Dynamic Top Border */}
          <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-500 z-20 ${view === 'otp' ? 'bg-orange-500' : 'bg-indigo-600'}`}></div>

          {/* LEFT SIDE (Visuals) */}
          <div className="hidden md:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[80px]"></div>
            <div className="relative z-10 text-white max-w-sm">
              <div className="mb-6 w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <BookOpen size={24} />
              </div>
              <h2 className="text-4xl font-bold mb-4">Welcome Back.</h2>
              <p className="text-slate-300 mb-8 leading-relaxed">Connect with thousands of engineering students and access AI-powered resources.</p>
            </div>
          </div>

          {/* RIGHT SIDE (Forms) */}
          <div className="w-full md:w-1/2 p-8 md:p-12 relative">
            <AnimatePresence mode='wait'>

              {/* === VIEW 1: LOGIN === */}
              {view === 'login' && (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
                  </div>
                  <p className="text-slate-500 mb-8 text-sm">Enter your college email to access your dashboard.</p>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="email" placeholder="student@college.edu" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="password" placeholder="••••••••" autoComplete="current-password" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot password?</button>
                    </div>

                    <button disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                      {loading ? "Signing in..." : <>Sign In <ArrowRight size={18} /></>}
                    </button>
                  </form>
                  <p className="mt-8 text-center text-sm text-slate-500">Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Create free account</Link></p>
                </motion.div>
              )}

              {/* === VIEW 2: FORGOT (SEND OTP) === */}
              {view === 'forgot' && (
                <motion.div 
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4"><AlertCircle size={24} /></div>
                    <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
                    <p className="text-slate-500 text-sm mt-1">We will send a 6-digit OTP to your email.</p>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="email" placeholder="student@college.edu" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
                      </div>
                    </div>
                    <button disabled={loading} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </form>
                  <button onClick={() => setView('login')} className="w-full mt-6 text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2"><ArrowLeft size={16}/> Back to Login</button>
                </motion.div>
              )}

              {/* === VIEW 3: OTP VERIFICATION === */}
              {view === 'otp' && (
                <motion.div 
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4"><KeyRound size={24} /></div>
                    <h2 className="text-2xl font-bold text-slate-900">Enter OTP & New Password</h2>
                    <p className="text-slate-500 text-sm mt-1">Check your email: <b>{email}</b></p>
                  </div>

                  <form onSubmit={handleReset} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">6-Digit OTP</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="text" placeholder="123456" maxLength="6" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-mono text-lg tracking-widest" value={otp} onChange={e => setOtp(e.target.value)} required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                      </div>
                    </div>

                    <button disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-200">
                      {loading ? "Updating..." : <><Check size={18}/> Reset Password</>}
                    </button>
                  </form>
                  <button onClick={() => setView('forgot')} className="w-full mt-6 text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2"><ArrowLeft size={16}/> Resend OTP</button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;