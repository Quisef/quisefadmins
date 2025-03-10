'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface Slide {
  id: string;
  title: string;
  link: string;
  imageUrl: string;
}

type SlideFormData = Omit<Slide, 'id'>;

// Constants
const EMPTY_SLIDE: SlideFormData = {
  title: '',
  link: '',
  imageUrl: ''
};

// Separate helper for Cloudinary upload
const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloud_name || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Check environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

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
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
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
        className="border p-2 rounded w-full"
        required
      />
      <input
        type="text"
        placeholder="Link (e.g. news, about, contact)"
        name="link"
        value={slideData.link}
        onChange={onChange}
        className="border p-2 rounded w-full"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="border p-2 rounded w-full"
      />
      {'imageUrl' in slideData && slideData.imageUrl && (
        <div className="my-2">
          <p className="text-sm text-gray-500 mb-1">Current image:</p>
          <img
            src={slideData.imageUrl}
            alt="Current slide"
            className="w-32 h-32 object-cover rounded"
            onError={() => toast.error("Failed to load image")}
          />
        </div>
      )}
    </div>
    <div className="flex justify-end gap-2">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
      >
        {isLoading ? 'Processing...' : buttonText}
      </button>
    </div>
  </form>
);

// Main component
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

  useEffect(() => {
    fetchSlides();
  }, []);

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
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Failed to load slides. Please try again.');
    } finally {
      setIsInitialLoad(false);
    }
  };

  const handleChangeNewSlide = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSlide(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeEditingSlide = (e: ChangeEvent<HTMLInputElement>) => {
    if (!editingSlide) return;
    const { name, value } = e.target;
    setEditingSlide(prev => ({ ...prev!, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImageFile(e.target.files?.[0] || null);
  };

  const handleAddSlide = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = newSlide.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const slideData = { ...newSlide, imageUrl };
      await addDoc(collection(db, 'slides'), slideData);
      
      setNewSlide(EMPTY_SLIDE);
      setImageFile(null);
      setShowAddModal(false);
      await fetchSlides();
      toast.success('Slide added successfully!');
    } catch (error) {
      console.error('Error adding slide:', error);
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
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const updatedSlide = { ...editingSlide, imageUrl };
      await updateDoc(doc(db, 'slides', editingSlide.id), {
        title: updatedSlide.title,
        link: updatedSlide.link,
        imageUrl: updatedSlide.imageUrl
      });
      
      setEditingSlide(null);
      setImageFile(null);
      await fetchSlides();
      toast.success('Slide updated successfully!');
    } catch (error) {
      console.error('Error updating slide:', error);
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

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Manage Slides</h1>

      {/* Add Slide Button */}
      <div className="mb-8">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add New Slide
        </button>
      </div>

      {/* Slides Table */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Current Slides</h2>
        
        {isInitialLoad ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-gray-500">Loading slides...</div>
          </div>
        ) : slides.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-md">
            <p className="text-gray-500">No slides available</p>
            <p className="text-sm text-gray-400 mt-2">Add your first slide by clicking the "Add New Slide" button</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-center">#</th>
                  <th className="py-2 px-4 border-b text-left">Image</th>
                  <th className="py-2 px-4 border-b text-left">Title</th>
                  <th className="py-2 px-4 border-b text-left">Link</th>
                  <th className="py-2 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slides.map((slide, index) => (
                  <tr key={slide.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b text-center">{index + 1}</td>
                    <td className="py-3 px-4 border-b">
                      <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
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
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b font-medium">{slide.title}</td>
                    <td className="py-3 px-4 border-b">
                      <span className="text-blue-500">/{slide.link}</span>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setEditingSlide(slide)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
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
        )}
      </div>

      {/* Add Slide Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Slide</h2>
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
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Edit Slide</h2>
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
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Delete Slide</h2>
            <p className="mb-4">Are you sure you want to delete this slide?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSlide}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
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