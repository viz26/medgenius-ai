import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index";
import PatientAnalysis from "./pages/PatientAnalysis";
import DiseasePrediction from "./pages/DiseasePrediction";
import DrugDiscovery from "./pages/DrugDiscovery";
import DrugRecommendation from "./pages/DrugRecommendation";
import SideEffects from "./pages/SideEffects";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import Documentation from "./pages/Documentation";
import ApiReference from "./pages/ApiReference";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect, useState } from "react";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status on app load
  useEffect(() => {
    // Just a small delay to prevent flickering of auth state
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="medgenius-theme">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          
          <Route path="/patient-analysis" element={
            <ProtectedRoute>
              <PatientAnalysis />
            </ProtectedRoute>
          } />
          
          <Route path="/disease-prediction" element={
            <ProtectedRoute>
              <DiseasePrediction />
            </ProtectedRoute>
          } />
          
          <Route path="/drug-discovery" element={
            <ProtectedRoute>
              <DrugDiscovery />
            </ProtectedRoute>
          } />
          
          <Route path="/drug-recommendation" element={
            <ProtectedRoute>
              <DrugRecommendation />
            </ProtectedRoute>
          } />
          
          <Route path="/side-effects" element={
            <ProtectedRoute>
              <SideEffects />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="/security" element={
            <ProtectedRoute>
              <Security />
            </ProtectedRoute>
          } />

          <Route path="/documentation" element={<Documentation />} />
          <Route path="/api-reference" element={<ApiReference />} />
          
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
