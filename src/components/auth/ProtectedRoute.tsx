
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication with server
    const checkAuth = async () => {
      try {
        // In a real implementation, this would be an API call to verify the session
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // For demo purposes, we're still using localStorage but simulating a token check
        // In production, this would be a fetch to your authentication endpoint
        setTimeout(() => {
          setIsAuthenticated(true);
          setIsLoading(false);
        }, 300);
      } catch (error) {
        console.error("Auth verification failed:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">Verifying authentication...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
