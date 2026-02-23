import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
  Brain, Database, Users, Trophy, Sparkles, 
  Target, Zap, Rocket, BookOpen 
} from 'lucide-react';

const About = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-20 overflow-x-hidden">
        
        {/* --- HERO SECTION --- */}
        <section className="relative bg-white border-b border-slate-200 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-50"></div>
          
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 lg:py-32 relative z-10 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">EduHive</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
                India's first AI-powered collaborative ecosystem designed specifically for engineering students to share, learn, and grow together.
              </p>
            </motion.div>
          </div>
        </section>

        {/* --- MAIN CONTENT --- */}
        <motion.div 
          className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-12 relative z-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* 1. THE PROBLEM & SOLUTION */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-16">
            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-slate-800">
                <Target className="text-red-500 shrink-0" /> The Problem
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                Engineering students often face fragmented study materials. Notes are scattered across WhatsApp groups, Google Drives, and physical copies. Finding high-quality, semester-specific resources before exams is a chaotic experience.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 md:p-10 rounded-3xl shadow-xl text-white flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Zap className="text-yellow-400 shrink-0" fill="currentColor"/> The EduHive Solution
              </h2>
              <p className="text-indigo-100 leading-relaxed text-sm md:text-base">
                We centralize everything. EduHive isn't just a storage drive; it's an intelligent platform where resources are organized by University, Branch, and Semester, powered by AI to help you understand them instantly.
              </p>
            </div>
          </motion.div>

          {/* 2. CORE FEATURES GRID */}
          <div className="mb-16 px-2">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-slate-800">Why Choose EduHive?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  <Database size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Repository</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Upload and find notes categorized by strict academic metadata. No more searching through endless chat history.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                  <Brain size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Study Room</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Powered by Google Gemini. Open any PDF to get instant summaries, ask doubts, or generate practice quizzes automatically.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 sm:col-span-2 md:col-span-1">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 mb-4">
                  <Trophy size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Gamified Learning</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Earn XP for every upload and helpful forum answer. Climb the leaderboard from Rookie to Legend status.
                </p>
              </motion.div>
            </div>
          </div>

          {/* 3. MISSION STATEMENT */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 md:p-12 border border-slate-200 text-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <h2 className="text-2xl font-bold mb-8 flex items-center justify-center gap-3">
              <Users size={28} className="text-indigo-600 shrink-0"/> Our Mission
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
                <div className="flex gap-4 items-start">
                   <div className="mt-1.5 shrink-0"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div></div>
                   <p className="text-slate-600 text-sm md:text-base">To democratize access to high-quality engineering notes across all colleges in India.</p>
                </div>
                <div className="flex gap-4 items-start">
                   <div className="mt-1.5 shrink-0"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div></div>
                   <p className="text-slate-600 text-sm md:text-base">To leverage Artificial Intelligence to make study sessions shorter, smarter, and more effective.</p>
                </div>
                <div className="flex gap-4 items-start">
                   <div className="mt-1.5 shrink-0"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div></div>
                   <p className="text-slate-600 text-sm md:text-base">To build a "Learn by Teaching" culture where students are rewarded for helping peers.</p>
                </div>
            </div>
          </motion.div>

          {/* 4. TECH STACK */}
          <div className="mt-16 text-center px-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Powered By Modern Tech</p>
            <div className="flex flex-wrap justify-center items-center gap-y-4 gap-x-6 md:gap-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="font-bold text-slate-600 text-sm md:text-base flex items-center gap-2"><Sparkles size={16} className="text-indigo-500"/> React.js</span>
                <span className="font-bold text-slate-600 text-sm md:text-base flex items-center gap-2"><Database size={16} className="text-indigo-500"/> Flask</span>
                <span className="font-bold text-slate-600 text-sm md:text-base flex items-center gap-2"><Brain size={16} className="text-indigo-500"/> Gemini AI</span>
                <span className="font-bold text-slate-600 text-sm md:text-base flex items-center gap-2"><BookOpen size={16} className="text-indigo-500"/> SQLite</span>
            </div>
          </div>

        </motion.div>
      </div>
    </Layout>
  );
};

export default About;