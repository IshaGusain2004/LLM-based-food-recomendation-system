import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfileManager from "@/components/UserProfileManager";
import MealPlanner from "@/components/MealPlanner";
import { useFormContext } from "@/contexts/FormContext";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Calendar, Camera, History, Home, Plus, User, 
  Trash2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const { 
    analysisHistory, 
    userProfile, 
    mealPlans, 
    addToHistory,
    removeFromHistory,
    setAnalysisResults,
    setCurrentStep,
    activeChildId,
    getActiveChild
  } = useFormContext();
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);
  
  const viewAnalysisResult = (result: any) => {
    setAnalysisResults(result);
    setCurrentStep(4);
    setLocation("/analyze");
  };
  
  const startNewAnalysis = () => {
    setLocation("/analyze");
  };
  
  const handleDeleteAnalysis = (analysisId: string) => {
    setAnalysisToDelete(analysisId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (analysisToDelete) {
      removeFromHistory(analysisToDelete);
      toast({
        title: "Analysis deleted",
        description: "The analysis report has been removed from your history",
      });
      setAnalysisToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const activeChild = getActiveChild();
  
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Header />
      
      <main className="flex-grow container py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            My Family Profiles
          </h1>
          <p className="text-gray-600">
            Manage your child profiles and view analysis history
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="profile" className="flex items-center justify-center">
              <User className="h-4 w-4 mr-2" /> Profiles
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center justify-center">
              <History className="h-4 w-4 mr-2" /> History
            </TabsTrigger>
            <TabsTrigger value="meal-plans" className="flex items-center justify-center">
              <Calendar className="h-4 w-4 mr-2" /> Meal Plans
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <UserProfileManager />
            
            <div className="mt-8 flex justify-center">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={startNewAnalysis}
                disabled={!activeChildId}
              >
                <Camera className="mr-2 h-4 w-4" />
                Analyze a Food Product
              </Button>
            </div>

            {!activeChildId && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-center">
                Please create and select a child profile before analyzing food products
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <div className="w-full max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <History className="inline-block mr-2 h-5 w-5" /> 
                  Analysis History
                </h2>
                
                {activeChildId && (
                  <Button 
                    onClick={startNewAnalysis}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Analysis
                  </Button>
                )}
              </div>
              
              {!activeChildId ? (
                <div className="text-center py-8 bg-white rounded border">
                  <User className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-lg font-semibold">No Child Selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Please select a child profile to view their analysis history
                  </p>
                  <Button className="mt-4" onClick={() => document.getElementById('profile-tab')?.click()}>
                    Go to Profiles
                  </Button>
                </div>
              ) : analysisHistory.length === 0 ? (
                <div className="text-center py-8 bg-white rounded border">
                  <BarChart3 className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-lg font-semibold">No Analysis History</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeChild?.name}'s product analysis history will appear here
                  </p>
                  <Button 
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={startNewAnalysis}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Analyze a Product
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {analysisHistory.map((analysis) => (
                    <div key={analysis.id} className="bg-white p-4 rounded border">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div>
                          <h3 className="text-lg font-semibold">{analysis.productName}</h3>
                          <p className="text-sm text-gray-600">
                            {analysis.productCategory} • 
                            {analysis.timestamp 
                              ? ` Analyzed ${formatDistanceToNow(analysis.timestamp, { addSuffix: true })}` 
                              : ' Recently analyzed'}
                            {activeChild && ` • For ${activeChild.name}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            analysis.suitability === "Good" 
                              ? "bg-green-100 text-green-800" 
                              : analysis.suitability === "Moderate" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {analysis.suitability}
                          </span>
                          <Button 
                            variant="outline" 
                            onClick={() => viewAnalysisResult(analysis)}>
                            View Details
                          </Button>
                          <Button 
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteAnalysis(analysis.id || '')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        {analysis.ingredients.slice(0, 5).map((ingredient, idx) => (
                          <span 
                            key={idx}
                            className={`px-2 py-1 rounded text-xs ${
                              ingredient.safety === "Safe" 
                                ? "bg-green-50 text-green-700 border border-green-200" 
                                : ingredient.safety === "Moderate" 
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200" 
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {ingredient.name}
                          </span>
                        ))}
                        {analysis.ingredients.length > 5 && (
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 border border-gray-200">
                            +{analysis.ingredients.length - 5} more
                          </span>
                        )}
                      </div>
                      
                      {analysis.specialWarnings && analysis.specialWarnings.length > 0 && (
                        <div className="mt-2 text-yellow-700 text-sm">
                          <strong>Warning:</strong> {analysis.specialWarnings[0].title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="meal-plans">
            <MealPlanner />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}