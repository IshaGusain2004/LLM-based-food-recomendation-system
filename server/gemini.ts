import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { AnalysisResponse, suitabilityRatings } from "@shared/schema";

// const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
const API_KEY = "AIzaSyDXuEMrJGj6bhxBXCq1Cv2EbEnNV71Lgek";
// console.log("DATA 1",API_KEY);


// Function to validate if we have a valid API key
function hasValidApiKey(): boolean {
  // Check if API key is not empty string, null, or undefined
  if (!API_KEY || API_KEY.trim() === "") {
    console.warn("Missing Gemini API key. Please set GEMINI_API_KEY environment variable.");
    return false;
  }

  // Gemini API keys have different formats:
  // - They can start with "AI" for Google AI Studio keys
  // - They can be standard API keys with no specific prefix
  // Let's just check for minimum length as a basic validation
  if (API_KEY.length < 10) {
    console.warn("Gemini API key appears to be too short. Please check the format.");
    return false;
  }

  return true;
}

// Log API key status (without revealing the actual key)
console.log(`Gemini API key status: ${hasValidApiKey() ? 'Valid format' : 'Invalid or missing'}`);

// Create the Gemini client only if we have a valid API key
let genAI: GoogleGenerativeAI | null = null;
try {
  if (hasValidApiKey()) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
} catch (error) {
  console.error("Error initializing Gemini API client:", error);
}

