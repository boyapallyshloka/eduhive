import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, ArrowLeft, Trophy, 
  AlertCircle, Loader2, Star, Check 
} from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const QuizDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        const res = await api.get(`/resource/${id}`);
        setResource(res.data);
      } catch (err) {
        console.error("Resource load error", err);
      }
    };

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await api.post('/ai/quiz', { resource_id: id });
        const data = Array.isArray(res.data) ? res.data : res.data.quiz;
        
        if (!data || data.length === 0) {
          throw new Error("No quiz data received");
        }
        
        setQuizData(data);
      } catch (err) {
        console.error("Quiz generation error", err);
        toast.error("AI is temporarily unavailable. Try again later.");
        setTimeout(() => navigate(-1), 2500);
      } finally {
        setLoading(false);
      }
    };

    fetchResourceData();
    fetchQuiz();
  }, [id, navigate]);

  const handleSelect = (questionId, optionPrefix) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionPrefix }));
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < quizData.length) {
      toast.error("Please answer all questions!", { icon: '📝' });
      return;
    }

    let calculatedScore = 0;
    quizData.forEach(q => {
      if (userAnswers[q.id] === q.answer) calculatedScore++;
    });

    setScore(calculatedScore);
    setSubmitted(true);
    toast.success("Quiz Completed!", { icon: '🎉' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progress = quizData.length > 0 
    ? (Object.keys(userAnswers).length / quizData.length) * 100 
    : 0;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-6 text-center">
      <div className="relative mb-8">
        <Loader2 size={64} className="animate-spin text-indigo-600" />
        <div className="absolute inset-0 flex items-center justify-center">
            <Star size={20} className="text-indigo-400 animate-pulse" />
        </div>
      </div>
      <motion.h2 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight"
      >
        Analyzing your notes...
      </motion.h2>
      <p className="text-slate-500 mt-3 font-medium italic text-sm sm:text-base">EduChat is crafting 15 custom questions for you.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans selection:bg-indigo-100">
      <Toaster position="top-center" />
      
      {/* STICKY NAV */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors shrink-0"
          >
            <ArrowLeft size={20} /> <span className="hidden sm:inline">Exit Quiz</span>
          </button>

          <div className="flex-1 flex flex-col items-center max-w-xs sm:max-w-md">
             <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-[0_0_8px_rgba(79,70,229,0.4)]" 
                />
             </div>
             <span className="text-[10px] font-black text-slate-400 mt-1.5 tracking-widest uppercase truncate w-full text-center">
                {Object.keys(userAnswers).length} / {quizData.length} Completed
             </span>
          </div>

          <div className="shrink-0 min-w-[40px] text-right">
            {submitted && (
                <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-lg shadow-indigo-200">
                    {score}/{quizData.length}
                </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        <AnimatePresence>
            {submitted && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    className="mb-10 p-6 sm:p-10 rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <motion.div 
                            initial={{ rotate: -15, scale: 0.5 }} 
                            animate={{ rotate: 0, scale: 1 }} 
                            transition={{ type: "spring", damping: 10 }}
                        >
                            <Trophy size={64} className="mx-auto mb-4 text-yellow-300 drop-shadow-lg" />
                        </motion.div>
                        <h2 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Quiz Complete!</h2>
                        <p className="text-indigo-100 font-medium mb-8 text-sm sm:text-base">You mastered {score} out of {quizData.length} topics.</p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <button onClick={() => window.location.reload()} className="bg-white text-indigo-600 px-6 sm:px-8 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition active:scale-95 shadow-md">Retake Quiz</button>
                            <button onClick={() => navigate('/dashboard')} className="bg-indigo-500/30 backdrop-blur-md border border-white/20 text-white px-6 sm:px-8 py-3 rounded-2xl font-bold hover:bg-indigo-500/50 transition active:scale-95">Dashboard</button>
                        </div>
                    </div>
                    {/* Background decor */}
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-black/10 rounded-full blur-3xl" />
                </motion.div>
            )}
        </AnimatePresence>

        <div className="space-y-6 sm:space-y-10">
          {quizData.map((q, index) => {
            const userAnswer = userAnswers[q.id];
            const isCorrect = userAnswer === q.answer;

            return (
              <motion.div 
                key={q.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-50px" }}
                className={`bg-white rounded-[2rem] p-5 sm:p-8 border-2 transition-all duration-300 ${
                  submitted 
                    ? (isCorrect ? 'border-green-100 shadow-green-50' : 'border-red-100 shadow-red-50') 
                    : 'border-transparent shadow-xl shadow-slate-200/40 hover:shadow-indigo-100/50'
                }`}
              >
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">Question {index + 1}</span>
                        {submitted && (
                            isCorrect 
                            ? <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-lg uppercase tracking-widest"><CheckCircle2 size={12}/> Correct</span>
                            : <span className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-lg uppercase tracking-widest"><XCircle size={12}/> Incorrect</span>
                        )}
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 leading-snug">{q.question}</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {q.options.map((opt) => {
                    const prefix = opt.split(/[).]/)[0].trim().toUpperCase();
                    const isSelected = userAnswer === prefix;
                    const isTheCorrectAnswer = q.answer === prefix;

                    let style = "border-slate-100 bg-slate-50 text-slate-600 hover:bg-white hover:border-indigo-200 hover:shadow-sm";
                    
                    if (submitted) {
                        if (isTheCorrectAnswer) style = "bg-green-50 border-green-500 text-green-700 font-bold ring-4 ring-green-500/5";
                        else if (isSelected && !isCorrect) style = "bg-red-50 border-red-400 text-red-700 opacity-80";
                        else style = "bg-white border-slate-100 text-slate-300 opacity-50";
                    } else if (isSelected) {
                        style = "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 transform scale-[1.01]";
                    }

                    return (
                      <button 
                        key={opt} 
                        onClick={() => handleSelect(q.id, prefix)} 
                        disabled={submitted} 
                        className={`text-left px-5 sm:px-7 py-4 sm:py-5 rounded-2xl border-2 transition-all active:scale-[0.97] flex items-center justify-between gap-4 group ${style}`}
                      >
                        <span className="font-semibold text-sm sm:text-base leading-tight">{opt}</span>
                        <div className="shrink-0 transition-transform group-hover:scale-110">
                            {submitted && isTheCorrectAnswer && <CheckCircle2 size={20} className="text-green-600" />}
                            {submitted && isSelected && !isCorrect && <XCircle size={20} className="text-red-500" />}
                            {!submitted && isSelected && <div className="w-3 h-3 rounded-full bg-white animate-pulse" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Optional explanation block can go here if provided by AI */}
                {submitted && !isCorrect && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-start">
                        <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-800 font-medium">The correct answer is <span className="font-bold">{q.answer}</span>. Review this section in your document for clarity.</p>
                    </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {!submitted && (
            <div className="mt-16 text-center">
                <button 
                    onClick={handleSubmit} 
                    className="w-full sm:w-auto bg-slate-900 text-white text-lg font-black px-12 py-5 rounded-[2rem] shadow-2xl hover:bg-indigo-700 transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95 flex items-center justify-center gap-3 mx-auto group"
                >
                    Submit My Answers
                    <Check size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Ensure all {quizData.length} questions are answered</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default QuizDashboard;