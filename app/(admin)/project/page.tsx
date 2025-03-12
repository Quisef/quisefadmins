'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent, DragEvent } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_IMAGES = 15;

export interface Project {
  id?: string;
  name: string;
  duration: string;
  beneficiaries: string;
  location: string;
  activities: string;
  year?: string;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
}

async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloud_name || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Check environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  console.log('Uploading to Cloudinary:', file.name);
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
  console.log('Upload successful:', data.secure_url);
  return data.secure_url;
}

export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const projectsPerPage = 4;

  type FormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
  const initialFormData: FormData = {
    name: '',
    duration: '',
    beneficiaries: '',
    location: '',
    activities: '',
    year: '',
    imageUrls: [],
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const newPreviewUrls = imageFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
    return () => newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [imageFiles]);

  const fetchProjects = async (): Promise<void> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        imageUrls: doc.data().imageUrls || (doc.data().imageUrl ? [doc.data().imageUrl] : []),
      })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    } catch (err) {
      console.error('Firestore error details:', err);
      setError('Failed to fetch projects');
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.year?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number): void => {
    setCurrentPage(pageNumber);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (files: File[]) => {
    const validFiles = files.filter(file => file.size <= MAX_IMAGE_SIZE);
    const totalImages = (formData.imageUrls?.length || 0) + imageFiles.length + validFiles.length;
    if (totalImages > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images total.`);
      return;
    }
    if (validFiles.length < files.length) {
      alert('Some files exceed the 1MB size limit and were not added.');
    }
    setImageFiles(prev => [...prev, ...validFiles].slice(0, MAX_IMAGES - (formData.imageUrls?.length || 0)));
  };

  const handleImageRemove = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setFormData(prev => ({
        ...prev,
        imageUrls: prev.imageUrls?.filter((_, i) => i !== index) || []
      }));
    } else {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrls = formData.imageUrls || [];
      
      if (imageFiles.length > 0) {
        setUploadProgress(0);
        const uploadPromises = imageFiles.map(async (file, index) => {
          const url = await uploadImageToCloudinary(file);
          setUploadProgress(((index + 1) / imageFiles.length) * 100);
          return url;
        });
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const projectData: Partial<Project> = {
        ...formData,
        imageUrls,
        updatedAt: new Date().toISOString(),
      };

      if (currentProject?.id) {
        await updateDoc(doc(db, 'projects', currentProject.id), projectData);
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: new Date().toISOString(),
        });
      }

      await fetchProjects();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const openDeleteModal = (projectId: string): void => {
    setProjectToDelete(projectId);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (!projectToDelete) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'projects', projectToDelete));
      await fetchProjects();
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (project: Project): void => {
    setCurrentProject(project);
    setFormData({
      name: project.name,
      duration: project.duration,
      beneficiaries: project.beneficiaries,
      location: project.location,
      activities: project.activities,
      year: project.year || '',
      imageUrls: project.imageUrls || [],
    });
    setImageFiles([]);
    setPreviewUrls([]);
    setIsModalOpen(true);
  };

  const resetForm = (): void => {
    setFormData(initialFormData);
    setCurrentProject(null);
    setImageFiles([]);
    setPreviewUrls([]);
    setUploadProgress(0);
  };

  const toggleProjectDetails = (project: Project) => {
    if (selectedProject?.id === project.id && showDetails) {
      setShowDetails(false);
      setSelectedProject(null);
    } else {
      setSelectedProject(project);
      setShowDetails(true);
    }
  };

  interface ImagePickerProps {
    onImageSelect: (files: File[]) => void;
    currentImages: string[];
    previewUrls: string[];
    onRemoveImage: (index: number, isExisting: boolean) => void;
  }

  const ImagePicker = ({ onImageSelect, currentImages, previewUrls, onRemoveImage }: ImagePickerProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const totalImages = currentImages.length + previewUrls.length;

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onImageSelect(files);
    };

    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {currentImages.map((url, index) => (
            <div key={`existing-${index}`} className="relative w-full h-32 rounded overflow-hidden border-2 border-gray-200">
              <img src={url} alt={`Existing Image ${index + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => onRemoveImage(index, true)}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
              >
                X
              </button>
            </div>
          ))}
          {previewUrls.map((url, index) => (
            <div key={`preview-${index}`} className="relative w-full h-32 rounded overflow-hidden border-2 border-gray-200">
              <img src={url} alt={`Preview Image ${index + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => onRemoveImage(index, false)}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
              >
                X
              </button>
            </div>
          ))}
        </div>
        {totalImages < MAX_IMAGES && (
          <div
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded p-4 text-center flex flex-col items-center justify-center ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && onImageSelect(Array.from(e.target.files))}
              className="hidden"
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className="cursor-pointer">
              <p className="text-gray-600 text-sm">
                {isDragging ? 'Drop images here' : `Drag & drop (Max ${MAX_IMAGES} images)`}
              </p>
              <span className="text-blue-600 hover:underline text-sm">Browse</span>
            </label>
          </div>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {totalImages}/{MAX_IMAGES} images uploaded
        </p>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Project Management</h1>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-300"
          >
            Add New Project
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search projects by name, location, or description..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full max-w-md border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProjects.length > 0 ? (
                currentProjects.map((project) => (
                  <div key={project.id} className="relative">
                    <div 
                      className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-gray-200 hover:border-blue-500 transition-all duration-300 cursor-pointer shadow-lg"
                      onClick={() => toggleProjectDetails(project)}
                    >
                      {project.imageUrls?.[0] ? (
                        <img
                          src={project.imageUrls[0]}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 opacity-0 hover:opacity-100 rounded-full transition-opacity duration-300">
                        <p className="text-white font-semibold text-center px-2">{project.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-3 gap-2">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 bg-gray-100 text-blue-600 rounded-full hover:bg-gray-200 transition-all duration-300"
                        title="Edit Project"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => toggleProjectDetails(project)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all duration-300"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faInfoCircle} />
                      </button>
                      <button
                        onClick={() => project.id && openDeleteModal(project.id)}
                        className="p-2 bg-gray-100 text-red-600 rounded-full hover:bg-gray-200 transition-all duration-300"
                        title="Delete Project"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600 col-span-full">No projects found matching your search</div>
              )}
            </div>

            {showDetails && selectedProject && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-40">
                <div className="bg-white rounded-lg max-w-2xl w-full p-6 sm:p-8 shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{selectedProject.name}</h2>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {selectedProject.imageUrls && selectedProject.imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedProject.imageUrls.map((url, index) => (
                          <div key={index} className="w-full h-32 rounded-lg overflow-hidden">
                            <img src={url} alt={`${selectedProject.name} ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Year</p>
                        <p className="font-medium">{selectedProject.year || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{selectedProject.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{selectedProject.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Beneficiaries</p>
                        <p className="font-medium">{selectedProject.beneficiaries}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Activities</p>
                      <p className="font-medium">{selectedProject.activities}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      onClick={() => {
                        setShowDetails(false);
                        openEditModal(selectedProject);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-300"
                    >
                      Edit Project
                    </button>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-all duration-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
                <button
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  First
                </button>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(pageNum => 
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  )
                  .map((pageNum, index, array) => (
                    <React.Fragment key={pageNum}>
                      {index > 0 && array[index - 1] !== pageNum - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <button
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Next
                </button>
                <button
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Last
                </button>
              </div>
            )}

            <div className="mt-4 text-center text-gray-600">
              Showing {indexOfFirstProject + 1} - {Math.min(indexOfLastProject, filteredProjects.length)} of{' '}
              {filteredProjects.length} projects
            </div>
          </>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
                {currentProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Project Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Duration</label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Year</label>
                      <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Beneficiaries</label>
                      <input
                        type="text"
                        name="beneficiaries"
                        value={formData.beneficiaries}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Major Activities</label>
                    <textarea
                      name="activities"
                      value={formData.activities}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Project Images <span className="text-gray-500">(Up to {MAX_IMAGES})</span>
                    </label>
                    <ImagePicker
                      onImageSelect={handleImageSelect}
                      currentImages={formData.imageUrls || []}
                      previewUrls={previewUrls}
                      onRemoveImage={handleImageRemove}
                    />
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-100 disabled:opacity-10"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-300 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}