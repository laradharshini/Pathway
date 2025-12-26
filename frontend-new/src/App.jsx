import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProfileSetup from './components/auth/ProfileSetup';
import MockOAuthPopup from './components/auth/MockOAuthPopup';
import Dashboard from './components/dashboard/Dashboard';
import Jobs from './components/jobs/Jobs';
import SkillGaps from './components/gaps/SkillGaps';
import Learning from './components/learning/Learning';
import GameHub from './components/games/GameHub';
import SimulationContainer from './components/simulations/SimulationContainer';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading, token } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (!token) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile-setup" element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="/mock-oauth/:provider" element={<MockOAuthPopup />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="gaps" element={<SkillGaps />} />
            <Route path="learning" element={<Learning />} />
            <Route path="games" element={<GameHub />} />
            <Route path="simulations" element={<SimulationContainer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
