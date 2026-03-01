import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, LayoutGrid, User, LogOut, Upload, Search, 
  Plus, Trophy, Zap, GraduationCap, Download, Filter, X,
  MessageSquare, Shield, Menu, ChevronRight, FileText, Star, Award, 
  BarChart3, HomeIcon, Clock, Loader2, Sparkles 
} from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

import Profile from './Profile';
import Leaderboard from './Leaderboard';
import Forum from './Forum';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { username: 'Guest', points: 0, is_admin: false });
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [topUsers, setTopUsers] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ university: '', semester: '', course: '' });
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', university: '', course: '', semester: '', description: '', tags: '', file: null });

  const API_URL = "`${import.meta.env.VITE_API_URL}/resource/uploads/`";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('q', debouncedSearch);
      if (filters.university) params.append('university', filters.university);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.course) params.append('course', filters.course);

      const res = await api.get(`/resource/search?${params.toString()}`);
      setResources(res.data);

      const leaderRes = await api.get('/auth/leaderboard');
      setTopUsers(leaderRes.data.slice(0, 5));

      const profRes = await api.get(`/auth/profile?user_id=${user.id}`);
      setUser({ ...user, ...profRes.data });
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [debouncedSearch, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.title) return toast.error("All fields required");
    const load = toast.loading("Processing...");
    const formData = new FormData();
    Object.keys(uploadData).forEach(key => formData.append(key, uploadData[key]));
    formData.append('user_id', user.id);
    try {
      await api.post('/resource/upload', formData);
      toast.dismiss(load);
      toast.success("Uploaded! +50 XP");
      setShowUpload(false);
      fetchData();
    } catch (err) { toast.dismiss(load); toast.error("Upload failed"); }
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: HomeIcon },
    { id: 'library', label: 'Vault', icon: LayoutGrid },
    { id: 'community', label: 'Forum', icon: MessageSquare },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
    { id: 'profile', label: 'Account', icon: User },
  ];

  return (
    <div className="flex h-[100dvh] bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden relative">
      <Toaster position="top-right" />
      
      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-[#0B0F1A]/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0B0F1A] text-white z-[70] flex flex-col md:hidden"
            >
              {/* Sidebar Content (Same as Desktop) */}
              <SidebarContent setActiveTab={setActiveTab} activeTab={activeTab} setIsSidebarOpen={setIsSidebarOpen} user={user} API_URL={API_URL} navItems={navItems} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-[#0B0F1A] text-white flex-col shrink-0">
        <SidebarContent setActiveTab={setActiveTab} activeTab={activeTab} user={user} API_URL={API_URL} navItems={navItems} />
      </aside>

      {/* --- MAIN STAGE --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 z-50 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-xl text-slate-600 md:hidden">
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
                <h2 className="text-lg md:text-xl font-black tracking-tight text-slate-800 capitalize leading-none">
                    {activeTab}
                </h2>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 hidden sm:block">Campus: Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col text-right">
                <p className="text-xs font-black text-slate-800 leading-none">{user.username}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{user.points} XP Earned</p>
             </div>
             <button onClick={() => setActiveTab('profile')} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-600 overflow-hidden shadow-lg shadow-indigo-200 border-2 border-white transition-transform active:scale-90">
                {user.avatar ? <img src={`${API_URL}${user.avatar}`} className="w-full h-full object-cover" /> : <User className="text-white m-auto" />}
             </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC]">
          
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                
                {/* Left/Middle Content */}
                <div className="lg:col-span-8 space-y-8 md:space-y-12">
                   <header>
                      <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                        Hello, <span className="text-indigo-600">{user.username.split(' ')[0]}!</span>
                      </h1>
                      <p className="text-slate-400 font-bold mt-2 text-xs md:text-sm uppercase tracking-widest">Your engineering hub is up to date.</p>
                   </header>

                   <div className="relative rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 md:p-14 text-white overflow-hidden shadow-2xl shadow-indigo-100 group">
                      <div className="relative z-10 max-w-md">
                        <h2 className="text-4xl font-black mb-4 tracking-tighter leading-[0.9]">Master your <br/>curriculum.</h2>
                        <p className="text-indigo-100 mb-10 text-sm md:text-lg leading-relaxed font-medium">Generate AI summaries and quizzes from any PDF notes instantly.</p>
                        <button onClick={() => setActiveTab('library')} className="bg-white text-indigo-700 px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                            Open The Vault
                        </button>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>
                   </div>

                   <section className="space-y-6 pb-10">
                      <div className="flex justify-between items-center px-2">
                        <h3 className="font-black text-slate-800 text-xl tracking-tight">Recent Additions</h3>
                        <button onClick={() => setActiveTab('library')} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">See All</button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {resources.slice(0, 3).map((res) => (
                           <motion.div whileHover={{ scale: 1.01 }} key={res.id} onClick={() => navigate(`/study/${res.id}`)} className="flex items-center justify-between p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                   <FileText size={22} />
                                </div>
                                <div className="min-w-0">
                                   <h4 className="font-bold text-slate-800 text-sm md:text-base truncate">{res.title}</h4>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">{res.course}</p>
                                </div>
                              </div>
                              <ChevronRight className="text-slate-200" size={20} />
                           </motion.div>
                        ))}
                      </div>
                   </section>
                </div>

                {/* Right Stats (Responsive) */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/50">
                      <div className="flex justify-between items-center mb-8">
                         <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Achievements</h3>
                         <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase">Lv. {Math.floor(user.points/100)}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-10">
                         <div className="bg-[#F8FAFC] p-6 rounded-[2.2rem] text-center border border-slate-100">
                            <Star className="text-indigo-600 mx-auto mb-3" size={24} />
                            <p className="text-2xl font-black text-slate-800 leading-none">{user.points}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-3">Points</p>
                         </div>
                         <div className="bg-[#F8FAFC] p-6 rounded-[2.2rem] text-center border border-slate-100">
                            <Award className="text-emerald-500 mx-auto mb-3" size={24} />
                            <p className="text-2xl font-black text-slate-800 leading-none">02</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-3">Badges</p>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Top Performers</p>
                         <div className="space-y-5 px-2">
                            {topUsers.map(u => (
                               <div key={u.id} className="flex items-center gap-3">
                                  <span className={`text-[10px] font-black w-10 truncate ${u.id === user.id ? 'text-indigo-600':'text-slate-400'}`}>
                                    {u.id === user.id ? 'YOU' : u.username}
                                  </span>
                                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${(u.points/ (topUsers[0]?.points || 1)) * 100}%` }} className={`h-full ${u.id === user.id ? 'bg-indigo-600':'bg-slate-300'}`} />
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <button onClick={() => setShowUpload(true)} className="w-full p-6 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3">
                      <Plus size={18} /> Upload Notes
                   </button>
                </div>
              </div>
            </div>
          )}

          {/* LIBRARY VIEW */}
          {activeTab === 'library' && (
            <div className="flex flex-col h-full">
               <header className="bg-white p-6 md:p-10 border-b border-slate-100">
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-between">
                     <div className="relative w-full max-w-xl group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                          type="text" placeholder="Search the knowledge vault..." 
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-transparent focus:bg-white border focus:border-indigo-200 rounded-[2rem] text-sm font-black outline-none transition-all tracking-tight"
                          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                        />
                     </div>
                     <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={() => setShowFilters(!showFilters)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600'}`}>
                           <Filter size={14} /> Filters
                        </button>
                        <button onClick={() => setShowUpload(true)} className="flex-1 md:flex-none bg-slate-950 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-lg">
                           Upload
                        </button>
                     </div>
                  </div>

                  <AnimatePresence>
                    {showFilters && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden max-w-7xl mx-auto mt-6">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                            <input placeholder="UNIVERSITY" className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black outline-none focus:bg-white focus:border-indigo-400 uppercase tracking-widest transition-all" value={filters.university} onChange={e => setFilters({...filters, university: e.target.value})} />
                            <select className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black outline-none focus:bg-white focus:border-indigo-400 uppercase tracking-widest transition-all appearance-none" value={filters.semester} onChange={e => setFilters({...filters, semester: e.target.value})}>
                               <option value="">SEMESTER</option>
                               {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={`${n}th Sem`}>{n}TH SEM</option>)}
                            </select>
                            <input placeholder="COURSE" className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black outline-none focus:bg-white focus:border-indigo-400 uppercase tracking-widest transition-all" value={filters.course} onChange={e => setFilters({...filters, course: e.target.value})} />
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </header>

               <div className="p-4 md:p-10 max-w-7xl mx-auto pb-32">
                 {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                       <Loader2 className="animate-spin text-indigo-600" size={40} />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Vault Synchronizing</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                       {resources.map(res => (
                          <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key={res.id} className="group bg-white rounded-[2.8rem] border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 flex flex-col overflow-hidden">
                             <div className="h-3 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-100 transition-opacity duration-700"></div>
                             <div className="p-8 md:p-10 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-8">
                                   <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-100">{res.university}</span>
                                   <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-slate-100">{res.semester}</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 italic tracking-tighter">{res.title}</h3>
                                <p className="text-xs font-black text-slate-400 mb-10 flex items-center gap-2 uppercase tracking-widest"><Sparkles size={12} className="text-indigo-400" /> {res.course}</p>
                                <div className="grid grid-cols-3 gap-3 mt-auto border-t border-slate-50 pt-6">
                                   <button onClick={() => navigate(`/study/${res.id}`)} className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-indigo-600 hover:text-white p-4 rounded-[1.5rem] transition-all group/btn shadow-sm active:scale-90">
                                      <Zap size={20} className="group-hover/btn:fill-yellow-300 group-hover/btn:text-yellow-300 transition-all"/>
                                      <span className="text-[9px] font-black uppercase">Study</span>
                                   </button>
                                   <button onClick={() => navigate(`/quiz/${res.id}`)} className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-purple-600 hover:text-white p-4 rounded-[1.5rem] transition-all shadow-sm active:scale-90">
                                      <GraduationCap size={20}/>
                                      <span className="text-[9px] font-black uppercase">Quiz</span>
                                   </button>
                                   <button onClick={() => handleDownload(res.filename, res.title)} className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-emerald-600 hover:text-white p-4 rounded-[1.5rem] transition-all shadow-sm active:scale-90">
                                      <Download size={20}/>
                                      <span className="text-[9px] font-black uppercase">PDF</span>
                                   </button>
                                </div>
                             </div>
                          </motion.div>
                       ))}
                    </div>
                 )}
               </div>
            </div>
          )}

          {/* EMBEDDED VIEWS */}
          {activeTab === 'profile' && <div className="p-4 md:p-8"><Profile /></div>}
          {activeTab === 'leaderboard' && <div className="p-4 md:p-8"><Leaderboard /></div>}
          {activeTab === 'community' && <div className="p-0 md:p-8 h-full"><Forum isEmbedded={true} /></div>}

        </div>
      </main>

      {/* --- PREMIUM UPLOAD MODAL --- */}
      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 bg-[#0B0F1A]/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="bg-white rounded-[4rem] w-full max-w-2xl p-10 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden border border-white/20">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter text-slate-800 leading-none">Sync.</h2>
                        <p className="text-xs text-slate-400 font-black mt-4 uppercase tracking-[0.4em]">Global Resource Ingestion</p>
                    </div>
                    <button onClick={() => setShowUpload(false)} className="p-5 bg-slate-50 hover:bg-white rounded-[2rem] text-slate-400 shadow-sm transition-all active:scale-90"><X size={24}/></button>
                </div>
                <form onSubmit={handleUpload} className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                   <input placeholder="DOCUMENT HEADLINE" className="w-full bg-slate-100 border-transparent p-6 rounded-[2rem] font-black text-[11px] outline-none focus:bg-white border focus:border-indigo-400 uppercase tracking-widest transition-all" onChange={e => setUploadData({...uploadData, title: e.target.value})} required />
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input placeholder="UNIVERSITY" className="w-full bg-slate-100 border-transparent p-6 rounded-[2rem] font-black text-[11px] outline-none focus:bg-white border focus:border-indigo-400 uppercase tracking-widest transition-all" onChange={e => setUploadData({...uploadData, university: e.target.value})} required />
                      <input placeholder="COURSE / BRANCH" className="w-full bg-slate-100 border-transparent p-6 rounded-[2rem] font-black text-[11px] outline-none focus:bg-white border focus:border-indigo-400 uppercase tracking-widest transition-all" onChange={e => setUploadData({...uploadData, course: e.target.value})} required />
                   </div>
                   <div className="border-4 border-dashed border-indigo-100 rounded-[3rem] p-16 text-center bg-indigo-50/20 hover:border-indigo-400 transition-all cursor-pointer group relative">
                        <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setUploadData({...uploadData, file: e.target.files[0]})} required />
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform">
                            <Upload className="text-indigo-600" size={36} />
                        </div>
                        <p className="text-indigo-600 font-black text-[11px] uppercase tracking-widest">{uploadData.file ? uploadData.file.name : "Inject PDF Document"}</p>
                   </div>
                   <button type="submit" className="w-full py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-indigo-700 shadow-[0_20px_50px_rgba(79,70,229,0.4)] transition-all active:scale-95">Verify & Sync</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable Internal Sidebar Content for Mobile/Desktop parity
const SidebarContent = ({ setActiveTab, activeTab, setIsSidebarOpen, user, API_URL, navItems }) => (
    <>
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/50">
                <Book size={22} strokeWidth={2.5} />
            </div>
            <div>
               <h1 className="font-black text-xl tracking-tighter">EduHive</h1>
               <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest mt-1">Intelligence Lab</p>
            </div>
            {setIsSidebarOpen && <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto p-2 text-slate-500"><X size={20}/></button>}
        </div>

        <nav className="flex-1 p-6 space-y-3 mt-4 overflow-y-auto no-scrollbar">
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Nav Main</p>
            {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); if(setIsSidebarOpen) setIsSidebarOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all text-sm group ${
                    activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                    <item.icon size={20} strokeWidth={2.5} className={activeTab === item.id ? '' : 'group-hover:text-indigo-400'} /> 
                    {item.label}
                </button>
            ))}
        </nav>

        <div className="p-6 border-t border-white/5">
           
            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="flex items-center gap-3 text-slate-500 hover:text-white px-4 py-2 transition-colors w-full font-bold text-sm">
                <LogOut size={18} /> Sign Out
            </button>
        </div>
    </>
);

export default Dashboard;