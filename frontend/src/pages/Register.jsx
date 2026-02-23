import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight, CheckCircle, Shield } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout'; // <--- Integrated Layout

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const loading = toast.loading('Creating account...');
    try {
      await api.post('/auth/register', formData);
      toast.dismiss(loading);
      toast.success('OTP Sent to Email!');
      setStep(2);
    } catch (err) {
      toast.dismiss(loading);
      toast.error(err.response?.data?.error || 'Registration Failed');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const loading = toast.loading('Verifying...');
    try {
      await api.post('/auth/verify-otp', { email: formData.email, otp });
      toast.dismiss(loading);
      toast.success('Account Verified!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.dismiss(loading);
      toast.error('Invalid OTP');
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-center" />

        {/* --- MAIN CARD CONTAINER --- */}
        <div className="flex w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

          {/* --- LEFT SIDE: VISUALS --- */}
          <div className="hidden md:flex w-1/2 bg-indigo-600 relative items-center justify-center p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>

            <div className="relative z-10 text-white max-w-sm">
              <h2 className="text-4xl font-bold mb-6">Join the Future.</h2>
              <ul className="space-y-4 text-indigo-100">
                <li className="flex items-center gap-3"><CheckCircle className="text-green-400" size={20} /> AI Summaries & Quizzes</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-green-400" size={20} /> University Specific Notes</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-green-400" size={20} /> Peer-to-Peer Chat</li>
              </ul>
            </div>
          </div>

          {/* --- RIGHT SIDE: FORM --- */}
          <div className="w-full md:w-1/2 p-8 md:p-12">

            {/* Steps Indicator */}
            <div className="flex items-center gap-2 mb-8">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-1/3 bg-indigo-600' : 'w-full bg-green-500'}`}></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{step === 1 ? 'Step 1: Account' : 'Step 2: Verify'}</span>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
                  <p className="text-slate-500 mb-6 text-sm">Start your journey with EduHive today.</p>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="text" placeholder="johndoe" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" onChange={e => setFormData({ ...formData, username: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="email" placeholder="you@college.edu" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="new-password" // <--- ADD THIS
                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition transform active:scale-95 shadow-lg shadow-indigo-200 mt-2">
                      Continue <ArrowRight size={18} className="inline ml-1" />
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Check your Email</h3>
                  <p className="text-sm text-slate-500 mb-6">We sent a 6-digit code to <br /><b>{formData.email}</b></p>

                  <form onSubmit={handleVerify} className="space-y-6">
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="0 0 0 0 0 0"
                      className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                      onChange={e => setOtp(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition transform active:scale-95 shadow-lg shadow-green-200">
                      Verify & Dashboard
                    </button>
                  </form>
                  <button onClick={() => setStep(1)} className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline">Change Email</button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;