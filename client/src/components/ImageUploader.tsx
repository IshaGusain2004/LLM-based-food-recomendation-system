import { useRef, useState, useCallback } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface ImageUploaderProps {
  onContinue?: () => void;
}

export default function ImageUploader({ onContinue }: ImageUploaderProps) {
  const { formData, setFormData } = useFormContext();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [, setLocation] = useLocation();

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB.',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPG, PNG, GIF).',
        variant: 'destructive',
      });
      return;
    }

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);

    setFormData({
      ...formData,
      productImage: file,
      imagePreviewUrl: imageUrl,
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    handleFileChange(file);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      productImage: null,
      imagePreviewUrl: '',
    });
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, []);

  // Format file size to be human-readable
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="mb-6">
      {!formData.productImage ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 transition duration-150 cursor-pointer ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:bg-gray-100'}`}
          onClick={handleBrowseClick}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-gray-800 font-medium text-lg mb-1">Upload Product Image</h3>
          <p className="text-gray-700 font-medium mb-1">Drag and drop your image here</p>
          <p className="text-gray-500 text-sm mb-2">or click to browse files</p>
          <p className="text-primary-600 text-sm font-medium mb-4">Take a clear photo of the ingredients list</p>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            id="product-image-upload" 
            ref={fileInputRef}
            onChange={handleInputChange}
          />
          <Button className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2" size="lg">Select Image</Button>
        </div>
      ) : (
        <div id="image-preview-container">
          <h3 className="text-lg font-medium mb-3">Image Preview</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
            <div className="relative">
              <img 
                src={formData.imagePreviewUrl} 
                alt="Product image preview" 
                className="rounded-md object-cover w-full h-48" 
              />
              <button 
                className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full"
                onClick={handleRemoveImage}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-700">
                {formData.productImage?.name}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                {formData.productImage ? formatFileSize(formData.productImage.size) : ''}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold px-8 py-3 text-base rounded-md shadow-lg hover:shadow-xl transition-all duration-300" 
              size="lg"
              onClick={onContinue}
            >
              Continue to Health Details →
            </Button>
            <Button 
              className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-6 py-3 rounded-md" 
              size="default"
              onClick={() => setLocation("/profile")}
            >
              <User className="h-5 w-5 mr-2" /> Go to Profile
            </Button>
          </div>
        </div>
      )}
      <div className="text-sm text-gray-500 mt-2">
        Supported formats: JPG, PNG, GIF (Max 5MB)
      </div>
    </div>
  );
}
