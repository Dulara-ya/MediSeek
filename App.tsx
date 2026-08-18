import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

import BottomNavbar from './components/BottomNavbar';
import EmergencyCallButton from './components/EmergencyCallButton';

import FindPage from './pages/FindPage';
import HealthScorePage from './pages/HealthScorePage';
import ChatbotPage from './pages/ChatbotPage';
import AuthPage from './pages/AuthPage';
import DoctorAuthPage from './pages/DoctorAuthPage';
import PharmacyAuthPage from './pages/PharmacyAuthPage';
import ProfilePage from './pages/ProfilePage';

import { LOGO_URL_ICON } from './constants';
import { useAuth } from './contexts/AuthContext';

const AppLayout: React.FC = () => {
  return (
    <div className="font-sans antialiased">
      <header className="bg-calm-blue-primary text-white p-3 shadow-md flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-14">
        <div className="flex items-center">
          <img src={LOGO_URL_ICON} alt="MediSeek Icon" className="h-8 w-8 mr-2" />
          <h1 className="text-xl font-bold">MediSeek</h1>
        </div>
      </header>

      <main className="pt-14 pb-16 bg-calm-blue-secondary min-h-screen">
        <ReactRouterDOM.Outlet />
      </main>

      <EmergencyCallButton />
      <BottomNavbar />
    </div>
  );
};

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppLayout /> : <ReactRouterDOM.Navigate to="/auth" replace />;
};

const UnauthenticatedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <AuthPage /> : <ReactRouterDOM.Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <ReactRouterDOM.Routes>
      {/* Routes for logged-out users */}
      <ReactRouterDOM.Route path="/auth" element={<UnauthenticatedRoute />} />

      {/* Standalone provider auth */}
      <ReactRouterDOM.Route path="/doctor-auth" element={<DoctorAuthPage />} />
      <ReactRouterDOM.Route path="/pharmacy-auth" element={<PharmacyAuthPage />} />

      {/* Protected routes */}
      <ReactRouterDOM.Route element={<ProtectedLayout />}>
        <ReactRouterDOM.Route path="/" element={<FindPage />} />
        <ReactRouterDOM.Route path="/health" element={<HealthScorePage />} />
        <ReactRouterDOM.Route path="/chat" element={<ChatbotPage />} />
        <ReactRouterDOM.Route path="/profile" element={<ProfilePage />} />
      </ReactRouterDOM.Route>

      {/* Fallback */}
      <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/" />} />
    </ReactRouterDOM.Routes>
  );
};

const App: React.FC = () => {
  // Use HashRouter to avoid server config for client-side routes
  return (
    <ReactRouterDOM.HashRouter>
      <AppRoutes />
    </ReactRouterDOM.HashRouter>
  );
};

export default App;
