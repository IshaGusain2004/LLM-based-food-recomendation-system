import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon, X, Plus, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFormContext } from "@/contexts/FormContext";
import Tesseract from "tesseract.js";

export default function MultiImageUploader() {
  const { formData, setFormData, addProductImage, removeProductImage } = useFormContext();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const productImages = formData.productImages || [];
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const file = files[0];
      
      // Check if the file is an image
      if (!file.type.match('image.*')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      // Create image preview
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        
        // Add to the images array
        if (productImages.length === 0) {
          // If this is the first image, also set it as the main product image
          setFormData(prev => ({
            ...prev,
            productImage: file,
            imagePreviewUrl: imageUrl
          }));
        }
        
        addProductImage(file);
      };
      
      reader.readAsDataURL(file);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Image added",
        description: "Your image has been added to the analysis queue",
      });
      
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error processing image",
        description: "There was an error processing your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };
  
  const handleCameraCapture = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleRemoveImage = (index: number) => {
    removeProductImage(index);
    
    // If we're removing the last image, clear the main product image too
    if (productImages.length === 1) {
      setFormData(prev => ({
        ...prev,
        productImage: null,
        imagePreviewUrl: ""
      }));
    } 
    // If we're removing the first image (which is set as main), set the next one as main
    else if (index === 0 && productImages.length > 1) {
      setFormData(prev => ({
        ...prev,
        productImage: productImages[1].file,
        imagePreviewUrl: productImages[1].url
      }));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center transition-colors hover:border-primary-300 cursor-pointer"
            onClick={handleCameraCapture}
          >
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-center text-gray-500">
              Drag and drop an image<br />or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCameraCapture}
              className="flex items-center gap-2"
            >
              <CameraIcon className="h-4 w-4" />
              Add Image
            </Button>
            
            <p className="text-xs text-gray-500">
              {productImages.length} image{productImages.length !== 1 ? 's' : ''} added
            </p>
          </div>
        </div>
        
        <div className="rounded-lg border bg-gray-50 p-4">
          <h3 className="text-sm font-medium mb-2">Tips for best results:</h3>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Ensure the ingredients list is clearly visible</li>
            <li>Add multiple angles of the packaging for accuracy</li>
            <li>Include nutritional information when possible</li>
            <li>Make sure text is not blurry or cut off</li>
            <li>Good lighting improves text recognition</li>
          </ul>
        </div>
      </div>
      
      {isProcessing && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
          <p className="text-sm text-blue-700 mb-2">Processing image...</p>
          <div className="w-full bg-blue-100 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {productImages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Uploaded Images:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {productImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className={`relative aspect-square rounded-md overflow-hidden border-2 ${index === 0 ? 'border-primary-400' : 'border-gray-200'}`}>
                  <img 
                    src={image.url} 
                    alt={`Uploaded product ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  
                  {index === 0 && (
                    <div className="absolute top-0 left-0 bg-primary-400 text-white text-xs py-0.5 px-2 rounded-br-md">
                      Primary
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 transition-colors"
              onClick={handleCameraCapture}
            >
              <Plus className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-2">Add More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}