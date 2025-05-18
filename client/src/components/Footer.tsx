import { BabyIcon, Heart, Apple, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-white via-primary-50 to-white border-t border-primary-100 mt-12 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-2 rounded-full shadow-sm">
              <BabyIcon className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-gray-800 drop-shadow-sm">
              LLM Food Advisor
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 my-4 md:my-0">
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">Privacy Policy</button>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">Terms of Use</button>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">Contact Us</button>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm font-medium text-primary-600">&copy; {new Date().getFullYear()} LLM Food Advisor</p>
            <p className="text-xs text-gray-700 mt-1">Made by Himanshu Dorbi, Isha Gusain, Nikhil Mahar and Abhay Karki</p>
            <div className="flex items-center justify-center md:justify-end space-x-1 mt-1">
              <p className="text-xs text-gray-500">Powered by</p>
              <Sparkles className="h-3 w-3 text-primary-500" />
              <p className="text-xs text-primary-700 font-semibold">Gemini AI</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
