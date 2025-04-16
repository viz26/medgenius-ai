import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import PrivateRoute from '@/components/PrivateRoute';
import { AdminRoute } from '@/components/AdminRoute';
import PublicRoute from '@/components/PublicRoute';
import Footer from '@/components/layout/Footer';
import { DidYouKnow } from '@/components/ui/DidYouKnow';
import Layout from '@/components/layout/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import PatientAnalysis from '@/pages/PatientAnalysis';
import DrugDiscovery from '@/pages/DrugDiscovery';
import SideEffects from '@/pages/SideEffects';
import AdminDashboard from '@/pages/AdminDashboard';
import UserManagement from '@/pages/UserManagement';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import PatientDashboard from '@/pages/PatientDashboard';
import AnalysisResults from '@/pages/AnalysisResults';
import DrugRecommendation from './pages/DrugRecommendation';
import Documentation from './pages/Documentation';
import ApiReference from './pages/ApiReference';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

// Wrapper component to conditionally render DidYouKnow
const DidYouKnowWrapper = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Only show on home page when logged in
  if (!user || location.pathname !== '/home') {
    return null;
  }
  
  return <DidYouKnow />;
};

// Wrapper component to conditionally render Footer
const FooterWrapper = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  if (!user || isLoginPage) return null;
  return <Footer />;
};

// Main app content component
const AppContent = () => {
  useSessionTimeout();

  return (
    <>
      <ScrollToTop />
      <Toaster />
      <DidYouKnowWrapper />
      <Routes>
        {/* Public Routes - Accessible to everyone */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - Require authentication */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Layout><Home /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/patient" element={<Layout><PatientDashboard /></Layout>} />
          <Route path="/patient-analysis" element={<Layout><PatientAnalysis /></Layout>} />
          <Route path="/patient/analysis" element={<Layout><PatientAnalysis /></Layout>} />
          <Route path="/patient/analysis/:id" element={<Layout><AnalysisResults /></Layout>} />
          <Route path="/drug-discovery" element={<Layout><DrugDiscovery /></Layout>} />
          <Route path="/side-effects" element={<Layout><SideEffects /></Layout>} />
          <Route path="/drug-recommendation" element={<Layout><DrugRecommendation /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/patient-dashboard" element={<Layout><PatientDashboard /></Layout>} />
          <Route path="/analysis-results" element={<Layout><AnalysisResults /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/about" element={<Layout><AboutUs /></Layout>} />
          <Route path="/contact" element={<Layout><ContactUs /></Layout>} />
        </Route>

        {/* Documentation Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/documentation" element={<Layout><Documentation /></Layout>} />
          <Route path="/api-reference" element={<Layout><ApiReference /></Layout>} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
          <Route path="/admin/users" element={<Layout><UserManagement /></Layout>} />
          <Route path="/admin/settings" element={<Layout><Settings /></Layout>} />
        </Route>

        {/* Fallback for not found pages */}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
      <FooterWrapper />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
