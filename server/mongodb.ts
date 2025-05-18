import mongoose from 'mongoose';
import { AnalysisResponse } from '@shared/schema';

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MongoDB URI not provided. Product history will not be saved.');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Define Analysis schema
const analysisSchema = new mongoose.Schema({
  childId: {
    type: String,
    required: true,
    index: true
  },
  childName: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    default: Date.now
  },
  productName: String,
  productCategory: String,
  suitability: String,
  suitabilityRating: Number,
  ingredients: [{
    name: String,
    description: String,
    safety: String,
    concerns: String
  }],
  specialWarnings: [{
    title: String,
    description: String
  }],
  alternatives: [{
    name: String,
    description: String,
    rating: String,
    benefits: [String]
  }],
  comparisonTable: [{
    product: String,
    suitability: String,
    keyBenefits: String,
    freeFrom: String
  }],
  recommendations: [String]
});

// Create model
export const AnalysisModel = mongoose.model('Analysis', analysisSchema);

// Save analysis result for a child
export const saveAnalysisForChild = async (
  childId: string,
  childName: string,
  analysis: AnalysisResponse
): Promise<any> => {
  try {
    if (!mongoose.connection.readyState) {
      console.warn('MongoDB not connected. Analysis will not be saved.');
      return null;
    }

    const newAnalysis = new AnalysisModel({
      childId,
      childName,
      ...analysis,
      timestamp: Date.now()
    });

    const savedAnalysis = await newAnalysis.save();
    return savedAnalysis;
  } catch (error) {
    console.error('Error saving analysis to MongoDB:', error);
    return null;
  }
};

// Get analysis history for a child
export const getAnalysisHistoryForChild = async (childId: string): Promise<any[]> => {
  try {
    if (!mongoose.connection.readyState) {
      console.warn('MongoDB not connected. Cannot retrieve analysis history.');
      return [];
    }

    const history = await AnalysisModel.find({ childId })
      .sort({ timestamp: -1 })
      .lean();
    
    return history;
  } catch (error) {
    console.error('Error getting analysis history from MongoDB:', error);
    return [];
  }
};

// Initialize MongoDB connection
connectDB();

export default {
  connectDB,
  saveAnalysisForChild,
  getAnalysisHistoryForChild
};