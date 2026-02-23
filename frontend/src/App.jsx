import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudyRoom from './pages/StudyRoom';
import QuizDashboard from './pages/QuizDashboard';
import Profile from './pages/Profile';
import Forum from './pages/Forum';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
// --- Protected Route Component ---
// This checks if a token exists. If not, it redirects to Login.
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes (Accessible by everyone) --- */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<Login />} />

        {/* --- Protected Routes (Login required) --- */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* The Study Room route takes an ':id' parameter for the specific file */}
        <Route
          path="/study/:id"
          element={
            <PrivateRoute>
              <StudyRoom />
            </PrivateRoute>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <PrivateRoute>
              <QuizDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/forum"
          element={
            <PrivateRoute>
              <Forum />
            </PrivateRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <PrivateRoute>
              <Leaderboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"  // <--- Dedicated Admin Path
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>

  );
}

export default App;