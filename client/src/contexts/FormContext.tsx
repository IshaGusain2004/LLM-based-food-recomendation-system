import React, { createContext, useContext, useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { saveAnalysisForChild, getAnalysisHistoryForChild } from "@/lib/api";

// Define types for our form data and analysis results
export type AgeGroup = "0-2" | "3-6" | "7-10";

export type HealthCondition = {
  id: string;
  name: string;
};

export interface AnalysisResult {
  id?: string; // Added for history tracking
  timestamp?: number; // Added timestamp for history
  suitability: "Good" | "Moderate" | "Poor";
  suitabilityRating: number;
  productName: string;
  productCategory: string;
  ingredients: {
    name: string;
    description: string;
    safety: "Safe" | "Moderate" | "Caution";
    concerns?: string;
  }[];
  specialWarnings?: {
    title: string;
    description: string;
  }[];
  alternatives: {
    name: string;
    description: string;
    rating: "Excellent" | "Very Good" | "Good";
    benefits: string[];
    image?: string;
  }[];
  comparisonTable: {
    product: string;
    suitability: "Excellent" | "Very Good" | "Good" | "Moderate" | "Poor";
    keyBenefits: string;
    freeFrom: string;
  }[];
  recommendations: string[];
}

export interface MealPlan {
  id: string;
  name: string;
  description: string;
  meals: {
    time: string;
    name: string;
    description: string;
    ingredients?: string[];
    nutritionalInfo?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
  targetAgeGroup: AgeGroup;
  healthConditions: HealthCondition[];
  createdAt: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  healthConditions: HealthCondition[];
  dateOfBirth?: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  children: ChildProfile[];
}

export interface FormData {
  productImage: File | null;
  imagePreviewUrl: string;
  ageGroup: AgeGroup;
  healthConditions: HealthCondition[];
  additionalConditions: string;
  healthNotes: string;
  extractedText: string;
  productImages?: {url: string, file: File}[]; // For multi-image support
}

interface FormContextProps {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isAnalyzing: boolean;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  analysisResults: AnalysisResult | null;
  setAnalysisResults: React.Dispatch<React.SetStateAction<AnalysisResult | null>>;
  analysisProgress: number;
  setAnalysisProgress: React.Dispatch<React.SetStateAction<number>>;
  currentAnalysisPhase: string;
  setCurrentAnalysisPhase: React.Dispatch<React.SetStateAction<string>>;
  resetForm: () => void;
  
  // User account related functions
  userProfile: UserProfile | null;
  updateUserProfile: (profile: UserProfile) => void;
  
  // Analysis history
  analysisHistory: AnalysisResult[];
  addToHistory: (result: AnalysisResult) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  
  // Multi-image support
  addProductImage: (file: File) => void;
  removeProductImage: (index: number) => void;
  
  // Meal plans
  mealPlans: MealPlan[];
  addMealPlan: (plan: MealPlan) => void;
  removeMealPlan: (id: string) => void;
  updateMealPlan: (plan: MealPlan) => void;
  
  // Active child for personalized recommendations
  activeChildId: string | null;
  setActiveChildId: React.Dispatch<React.SetStateAction<string | null>>;
  getActiveChild: () => ChildProfile | null;
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

// Initial form data
const initialFormData: FormData = {
  productImage: null,
  imagePreviewUrl: "",
  ageGroup: "0-2",
  healthConditions: [],
  additionalConditions: "",
  healthNotes: "",
  extractedText: "",
  productImages: []
};

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisPhase, setCurrentAnalysisPhase] = useState("Extracting text from image");
  
  // Form data with multi-image support
  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Analysis history
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  
  // Meal plans
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  
  // Active child for personalized recommendations
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  
  // Fetch analysis history from MongoDB when active child changes
  useEffect(() => {
    const fetchChildHistory = async () => {
      if (activeChildId) {
        try {
          console.log("Fetching analysis history for child ID:", activeChildId);
          const historyData = await getAnalysisHistoryForChild(activeChildId);
          if (historyData && historyData.length > 0) {
            console.log("Loaded history from MongoDB:", historyData.length, "items");
            setAnalysisHistory(historyData);
          }
        } catch (error) {
          console.error("Error fetching child history from MongoDB:", error);
        }
      }
    };
    
    fetchChildHistory();
  }, [activeChildId]);

  // Load user data from localStorage on initial render
  useEffect(() => {
    try {
      // Load user profile
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
      
      // Load analysis history
      const savedHistory = localStorage.getItem('analysisHistory');
      if (savedHistory) {
        setAnalysisHistory(JSON.parse(savedHistory));
      }
      
      // Load meal plans
      const savedMealPlans = localStorage.getItem('mealPlans');
      if (savedMealPlans) {
        setMealPlans(JSON.parse(savedMealPlans));
      }
      
      // Load active child
      const savedActiveChildId = localStorage.getItem('activeChildId');
      if (savedActiveChildId) {
        setActiveChildId(savedActiveChildId);
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);
  
  // Save user profile to localStorage when it changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, [userProfile]);
  
  // Save analysis history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
  }, [analysisHistory]);
  
  // Save meal plans to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
  }, [mealPlans]);
  
  // Save active child to localStorage when it changes
  useEffect(() => {
    if (activeChildId) {
      localStorage.setItem('activeChildId', activeChildId);
    }
  }, [activeChildId]);

  const resetForm = () => {
    setCurrentStep(1);
    setIsAnalyzing(false);
    setAnalysisResults(null);
    setAnalysisProgress(0);
    setCurrentAnalysisPhase("Extracting text from image");
    setFormData(initialFormData);
  };
  
  // Update user profile
  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };
  
  // Add analysis to history with MongoDB support
  const addToHistory = async (result: AnalysisResult) => {
    try {
      // Add unique ID and timestamp
      const resultWithMetadata = {
        ...result,
        id: `analysis-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now()
      };
      
      // Update local state
      setAnalysisHistory(prev => [resultWithMetadata, ...prev]);
      
      // Save to MongoDB if there's an active child
      const activeChild = getActiveChild();
      if (activeChild) {
        await saveAnalysisForChild(
          activeChild.id,
          activeChild.name,
          resultWithMetadata
        );
        console.log(`Analysis saved to MongoDB for child: ${activeChild.name}`);
      }
    } catch (error) {
      console.error("Error saving analysis to history:", error);
    }
  };
  
  // Clear history
  const clearHistory = () => {
    setAnalysisHistory([]);
  };
  
  // Remove analysis from history
  const removeFromHistory = (id: string) => {
    setAnalysisHistory(prev => prev.filter(item => item.id !== id));
  };
  
  // Add product image for multi-image support
  const addProductImage = (file: File) => {
    setFormData(prev => ({
      ...prev,
      productImages: [...(prev.productImages || []), {
        url: URL.createObjectURL(file),
        file
      }]
    }));
  };
  
  // Remove product image
  const removeProductImage = (index: number) => {
    setFormData(prev => {
      const updatedImages = [...(prev.productImages || [])];
      updatedImages.splice(index, 1);
      return {
        ...prev,
        productImages: updatedImages
      };
    });
  };
  
  // Add meal plan
  const addMealPlan = (plan: MealPlan) => {
    setMealPlans(prev => [...prev, plan]);
  };
  
  // Remove meal plan
  const removeMealPlan = (id: string) => {
    setMealPlans(prev => prev.filter(plan => plan.id !== id));
  };
  
  // Update meal plan
  const updateMealPlan = (plan: MealPlan) => {
    setMealPlans(prev => prev.map(item => item.id === plan.id ? plan : item));
  };
  
  // Get active child
  const getActiveChild = (): ChildProfile | null => {
    if (!userProfile || !activeChildId) return null;
    return userProfile.children.find(child => child.id === activeChildId) || null;
  };

  return (
    <FormContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        isAnalyzing,
        setIsAnalyzing,
        analysisResults,
        setAnalysisResults,
        analysisProgress,
        setAnalysisProgress,
        currentAnalysisPhase,
        setCurrentAnalysisPhase,
        resetForm,
        
        // User profile
        userProfile,
        updateUserProfile,
        
        // Analysis history
        analysisHistory,
        addToHistory,
        removeFromHistory,
        clearHistory,
        
        // Multi-image support
        addProductImage,
        removeProductImage,
        
        // Meal plans
        mealPlans,
        addMealPlan,
        removeMealPlan,
        updateMealPlan,
        
        // Active child
        activeChildId,
        setActiveChildId,
        getActiveChild
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
