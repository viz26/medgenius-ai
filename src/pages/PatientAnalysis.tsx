import * as React from "react";
import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/ui/GlassCard";
import { Search, ArrowRight, FileText, RotateCcw, Info, Shield, Tag, Loader2, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { fetchOpenAI, parseAIResponse, deepParseJsonStrings } from "@/utils/apiService";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Disclaimer } from "@/components/ui/Disclaimer";

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
      setProgress(prev => Math.min(prev + 5, 90));
    }, 500);

    const maxRetries = 3;
    let currentTry = 0;

    while (currentTry < maxRetries) {
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
        }`;

        const response = await fetchOpenAI({
          prompt,
          systemMessage: "You are a medical AI assistant specialized in analyzing patient information and providing comprehensive medical insights. Always respond with valid JSON in the specified format.",
          temperature: 0.7,
          maxTokens: 1500
        });
        
        if (!response?.choices?.[0]?.message?.content) {
          throw new Error("Invalid API response format");
        }

        const content = response.choices[0].message.content;
        const result = parseAIResponse(content);
        
        if (!result || typeof result !== 'object') {
          throw new Error("Invalid analysis response format");
        }

        const processedResult = deepParseJsonStrings(result);
        
        if (!processedResult.diagnosis || !processedResult.riskFactors || 
            !processedResult.recommendations || !processedResult.nextSteps) {
          throw new Error("Missing required analysis sections");
        }

        setAnalysis(processedResult);
        clearInterval(interval);
        setProgress(100);

        toast({
          title: "Analysis complete",
          description: "Patient analysis has been generated successfully.",
        });
        break;
      } catch (error) {
        currentTry++;
        console.error(`Analysis attempt ${currentTry} failed:`, error);
        
        if (currentTry === maxRetries) {
          toast({
            variant: "destructive",
            title: "Analysis failed",
            description: "Unable to complete analysis after multiple attempts. Please try again.",
          });
          clearInterval(interval);
          setProgress(0);
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    setIsAnalyzing(false);
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

  const generatePDF = async () => {
    if (!analysis) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add header with border bottom
      pdf.setFontSize(24);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Patient Analysis Report', pdfWidth / 2, 20, { align: 'center' });
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 25, pdfWidth - 20, 25);
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, pdfWidth / 2, 35, { align: 'center' });
      
      // Add patient information section
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      let yPos = 50;
      
      // Add patient info section with border
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Patient Information', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const patientInfoLines = pdf.splitTextToSize(patientInfo, pdfWidth - 40);
      pdf.text(patientInfoLines, 20, yPos);
      yPos += (patientInfoLines.length * 7) + 10;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(20, yPos - 5, pdfWidth - 20, yPos - 5);
      yPos += 10;

      // Add diagnosis section with border
      if (analysis.diagnosis) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Diagnosis', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        
        if (Array.isArray(analysis.diagnosis)) {
          analysis.diagnosis.forEach((item: any) => {
            if (typeof item === 'object') {
              pdf.setFont(undefined, 'bold');
              pdf.text(item.condition, 25, yPos);
              yPos += 7;
              
              if (item.confidenceLevel) {
                pdf.setFont(undefined, 'normal');
                pdf.text(`Confidence: ${item.confidenceLevel}`, 30, yPos);
                yPos += 7;
              }
              
              if (item.description) {
                const descLines = pdf.splitTextToSize(item.description, pdfWidth - 60);
                pdf.text(descLines, 30, yPos);
                yPos += (descLines.length * 7);
              }
            } else {
              pdf.text(item.toString(), 25, yPos);
              yPos += 7;
            }
            yPos += 3;
          });
        }
        yPos += 5;
        pdf.line(20, yPos - 5, pdfWidth - 20, yPos - 5);
        yPos += 10;
      }

      // Check if we need a new page
      if (yPos > pdfHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }

      // Add risk factors section with border
      if (analysis.riskFactors) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Risk Factors', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        
        if (Array.isArray(analysis.riskFactors)) {
          analysis.riskFactors.forEach((item: any) => {
            if (typeof item === 'object') {
              pdf.setFont(undefined, 'bold');
              pdf.text(item.factor, 25, yPos);
              yPos += 7;
              
              if (item.impact) {
                pdf.setFont(undefined, 'normal');
                pdf.text(`Impact: ${item.impact}`, 30, yPos);
                yPos += 7;
              }
              
              if (item.description) {
                const descLines = pdf.splitTextToSize(item.description, pdfWidth - 60);
                pdf.text(descLines, 30, yPos);
                yPos += (descLines.length * 7);
              }
            } else {
              pdf.text(item.toString(), 25, yPos);
              yPos += 7;
            }
            yPos += 3;
          });
        }
        yPos += 5;
        pdf.line(20, yPos - 5, pdfWidth - 20, yPos - 5);
        yPos += 10;
      }

      // Check if we need a new page
      if (yPos > pdfHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }

      // Add recommendations section with border
      if (analysis.recommendations) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Recommendations', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        
        if (Array.isArray(analysis.recommendations)) {
          analysis.recommendations.forEach((item: any) => {
            if (typeof item === 'object') {
              pdf.setFont(undefined, 'bold');
              pdf.text(item.recommendation, 25, yPos);
              yPos += 7;
              
              if (item.reason) {
                pdf.setFont(undefined, 'normal');
                const reasonLines = pdf.splitTextToSize(`Reason: ${item.reason}`, pdfWidth - 60);
                pdf.text(reasonLines, 30, yPos);
                yPos += (reasonLines.length * 7);
              }
              
              if (item.priority) {
                pdf.text(`Priority: ${item.priority}`, 30, yPos);
                yPos += 7;
              }
            } else {
              pdf.text(item.toString(), 25, yPos);
              yPos += 7;
            }
            yPos += 3;
          });
        }
        yPos += 5;
        pdf.line(20, yPos - 5, pdfWidth - 20, yPos - 5);
        yPos += 10;
      }

      // Check if we need a new page
      if (yPos > pdfHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }

      // Add next steps section with border
      if (analysis.nextSteps) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Next Steps', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        
        if (Array.isArray(analysis.nextSteps)) {
          analysis.nextSteps.forEach((item: any, index: number) => {
            if (typeof item === 'object') {
              pdf.setFont(undefined, 'bold');
              pdf.text(item.step, 25, yPos);
              yPos += 7;
              
              if (item.reason) {
                pdf.setFont(undefined, 'normal');
                const reasonLines = pdf.splitTextToSize(`Reason: ${item.reason}`, pdfWidth - 60);
                pdf.text(reasonLines, 30, yPos);
                yPos += (reasonLines.length * 7);
              }
              
              if (item.timeline) {
                pdf.text(`Timeline: ${item.timeline}`, 30, yPos);
                yPos += 7;
              }
            } else {
              pdf.text(item.toString(), 25, yPos);
              yPos += 7;
            }
            yPos += 3;
          });
        }
        yPos += 5;
        pdf.line(20, yPos - 5, pdfWidth - 20, yPos - 5);
      }

      // Add border around the entire content
      pdf.setDrawColor(180, 180, 180);
      pdf.rect(15, 15, pdfWidth - 30, pdfHeight - 25);
      
      // Add footer with border top
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.line(20, pdfHeight - 15, pdfWidth - 20, pdfHeight - 15);
      pdf.text('Generated by MedGenius AI', pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      
      // Save the PDF
      pdf.save('patient-analysis-report.pdf');
      
      toast({
        title: "Report Generated",
        description: "Your patient analysis report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not generate the patient analysis report",
      });
    }
  };

      return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Patient Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze patient information to get comprehensive medical insights and recommendations.
          </p>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">Patient Analysis</h1>
              <p className="text-gray-600">
                Enter patient information, symptoms, and medical history for AI-powered analysis.
            </p>
          </div>

            <div className="space-y-8">
              <div className="animate-slide-up">
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
                  <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Analysis Results</h2>
                    {analysis && (
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
        </div>
      
        <Disclaimer className="mt-16" />
    </div>
    </PageContainer>
  );
};

export default PatientAnalysis;