// Function to analyze product with Gemini
export async function analyzeWithGemini(
  ageGroup: string,
  healthConditions: string[],
  ingredientsText: string,
  userNotes: string
): Promise<AnalysisResponse> {
  try {
    // Check if we have a valid API key first
    if (!hasValidApiKey() || genAI === null) {
      console.error("Gemini API key is missing or invalid. Please provide a valid API key.");
      throw new Error("MISSING_API_KEY");
    }
    
    // Configure the model - use the correct model name
    const model = genAI.getGenerativeModel({
      model: "gemini-pro", // Use the standard model name that works with the API
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Construct the prompt for Gemini
    const prompt = `
      You are an expert pediatric nutritionist tasked with analyzing a packaged food product for a child, based on the extracted ingredients and user-provided health metadata.

      ESSENTIAL INFORMATION:
      - Age Group: ${ageGroup}
      - Known Health Conditions / Allergies / Restrictions: ${healthConditions.join(", ")}
      - Additional Parent Notes: ${userNotes}
      - Ingredients (Extracted via OCR): ${ingredientsText}

      ANALYSIS OBJECTIVES:
      You must provide a thorough, evidence-based analysis specifically tailored to the child's age group and health conditions. Your recommendations must be highly personalized and actionable.

      REQUIRED SECTIONS AND FORMAT:
      1. Identify the product name and category based on the ingredients.
      2. Thoroughly assess each ingredient for its nutritional impact and safety.
      3. Determine overall suitability taking into account age-appropriate nutrition needs.
      4. Provide specific alternative products with real brand names (not generic suggestions).
      5. Include precise, personalized recommendations relevant to the specific age group.

      CRITICAL INSTRUCTIONS:
      - NEVER repeat the same recommendations for every analysis.
      - Base your analysis on the child's exact age group (${ageGroup}) and specific health conditions.
      - Give precise, actionable advice that's practical for parents to implement.
      - Alternatives must be actual products available in major stores, not generic descriptions.
      - Recommendations must be specific to the analyzed product and child's needs, not generic health advice.
      - Vary your response structure based on product type and health considerations.
      - If potential allergens are detected, highlight them prominently and suggest allergen-free alternatives.
      - Evaluate ingredients based on current pediatric nutritional research.

      RESPONSE FORMAT:
      Format your response as structured JSON with the following format, using real data for all fields:

      {
        "productName": "Detected product name based on ingredients",
        "productCategory": "Specific category (Snack, Beverage, Baby Food, etc.)",
        "suitability": "Good, Moderate, or Poor",
        "suitabilityRating": "Numerical rating from 0-100",
        "ingredients": [
          {
            "name": "Ingredient name",
            "description": "Function, nutritional impact, and research-based assessment",
            "safety": "Safe, Moderate, or Caution",
            "concerns": "Specific concerns for THIS age group and THESE health conditions"
          }
        ],
        "specialWarnings": [
          {
            "title": "Clear warning title",
            "description": "Detailed explanation of specific risks for this child"
          }
        ],
        "alternatives": [
          {
            "name": "SPECIFIC REAL PRODUCT with brand name",
            "description": "Detailed comparison to the analyzed product",
            "rating": "Excellent, Very Good, or Good",
            "benefits": ["Specific benefit 1", "Specific benefit 2", "Specific benefit 3"]
          }
        ],
        "comparisonTable": [
          {
            "product": "Original or alternative product name (be specific)",
            "suitability": "Excellent, Very Good, Good, Moderate, or Poor",
            "keyBenefits": "Specific nutritional benefits for this age group",
            "freeFrom": "Harmful ingredients it lacks"
          }
        ],
        "recommendations": [
          "Age-specific actionable recommendation 1 for this exact product",
          "Health-condition-specific recommendation 2",
          "Serving size or frequency recommendation 3",
          "Product preparation or complementary food recommendation 4",
          "Medical consultation advice if needed"
        ]
      }
      
      ESSENTIAL NOTES:
      - Products in alternatives should be real, recognizable brands (like Earth's Best, Gerber Organic, Happy Baby, etc.)
      - Recommendations should be directly relevant to the product being analyzed
      - Adapt your assessment to the specific age group's nutritional needs (${ageGroup})
      - If key health issues are identified, they should be clearly highlighted
      - All analyses should be evidence-based, not opinion
      - Different age groups have different nutritional needs - be precise about this
      
      I will evaluate the quality of your analysis based on how personalized and specific your recommendations are to this exact product and child's profile.
    `;

    // Generate response from Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Try to parse the JSON response
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("No JSON object found in the response");
      }
      
      const jsonStr = jsonMatch[0];
      const analysisData = JSON.parse(jsonStr) as AnalysisResponse;
      
      // Validate the essential fields
      if (!analysisData.productName || !analysisData.suitability || !analysisData.ingredients) {
        throw new Error("Missing required fields in the analysis response");
      }
      
      // Ensure the suitability rating is within valid range
      if (typeof analysisData.suitabilityRating !== 'number' || 
          analysisData.suitabilityRating < 0 || 
          analysisData.suitabilityRating > 100) {
        analysisData.suitabilityRating = 
          analysisData.suitability === "Good" ? 85 : 
          analysisData.suitability === "Moderate" ? 60 : 30;
      }
      
      // Ensure we have at least some recommendations
      if (!analysisData.recommendations || analysisData.recommendations.length === 0) {
        analysisData.recommendations = [
          "Consult with a healthcare professional before making significant changes to your routine.",
          "Always perform a patch test before using new products, especially if you have sensitive skin or allergies.",
          "Read ingredient labels carefully and avoid known triggers for your condition."
        ];
      }
      
      return analysisData;
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.log("Raw response:", text);
      
      // Return a fallback response
      return createFallbackResponse(ageGroup, healthConditions, ingredientsText);
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // Check if the error is a missing API key
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = errorMessage === "MISSING_API_KEY" ? "MISSING_API_KEY" : undefined;
    
    // Return a fallback response with the error type
    return createFallbackResponse(ageGroup, healthConditions, ingredientsText, errorType);
  }
}

// Fallback response in case of API errors
function createFallbackResponse(
  ageGroup: string, 
  healthConditions: string[],
  ingredientsText: string,
  errorType?: string
): AnalysisResponse {
  // Special fallback for missing API key
  if (errorType === "MISSING_API_KEY") {
    return {
      productName: "API Key Required",
      productCategory: "Setup Required",
      suitability: "Moderate",
      suitabilityRating: 50,
      ingredients: [
        {
          name: "Google AI API Key Required",
          description: "Missing API credentials for AI analysis",
          safety: "Moderate",
          concerns: "To analyze product ingredients, you need to add a Google Gemini API key to the application."
        }
      ],
      specialWarnings: [
        {
          title: "Missing API Key",
          description: "This application requires a Google Gemini API key to analyze your product. Please add your API key to enable advanced analysis."
        }
      ],
      alternatives: [
        {
          name: "Setup Instructions",
          description: "Get a Gemini API key",
          rating: "Good",
          benefits: ["Free tier available", "Powerful AI analysis", "Detailed ingredient assessments"]
        }
      ],
      comparisonTable: [
        {
          product: "Current Setup",
          suitability: "Poor",
          keyBenefits: "None - Missing API key",
          freeFrom: "N/A"
        }
      ],
      recommendations: [
        "Get a Google AI (Gemini) API key from https://ai.google.dev/",
        "Add the API key to your environment variables as GEMINI_API_KEY",
        "Restart the application to enable ingredient analysis",
        "You can still use the application to extract text from images",
        "Contact support if you need assistance setting up the API key"
      ]
    };
  }
  // Create a more detailed child-focused fallback response
  // Extract key ingredients from the text
  const ingredientText = ingredientsText.toLowerCase();
  
  // Determine product type and ingredients based on text content
  let productType = "Nutritious Food";
  let category = "Children's Food";
  
  if (ingredientText.includes("fruit") || ingredientText.includes("apple") || ingredientText.includes("banana")) {
    productType = "Fruit Puree";
    category = "Baby Food";
  } else if (ingredientText.includes("veget") || ingredientText.includes("carrot") || ingredientText.includes("pea")) {
    productType = "Vegetable Mix";
    category = "Baby Food";
  } else if (ingredientText.includes("cereal") || ingredientText.includes("grain") || ingredientText.includes("oat")) {
    productType = "Infant Cereal";
    category = "Baby Breakfast";
  } else if (ingredientText.includes("milk") || ingredientText.includes("formula")) {
    productType = "Dairy Product";
    category = "Baby Formula";
  } else if (ingredientText.includes("yogurt") || ingredientText.includes("cheese")) {
    productType = "Dairy Snack";
    category = "Toddler Snack";
  } else if (ingredientText.includes("biscuit") || ingredientText.includes("cracker")) {
    productType = "Whole Grain Biscuits";
    category = "Toddler Snack";
  }
  
  // Extract potential ingredients
  const commonIngredients = [
    { name: "Water", exists: ingredientText.includes("water"), safety: "Safe" },
    { name: "Apple", exists: ingredientText.includes("apple"), safety: "Safe" },
    { name: "Banana", exists: ingredientText.includes("banana"), safety: "Safe" },
    { name: "Pear", exists: ingredientText.includes("pear"), safety: "Safe" },
    { name: "Carrot", exists: ingredientText.includes("carrot"), safety: "Safe" },
    { name: "Sweet Potato", exists: ingredientText.includes("sweet potato") || ingredientText.includes("sweetpotato"), safety: "Safe" },
    { name: "Rice", exists: ingredientText.includes("rice"), safety: "Safe" },
    { name: "Oats", exists: ingredientText.includes("oat"), safety: "Safe" },
    { name: "Wheat", exists: ingredientText.includes("wheat"), safety: "Moderate" },
    { name: "Milk", exists: ingredientText.includes("milk"), safety: "Moderate" },
    { name: "Sugar", exists: ingredientText.includes("sugar"), safety: "Caution" },
    { name: "Salt", exists: ingredientText.includes("salt"), safety: "Caution" },
    { name: "Corn Syrup", exists: ingredientText.includes("corn syrup"), safety: "Caution" },
    { name: "Natural Flavors", exists: ingredientText.includes("natural flavor"), safety: "Moderate" },
    { name: "Ascorbic Acid", exists: ingredientText.includes("ascorbic acid"), safety: "Safe" },
    { name: "Citric Acid", exists: ingredientText.includes("citric acid"), safety: "Safe" },
    { name: "Lemon Juice", exists: ingredientText.includes("lemon juice"), safety: "Safe" },
  ];
  
  // Filter and map ingredients
  const foundIngredients = commonIngredients.filter(ing => ing.exists).map(ing => {
    const descriptions: Record<string, string> = {
      "Water": "Base ingredient used for consistency",
      "Apple": "Natural source of fiber and vitamins",
      "Banana": "Rich in potassium and easily digestible carbohydrates",
      "Pear": "Gentle fruit that's easily digestible for babies",
      "Carrot": "Excellent source of beta-carotene and vitamin A",
      "Sweet Potato": "Nutritious root vegetable with vitamin A and fiber",
      "Rice": "Easily digestible grain, common in first solid foods",
      "Oats": "Whole grain providing fiber and nutrients",
      "Wheat": "Whole grain with protein and fiber, potential allergen",
      "Milk": "Source of calcium and protein, potential allergen",
      "Sugar": "Added sweetener with no nutritional benefits",
      "Salt": "Added sodium not recommended for young children",
      "Corn Syrup": "Added sweetener with no nutritional benefits",
      "Natural Flavors": "Undefined flavor enhancers",
      "Ascorbic Acid": "Vitamin C, acts as a natural preservative",
      "Citric Acid": "Natural preservative from citrus fruits",
      "Lemon Juice": "Natural flavoring and preservative"
    };
    
    type SafetyType = "Safe" | "Moderate" | "Caution";
    
    const concerns: Record<SafetyType, Record<string, string> | null> = {
      "Safe": null,
      "Moderate": {
        "Wheat": "Potential allergen, introduce gradually with pediatrician guidance",
        "Milk": "Common allergen, only appropriate after 12 months unless in formula",
        "Natural Flavors": "Undefined ingredients that may mask additives"
      },
      "Caution": {
        "Sugar": "Not recommended for children under 2 years; can develop sweet preferences and contribute to tooth decay",
        "Salt": "Not recommended for children under 1 year; kidney function still developing",
        "Corn Syrup": "Added sugar with no nutritional value, may contribute to sweet preferences"
      }
    };
    
    const safetyValue = ing.safety as SafetyType;
    const concernsObj = concerns[safetyValue];
    let concernText: string | undefined = undefined;
    
    if (safetyValue !== "Safe" && concernsObj) {
      concernText = concernsObj[ing.name] || "Consult your pediatrician";
    }
    
    return {
      name: ing.name,
      description: descriptions[ing.name] || "Nutritional food component",
      safety: safetyValue,
      concerns: concernText
    };
  });
  
  // If no ingredients were extracted, provide generic ones
  const ingredients = foundIngredients.length > 0 ? foundIngredients : [
    {
      name: "Food Components",
      description: "Nutritional elements suitable for young children",
      safety: "Moderate" as const,
      concerns: `For ${ageGroup}s with ${healthConditions.join(", ")}, consult with your pediatrician before introducing new foods.`
    }
  ];
  
  // Tailor fallback responses based on age groups
  type Alternative = {
    name: string;
    description: string;
    rating: "Excellent" | "Very Good" | "Good";
    benefits: string[];
  };
  
  let tailoredAlternatives: Alternative[] = [];
  let tailoredRecommendations: string[] = [];
  
  // Age-specific product alternatives
  if (ageGroup === "0-2") {
    tailoredAlternatives = [
      {
        name: "Plum Organics Stage 2 Baby Food",
        description: "Simple organic ingredients perfect for infants and young toddlers",
        rating: "Excellent",
        benefits: ["No added sugar or salt", "USDA Organic certified", "Transparent ingredients"]
      },
      {
        name: "Beech-Nut Naturals Baby Food",
        description: "Made with whole ingredients, minimal processing",
        rating: "Very Good",
        benefits: ["No artificial preservatives", "Honeypot jars for easy serving", "Naturally sweet from fruits"]
      },
      {
        name: "Happy Baby Clearly Crafted",
        description: "Transparent pouches with organic ingredients",
        rating: "Good",
        benefits: ["See-through packaging", "USDA Organic", "Baby-friendly textures"]
      }
    ];
    tailoredRecommendations = [
      "For infants and young toddlers, focus on simple, single-ingredient foods before introducing more complex combinations",
      "Avoid added salt, sugar, and artificial preservatives in foods for children under 2 years",
      "Serve appropriate textures - pureed for 4-6 months, mashed for 6-9 months, soft pieces for 9+ months",
      "Monitor for allergic reactions; wait 3-5 days between introducing new foods",
      "Consult your pediatrician before introducing potential allergens like dairy, eggs, or nuts"
    ];
  } else if (ageGroup === "3-6") {
    tailoredAlternatives = [
      {
        name: "Annie's Organic Bunny Snacks",
        description: "Wholesome snacks made with organic wheat and minimal ingredients",
        rating: "Excellent",
        benefits: ["No artificial flavors or preservatives", "Portion-controlled packages", "Kid-friendly shapes"]
      },
      {
        name: "GoGo squeeZ Organic Applesauce",
        description: "Portable fruit snacks with no added sugar",
        rating: "Very Good",
        benefits: ["100% fruit", "Convenient pouches", "USDA Organic"]
      },
      {
        name: "Made Good Granola Bars",
        description: "Allergen-free snack bars with hidden vegetable nutrients",
        rating: "Good",
        benefits: ["Free from top allergens", "Contains vegetable nutrients", "Appropriate portion size"]
      }
    ];
    tailoredRecommendations = [
      "For preschoolers (3-6 years), focus on balanced nutrition with growing independence in food choices",
      "Limit added sugars to less than 25g per day and prioritize whole food snacks",
      "Serve appropriate portions - generally 1 tablespoon of each food group per year of age",
      "Encourage self-feeding and exploration of different food textures and flavors",
      "Consider calcium-rich foods and vitamin D for developing bones and teeth"
    ];
  } else if (ageGroup === "7-10") {
    tailoredAlternatives = [
      {
        name: "Kind Kids Bars",
        description: "Whole grain bars with lower sugar content",
        rating: "Excellent",
        benefits: ["5g or less of sugar", "Good source of fiber", "No artificial flavors"]
      },
      {
        name: "Pirate's Booty Aged White Cheddar",
        description: "Baked corn puffs with real cheese and no artificial ingredients",
        rating: "Very Good",
        benefits: ["Gluten-free", "No artificial flavors", "Lower fat than fried alternatives"]
      },
      {
        name: "RX Kids Protein Snack Bars",
        description: "Protein-rich snack with simple ingredients",
        rating: "Good",
        benefits: ["No added sugar", "5g protein per bar", "Clean ingredient list"]
      }
    ];
    tailoredRecommendations = [
      "For school-age children (7-10 years), focus on nutrient-dense foods to support growth and activity",
      "Aim for a variety of whole foods including fruits, vegetables, whole grains, lean proteins, and dairy",
      "Watch portion sizes and encourage mindful eating habits as independence grows",
      "Include sources of iron, calcium, and vitamin D to support rapid growth phases",
      "Help build healthy habits by involving children in meal planning and preparation"
    ];
  }
  
  return {
    productName: productType,
    productCategory: category,
    suitability: "Moderate",
    suitabilityRating: 65,
    ingredients: ingredients,
    specialWarnings: [
      {
        title: `Food Safety Notice for ${ageGroup} Year Olds`,
        description: `Children in the ${ageGroup} age range have specific nutritional needs. ${
          ageGroup === "0-2" ? "Their digestive and immune systems are still developing." :
          ageGroup === "3-6" ? "They need nutrient-dense foods to support rapid growth and development." :
          "They require balanced nutrition to support growth, activity, and cognitive development."
        } Always introduce new foods gradually and monitor for reactions.`
      }
    ],
    alternatives: tailoredAlternatives.length > 0 ? tailoredAlternatives : [
      {
        name: "Gerber Organic Baby Food",
        description: "Simple ingredients with organic certification",
        rating: "Excellent",
        benefits: ["No artificial additives", "USDA Organic certified", "Available in various stages for different ages"]
      },
      {
        name: "Happy Baby Organic",
        description: "Transparent ingredient sourcing with minimal processing",
        rating: "Very Good",
        benefits: ["Organic ingredients", "No added sugars", "Stage-based options for developmental needs"]
      },
      {
        name: "Earth's Best Organic",
        description: "Wholesome organic options for growing children",
        rating: "Good",
        benefits: ["No artificial flavors or colors", "Non-GMO ingredients", "Age-appropriate nutritional content"]
      }
    ],
    comparisonTable: [
      {
        product: productType,
        suitability: "Moderate",
        keyBenefits: "Commercial convenience, professionally formulated",
        freeFrom: foundIngredients.some(i => i.safety === "Caution") ? 
          "Not fully assessed" : "May contain common additives"
      },
      {
        product: "Gerber Organic",
        suitability: "Excellent",
        keyBenefits: "Simple, transparent ingredients",
        freeFrom: "Artificial preservatives, colors, and flavors"
      },
      {
        product: "Homemade Baby Food",
        suitability: "Very Good",
        keyBenefits: "Complete control over ingredients",
        freeFrom: "All unnecessary additives and processing"
      }
    ],
    recommendations: tailoredRecommendations.length > 0 ? tailoredRecommendations : [
      "Always read full ingredient labels when purchasing foods for young children",
      "For children under 2, choose foods with no added salt or sugar",
      "Introduce potential allergenic foods one at a time with pediatrician guidance",
      "Consider making simple homemade foods to control ingredients when possible",
      "Keep a food diary to track any reactions when introducing new foods to children with sensitivities"
    ]
  };
}
