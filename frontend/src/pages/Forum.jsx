import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, ThumbsUp, Plus, ArrowLeft, Send, 
  CheckCircle, Search, Clock, User as UserIcon, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const Forum = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [questions, setQuestions] = useState([]);
  const [selectedQ, setSelectedQ] = useState(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Forms
  const [askForm, setAskForm] = useState({ title: '', content: '' });
  const [replyContent, setReplyContent] = useState('');

  // --- FETCH QUESTIONS ---
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/forum/list');
      setQuestions(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchDetails = async (id) => {
    try {
      const res = await api.get(`/forum/${id}`);
      setSelectedQ(res.data);
    } catch (err) { console.error(err); }
  };

  // --- CLIENT SIDE FILTER ---
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questions, searchQuery]);

  // --- ACTIONS ---
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!askForm.title || !askForm.content) return;
    try {
      await api.post('/forum/create', { ...askForm, user_id: user.id });
      toast.success("Question posted!");
      setShowAskModal(false);
      setAskForm({ title: '', content: '' });
      fetchQuestions();
    } catch (err) { toast.error("Failed to post"); }
  };

  const handleReply = async () => {
    if (!replyContent) return;
    try {
      await api.post('/forum/answer', {
        content: replyContent,
        user_id: user.id,
        question_id: selectedQ.id
      });
      toast.success("Answer posted (+20 XP)");
      setReplyContent('');
      fetchDetails(selectedQ.id); 
    } catch (err) { toast.error("Failed to reply"); }
  };

  const handleUpvote = async (answerId) => {
    try {
      await api.post(`/forum/upvote/${answerId}`);
      fetchDetails(selectedQ.id); 
    } catch (err) { toast.error("Failed"); }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden md:p-4">
      <Toaster position="top-center" />

      {/* --- WRAPPER FOR RESPONSIVE SPLIT --- */}
      <div className="flex w-full h-full bg-white md:rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* LEFT: QUESTION LIST */}
        <div className={`
          flex flex-col border-r border-slate-100 bg-white
          ${selectedQ ? 'hidden md:flex md:w-[380px] lg:w-[450px]' : 'w-full md:w-[380px] lg:w-[450px]'}
        `}>
          
          <div className="p-6 border-b border-slate-50 shrink-0">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                   <div className="p-2 bg-indigo-600 rounded-xl text-white">
                      <MessageSquare size={20} />
                   </div>
                   Discussions
                </h1>
                <button 
                  onClick={() => setShowAskModal(true)} 
                  className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                  <Plus size={20}/>
                </button>
             </div>

             {/* SEARCH BAR */}
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition" size={18} />
                <input 
                  type="text" 
                  placeholder="Search discussions..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white border focus:border-indigo-200 rounded-2xl text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-indigo-50/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
             {filteredQuestions.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <Search className="text-slate-300" size={32} />
                   </div>
                   <p className="text-slate-400 font-bold text-sm">No discussions found</p>
                </div>
             ) : (
                filteredQuestions.map(q => (
                  <motion.div 
                    layout
                    key={q.id} 
                    onClick={() => fetchDetails(q.id)}
                    className={`p-5 border-b border-slate-50 cursor-pointer transition-all relative group
                      ${selectedQ?.id === q.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}
                    `}
                  >
                    {selectedQ?.id === q.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full" />}
                    
                    <h3 className={`font-bold text-sm mb-1 line-clamp-1 transition-colors ${selectedQ?.id === q.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {q.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{q.content}</p>
                    
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-sm">
                            {q.author ? q.author.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{q.author}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                             <MessageSquare size={12}/> {q.answer_count}
                          </div>
                          <ChevronRight size={14} className={`transition-transform ${selectedQ?.id === q.id ? 'translate-x-1 text-indigo-600' : 'text-slate-300 group-hover:translate-x-1'}`} />
                       </div>
                    </div>
                  </motion.div>
                ))
             )}
          </div>
        </div>

        {/* RIGHT: DETAILS VIEW */}
        <div className={`
          flex-1 flex flex-col bg-slate-50/50 relative
          ${!selectedQ ? 'hidden md:flex' : 'flex'}
        `}>
          {selectedQ ? (
            <AnimatePresence mode='wait'>
              <motion.div 
                key={selectedQ.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <div className="p-6 bg-white border-b border-slate-100 shadow-sm shrink-0">
                   <button onClick={() => setSelectedQ(null)} className="md:hidden mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                      <ArrowLeft size={16}/> Back to Discussions
                   </button>
                   
                   <div className="flex items-start justify-between gap-4 mb-4">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{selectedQ.title}</h2>
                      <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                        Question
                      </div>
                   </div>

                   <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 mb-6">
                      <div className="flex items-center gap-1.5">
                         <UserIcon size={12} className="text-indigo-500" />
                         <span className="text-slate-700">@{selectedQ.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Clock size={12} />
                         <span>{selectedQ.timestamp}</span>
                      </div>
                   </div>

                   <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                     {selectedQ.content}
                   </div>
                </div>

                {/* Answers List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                   <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Responses ({selectedQ.answers.length})</h3>
                   </div>
                   
                   {selectedQ.answers.length === 0 && (
                      <div className="text-center py-10">
                        <p className="text-slate-400 text-sm font-medium italic">No responses yet. Be the hero this peer needs!</p>
                      </div>
                   )}

                   <div className="space-y-4">
                    {selectedQ.answers.map(ans => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={ans.id} 
                        className={`p-5 rounded-[1.5rem] border shadow-sm transition-all ${
                          ans.is_solution 
                          ? 'bg-green-50/50 border-green-200 ring-4 ring-green-500/5' 
                          : 'bg-white border-slate-100 hover:border-indigo-100'
                        }`}
                      >
                         <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500">
                                  {ans.author?.charAt(0).toUpperCase()}
                               </div>
                               <div>
                                  <span className="font-black text-xs text-slate-800 block leading-none">{ans.author}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{ans.timestamp}</span>
                               </div>
                            </div>
                            {ans.is_solution && (
                              <div className="bg-green-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase tracking-widest shadow-lg shadow-green-200">
                                 <CheckCircle size={10}/> Solution
                              </div>
                            )}
                         </div>
                         <p className="text-slate-700 text-sm mb-4 leading-relaxed">{ans.content}</p>
                         <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleUpvote(ans.id)} 
                              className="flex items-center gap-2 text-slate-500 hover:text-white bg-white hover:bg-indigo-600 border border-slate-100 hover:border-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm active:scale-95"
                            >
                               <ThumbsUp size={12}/> {ans.upvotes} Helpful
                            </button>
                         </div>
                      </motion.div>
                    ))}
                   </div>
                </div>

                {/* Reply Box */}
                <div className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0">
                   <div className="relative flex items-center gap-3">
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          placeholder="Share your knowledge..." 
                          className="w-full pl-5 pr-12 py-3.5 bg-slate-100 border-transparent focus:bg-white border focus:border-indigo-200 rounded-2xl outline-none text-sm font-medium transition-all focus:ring-4 focus:ring-indigo-50/50"
                          value={replyContent}
                          onChange={e => setReplyContent(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleReply()}
                        />
                        <button 
                          onClick={handleReply} 
                          disabled={!replyContent.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-indigo-100"
                        >
                           <Send size={18}/>
                        </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl border border-slate-50 mb-6">
                    <MessageSquare size={40} className="text-indigo-100 animate-pulse"/>
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Select a discussion</h3>
                <p className="text-sm font-medium text-slate-400 mt-1 px-10 text-center">Join the conversation or help a fellow engineer out.</p>
            </div>
          )}
        </div>
      </div>

      {/* ASK MODAL */}
      <AnimatePresence>
         {showAskModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                 animate={{ scale: 1, opacity: 1, y: 0 }} 
                 exit={{ scale: 0.9, opacity: 0, y: 20 }}
                 className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-3xl overflow-hidden"
               >
                  <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Start a Discussion</h2>
                    <p className="text-sm text-slate-500 font-medium">Be clear and concise with your question.</p>
                  </div>
                  
                  <form onSubmit={handleAsk} className="p-8 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Headline</label>
                        <input 
                          placeholder="e.g. Help with Fourier Series derivation" 
                          className="w-full bg-slate-50 border-transparent focus:bg-white border focus:border-indigo-200 p-4 rounded-2xl text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-indigo-50/50" 
                          value={askForm.title} 
                          onChange={e => setAskForm({...askForm, title: e.target.value})} 
                          required
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Context & Details</label>
                        <textarea 
                          placeholder="Provide enough details for others to help you..." 
                          className="w-full bg-slate-50 border-transparent focus:bg-white border focus:border-indigo-200 p-4 rounded-2xl text-sm font-bold outline-none h-32 resize-none transition-all focus:ring-4 focus:ring-indigo-50/50" 
                          value={askForm.content} 
                          onChange={e => setAskForm({...askForm, content: e.target.value})} 
                          required
                        />
                     </div>
                     <div className="flex gap-3 pt-4 border-t border-slate-50">
                        <button type="button" onClick={() => setShowAskModal(false)} className="flex-1 py-4 text-slate-500 font-black text-sm uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition">Cancel</button>
                        <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1">Broadcast Question</button>
                     </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default Forum;