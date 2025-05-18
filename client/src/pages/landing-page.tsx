import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useFormContext } from "@/contexts/FormContext";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { userProfile } = useFormContext();

  const handleGetStarted = () => {
    if (userProfile) {
      setLocation("/profile");
    } else {
      setLocation("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section - Simplified */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">
              LLM Food Advisor
            </h1>
            <p className="text-lg mb-8">
              AI-powered food analysis to ensure safe and healthy choices for your children
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>
        </section>
        
        {/* Features Section - Simplified */}
        <section className="py-12 px-4 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded border">
                <h3 className="text-lg font-semibold mb-2">Snap a Photo</h3>
                <p className="text-gray-600">
                  Upload an image of any food product's ingredient list
                </p>
              </div>
              
              <div className="bg-white p-4 rounded border">
                <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
                <p className="text-gray-600">
                  Our AI analyzes ingredients for age appropriateness and health impact
                </p>
              </div>
              
              <div className="bg-white p-4 rounded border">
                <h3 className="text-lg font-semibold mb-2">Get Results</h3>
                <p className="text-gray-600">
                  Receive personalized recommendations and healthier alternatives
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Key Benefits - Simplified */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded border">
                <ul className="space-y-3">
                  <li>• Personalized analysis based on child's age and health conditions</li>
                  <li>• Identify potentially harmful ingredients and additives</li>
                  <li>• Track and save previous product analyses</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded border">
                <ul className="space-y-3">
                  <li>• Get healthier alternative product suggestions</li>
                  <li>• Create customized meal plans for your child</li>
                  <li>• Manage multiple child profiles with different health needs</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                onClick={handleGetStarted}
              >
                Start Using Now
              </Button>
            </div>
          </div>
        </section>
        
        {/* Project Info - Simplified */}
        <section className="py-8 px-4 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl font-bold mb-2">College Project</h2>
            <p className="text-gray-700">
              Made by Himanshu Dorbi, Isha Gusain, Nikhil Mahar and Abhay Karki
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}