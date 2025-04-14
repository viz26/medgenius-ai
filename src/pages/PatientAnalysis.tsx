import * as React from "react";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/ui/GlassCard";
import { Search, ArrowRight, FileText, RotateCcw, Info, Shield, Tag, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { fetchOpenAI, parseAIResponse, deepParseJsonStrings } from "@/utils/apiService";

const PatientAnalysis = () => {
  const [patientInfo, setPatientInfo] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalysis = async () => {
    if (!patientInfo.trim()) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter patient information.",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setAnalysis(null);

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
      const prompt = `Analyze the following patient information and provide a comprehensive medical analysis. 
      Patient Information: ${patientInfo}
      
      Please provide your analysis in the following JSON format:
      {
        "diagnosis": [
          {
            "condition": "string",
            "confidenceLevel": "string",
            "description": "string"
          }
        ],
        "riskFactors": [
          {
            "factor": "string",
            "impact": "string",
            "description": "string"
          }
        ],
        "recommendations": [
          {
            "recommendation": "string",
            "reason": "string",
            "priority": "string"
          }
        ],
        "nextSteps": [
          {
            "step": "string",
            "reason": "string",
            "timeline": "string"
          }
        ]
      }
      
      Ensure all sections are properly filled with relevant medical information. Each section should contain at least 3 items.`;

      const response = await fetchOpenAI({
        prompt,
        systemMessage: "You are a medical AI assistant specialized in analyzing patient information and providing comprehensive medical insights. Always respond with valid JSON in the specified format. Include detailed recommendations and next steps.",
        temperature: 0.7,
        maxTokens: 2000
      });
      
      const content = response.choices[0].message.content;
      const result = parseAIResponse(content);
      
      if (!result || typeof result !== 'object') {
        throw new Error("Invalid analysis response format");
      }

      const processedResult = deepParseJsonStrings(result);
      
      // Validate the processed result
      if (!processedResult.diagnosis || !processedResult.riskFactors || 
          !processedResult.recommendations || !processedResult.nextSteps) {
        throw new Error("Missing required analysis sections");
      }

      // Ensure arrays are properly formatted
      if (!Array.isArray(processedResult.recommendations)) {
        processedResult.recommendations = [processedResult.recommendations];
      }
      if (!Array.isArray(processedResult.nextSteps)) {
        processedResult.nextSteps = [processedResult.nextSteps];
      }

      setAnalysis(processedResult);
      clearInterval(interval);
      setProgress(100);

      toast({
        title: "Analysis complete",
        description: "Patient analysis has been generated successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Error during analysis. Please try again.",
      });
      clearInterval(interval);
      setProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProceedToRecommendations = () => {
    if (!analysis) {
      toast({
        variant: "destructive",
        title: "No analysis available",
        description: "Please complete the patient analysis first.",
      });
      return;
    }
    
    // Store both the analysis and patient information
    const dataToStore = {
      analysis,
      patientInfo
    };
    
    localStorage.setItem('patientAnalysis', JSON.stringify(dataToStore));
    
    // Navigate to drug recommendations page
    navigate('/drug-recommendation');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto py-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              AI-Powered Patient Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Get comprehensive medical analysis based on patient information.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6 animate-slide-up">
              <GlassCard className="h-full">
                <h2 className="text-xl font-semibold mb-6">Enter Patient Information</h2>
                
                <div className="space-y-6">
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

                  <Button 
                    className="w-full" 
                    onClick={handleAnalysis}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Analyze Patient Data
                      </>
                    )}
                  </Button>

                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Analyzing patient data</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <GlassCard className="h-full">
                <h2 className="text-xl font-semibold mb-6">Analysis Results</h2>
                
                {!analysis ? (
                  <div className="text-center py-20 text-muted-foreground">
                    {isAnalyzing ? (
                      <div className="space-y-4">
                        <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                        <p>Analyzing patient data...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Search className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p>Enter patient information to see analysis results</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">Diagnosis</h3>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          {Array.isArray(analysis.diagnosis) ? (
                            analysis.diagnosis.map((item: any, index: number) => (
                              <div key={index} className="mb-2">
                                {typeof item === 'object' ? (
                                  <div>
                                    <div className="font-medium">{item.condition}</div>
                                    {item.confidenceLevel && (
                                      <div className="text-sm text-muted-foreground">
                                        Confidence: {item.confidenceLevel}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>{item}</div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div>
                              {typeof analysis.diagnosis === 'object' ? (
                                <div>
                                  <div className="font-medium">{analysis.diagnosis.condition}</div>
                                  {analysis.diagnosis.confidenceLevel && (
                                    <div className="text-sm text-muted-foreground">
                                      Confidence: {analysis.diagnosis.confidenceLevel}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>{analysis.diagnosis}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">Risk Factors</h3>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          {Array.isArray(analysis.riskFactors) ? (
                            analysis.riskFactors.map((item: any, index: number) => (
                              <div key={index} className="mb-2">
                                {typeof item === 'object' ? (
                                  <div>
                                    <div className="font-medium">{item.factor}</div>
                                    {item.impact && (
                                      <div className="text-sm text-muted-foreground">
                                        Impact: {item.impact}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>{item}</div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div>
                              {typeof analysis.riskFactors === 'object' ? (
                                <div>
                                  <div className="font-medium">{analysis.riskFactors.factor}</div>
                                  {analysis.riskFactors.impact && (
                                    <div className="text-sm text-muted-foreground">
                                      Impact: {analysis.riskFactors.impact}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>{analysis.riskFactors}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">Recommendations</h3>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          {Array.isArray(analysis.recommendations) ? (
                            analysis.recommendations.map((item: any, index: number) => (
                              <div key={index} className="mb-2">
                                {typeof item === 'object' ? (
                                  <div>
                                    <div className="font-medium">{item.recommendation}</div>
                                    {item.reason && (
                                      <div className="text-sm text-muted-foreground">
                                        Reason: {item.reason}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>{item}</div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div>
                              {typeof analysis.recommendations === 'object' ? (
                                <div>
                                  <div className="font-medium">{analysis.recommendations.recommendation}</div>
                                  {analysis.recommendations.reason && (
                                    <div className="text-sm text-muted-foreground">
                                      Reason: {analysis.recommendations.reason}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>{analysis.recommendations}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">Next Steps</h3>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          {Array.isArray(analysis.nextSteps) ? (
                            analysis.nextSteps.map((item: any, index: number) => (
                              <div key={index} className="mb-2">
                                {typeof item === 'object' ? (
                                  <div>
                                    <div className="font-medium">{item.step}</div>
                                    {item.reason && (
                                      <div className="text-sm text-muted-foreground">
                                        Reason: {item.reason}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>{item}</div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div>
                              {typeof analysis.nextSteps === 'object' ? (
                                <div>
                                  <div className="font-medium">{analysis.nextSteps.step}</div>
                                  {analysis.nextSteps.reason && (
                                    <div className="text-sm text-muted-foreground">
                                      Reason: {analysis.nextSteps.reason}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>{analysis.nextSteps}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleProceedToRecommendations}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Proceed to Recommendations
                      </Button>
                    </div>
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

export default PatientAnalysis;
