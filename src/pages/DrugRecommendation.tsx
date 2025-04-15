import * as React from "react";
import { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/ui/GlassCard";
import { Search, ArrowRight, Pill, RotateCcw, Info, Shield, Tag, Loader2, AlertTriangle, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { fetchOpenAI, parseAIResponse, deepParseJsonStrings } from "@/utils/apiService";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Disclaimer } from "@/components/ui/Disclaimer";
import { useAuth } from "@/contexts/AuthContext";

const DrugRecommendation = () => {
  const [patientInfo, setPatientInfo] = useState("");
  const [disease, setDisease] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("patient");
  const { toast } = useToast();
  const { user } = useAuth();

  // Clear stored data when component unmounts or user logs out
  useEffect(() => {
    return () => {
      localStorage.removeItem('patientAnalysis');
    };
  }, []);

  // Clear stored data when user changes
  useEffect(() => {
    if (!user) {
      setPatientInfo("");
      setDisease("");
      setRecommendations(null);
      localStorage.removeItem('patientAnalysis');
    }
  }, [user]);

  // Load stored data only once when component mounts
  useEffect(() => {
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
        localStorage.removeItem('patientAnalysis');
      }
    }
  }, []);

  const clearPatientData = () => {
    setPatientInfo("");
    setDisease("");
    setRecommendations(null);
    localStorage.removeItem('patientAnalysis');
    toast({
      title: "Data cleared",
      description: "Patient information has been cleared.",
    });
  };

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

  const generatePDF = async () => {
    if (!recommendations) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add header with border bottom
      pdf.setFontSize(24);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Drug Recommendation Report', pdfWidth / 2, 20, { align: 'center' });
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 25, pdfWidth - 20, 25);
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, pdfWidth / 2, 35, { align: 'center' });
      
      let yPos = 50;
      
      // Add search criteria section with border
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Search Criteria', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      if (activeTab === 'patient') {
        const patientInfoLines = pdf.splitTextToSize(patientInfo, pdfWidth - 40);
        pdf.text(patientInfoLines, 20, yPos);
        yPos += (patientInfoLines.length * 7) + 10;
      } else {
        const diseaseLines = pdf.splitTextToSize(disease, pdfWidth - 40);
        pdf.text(diseaseLines, 20, yPos);
        yPos += (diseaseLines.length * 7) + 10;
      }
      pdf.line(20, yPos - 5, pdfWidth - 20, yPos - 5);
      yPos += 10;

      // Add recommendations section with border
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Drug Recommendations', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      
      recommendations.forEach((rec: any, index: number) => {
        // Check if we need a new page
        if (yPos > pdfHeight - 60) {
          pdf.addPage();
          yPos = 20;
        }

        // Drug name
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${rec.drugName}`, 20, yPos);
        yPos += 10;

        // Dosage
        if (rec.dosage) {
          pdf.setFont(undefined, 'bold');
          pdf.text('Dosage:', 25, yPos);
          pdf.setFont(undefined, 'normal');
          const dosageLines = pdf.splitTextToSize(rec.dosage, pdfWidth - 60);
          pdf.text(dosageLines, 70, yPos);
          yPos += (dosageLines.length * 7);
        }

        // Side Effects
        if (rec.sideEffects) {
          pdf.setFont(undefined, 'bold');
          pdf.text('Side Effects:', 25, yPos);
          pdf.setFont(undefined, 'normal');
          const sideEffectLines = pdf.splitTextToSize(rec.sideEffects, pdfWidth - 60);
          pdf.text(sideEffectLines, 70, yPos);
          yPos += (sideEffectLines.length * 7);
        }

        // Precautions
        if (rec.precautions) {
          pdf.setFont(undefined, 'bold');
          pdf.text('Precautions:', 25, yPos);
          pdf.setFont(undefined, 'normal');
          const precautionLines = pdf.splitTextToSize(rec.precautions, pdfWidth - 60);
          pdf.text(precautionLines, 70, yPos);
          yPos += (precautionLines.length * 7);
        }

        // Reason
        if (rec.reason) {
          pdf.setFont(undefined, 'bold');
          pdf.text('Reason:', 25, yPos);
          pdf.setFont(undefined, 'normal');
          const reasonLines = pdf.splitTextToSize(rec.reason, pdfWidth - 60);
          pdf.text(reasonLines, 70, yPos);
          yPos += (reasonLines.length * 7);
        }

        yPos += 10; // Add space between recommendations
        pdf.line(20, yPos - 5, pdfWidth - 20, yPos - 5);
        yPos += 10;
      });
      
      // Add border around the entire content
      pdf.setDrawColor(180, 180, 180);
      pdf.rect(15, 15, pdfWidth - 30, pdfHeight - 25);
      
      // Add footer with border top
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.line(20, pdfHeight - 15, pdfWidth - 20, pdfHeight - 15);
      pdf.text('Generated by MedGenius AI', pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      
      // Save the PDF
      pdf.save('drug-recommendations-report.pdf');
      
      toast({
        title: "Report Generated",
        description: "Your drug recommendations report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not generate the drug recommendations report",
      });
    }
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Drug Recommendation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized drug recommendations based on patient information or specific diseases.
          </p>
        </div>

        <div className="space-y-8">
          <div className="animate-slide-up">
            <GlassCard className="h-full">
              <h2 className="text-xl font-semibold mb-6">Enter Information</h2>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="patient">Patient Information</TabsTrigger>
                  <TabsTrigger value="disease">Disease Name</TabsTrigger>
                </TabsList>
                
                <TabsContent value="patient" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Enter Patient Information</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearPatientData}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Clear Data
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter patient details, medical history, current medications, etc."
                    className="min-h-[150px]"
                    value={patientInfo}
                    onChange={e => setPatientInfo(e.target.value)}
                  />
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Drug Recommendations</h2>
                {recommendations && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generatePDF}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export Report
                  </Button>
                )}
              </div>
              
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
                    <>
                      {recommendations.map((rec: any, index: number) => (
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
                      ))}

                      {/* Drug Interactions Section */}
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-yellow-200">
                        <h3 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Potential Drug Interactions
                        </h3>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            The following potential interactions have been identified between the recommended medications:
                          </p>
                          
                          <div className="space-y-3">
                            {recommendations.length > 1 && (
                              <div className="bg-yellow-50 p-4 rounded-lg">
                                <h4 className="font-medium text-yellow-800 mb-2">
                                  {recommendations[0].drugName} + {recommendations[1].drugName}
                                </h4>
                                <p className="text-sm text-yellow-700">
                                  These medications may interact and cause increased side effects. 
                                  Please consult your healthcare provider before taking them together.
                                </p>
                              </div>
                            )}
                            
                            {recommendations.length > 2 && (
                              <div className="bg-yellow-50 p-4 rounded-lg">
                                <h4 className="font-medium text-yellow-800 mb-2">
                                  {recommendations[1].drugName} + {recommendations[2].drugName}
                                </h4>
                                <p className="text-sm text-yellow-700">
                                  These medications may affect each other's effectiveness. 
                                  Your doctor may need to adjust the dosages.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Important Notes:</h4>
                            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                              <li>Always inform your healthcare provider about all medications you are taking</li>
                              <li>Read medication labels carefully for interaction warnings</li>
                              <li>Report any unusual symptoms to your doctor immediately</li>
                              <li>Keep a list of all your medications, including over-the-counter drugs</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
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

        {recommendations && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recommendations</h2>
              <Button
                onClick={generatePDF}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec: any, index: number) => (
                <GlassCard key={index} className="p-6">
                  <div className="flex items-center mb-4">
                    <Pill className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-xl font-semibold">{rec.drugName}</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Dosage</h4>
                      <p className="mt-1">{rec.dosage}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Side Effects</h4>
                      <p className="mt-1">{rec.sideEffects}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Precautions</h4>
                      <p className="mt-1">{rec.precautions}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Reason</h4>
                      <p className="mt-1">{rec.reason}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        <Disclaimer className="mt-16" />
      </div>
    </PageContainer>
  );
};

export default DrugRecommendation;
