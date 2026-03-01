import { useState, useEffect } from 'react';
import { 
  Trophy, Crown, Medal, Star, Zap, Shield, 
  Info, Upload, MessageSquare, ChevronRight, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/auth/leaderboard');
        const studentsOnly = res.data.filter(user => !user.is_admin && user.username !== 'Super Admin');
        setLeaders(studentsOnly);
      } catch (err) {
        console.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getAvatar = (user) => 
    user.avatar ? `${import.meta.env.VITE_API_URL}/resource/file/${user.avatar}` : null;

  const getTheme = (points) => {
    if (points >= 1000) return {
        card: "bg-slate-900 border-purple-500/40 shadow-xl shadow-purple-500/10 text-white",
        text: "text-purple-300", highlight: "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400", 
        badge: "bg-purple-600 text-white", icon: <Crown size={12} fill="currentColor" />, label: "LEGEND"
    };
    if (points >= 500) return {
        card: "bg-white border-blue-100 shadow-sm text-slate-800",
        text: "text-slate-500", highlight: "text-blue-600", 
        badge: "bg-blue-500 text-white", icon: <Zap size={12} fill="currentColor" />, label: "PRO"
    };
    if (points >= 100) return {
        card: "bg-white border-orange-100 shadow-sm text-slate-800",
        text: "text-slate-500", highlight: "text-orange-600", 
        badge: "bg-orange-500 text-white", icon: <Star size={12} fill="currentColor" />, label: "RISING"
    };
    return {
        card: "bg-white border-slate-100 text-slate-800",
        text: "text-slate-400", highlight: "text-slate-600", 
        badge: "bg-slate-100 text-slate-500", icon: <Shield size={12} />, label: "ROOKIE"
    };
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-3 sm:px-6 font-sans overflow-x-hidden">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-6">
            <div className="space-y-1">
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  className="text-2xl sm:text-4xl font-black flex items-center gap-3 text-slate-900 tracking-tight"
                >
                    <Trophy className="text-yellow-500 shrink-0" size={32} fill="currentColor" /> 
                    Hall of Fame
                </motion.h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">Climb the ranks and become a Legend.</p>
            </div>
            
            <button 
                onClick={() => setShowInfo(!showInfo)} 
                className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl text-[11px] sm:text-sm font-black text-slate-700 hover:border-indigo-300 transition-all shadow-sm active:scale-95"
            >
                <Info size={16} className="text-indigo-500"/> 
                {showInfo ? "Close Rules" : "How to Rank?"}
            </button>
        </div>

        {/* INFO BOX (Responsive Grid) */}
        <AnimatePresence>
            {showInfo && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-10"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-5 rounded-[1.5rem] text-white">
                            <h3 className="font-black text-sm mb-3 flex items-center gap-2"><Zap size={16}/> XP Protocol</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center bg-white/10 p-2.5 rounded-xl border border-white/10">
                                    <span className="text-[11px] font-bold">Document Upload</span>
                                    <span className="font-black text-yellow-300">+50 XP</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/10 p-2.5 rounded-xl border border-white/10">
                                    <span className="text-[11px] font-bold">Best Answer</span>
                                    <span className="font-black text-yellow-300">+20 XP</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-[1.5rem] shadow-sm">
                            <h3 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-2 text-indigo-600"><Star size={16}/> Tiers</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['Rookie (0)', 'Rising (100)', 'Pro (500)', 'Legend (1k)'].map(t => (
                                    <div key={t} className="p-2 bg-slate-50 rounded-lg text-[10px] font-black text-slate-500 border border-slate-100 text-center uppercase tracking-tighter">{t}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Syncing Rankings</p>
            </div>
        ) : (
            <>
              {/* --- PODIUM (Responsive) --- */}
              {leaders.length > 0 && (
                <div className="flex justify-center items-end gap-1.5 sm:gap-6 md:gap-10 mb-12 h-64 sm:h-80 mt-6 relative px-2">
                  {/* 2nd Place */}
                  {leaders[1] && (
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center w-24 sm:w-32">
                          <div className="relative mb-3">
                              <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl border-[3px] border-slate-300 overflow-hidden shadow-xl bg-white rotate-[-3deg]">
                                {getAvatar(leaders[1]) ? <img src={getAvatar(leaders[1])} className="w-full h-full object-cover" alt="2nd"/> : <div className="w-full h-full bg-slate-100 flex items-center justify-center font-black text-slate-400">{leaders[1].username[0]}</div>}
                              </div>
                              <div className="absolute -bottom-1.5 -right-1.5 bg-slate-300 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-md border-2 border-white">2</div>
                          </div>
                          <p className="font-black text-slate-800 text-[10px] sm:text-xs truncate w-full text-center">{leaders[1].username}</p>
                          <div className="text-[10px] font-black text-indigo-500">{leaders[1].points} XP</div>
                      </motion.div>
                  )}

                  {/* 1st Place */}
                  {leaders[0] && (
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center z-10 w-28 sm:w-36 md:w-44 scale-105 sm:scale-110">
                          <Crown className="text-yellow-400 mb-1 drop-shadow-md" size={32} fill="currentColor"/>
                          <div className="relative mb-4">
                              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[2rem] border-[4px] border-yellow-400 overflow-hidden shadow-2xl bg-white relative z-10">
                                {getAvatar(leaders[0]) ? <img src={getAvatar(leaders[0])} className="w-full h-full object-cover" alt="1st"/> : <div className="w-full h-full bg-yellow-50 flex items-center justify-center font-black text-yellow-600 text-2xl">{leaders[0].username[0]}</div>}
                              </div>
                              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-xl border-[3px] border-white z-20">1</div>
                              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-10 -z-10 animate-pulse"></div>
                          </div>
                          <p className="font-black text-slate-900 text-xs sm:text-sm md:text-base truncate w-full text-center mb-0.5">{leaders[0].username}</p>
                          <div className="px-3 py-1 bg-yellow-400 text-white rounded-full text-[10px] font-black shadow-lg">{leaders[0].points} XP</div>
                      </motion.div>
                  )}

                  {/* 3rd Place */}
                  {leaders[2] && (
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center w-24 sm:w-32">
                          <div className="relative mb-3">
                              <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl border-[3px] border-orange-300 overflow-hidden shadow-xl bg-white rotate-[3deg]">
                                {getAvatar(leaders[2]) ? <img src={getAvatar(leaders[2])} className="w-full h-full object-cover" alt="3rd"/> : <div className="w-full h-full bg-slate-100 flex items-center justify-center font-black text-slate-400">{leaders[2].username[0]}</div>}
                              </div>
                              <div className="absolute -bottom-1.5 -right-1.5 bg-orange-300 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-md border-2 border-white">3</div>
                          </div>
                          <p className="font-black text-slate-800 text-[10px] sm:text-xs truncate w-full text-center">{leaders[2].username}</p>
                          <div className="text-[10px] font-black text-indigo-500">{leaders[2].points} XP</div>
                      </motion.div>
                  )}
                </div>
              )}

              {/* LIST VIEW */}
              <div className="space-y-3 sm:space-y-4">
                {leaders.slice(3).map((user, index) => {
                   const theme = getTheme(user.points);
                   return (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.03 }}
                       key={user.id} 
                       className={`group flex items-center justify-between p-3.5 sm:p-5 rounded-2xl sm:rounded-[2rem] border transition-all duration-300 hover:shadow-lg ${theme.card}`}
                     >
                        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                            <span className={`font-black w-6 text-center text-sm sm:text-lg ${theme.text} opacity-40 group-hover:opacity-100 transition-opacity`}>
                                {index + 4}
                            </span>
                            
                            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-slate-100 overflow-hidden border-2 border-white/10 shrink-0">
                               {getAvatar(user) ? <img src={getAvatar(user)} className="w-full h-full object-cover" alt="avatar"/> : <div className="w-full h-full flex items-center justify-center font-black opacity-30 text-xs sm:text-base">{user.username[0]}</div>}
                            </div>
                            
                            <div className="min-w-0">
                                <p className="font-black text-sm sm:text-lg leading-none mb-1.5 truncate">{user.username}</p>
                                <div className={`text-[9px] font-black px-2 py-0.5 rounded-lg inline-flex items-center gap-1.5 ${theme.badge} uppercase tracking-widest`}>
                                    {theme.icon} {theme.label}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-3 ml-2 shrink-0">
                            <div className="text-right">
                                <span className={`font-black text-base sm:text-2xl ${theme.highlight}`}>{user.points}</span>
                                <span className="text-[8px] sm:text-[10px] font-black ml-1 uppercase opacity-40">XP</span>
                            </div>
                            <ChevronRight className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" size={18} />
                        </div>
                     </motion.div>
                   );
                })}

                {leaders.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                        <Trophy size={48} className="text-slate-100 mb-4" />
                        <h3 className="text-lg font-black text-slate-800">No Champions Yet</h3>
                        <p className="text-slate-400 text-xs mt-1">Be the first to upload and claim the #1 spot!</p>
                    </div>
                )}
              </div>
            </>
        )}
    </div>
  );
};

export default Leaderboard;