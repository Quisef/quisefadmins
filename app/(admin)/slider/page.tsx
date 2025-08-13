'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface Slide {
  id: string;
  title: string;
  text: string;
  link: string;
  imageUrl: string;
}

type SlideFormData = Omit<Slide, 'id'>;

// Constants
const EMPTY_SLIDE: SlideFormData = {
  title: '',
  text: '',
  link: '',
  imageUrl: ''
};
const ITEMS_PER_PAGE = 3; // Number of slides per page

// Image processing utilities
const resizeImageToStandardSize = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Standard dimensions for consistent display
      const targetWidth = 1050;
      const targetHeight = 750;
      
      // Set canvas dimensions
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Calculate scaling to fill entire canvas while maintaining aspect ratio
      const scaleX = targetWidth / img.width;
      const scaleY = targetHeight / img.height;
      const scale = Math.max(scaleX, scaleY); // Use max to ensure full coverage
      
      // Calculate centered position
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (targetWidth - scaledWidth) / 2;
      const offsetY = (targetHeight - scaledHeight) / 2;
      
      // Fill with a subtle background color first
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // Draw image to fill canvas
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      
      // Convert to blob and create file
      canvas.toBlob((blob) => {
        if (blob) {
          const processedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(processedFile);
        } else {
          resolve(file); // Fallback to original file
        }
      }, 'image/jpeg', 0.95);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Separate helper for Cloudinary upload with image processing
const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloud_name || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Check environment variables.');
  }

  // Process image to ensure standard size coverage
  const processedFile = await resizeImageToStandardSize(file);

  const formData = new FormData();
  formData.append('file', processedFile);
  formData.append('upload_preset', uploadPreset);
  // Add transformation parameters for 1050x750 optimization
  formData.append('transformation', 'c_fill,w_1050,h_750,q_auto:good');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

