import { useFormContext } from "@/contexts/FormContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generatePDF } from "@/lib/pdf";

interface AnalysisResultsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGenerateReport: () => void;
  onBack: () => void;
}

export default function AnalysisResults({ 
  activeTab, 
  setActiveTab,
  onGenerateReport,
  onBack
}: AnalysisResultsProps) {
  const { formData, analysisResults } = useFormContext();

  if (!analysisResults) return null;

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case "Good":
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

  const handleExportPDF = () => {
    if (analysisResults) {
      generatePDF(analysisResults, formData);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Analysis Results</h2>
        <Button 
          size="sm"
          onClick={handleExportPDF}
        >
          Download PDF
        </Button>
      </div>
      
      <div className="bg-gray-50 p-4 mb-4 rounded">
        <h3 className="font-medium">{analysisResults.productName}</h3>
        <p className="text-sm text-gray-600">{analysisResults.productCategory}</p>
        <div className="mt-2">
          <span className={`inline-block px-2 py-1 rounded text-sm ${getSuitabilityColor(analysisResults.suitability)}`}>
            {analysisResults.suitability} Suitability
          </span>
          <span className="text-sm text-gray-600 ml-2">
            For: {formData.ageGroup.charAt(0).toUpperCase() + formData.ageGroup.slice(1)} with {formData.healthConditions.map(c => c.name).join(", ")}
          </span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="border-b mb-4">
          <TabsTrigger value="ingredient-analysis">Ingredients</TabsTrigger>
          <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ingredient-analysis">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Key Ingredients</h3>
            <div className="border rounded">
              <ul className="divide-y">
                {analysisResults.ingredients.map((ingredient, index) => (
                  <li key={index} className="p-3">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{ingredient.name}</h4>
                        <p className="text-sm text-gray-600">{ingredient.description}</p>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded text-sm ${getSuitabilityColor(ingredient.safety)}`}>
                        {ingredient.safety}
                      </span>
                    </div>
                    {ingredient.concerns && (
                      <p className="mt-1 text-sm text-red-600">{ingredient.concerns}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {analysisResults.specialWarnings && analysisResults.specialWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
              <h4 className="font-medium text-yellow-800">{analysisResults.specialWarnings[0].title}</h4>
              <p className="text-sm text-yellow-700">{analysisResults.specialWarnings[0].description}</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="alternatives">
          <h3 className="text-lg font-medium mb-2">Recommended Alternatives</h3>
          <p className="text-gray-600 mb-4">Based on your health profile, these alternatives may be better suited for your needs.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {analysisResults.alternatives.map((alternative, index) => (
              <div key={index} className="border rounded p-3">
                <h4 className="font-medium">{alternative.name}</h4>
                <p className="text-sm text-gray-600">{alternative.description}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 rounded text-sm ${getSuitabilityColor(alternative.rating)}`}>
                    {alternative.rating}
                  </span>
                </div>
                <div className="mt-2">
                  <h5 className="font-medium">Why it's better:</h5>
                  <ul className="mt-1 pl-5 list-disc text-sm text-gray-600">
                    {alternative.benefits.map((benefit, i) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border rounded p-3">
            <h4 className="font-medium mb-2">Comparison Table</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-sm">Product</th>
                    <th className="px-3 py-2 text-left text-sm">Suitability</th>
                    <th className="px-3 py-2 text-left text-sm">Key Benefits</th>
                    <th className="px-3 py-2 text-left text-sm">Free From</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {analysisResults.comparisonTable.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm">{item.product}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block px-2 py-1 rounded text-sm ${getSuitabilityColor(item.suitability)}`}>
                          {item.suitability}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm">{item.keyBenefits}</td>
                      <td className="px-3 py-2 text-sm">{item.freeFrom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations">
          <div className="space-y-4">
            <div className="border rounded p-3">
              <h3 className="font-medium mb-2">Recommendations</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {analysisResults.recommendations.map((recommendation: string, index: number) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onGenerateReport}>Generate Report</Button>
      </div>
    </div>
  );
}
