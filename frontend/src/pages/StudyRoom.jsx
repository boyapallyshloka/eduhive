import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Send, BookOpen, Brain, GraduationCap, 
  Loader2, Paperclip, FileText, Bot, Download, ChevronRight, Layout
} from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const StudyRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  
  // Mobile Responsiveness State
  const [mobileTab, setMobileTab] = useState('chat'); 

  // Chat State
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm **EduChat**. I'm ready to help.\n\nYou can ask me about this document, or upload a NEW PDF to summarize it instantly." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Refs
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- 1. Fetch Resource Metadata ---
  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await api.get(`/resource/${id}`);
        setResource(res.data);
      } catch (err) {
        console.error("Failed to load resource", err);
        toast.error("Could not load document details");
      }
    };
    fetchResource();
  }, [id]);

  // --- 2. Auto-scroll Chat ---
  useEffect(() => {
    if (mobileTab === 'chat') {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, mobileTab]);

  // --- 3. Handle Text Chat ---
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', { 
        question: input, 
        resource_id: id 
      });
      
      const aiMsg = { role: 'ai', content: res.data.answer };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Handle "Select PDF to Summarize" ---
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        toast.error("Please select a PDF file");
        return;
    }

    setLoading(true);
    const loadingId = toast.loading(`Uploading ${file.name}...`);
    setMobileTab('chat');

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('university', 'Chat Upload');
        formData.append('course', 'General');
        formData.append('semester', 'N/A');
        formData.append('user_id', 1);

        const uploadRes = await api.post('/resource/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const newResourceId = uploadRes.data.resource.id;
        toast.success("Uploaded! Generating summary...", { id: loadingId });

        setMessages(prev => [...prev, { role: 'user', content: `📂 Uploaded: ${file.name}\nPlease summarize this.` }]);
        
        const summaryRes = await api.get(`/ai/summarize/${newResourceId}`);
        
        setMessages(prev => [...prev, { 
            role: 'ai', 
            content: `**Summary of ${file.name}:**\n\n${summaryRes.data.summary}` 
        }]);

    } catch (err) {
        console.error(err);
        toast.error("Failed to process file", { id: loadingId });
        setMessages(prev => [...prev, { role: 'ai', content: "❌ I couldn't read that file. Please try a different PDF." }]);
    } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleQuickAction = async (action) => {
    if (loading) return;
    setLoading(true);
    setMobileTab('chat'); 
    
    if (action === 'upload_summarize') {
        fileInputRef.current.click();
        setLoading(false);
        return;
    }

    const actionText = action === 'summarize' ? "Summarizing..." : "Generating quiz...";
    const loadingToast = toast.loading(actionText);

    try {
      if (action === 'summarize') {
        const res = await api.get(`/ai/summarize/${id}`);
        setMessages(prev => [...prev, { role: 'ai', content: `**Summary:**\n\n${res.data.summary}` }]);
      
      } else if (action === 'quiz') {
        const res = await api.post('/ai/ask', {
            resource_id: id,
            question: "Create a comprehensive quiz with 15 multiple-choice questions based on this document. Include answers at the end."
        });
        setMessages(prev => [...prev, { role: 'ai', content: res.data.answer }]);
      }
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("AI failed");
    } finally {
      setLoading(false);
    }
  };

  const pdfUrl = `http://127.0.0.1:5000/api/resource/file/${id}`;

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      <Toaster position="top-center" />

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="application/pdf"
      />

      {/* --- RESPONSIVE HEADER --- */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-30 shrink-0 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition active:scale-95">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex flex-col overflow-hidden">
            <h1 className="font-black text-slate-800 flex items-center gap-2 text-sm md:text-base truncate tracking-tight">
              <BookOpen size={16} className="text-indigo-600 shrink-0"/> 
              <span className="truncate max-w-[120px] sm:max-w-[300px] md:max-w-md">{resource?.title || "Loading..."}</span>
            </h1>
            <p className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {resource ? `${resource.course} • AI Lab` : "Connecting..."}
            </p>
          </div>
        </div>

        {/* --- MOBILE VIEW TOGGLE --- */}
        <div className="flex md:hidden bg-slate-100 p-1 rounded-xl mx-2 shrink-0 border border-slate-200">
            <button 
                onClick={() => setMobileTab('pdf')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${mobileTab === 'pdf' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
                PDF
            </button>
            <button 
                onClick={() => setMobileTab('chat')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${mobileTab === 'chat' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
                Chat
            </button>
        </div>

        {resource && (
            <a href={pdfUrl} download className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black hover:bg-indigo-100 transition shadow-sm border border-indigo-100">
                <Download size={14} /> Download
            </a>
        )}
      </header>

      {/* --- MAIN SPLIT VIEW --- */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT: PDF VIEWER */}
        <div className={`
            ${mobileTab === 'pdf' ? 'flex' : 'hidden'} 
            md:flex md:w-[60%] 
            w-full h-full bg-slate-200 items-center justify-center relative border-r border-slate-200
        `}>
          {resource ? (
            <iframe src={pdfUrl} className="w-full h-full border-none shadow-inner" title="PDF Viewer"></iframe>
          ) : (
            <div className="flex flex-col items-center text-slate-400 animate-pulse">
              <Loader2 size={40} className="animate-spin text-indigo-500" />
              <p className="mt-4 font-black text-[10px] uppercase tracking-[0.2em]">Initializing PDF</p>
            </div>
          )}
        </div>

        {/* RIGHT: AI CHAT */}
        <div className={`
            ${mobileTab === 'chat' ? 'flex' : 'hidden'} 
            md:flex md:w-[40%] 
            w-full h-full bg-white flex-col shadow-2xl z-20
        `}>
          
          {/* EduChat Branding */}
          <div className="px-5 py-4 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/30 to-white flex items-center gap-3 shrink-0">
             <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
               <Bot size={20} />
             </div>
             <div>
               <h3 className="font-black text-slate-800 text-sm tracking-tight">EduChat</h3>
               <div className="flex items-center gap-1.5">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">AI Assistant Online</p>
               </div>
             </div>
          </div>

          {/* Quick Actions */}
          <div className="p-3 grid grid-cols-3 gap-2 bg-white border-b border-slate-100 shrink-0">
             <button onClick={() => handleQuickAction('summarize')} className="group flex flex-col items-center justify-center gap-1 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 py-2.5 rounded-2xl transition shadow-sm active:scale-95">
               <Brain size={18} className="text-purple-500 group-hover:scale-110 transition-transform"/> 
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Summary</span>
             </button>

             <button onClick={() => handleQuickAction('upload_summarize')} className="group flex flex-col items-center justify-center gap-1 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 py-2.5 rounded-2xl transition shadow-sm active:scale-95">
               <FileText size={18} className="text-blue-500 group-hover:scale-110 transition-transform"/> 
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">New PDF</span>
             </button>

             <button onClick={() => handleQuickAction('quiz')} className="group flex flex-col items-center justify-center gap-1 bg-white border border-slate-200 hover:border-green-300 hover:bg-green-50/50 py-2.5 rounded-2xl transition shadow-sm active:scale-95">
               <GraduationCap size={18} className="text-green-500 group-hover:scale-110 transition-transform"/> 
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Practice</span>
             </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
            <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] p-4 rounded-[1.5rem] text-[13.5px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-none shadow-indigo-100 font-medium' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                }`}>
                  {msg.content.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className={msg.role === 'user' ? 'text-white' : 'text-slate-900'}>{part}</strong> : part)}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            
            {loading && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex gap-2 items-center text-[11px] font-black text-indigo-600 uppercase tracking-widest">
                      <Loader2 size={14} className="animate-spin"/> EduChat is thinking...
                  </div>
               </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
              <button 
                onClick={() => fileInputRef.current.click()}
                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-[1.2rem] transition active:scale-90 shrink-0"
              >
                <Paperclip size={20} />
              </button>

              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Ask anything about the notes..." 
                  className="w-full pl-4 pr-4 py-3.5 bg-slate-100 border-transparent focus:bg-white border focus:border-indigo-200 rounded-[1.2rem] outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
              </div>

              <button 
                onClick={handleSend} 
                disabled={!input.trim() || loading} 
                className="p-3.5 bg-indigo-600 text-white rounded-[1.2rem] hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale shadow-xl shadow-indigo-100 transition active:scale-90 shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudyRoom;