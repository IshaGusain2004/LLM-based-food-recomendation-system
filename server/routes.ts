import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import Tesseract from "tesseract.js";
import { analyzeWithGemini } from "./gemini";
import { AnalysisRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { saveAnalysisForChild, getAnalysisHistoryForChild } from "./mongodb";
import { z } from "zod";

// Zod schemas for request validation
const SaveAnalysisSchema = z.object({
  childId: z.string(),
  childName: z.string(),
  analysis: z.any() // Will be an AnalysisResponse object
});

const GetHistorySchema = z.object({
  childId: z.string()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads with in-memory storage
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

  // OCR endpoint to extract text from product images
  app.post("/api/ocr", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Convert buffer to base64 for Tesseract
      const buffer = req.file.buffer;
      
      // Process image with Tesseract.js
      const { data } = await Tesseract.recognize(buffer, "eng");
      
      // Return extracted text
      return res.json({
        text: data.text,
        confidence: data.confidence
      });
    } catch (error) {
      console.error("OCR error:", error);
      return res.status(500).json({ error: "Failed to process image" });
    }
  });

  // Product analysis endpoint using Gemini
  app.post("/api/analyze", async (req, res) => {
    try {
      // Validate request body
      const validatedData = AnalysisRequestSchema.parse(req.body);
      
      // Extract data for Gemini analysis
      const { 
        ageGroup, 
        healthConditions, 
        additionalConditions,
        healthNotes, 
        extractedText 
      } = validatedData;
      
      // Combine health conditions
      const allConditions = [...healthConditions];
      if (additionalConditions) {
        allConditions.push(additionalConditions);
      }

      // Analyze with Gemini
      const analysisResult = await analyzeWithGemini(
        ageGroup,
        allConditions,
        extractedText,
        healthNotes || ""
      );
      
      return res.json(analysisResult);
    } catch (error) {
      console.error("Analysis error:", error);
      
      // Handle validation errors
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      return res.status(500).json({ error: "Failed to analyze product" });
    }
  });

  // Save analysis for a child
  app.post("/api/history/save", async (req, res) => {
    try {
      // Validate request body
      const { childId, childName, analysis } = SaveAnalysisSchema.parse(req.body);
      
      // Save to MongoDB
      const savedAnalysis = await saveAnalysisForChild(childId, childName, analysis);
      
      if (savedAnalysis) {
        return res.status(201).json({ success: true, data: savedAnalysis });
      } else {
        return res.status(500).json({ success: false, error: "Failed to save analysis" });
      }
    } catch (error) {
      console.error("Save analysis error:", error);
      
      // Handle validation errors
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      return res.status(500).json({ error: "Failed to save analysis" });
    }
  });

  // Get analysis history for a child
  app.get("/api/history/:childId", async (req, res) => {
    try {
      // Validate parameter
      const { childId } = GetHistorySchema.parse({ childId: req.params.childId });
      
      // Get history from MongoDB
      const history = await getAnalysisHistoryForChild(childId);
      
      return res.json({ success: true, data: history });
    } catch (error) {
      console.error("Get history error:", error);
      
      // Handle validation errors
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      return res.status(500).json({ error: "Failed to get analysis history" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
