import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
        How LLM Food Advisor Works
      </h1>
      
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        AI-powered food recommendation system for determining food product suitability for toddlers
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-primary-700">Step 1: Upload &amp; Scan</CardTitle>
            <CardDescription>Image Analysis &amp; Text Extraction</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              <li>Take a photo of the product's ingredient list</li>
              <li>Our OCR technology extracts the text</li>
              <li>Upload multiple images for more complete analysis</li>
              <li>Extracted text can be reviewed and edited if needed</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-primary-700">Step 2: Health Profile</CardTitle>
            <CardDescription>Customize Your Analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              <li>Select your child's age group</li>
              <li>Add any health conditions or allergies</li>
              <li>Create multiple profiles for different children</li>
              <li>Save profiles for future use</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-primary-700">Step 3: AI Analysis</CardTitle>
            <CardDescription>Comprehensive Evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              <li>Google's Gemini AI analyzes ingredients</li>
              <li>Matches against age-appropriate guidelines</li>
              <li>Checks for allergens and health concerns</li>
              <li>Generates personalized recommendations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center my-8">
        <Link href="/">
          <Button size="lg" className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg">
            ← Back to Home
          </Button>
        </Link>
      </div>
      
      <h2 className="text-2xl font-bold mb-6 text-center">Key Features</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="border rounded-lg p-5 hover:border-primary-300 hover:bg-primary-50 transition-colors">
          <h3 className="font-semibold text-lg mb-2 text-primary-700">Multi-Image Analysis</h3>
          <p className="text-sm text-gray-600">Upload multiple product images to ensure complete coverage of ingredients and nutritional information.</p>
        </div>
        
        <div className="border rounded-lg p-5 hover:border-primary-300 hover:bg-primary-50 transition-colors">
          <h3 className="font-semibold text-lg mb-2 text-primary-700">Child Profiles</h3>
          <p className="text-sm text-gray-600">Create and manage multiple child profiles with different ages and health conditions for personalized analysis.</p>
        </div>
        
        <div className="border rounded-lg p-5 hover:border-primary-300 hover:bg-primary-50 transition-colors">
          <h3 className="font-semibold text-lg mb-2 text-primary-700">Meal Planning</h3>
          <p className="text-sm text-gray-600">Generate and save meal plans based on your child's age group and health conditions.</p>
        </div>
        
        <div className="border rounded-lg p-5 hover:border-primary-300 hover:bg-primary-50 transition-colors">
          <h3 className="font-semibold text-lg mb-2 text-primary-700">History Storage</h3>
          <p className="text-sm text-gray-600">Save analysis results to MongoDB for persistent storage, accessible across devices and sessions.</p>
        </div>
      </div>
      
      <div className="text-center">
        <Link href="/">
          <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
            Get Started Now
          </Button>
        </Link>
      </div>
    </div>
  );
}