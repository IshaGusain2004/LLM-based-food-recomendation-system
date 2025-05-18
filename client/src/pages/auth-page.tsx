import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useFormContext } from "@/contexts/FormContext";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { updateUserProfile } = useFormContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // This is a dummy login that just creates a user profile
    setTimeout(() => {
      // Create a basic user profile
      updateUserProfile({
        name: email.split('@')[0],
        email: email,
        children: []
      });
      
      toast({
        title: "Login successful",
        description: "Welcome back! You're now logged in.",
      });
      
      setIsLoading(false);
      // Redirect to the profile page to create a child profile
      setLocation("/profile");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Login Form */}
          <div className="bg-white p-6 rounded border">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <p className="text-gray-600 mb-6">
              Login to manage your profiles and access personalized food analysis
            </p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account? Just enter your email and we'll create one for you.
            </p>
          </div>
          
          {/* Features List */}
          <div className="mt-8 bg-gray-100 p-6 rounded border">
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Analyze food products with a simple photo</li>
              <li>• Get personalized advice based on your child's age</li>
              <li>• Discover healthier alternative products</li>
              <li>• Create custom meal plans for your child</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}