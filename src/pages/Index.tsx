import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import InfoCard from "../components/ui/InfoCard";
import { Brain, Microscope, Pill, Stethoscope } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            AI-Powered Medical Assistant
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            Empowering healthcare professionals with advanced AI technology for accurate disease prediction, drug recommendations, and side effect analysis.
          </p>
          <Button
            onClick={() => navigate("/patient-analysis")}
            className="text-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Get Started
          </Button>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight text-gray-900">
            Key Features
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={<Brain className="h-6 w-6" />}
              title="Disease Prediction"
              subtitle="Advanced AI analysis of patient data"
            >
              Leverage machine learning to predict potential diseases based on patient symptoms and medical history.
            </InfoCard>

            <InfoCard
              icon={<Pill className="h-6 w-6" />}
              title="Drug Recommendations"
              subtitle="Personalized medication suggestions"
            >
              Get AI-powered drug recommendations tailored to specific conditions and patient profiles.
            </InfoCard>

            <InfoCard
              icon={<Microscope className="h-6 w-6" />}
              title="Side Effect Analysis"
              subtitle="Comprehensive drug interaction checks"
            >
              Analyze potential drug interactions and side effects to ensure safe medication combinations.
            </InfoCard>

            <InfoCard
              icon={<Stethoscope className="h-6 w-6" />}
              title="Patient Analysis"
              subtitle="Detailed health insights"
            >
              Generate comprehensive patient health analysis with actionable insights and recommendations.
            </InfoCard>
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-xl bg-blue-50 p-8 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900">
            Ready to Transform Your Practice?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-gray-600">
            Join healthcare professionals worldwide who are using our AI-powered platform to enhance their medical practice and improve patient care.
          </p>
          <Button
            onClick={() => navigate("/patient-analysis")}
            className="text-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Start Your Analysis
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
