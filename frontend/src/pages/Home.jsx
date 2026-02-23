import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Users, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

// --- ANIMATION CONFIGURATION ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    title: "Collaborative Learning",
    desc: "Connect with peers to solve complex engineering problems together."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    title: "AI-Powered Tools",
    desc: "Instant summaries and generated quizzes at your fingertips."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    title: "Organized Library",
    desc: "Access notes sorted by University, Branch, and Semester."
  }
];

// --- INTERNAL COMPONENT: IMAGE SLIDER ---
const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="relative w-full h-full group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          
          {/* Caption Overlay */}
          <div className="absolute bottom-12 left-0 right-0 text-center px-8 sm:px-12">
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-white inline-block max-w-lg mx-auto border border-white/10 shadow-xl">
              <h5 className="font-bold text-xl mb-2">{slide.title}</h5>
              <p className="text-indigo-100 text-sm font-medium">{slide.desc}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Left Arrow */}
      <button 
        onClick={prevSlide} 
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Right Arrow */}
      <button 
        onClick={nextSlide} 
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators (Dots) */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </div>
  );
};

// --- MAIN HOME COMPONENT ---
const Home = () => {
  return (
    <Layout>
      <div className="bg-slate-50 overflow-hidden">
        
        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6">
          {/* Background Gradients */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-100/60 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-100/60 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT SIDE: Text Content */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="text-center lg:text-left z-10">

              <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
                Study Smarter with <br/>
                <span className="transparent-text bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                  AI & Community.
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Stop drowning in PDFs. Upload notes, get instant AI summaries, take generated quizzes, and collaborate with peers across India.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link to="/register" className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all hover:scale-105 shadow-xl shadow-indigo-200">
                  Start Learning Now <ArrowRight size={18} />
                </Link>
                <Link to="/about" className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold hover:border-indigo-300 hover:text-indigo-600 transition-all">
                  See How It Works
                </Link>
              </motion.div>
            </motion.div>

            {/* RIGHT SIDE: Custom Slider */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 1 }} 
              className="relative hidden lg:block"
            >
              <div className="rounded-[40px] overflow-hidden shadow-2xl border-[8px] border-white bg-white h-[500px] relative">
                <ImageSlider />
              </div>
              
            </motion.div>

          </div>
        </section>

        {/* --- HOW IT WORKS SECTION --- */}
        <section className="py-24 px-6">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                 <h2 className="text-4xl font-bold text-slate-900 mb-4">Your Path to Better Grades</h2>
                 <p className="text-slate-600 max-w-2xl mx-auto text-lg">A simple workflow designed for busy engineering students.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 relative">
                 <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 -z-10 transform -translate-y-1/2"></div>
                 {[
                    { icon: FileText, title: "1. Upload & Organize", desc: "Upload your PDFs. We auto-tag them by university and course.", color: "indigo" },
                    { icon: Brain, title: "2. AI Processing", desc: "Get instant summaries, key concepts, and generated quizzes.", color: "purple" },
                    { icon: Users, title: "3. Learn & Collaborate", desc: "Study with the split-screen view and discuss with peers.", color: "pink" },
                 ].map((step, idx) => (
                    <motion.div 
                       key={idx}
                       initial={{ opacity: 0, y: 30 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: idx * 0.2 }}
                       className="bg-white relative z-10 p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 text-center group hover:-translate-y-2 transition-all"
                    >
                       <div className={`w-20 h-20 mx-auto bg-${step.color}-100 rounded-2xl flex items-center justify-center text-${step.color}-600 mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                          <step.icon size={36} />
                       </div>
                       <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                       <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>
        
        {/* --- FINAL CTA SECTION --- */}
        <section className="py-24 px-6 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-800 -z-20"></div>
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent -z-10"></div>
           
           <div className="max-w-4xl mx-auto text-center text-white relative z-10">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                  <h2 className="text-4xl text-black md:text-5xl font-bold mb-6 leading-tight">Ready to transform how you study?</h2>
                  <p className="text-indigo-400 mb-10 text-xl max-w-2xl mx-auto">Join the fastest-growing community of engineering students leveraging AI for success.</p>
                 <Link to='./Register'> <button className="px-10 py-5 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-2xl shadow-indigo-900/20 flex items-center gap-3 mx-auto">
                    Create Free Account <CheckCircle size={20} className="text-green-500" />
                  </button></Link>
              </motion.div>
           </div>
        </section>

      </div>
    </Layout>
  );
};

export default Home;