// Component for slide form (reused for add and edit)
const SlideForm = ({
  slideData,
  onSubmit,
  onChange,
  onFileChange,
  isLoading,
  buttonText,
  onCancel
}: {
  slideData: SlideFormData | Slide;
  onSubmit: (e: FormEvent) => Promise<void>;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  buttonText: string;
  onCancel?: () => void;
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 gap-4">
      <input
        type="text"
        placeholder="Title"
        name="title"
        value={slideData.title}
        onChange={onChange}
        className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      <textarea
        placeholder="Description text"
        name="text"
        value={slideData.text}
        onChange={onChange}
        className="border p-3 rounded-lg w-full h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      <input
        type="text"
        placeholder="Link (e.g. news, about, contact)"
        name="link"
        value={slideData.link}
        onChange={onChange}
        className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Image (Will be automatically resized to 1050×750 pixels)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="border p-3 rounded-lg w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500">
          Images will be automatically resized to 1050×750 for consistent display across all devices
        </p>
      </div>
      {'imageUrl' in slideData && slideData.imageUrl && (
        <div className="my-2">
          <p className="text-sm text-gray-700 mb-2 font-medium">Current image preview:</p>
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border">
            <img
              src={slideData.imageUrl}
              alt="Current slide"
              className="w-full h-full object-cover"
              onError={() => toast.error("Failed to load image")}
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                Click to view full size
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
    <div className="flex justify-end gap-2 pt-4">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center gap-2"
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        )}
        {isLoading ? 'Processing...' : buttonText}
      </button>
    </div>
  </form>
);

// Main component with pagination
const AdminSlides: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [newSlide, setNewSlide] = useState<SlideFormData>(EMPTY_SLIDE);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    fetchSlides();
  }, []);

  // Calculate pagination values
  const totalPages = Math.ceil(slides.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSlides = slides.slice(startIndex, endIndex);

  const fetchSlides = async () => {
    try {
      setIsInitialLoad(true);
      const slidesCollection = collection(db, 'slides');
      const slidesSnapshot = await getDocs(slidesCollection);
      const slidesList: Slide[] = slidesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Slide));
      setSlides(slidesList);
      // Reset to first page when slides are fetched
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Failed to load slides. Please try again.');
    } finally {
      setIsInitialLoad(false);
    }
  };

  const handleChangeNewSlide = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSlide(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeEditingSlide = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingSlide) return;
    const { name, value } = e.target;
    setEditingSlide(prev => ({ ...prev!, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    
    if (file) {
      // Show preview and file info
      toast.success(`Selected: ${file.name} - Will be resized to 1050×750 pixels`);
    }
  };

  const handleAddSlide = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = newSlide.imageUrl;
      if (imageFile) {
        toast.loading('Processing and uploading image...');
        imageUrl = await uploadImageToCloudinary(imageFile);
        toast.dismiss();
      }
      const slideData = { ...newSlide, imageUrl };
      await addDoc(collection(db, 'slides'), slideData);
      setNewSlide(EMPTY_SLIDE);
      setImageFile(null);
      setShowAddModal(false);
      await fetchSlides();
      toast.success('Slide added successfully! Image resized to 1050×750 pixels.');
    } catch (error) {
      console.error('Error adding slide:', error);
      toast.dismiss();
      toast.error('Failed to add slide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    setSlideToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteSlide = async () => {
    if (!slideToDelete) return;
    try {
      await deleteDoc(doc(db, 'slides', slideToDelete));
      setSlides(slides.filter(slide => slide.id !== slideToDelete));
      // Adjust current page if necessary
      if (currentSlides.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      toast.success('Slide deleted successfully!');
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Failed to delete slide. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setSlideToDelete(null);
    }
  };

  const handleUpdateSlide = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    setLoading(true);
    try {
      let imageUrl = editingSlide.imageUrl;
      if (imageFile) {
        toast.loading('Processing and uploading image...');
        imageUrl = await uploadImageToCloudinary(imageFile);
        toast.dismiss();
      }
      const updatedSlide = { ...editingSlide, imageUrl };
      await updateDoc(doc(db, 'slides', editingSlide.id), {
        title: updatedSlide.title,
        text: updatedSlide.text,
        link: updatedSlide.link,
        imageUrl: updatedSlide.imageUrl
      });
      setEditingSlide(null);
      setImageFile(null);
      await fetchSlides();
      toast.success('Slide updated successfully! Image resized to 1050×750 pixels.');
    } catch (error) {
      console.error('Error updating slide:', error);
      toast.dismiss();
      toast.error('Failed to update slide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAddSlideForm = () => {
    setNewSlide(EMPTY_SLIDE);
    setImageFile(null);
    setShowAddModal(false);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Slides</h1>
        <p className="text-gray-600">Images are automatically resized to 1050×750 pixels for consistent display</p>
      </div>

      {/* Add Slide Button */}
      <div className="mb-8">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md font-medium"
        >
          Add New Slide
        </button>
      </div>

      {/* Slides Table */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Current Slides</h2>
        
        {isInitialLoad ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-gray-500 flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Loading slides...
            </div>
          </div>
        ) : slides.length === 0 ? (
          <div className="bg-gray-50 p-12 text-center rounded-lg">
            <div className="text-gray-400 text-6xl mb-4">📷</div>
            <p className="text-gray-600 text-lg mb-2">No slides available</p>
            <p className="text-sm text-gray-500">Add your first slide by clicking the "Add New Slide" button</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-4 px-6 border-b text-center font-medium text-gray-700">#</th>
                    <th className="py-4 px-6 border-b text-left font-medium text-gray-700">Image Preview</th>
                    <th className="py-4 px-6 border-b text-left font-medium text-gray-700">Title</th>
                    <th className="py-4 px-6 border-b text-left font-medium text-gray-700">Text</th>
                    <th className="py-4 px-6 border-b text-left font-medium text-gray-700">Link</th>
                    <th className="py-4 px-6 border-b text-center font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSlides.map((slide, index) => (
                    <tr key={slide.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 border-b text-center font-medium">{startIndex + index + 1}</td>
                      <td className="py-4 px-6 border-b">
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 border shadow-sm">
                          {slide.imageUrl ? (
                            <img
                              src={slide.imageUrl}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                toast.error(`Failed to load image for "${slide.title}"`);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b font-medium text-gray-800">{slide.title}</td>
                      <td className="py-4 px-6 border-b text-gray-600 max-w-xs">
                        <div className="truncate" title={slide.text}>
                          {slide.text}
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b">
                        <span className="text-blue-600 font-medium">/{slide.link}</span>
                      </td>
                      <td className="py-4 px-6 border-b text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setEditingSlide(slide)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSlide(slide.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-between items-center">
                <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                  Showing {startIndex + 1} to {Math.min(endIndex, slides.length)} of {slides.length} slides
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors font-medium"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                        currentPage === page
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Slide Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Slide</h2>
            <SlideForm
              slideData={newSlide}
              onSubmit={handleAddSlide}
              onChange={handleChangeNewSlide}
              onFileChange={handleFileChange}
              isLoading={loading}
              buttonText="Add Slide"
              onCancel={resetAddSlideForm}
            />
          </div>
        </div>
      )}

      {/* Edit Slide Modal */}
      {editingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Edit Slide</h2>
            <SlideForm
              slideData={editingSlide}
              onSubmit={handleUpdateSlide}
              onChange={handleChangeEditingSlide}
              onFileChange={handleFileChange}
              isLoading={loading}
              buttonText="Save Changes"
              onCancel={() => {
                setEditingSlide(null);
                setImageFile(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Delete Slide</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this slide? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSlide}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSlides;