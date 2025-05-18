import { useFormContext } from "@/contexts/FormContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StepIndicator from "@/components/StepIndicator";
import ImageUploader from "@/components/ImageUploader";
import MultiImageUploader from "@/components/MultiImageUploader";
import AgeGroupSelector from "@/components/AgeGroupSelector";
import HealthConditionsSelector from "@/components/HealthConditionsSelector";
import AnalysisInProgress from "@/components/AnalysisInProgress";
import AnalysisResults from "@/components/AnalysisResults";
import ProductReport from "@/components/ProductReport";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import React, { useState, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { User } from "lucide-react";

export default function Home() {
  const { 
    currentStep, 
    setCurrentStep, 
    formData, 
    setFormData,
    isAnalyzing,
    setIsAnalyzing,
    analysisResults,
    setAnalysisResults,
    setAnalysisProgress,
    setCurrentAnalysisPhase,
    resetForm
  } = useFormContext();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("ingredient-analysis");
  
  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && !formData.productImage) {
      toast({
        title: "No image selected",
        description: "Please upload a product image to continue.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(currentStep + 1);
  }, [currentStep, formData.productImage, setCurrentStep, toast]);

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleAnalyzeProduct = async () => {
    if (formData.healthConditions.length === 0) {
      toast({
        title: "No health conditions selected",
        description: "Please select at least one health condition to continue.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(3);
    setIsAnalyzing(true);
    
    try {
      setAnalysisProgress(30);
      setCurrentAnalysisPhase("Extracting text from image");
      
      const formDataToSend = new FormData();
      formDataToSend.append('image', formData.productImage as Blob);
      
      const ocrResponse = await apiRequest("POST", "/api/ocr", formDataToSend);
      const { text } = await ocrResponse.json();
      
      setFormData(prev => ({ ...prev, extractedText: text }));
      
      setAnalysisProgress(60);
      setCurrentAnalysisPhase("Analyzing with AI");
      
      const analysisResponse = await apiRequest("POST", "/api/analyze", {
        ageGroup: formData.ageGroup,
        healthConditions: formData.healthConditions.map(c => c.name),
        additionalConditions: formData.additionalConditions,
        healthNotes: formData.healthNotes,
        extractedText: text
      });
      
      const results = await analysisResponse.json();
      
      setAnalysisProgress(100);
      setCurrentAnalysisPhase("Completing analysis");
      
      setTimeout(() => {
        setAnalysisResults(results);
        setIsAnalyzing(false);
      }, 500);
      
    } catch (error) {
      console.error("Analysis error:", error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your product. Please try again.",
        variant: "destructive",
      });
      setCurrentStep(2);
    }
  };

  const handleGenerateReport = () => {
    setCurrentStep(4);
  };

  const handleStartOver = () => {
    resetForm();
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <StepIndicator currentStep={currentStep} />
        </div>
        
        {currentStep === 1 && (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-3">
              Safe Food for Little Ones
            </h1>
            <p className="text-gray-600">
              Upload a photo of the ingredients and get personalized nutrition advice.
            </p>
          </div>
        )}

        <div id="step-content-container">
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div className="bg-white p-6 rounded border">
              <h2 className="text-xl font-semibold mb-4">Upload Product Images</h2>
              <p className="text-gray-600 mb-6">Upload clear images of the product ingredients list.</p>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">New!</span>
                  <p className="text-sm text-gray-600">You can upload multiple images</p>
                </div>
                <MultiImageUploader />
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <Link href="/profile">
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Manage Profiles
                  </Button>
                </Link>
                
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleNextStep}
                >
                  Continue to Health Details →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Health Details */}
          {currentStep === 2 && (
            <div className="bg-white p-6 rounded border">
              <h2 className="text-xl font-semibold mb-4">Health Details</h2>
              <p className="text-gray-600 mb-6">Provide information about who will be using this product.</p>
              
              <form className="space-y-6">
                <AgeGroupSelector />
                
                <HealthConditionsSelector />
                
                <div>
                  <Label htmlFor="health-notes" className="text-sm font-medium mb-1">
                    Additional Health Notes
                  </Label>
                  <Textarea 
                    id="health-notes" 
                    rows={4} 
                    placeholder="Share any other relevant health information..."
                    value={formData.healthNotes}
                    onChange={(e) => setFormData({...formData, healthNotes: e.target.value})}
                    className="block w-full border rounded p-2"
                  />
                </div>
              </form>
              
              <div className="mt-6 flex justify-between">
                <Button 
                  variant="outline"
                  onClick={handlePrevStep}
                >
                  ← Back to Upload
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAnalyzeProduct}
                >
                  Analyze Product →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Analysis */}
          {currentStep === 3 && (
            <div className="bg-white p-6 rounded border">
              {isAnalyzing ? (
                <AnalysisInProgress />
              ) : (
                analysisResults && (
                  <AnalysisResults 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onGenerateReport={handleGenerateReport}
                    onBack={handlePrevStep}
                  />
                )
              )}
            </div>
          )}

          {/* Step 4: Report */}
          {currentStep === 4 && (
            <div className="bg-white p-6 rounded border">
              <ProductReport onStartOver={handleStartOver} />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
