import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, MapPin, Save, ArrowLeft, Camera, Loader2, Sparkles } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import Dashboard from './Dashboard';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    university: '', branch: '', semester: '', bio: '', avatarFile: null
  });

  const API_URL = "http://127.0.0.1:5000/api/resource/uploads/";

  useEffect(() => {
    if (!user.id) return;
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/auth/profile?user_id=${user.id}`);
        setFormData(prev => ({
            ...prev,
            university: res.data.university || '',
            branch: res.data.branch || '',
            semester: res.data.semester || '',
            bio: res.data.bio || ''
        }));
        localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
      } catch (err) { console.error("Failed to load profile"); }
    };
    fetchProfile();
  }, [user.id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatarFile: file });
      setPreviewImage(URL.createObjectURL(file));
      toast.success("Image selected! Click save to update.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadToast = toast.loading("Saving changes...");

    try {
      const data = new FormData();
      data.append('user_id', user.id);
      data.append('university', formData.university);
      data.append('branch', formData.branch);
      data.append('semester', formData.semester);
      data.append('bio', formData.bio);
      if (formData.avatarFile) {
        data.append('avatar', formData.avatarFile);
      }

      const res = await api.put('/auth/profile/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.dismiss(loadToast);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 md:py-12 px-4 sm:px-6 font-sans text-slate-900">
      <Toaster position="top-center" />
      
      <div className="max-w-2xl mx-auto">
        {/* Navigation / Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          
          {/* HEADER / BANNER */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 h-32 md:h-40 relative">
             <div className="absolute -bottom-12 left-6 md:left-10 group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                
                {/* AVATAR CONTAINER */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2rem] p-1.5 shadow-2xl relative overflow-hidden ring-4 ring-white">
                   {previewImage || user.avatar ? (
                     <img 
                       src={previewImage || `${API_URL}${user.avatar}`} 
                       alt="Profile" 
                       className="w-full h-full rounded-[1.8rem] object-cover"
                     />
                   ) : (
                     <div className="w-full h-full bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-indigo-600 font-black text-3xl md:text-4xl">
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                     </div>
                   )}
                   
                   {/* CAMERA OVERLAY */}
                   <div className="absolute inset-0 bg-indigo-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                     <Camera className="text-white" size={28} />
                   </div>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
             </div>
          </div>
          
          {/* PROFILE INFO & FORM */}
          <div className="pt-16 md:pt-20 px-6 md:px-10 pb-10">
              <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800">{user.username}</h1>
                    <p className="text-sm font-medium text-slate-400">{user.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                    <Sparkles size={12} /> Student Account
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Institution</label>
                      <input 
                        type="text" 
                        placeholder="University Name"
                        className="w-full bg-slate-50 border-transparent focus:bg-white border focus:border-indigo-200 p-4 rounded-2xl text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-indigo-50/50" 
                        value={formData.university} 
                        onChange={e => setFormData({...formData, university: e.target.value})} 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Branch / Course</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Computer Science"
                        className="w-full bg-slate-50 border-transparent focus:bg-white border focus:border-indigo-200 p-4 rounded-2xl text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-indigo-50/50" 
                        value={formData.branch} 
                        onChange={e => setFormData({...formData, branch: e.target.value})} 
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">About You</label>
                   <textarea 
                     className="w-full bg-slate-50 border-transparent focus:bg-white border focus:border-indigo-200 p-4 rounded-2xl text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-indigo-50/50 resize-none" 
                     rows="4" 
                     placeholder="Share a little bit about your academic interests..."
                     value={formData.bio} 
                     onChange={e => setFormData({...formData, bio: e.target.value})}
                   />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                   <button 
                     type="button"
                     onClick={() => navigate('/dashboard')}
                     className="order-2 sm:order-1 px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     disabled={loading} 
                     className="order-1 sm:order-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                   >
                     {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} /> Saving...
                        </>
                     ) : (
                        <>
                            <Save size={18} /> Update Profile
                        </>
                     )}
                   </button>
                </div>
              </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;