import { lazy, Suspense, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BootScreen from './components/BootScreen.jsx';

const JWTDecoder = lazy(() => import('./pages/JWTDecoder.jsx'));
const JWTGenerator = lazy(() => import('./pages/JWTGenerator.jsx'));
const JWTVerifier = lazy(() => import('./pages/JWTVerifier.jsx'));
const TokenInspector = lazy(() => import('./pages/TokenInspector.jsx'));
const Labs = lazy(() => import('./pages/Labs.jsx'));
const LabDetail = lazy(() => import('./pages/LabDetail.jsx'));
const Achievements = lazy(() => import('./pages/Achievements.jsx'));
const Leaderboard = lazy(() => import('./pages/Leaderboard.jsx'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-black">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-green-500/20 border-t-green-400 rounded-full animate-spin" />
      <span className="text-xs font-mono text-neutral-600">Loading...</span>
    </div>
  </div>
);

const App = () => {
  const [booted, setBooted] = useState(false);
  const handleBoot = useCallback(() => setBooted(true), []);

  return (
    <BrowserRouter>
      {!booted && <BootScreen onComplete={handleBoot} />}
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="tools/decoder" element={<JWTDecoder />} />
              <Route path="tools/generator" element={<JWTGenerator />} />
              <Route path="tools/verifier" element={<JWTVerifier />} />
              <Route path="tools/inspector" element={<TokenInspector />} />
              <Route path="labs" element={<Labs />} />
              <Route path="labs/:slug" element={<LabDetail />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
