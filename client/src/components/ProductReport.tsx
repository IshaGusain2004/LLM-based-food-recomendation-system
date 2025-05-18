import { useFormContext } from "@/contexts/FormContext";
import { Button } from "@/components/ui/button";
import { FileDownIcon } from "lucide-react";
import { format } from "date-fns";
import { generatePDF } from "@/lib/pdf";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface ProductReportProps {
  onStartOver: () => void;
}

export default function ProductReport({ onStartOver }: ProductReportProps) {
  const { formData, analysisResults, addToHistory, activeChildId } = useFormContext();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  if (!analysisResults) return null;

  const handleDownloadPDF = () => {
    generatePDF(analysisResults, formData);
  };
  
  const handleSaveToHistory = async () => {
    try {
      setIsSaving(true);
      
      if (!activeChildId) {
        toast({
          title: "No child selected",
          description: "Please select a child profile before saving this analysis.",
          variant: "destructive",
        });
        return;
      }
      
      await addToHistory(analysisResults);
      
      toast({
        title: "Analysis saved!",
        description: "This analysis has been saved to the child's history.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving analysis:", error);
      toast({
        title: "Error saving analysis",
        description: "There was a problem saving this analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case "Good":
      case "Excellent":
      case "Very Good":
        return "bg-green-100 text-green-800";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800";
      case "Poor":
      case "Caution":
        return "bg-red-100 text-red-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Product Report</h2>
        <Button 
          size="sm"
          onClick={handleDownloadPDF}
        >
          Download PDF
        </Button>
      </div>
      
      <div className="border rounded mb-6">
        <div className="bg-gray-50 p-3 border-b">
          <h3 className="font-medium">{analysisResults.productName}</h3>
          <p className="text-sm text-gray-600">
            For: {formData.ageGroup.charAt(0).toUpperCase() + formData.ageGroup.slice(1)} with {formData.healthConditions.map(c => c.name).join(", ")}
          </p>
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded text-sm ${getSuitabilityColor(analysisResults.suitability)}`}>
              {analysisResults.suitability} ({analysisResults.suitabilityRating}%)
            </span>
          </div>
        </div>
        
        <div className="divide-y">
          <div className="p-3">
            <h4 className="font-medium mb-2">Overview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Category</p>
                <p>{analysisResults.productCategory}</p>
              </div>
              <div>
                <p className="text-gray-600">Analysis Date</p>
                <p>{format(new Date(), 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <h4 className="font-medium mb-2">Summary</h4>
            <p className="text-sm text-gray-600">
              This product is generally {analysisResults.suitability.toLowerCase()} for {formData.ageGroup}s with {formData.healthConditions.map(c => c.name).join(", ")}.
              {analysisResults.specialWarnings && analysisResults.specialWarnings.length > 0 && (
                ` ${analysisResults.specialWarnings[0].description}`
              )}
            </p>
          </div>
          
          <div className="p-3">
            <h4 className="font-medium mb-2">Ingredients</h4>
            <div className="border rounded">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-sm">Ingredient</th>
                    <th className="px-3 py-2 text-left text-sm">Safety</th>
                    <th className="px-3 py-2 text-left text-sm">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {analysisResults.ingredients.map((ingredient, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm">{ingredient.name}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block px-2 py-1 rounded text-sm ${getSuitabilityColor(ingredient.safety)}`}>
                          {ingredient.safety}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm">{ingredient.concerns || "No concerns"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-3">
            <h4 className="font-medium mb-2">Alternatives</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysisResults.alternatives.map((alternative, index) => (
                <div key={index} className="border rounded p-3">
                  <h5 className="font-medium">{alternative.name}</h5>
                  <p className="text-sm text-gray-600">{alternative.description}</p>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-sm ${getSuitabilityColor(alternative.rating)}`}>
                      {alternative.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-3">
            <h4 className="font-medium mb-2">Recommendations</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              {analysisResults.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 border rounded p-3 mb-6">
        <h4 className="font-medium mb-2">Medical Disclaimer</h4>
        <p className="text-sm text-gray-600">
          This report is for informational purposes only and is not a substitute for professional medical advice. Always consult with a healthcare provider before making changes to your skincare routine.
        </p>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onStartOver}>New Analysis</Button>
        <Button variant="outline" onClick={() => setLocation('/profile')}>Back to Profile</Button>
      </div>
    </div>
  );
}
