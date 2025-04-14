import * as React from "react";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/ui/GlassCard";
import { Search, ArrowRight, Pill, RotateCcw, Info, Shield, Tag, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { fetchOpenAI, parseAIResponse, deepParseJsonStrings } from "@/utils/apiService";

const DrugRecommendation = () => {
  const [patientInfo, setPatientInfo] = useState("");
  const [disease, setDisease] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("patient");
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's stored patient information from the analysis page
    const storedData = localStorage.getItem('patientAnalysis');
    if (storedData) {
      try {
        const { patientInfo: storedPatientInfo } = JSON.parse(storedData);
        if (storedPatientInfo) {
          setPatientInfo(storedPatientInfo);
          setActiveTab("patient");
        }
      } catch (error) {
        console.error("Error parsing stored patient data:", error);
      }
    }
  }, []);

  const handleGenerateRecommendations = async () => {
    if (activeTab === "patient" && !patientInfo) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter patient information.",
      });
      return;
    }

    if (activeTab === "disease" && !disease) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter a disease name.",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setRecommendations(null);

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 90) {
          clearInterval(interval);
          return 90;
        }
        return newProgress;
      });
    }, 300);

    try {
      const prompt = activeTab === "patient" 
        ? `Based on the following patient information, provide drug recommendations in JSON format:
        Patient Information: ${patientInfo}
        
        Please provide your response in the following JSON format:
        {
          "recommendations": [
            {
              "drugName": "string",
              "dosage": "string",
              "sideEffects": "string",
              "precautions": "string",
              "reason": "string"
            }
          ]
        }
        
        Ensure the response is valid JSON and contains at least 3 drug recommendations.`
        : `Provide drug recommendations for treating the following disease in JSON format:
        Disease: ${disease}
        
        Please provide your response in the following JSON format:
        {
          "recommendations": [
            {
              "drugName": "string",
              "dosage": "string",
              "sideEffects": "string",
              "precautions": "string",
              "reason": "string"
            }
          ]
        }
        
        Ensure the response is valid JSON and contains at least 3 drug recommendations.`;

      const response = await fetchOpenAI({
        prompt,
        systemMessage: "You are a medical AI assistant specialized in providing drug recommendations. Always respond with valid JSON in the specified format. Do not include any text outside the JSON structure.",
        temperature: 0.7,
        maxTokens: 2000
      });
      
      const content = response.choices[0].message.content;
      const result = parseAIResponse(content);
      
      if (!result || typeof result !== 'object' || !result.recommendations) {
        throw new Error("Invalid recommendations response format");
      }

      const processedResult = deepParseJsonStrings(result);
      
      // Ensure recommendations is an array
      if (!Array.isArray(processedResult.recommendations)) {
        processedResult.recommendations = [processedResult.recommendations];
      }

      setRecommendations(processedResult.recommendations);
      clearInterval(interval);
      setProgress(100);

      toast({
        title: "Recommendations generated",
        description: "Drug recommendations have been generated successfully.",
      });
    } catch (error) {
      console.error("Recommendations error:", error);
      toast({
        variant: "destructive",
        title: "Recommendations failed",
        description: error instanceof Error ? error.message : "Error generating recommendations. Please try again.",
      });
      clearInterval(interval);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto py-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              AI-Powered Drug Recommendation
            </h1>
            <p className="text-lg text-muted-foreground">
              Get personalized drug recommendations based on patient information or specific diseases.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6 animate-slide-up">
              <GlassCard className="h-full">
                <h2 className="text-xl font-semibold mb-6">Enter Information</h2>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="patient">Patient Information</TabsTrigger>
                    <TabsTrigger value="disease">Disease Name</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="patient" className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Patient Information
                      </label>
                      <Textarea
                        placeholder="Enter patient details, medical history, current medications, etc."
                        className="min-h-[150px]"
                        value={patientInfo}
                        onChange={e => setPatientInfo(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="disease" className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Disease Name
                      </label>
                      <Input
                        placeholder="Enter the disease name"
                        value={disease}
                        onChange={e => setDisease(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button 
                  className="w-full mt-6" 
                  onClick={handleGenerateRecommendations}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Pill className="mr-2 h-4 w-4" />
                      Generate Recommendations
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Generating recommendations</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </GlassCard>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <GlassCard className="h-full">
                <h2 className="text-xl font-semibold mb-6">Drug Recommendations</h2>
                
                {!recommendations ? (
                  <div className="text-center py-20 text-muted-foreground">
                    {isGenerating ? (
                      <div className="space-y-4">
                        <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                        <p>Generating drug recommendations...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Search className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p>Enter information to see drug recommendations</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in">
                    {Array.isArray(recommendations) ? (
                      recommendations.map((rec: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                          <h3 className="text-lg font-semibold text-primary mb-3">{rec.drugName}</h3>
                          <div className="space-y-3">
                            <div>
                              <span className="font-medium">Dosage:</span> {rec.dosage}
                            </div>
                            <div>
                              <span className="font-medium">Side Effects:</span> {rec.sideEffects}
                            </div>
                            <div>
                              <span className="font-medium">Precautions:</span> {rec.precautions}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-primary mb-3">{recommendations.drugName}</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium">Dosage:</span> {recommendations.dosage}
                          </div>
                          <div>
                            <span className="font-medium">Side Effects:</span> {recommendations.sideEffects}
                          </div>
                          <div>
                            <span className="font-medium">Precautions:</span> {recommendations.precautions}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DrugRecommendation;
