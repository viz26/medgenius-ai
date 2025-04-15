import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import PatientAnalysis from "./pages/PatientAnalysis";
import DrugRecommendation from "./pages/DrugRecommendation";
import DrugDiscovery from "./pages/DrugDiscovery";
import SideEffects from "./pages/SideEffects";
import Documentation from "./pages/Documentation";
import ApiReference from "./pages/ApiReference";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
          <Navbar />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/patient-analysis" 
                element={
                  <ProtectedRoute>
                    <PatientAnalysis />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/drug-recommendation" 
                element={
                  <ProtectedRoute>
                    <DrugRecommendation />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/drug-discovery"
                element={
                  <ProtectedRoute>
                    <DrugDiscovery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/side-effects"
                element={
                  <ProtectedRoute>
                    <SideEffects />
                  </ProtectedRoute>
                }
              />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/api-reference" element={<ApiReference />} />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
