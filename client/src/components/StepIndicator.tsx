type StepIndicatorProps = {
  currentStep: number;
};

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: "Upload", icon: "📷", color: "from-blue-500 to-indigo-600" },
    { number: 2, label: "Details", icon: "📋", color: "from-teal-500 to-emerald-600" },
    { number: 3, label: "Analysis", icon: "🔍", color: "from-purple-500 to-indigo-600" },
    { number: 4, label: "Report", icon: "📊", color: "from-orange-500 to-amber-600" },
  ];

  return (
    <div className="flex items-center justify-between max-w-3xl mx-auto mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center relative">
          <div className="step-item flex flex-col items-center">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-all duration-300 ${
                step.number === currentStep 
                  ? `bg-gradient-to-r ${step.color} scale-110 ring-4 ring-primary-100` 
                  : step.number < currentStep
                    ? `bg-gradient-to-r ${step.color} opacity-80`
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {step.number === currentStep ? step.icon : step.number}
            </div>
            <span 
              className={`text-sm font-semibold mt-2 transition-colors duration-300 ${
                step.number === currentStep 
                  ? "text-primary-700" 
                  : step.number < currentStep
                    ? "text-primary-600"
                    : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
            {step.number === currentStep && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full" />
            )}
          </div>
          
          {index < steps.length - 1 && (
            <div className="relative">
              <div 
                className="step-connector w-full max-w-[70px] h-[2px] mx-3 bg-gray-200"
              />
              <div 
                className={`step-connector-progress absolute top-0 left-0 h-[2px] mx-3 bg-gradient-to-r from-primary-500 to-primary-300 transition-all duration-700 ease-in-out ${
                  step.number < currentStep ? "w-full" : "w-0"
                }`}
                style={{
                  width: step.number < currentStep ? '100%' : 
                        step.number === currentStep ? '50%' : '0%'
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
