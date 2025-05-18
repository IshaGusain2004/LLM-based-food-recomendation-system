import { BabyIcon, Heart, Apple, User, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useFormContext } from "@/contexts/FormContext";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { userProfile, updateUserProfile } = useFormContext();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const handleLogout = () => {
    // Clear the user profile to log out
    updateUserProfile({ name: "", children: [] });
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    
    // Redirect to the auth page
    setLocation("/auth");
  };
  
  return (
    <header className="bg-gradient-to-r from-white via-primary-50 to-white shadow-md border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-3 rounded-full shadow-md">
              <BabyIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 drop-shadow-sm">
                LLM Food Advisor
              </h1>
              <div className="flex items-center space-x-1">
                <p className="text-sm font-medium text-gray-700">Food Recommendation System for Toddlers</p>
                <Heart className="h-3 w-3 text-red-500" fill="#ef4444" />
                <Apple className="h-3 w-3 text-green-600" />
              </div>
            </div>
          </div>
        </Link>
        
        <div className="flex space-x-4 items-center">
          <Link href="/how-it-works">
            <button className="bg-white px-3 py-1.5 rounded-full text-sm text-primary-600 hover:text-primary-700 font-medium border border-primary-100 shadow-sm hover:shadow transition-all duration-200">
              How it works
            </button>
          </Link>
          
          {userProfile && userProfile.name ? (
            <>
              <Link href="/profile">
                <Button 
                  variant="outline" 
                  className="rounded-full flex items-center gap-2 border-primary-100 bg-primary-50 hover:bg-primary-100 text-primary-700"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {userProfile.name}
                  </span>
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-500 hover:text-gray-700 hover:bg-red-50"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button 
                variant="outline" 
                className="rounded-full flex items-center gap-2 border-primary-100 bg-primary-50 hover:bg-primary-100 text-primary-700"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Log In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
