import { apiRequest } from "./queryClient";

export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    console.log("Sending file to OCR API:", imageFile.name, imageFile.type, imageFile.size);

    const response = await apiRequest("POST", "/api/ocr", formData);
    const data = await response.json();
    
    console.log("OCR API response:", data);
    
    if (!data.text) {
      throw new Error("No text was extracted from the image");
    }
    
    return data.text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw error;
  }
}

export async function analyzeProduct(
  ageGroup: string, 
  healthConditions: string[], 
  additionalConditions: string,
  healthNotes: string,
  extractedText: string
) {
  try {
    console.log("Sending analysis request with:", {
      ageGroup,
      healthConditions: healthConditions.length,
      hasAdditionalConditions: !!additionalConditions,
      hasHealthNotes: !!healthNotes,
      extractedTextLength: extractedText.length,
    });

    const response = await apiRequest("POST", "/api/analyze", {
      ageGroup,
      healthConditions,
      additionalConditions,
      healthNotes,
      extractedText,
    });

    const data = await response.json();
    console.log("Analysis API response:", data);
    
    return data;
  } catch (error) {
    console.error("Error analyzing product:", error);
    throw error;
  }
}

export async function saveAnalysisForChild(childId: string, childName: string, analysis: any) {
  try {
    console.log("Saving analysis for child:", childId, childName);
    
    const response = await apiRequest("POST", "/api/history/save", {
      childId,
      childName,
      analysis
    });

    const data = await response.json();
    console.log("Save analysis response:", data);
    
    return data;
  } catch (error) {
    console.error("Error saving analysis for child:", error);
    throw error;
  }
}

export async function getAnalysisHistoryForChild(childId: string) {
  try {
    console.log("Getting analysis history for child:", childId);
    
    const response = await apiRequest("GET", `/api/history/${childId}`);
    const data = await response.json();
    
    console.log("Analysis history response:", data);
    
    return data.data || []; // Return the actual history array or empty array if not found
  } catch (error) {
    console.error("Error getting analysis history for child:", error);
    return []; // Return empty array on error
  }
}
