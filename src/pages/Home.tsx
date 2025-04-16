import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Microscope, Shield, Upload, Search, FileText, Download, Pill } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { Logo } from '@/components/ui/Logo';
import MedicationStats from '@/components/MedicationStats';

const Home = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 xl:px-0 pt-28 pb-16 max-w-7xl">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">MedGenius AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your intelligent healthcare companion powered by advanced AI to revolutionize medical analysis, drug discovery, and patient care
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Login to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login?tab=register">
                <Button size="lg" variant="outline">Register Now</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20">
          <Link to="/patient/analysis" className="w-full">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow hover:bg-blue-50 h-full">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-3">Patient Analysis</h2>
              <p className="text-gray-600 text-center">
                Advanced AI-powered analysis of patient symptoms and medical history to provide accurate diagnostics and personalized treatment plans.
              </p>
              {user && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white">Access Now</Button>
                </div>
              )}
            </div>
          </Link>

          <Link to="/drug-recommendation" className="w-full">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow hover:bg-blue-50 h-full">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Pill className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-3">Drug Recommendation</h2>
              <p className="text-gray-600 text-center">
                Get personalized medication recommendations based on patient information or specific diseases using our advanced AI technology.
              </p>
              {user && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white">Access Now</Button>
                </div>
              )}
            </div>
          </Link>

          <Link to="/drug-discovery" className="w-full">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow hover:bg-blue-50 h-full">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Microscope className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-3">Drug Discovery</h2>
              <p className="text-gray-600 text-center">
                Cutting-edge research tools to accelerate the discovery of new drugs and treatment methods through machine learning algorithms.
              </p>
              {user && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white">Access Now</Button>
                </div>
              )}
            </div>
          </Link>

          <Link to="/side-effects" className="w-full">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow hover:bg-blue-50 h-full">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-3">Side Effects Analysis</h2>
              <p className="text-gray-600 text-center">
                Comprehensive analysis of potential drug interactions and side effects to ensure safer medications and better patient outcomes.
              </p>
              {user && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white">Access Now</Button>
                </div>
              )}
            </div>
          </Link>
        </div>

        <div className="mb-20">
          <MedicationStats />
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-100 rounded-full mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Documents</h3>
              <p className="text-gray-600">
                Upload patient medical records, symptoms, or research documents in PDF or DOC format.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-100 rounded-full mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-gray-600">
                Our advanced AI algorithm analyzes the data, identifies patterns, and generates insights.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. View Results</h3>
              <p className="text-gray-600">
                Review detailed analysis, including diagnoses, risk factors, and recommended treatments.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-100 rounded-full mb-4">
                <Download className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Download Reports</h3>
              <p className="text-gray-600">
                Download comprehensive PDF reports to share with patients or healthcare providers.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          {!user ? (
            <Link to="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
            MedGenius AI helps healthcare professionals make faster, more accurate diagnoses 
            and treatment decisions. Our platform is trusted by doctors, researchers, and medical 
            institutions worldwide.
          </p>
        </div>
        
        <Disclaimer className="mt-16" />
      </div>
    </div>
  );
};

export default Home; 