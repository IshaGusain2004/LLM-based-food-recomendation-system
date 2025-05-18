import { useFormContext } from "@/contexts/FormContext";

export default function AnalysisInProgress() {
  const { analysisProgress, currentAnalysisPhase } = useFormContext();
  
  return (
    <div className="text-center py-8">
      <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold mb-2">Analyzing Your Product</h3>
      <p className="text-gray-600 mb-6">
        Processing your product image and health information. This may take a few moments.
      </p>
      
      <div className="max-w-md mx-auto">
        <div className="mb-2 flex justify-between text-sm">
          <span>{currentAnalysisPhase}</span>
          <span>{analysisProgress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div 
            style={{ width: `${analysisProgress}%` }} 
            className="h-full bg-blue-600 rounded transition-all duration-500"
          ></div>
        </div>
      </div>
    </div>
  );
}
