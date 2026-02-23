import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Github, Twitter, Linkedin, Instagram, 
  Menu, X, ChevronRight 
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Nav Links Configuration
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Login', path: '/login' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl font-bold text-white tracking-tight hover:opacity-90 transition shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-900/50">
                <BookOpen size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
              </div>
              <span>EduHive</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 font-medium text-slate-300 text-sm">
              {navLinks.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`hover:text-white transition relative py-1 px-1 ${location.pathname === item.path ? 'text-white' : ''}`}
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <motion.span 
                      layoutId="nav-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full"
                    />
                  )}
                </Link>
              ))}
              <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/50 hover:-translate-y-0.5 active:scale-95">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-300 hover:text-white transition-colors"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-b border-slate-800 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-xl font-medium transition-all ${
                      location.pathname === item.path ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.name}
                    <ChevronRight size={16} className={location.pathname === item.path ? 'opacity-100' : 'opacity-0'} />
                  </Link>
                ))}
                <div className="pt-4">
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-indigo-900/40"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <main className="flex-grow pt-16 md:pt-20 bg-slate-50"> 
        {children}
      </main>

      {/* --- RICH FOOTER --- */}
      <footer className="bg-slate-950 text-slate-300 pt-16 pb-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Column */}
            <div className="space-y-4 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                 <BookOpen className="text-indigo-500" size={24}/> EduHive
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto sm:mx-0">
                Empowering engineering students with AI-driven summaries, quizzes, and a collaborative resource library.
              </p>
              <div className="flex justify-center sm:justify-start gap-4 pt-2">
                {[Github, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110 border border-slate-800">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link to="/" className="hover:text-indigo-400 transition flex items-center justify-center sm:justify-start gap-2">Home</Link></li>
                <li><Link to="/about" className="hover:text-indigo-400 transition flex items-center justify-center sm:justify-start gap-2">About Us</Link></li>
                <li><Link to="/dashboard" className="hover:text-indigo-400 transition flex items-center justify-center sm:justify-start gap-2">Browse Notes</Link></li>
                <li><Link to="/register" className="hover:text-indigo-400 transition flex items-center justify-center sm:justify-start gap-2">Student Register</Link></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-white font-bold mb-6 text-lg">Resources</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><a href="#" className="hover:text-indigo-400 transition">University Syllabus</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Previous Papers</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">AI Summarizer</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Quiz Generator</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="text-center sm:text-left">
              <h4 className="text-white font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><a href="#" className="hover:text-indigo-400 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 text-center md:text-left">
            <p>© 2026 EduHive Project. Designed by Your Team name</p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span>Made in India...💖</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;