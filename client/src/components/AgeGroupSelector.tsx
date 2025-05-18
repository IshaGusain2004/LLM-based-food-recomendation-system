import { useFormContext, AgeGroup } from "@/contexts/FormContext";
import { Label } from "@/components/ui/label";

export default function AgeGroupSelector() {
  const { formData, setFormData } = useFormContext();

  const handleAgeGroupChange = (ageGroup: AgeGroup) => {
    setFormData({
      ...formData,
      ageGroup,
    });
  };

  const ageGroups: { value: AgeGroup; label: string; age: string; icon: JSX.Element; isRecommended?: boolean }[] = [
    {
      value: "0-2",
      label: "Infants/Toddlers",
      age: "(0-2 years)",
      isRecommended: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 peer-checked:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
      ),
    },
    {
      value: "3-6",
      label: "Preschoolers",
      age: "(3-6 years)",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 peer-checked:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      value: "7-10",
      label: "School Age",
      age: "(7-10 years)",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 peer-checked:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <Label className="block text-sm font-medium text-gray-700 mb-1">Age Group</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ageGroups.map((group) => (
          <div className="relative" key={group.value}>
            <input
              type="radio"
              id={`age-${group.value}`}
              name="age-group"
              value={group.value}
              checked={formData.ageGroup === group.value}
              onChange={() => handleAgeGroupChange(group.value)}
              className="sr-only peer"
            />
            <label
              htmlFor={`age-${group.value}`}
              className={`flex flex-col items-center justify-center p-4 border ${
                group.isRecommended 
                  ? 'border-primary-300 bg-primary-50/40 ring-2 ring-primary-200/50 shadow-sm' 
                  : 'border-gray-200'
              } rounded-lg cursor-pointer peer-checked:bg-primary-50 peer-checked:border-primary-600 peer-checked:ring-4 peer-checked:ring-primary-100 hover:bg-gray-50 transition-all duration-200`}
            >
              {group.icon}
              <span className={`mt-2 font-medium ${group.isRecommended ? 'text-base text-primary-700' : 'text-sm'}`}>
                {group.label}
              </span>
              <span className="text-xs text-gray-500">{group.age}</span>
              {group.isRecommended && (
                <span className="mt-1 bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
