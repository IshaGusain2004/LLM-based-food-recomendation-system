import { useState } from "react";
import { useFormContext, HealthCondition } from "@/contexts/FormContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { nanoid } from "nanoid";
import { X } from "lucide-react";

export default function HealthConditionsSelector() {
  const { formData, setFormData } = useFormContext();
  const [selectedCondition, setSelectedCondition] = useState<string>("");

  const healthConditions = [
    "Allergies",
    "Diabetes",
    "Hypertension",
    "Heart Disease",
    "Asthma",
    "Psoriasis",
    "Eczema",
    "Pregnancy",
    "Lactose Intolerance",
    "Gluten Sensitivity",
    "Celiac Disease",
  ];

  const handleAddCondition = (condition: string) => {
    if (!condition) return;
    
    // Check if this condition is already added
    const isAlreadyAdded = formData.healthConditions.some(
      (c) => c.name.toLowerCase() === condition.toLowerCase()
    );
    
    if (!isAlreadyAdded) {
      const newCondition: HealthCondition = {
        id: nanoid(),
        name: condition,
      };
      
      setFormData({
        ...formData,
        healthConditions: [...formData.healthConditions, newCondition],
      });
    }
    
    // Clear the selection
    setSelectedCondition("");
  };

  const handleRemoveCondition = (id: string) => {
    setFormData({
      ...formData,
      healthConditions: formData.healthConditions.filter((c) => c.id !== id),
    });
  };

  const handleSelectChange = (value: string) => {
    setSelectedCondition(value);
    handleAddCondition(value);
  };

  const handleAddCustomCondition = () => {
    if (formData.additionalConditions.trim()) {
      handleAddCondition(formData.additionalConditions.trim());
      setFormData({
        ...formData,
        additionalConditions: "",
      });
    }
  };

  const handleAdditionalConditionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      additionalConditions: e.target.value,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomCondition();
    }
  };

  return (
    <div>
      <Label htmlFor="health-conditions" className="block text-sm font-medium text-gray-700 mb-1">
        Health Conditions
      </Label>
      <div className="relative">
        <Select value={selectedCondition} onValueChange={handleSelectChange}>
          <SelectTrigger id="health-conditions" className="w-full">
            <SelectValue placeholder="Select a condition (or type to search)" />
          </SelectTrigger>
          <SelectContent>
            {healthConditions.map((condition) => (
              <SelectItem key={condition} value={condition}>
                {condition}
              </SelectItem>
            ))}
            <SelectItem value="other">Other (specify below)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.healthConditions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {formData.healthConditions.map((condition) => (
            <span
              key={condition.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
            >
              {condition.name}
              <button
                type="button"
                onClick={() => handleRemoveCondition(condition.id)}
                className="ml-1 inline-flex text-primary-600 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3">
        <Label htmlFor="custom-condition" className="block text-sm font-medium text-gray-700">
          Additional Conditions
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="text"
            id="custom-condition"
            value={formData.additionalConditions}
            onChange={handleAdditionalConditionsChange}
            onKeyDown={handleKeyDown}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter any specific conditions or concerns"
          />
          <button
            type="button"
            onClick={handleAddCustomCondition}
            className="px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
