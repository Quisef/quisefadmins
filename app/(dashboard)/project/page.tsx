'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent, DragEvent } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export interface Project {
  id?: string;
  name: string;
  duration: string;
  beneficiaries: string;
  location: string;
  activities: string;
  year?: string;
  imageUrl?: string;
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
  const projectsPerPage = 8; // Increased for better grid layout

  type FormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
  const initialFormData: FormData = {
    name: '',
    duration: '',
    beneficiaries: '',
    location: '',
    activities: '',
    year: '',
    imageUrl: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Create preview URL for the selected image file
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const fetchProjects = async (): Promise<void> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    } catch (err) {
      console.error('Firestore error details:', err);
      setError('Failed to fetch projects');
      setLoading(false);
    }
  };

  // Filter and paginate projects
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

  const handleImageSelect = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      alert('File size exceeds 5MB limit.');
      return;
    }
    setImageFile(file);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = formData.imageUrl || '';

      if (imageFile) {
        setUploadProgress(0);
        imageUrl = await uploadImageToCloudinary(imageFile);
        setUploadProgress(100);
      }

      const projectData: Partial<Project> = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      
      if (imageUrl) {
        projectData.imageUrl = imageUrl;
      }

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
      imageUrl: project.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = (): void => {
    setFormData(initialFormData);
    setCurrentProject(null);
    setImageFile(null);
    setPreviewUrl(null);
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
    onImageSelect: (file: File) => void;
    currentImage: string | null;
    previewUrl: string | null;
    onRemoveImage: () => void;
  }

  const ImagePicker = ({ onImageSelect, currentImage, previewUrl, onRemoveImage }: ImagePickerProps) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files?.[0]) onImageSelect(files[0]);
    };

    const displayImage = previewUrl || currentImage;

    return (
      <div>
        {displayImage ? (
          <div className="relative w-full h-40 rounded-full overflow-hidden border-2 border-gray-200 mx-auto max-w-xs">
            <img src={displayImage} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={onRemoveImage}
              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
            >
              X
            </button>
          </div>
        ) : (
          <div
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-full p-4 text-center h-40 w-40 flex flex-col items-center justify-center mx-auto ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onImageSelect(e.target.files[0])}
              className="hidden"
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className="cursor-pointer">
              <p className="text-gray-600 text-sm">{isDragging ? 'Drop image here' : 'Drag & drop'}</p>
              <span className="text-blue-600 hover:underline text-sm">Browse</span>
            </label>
          </div>
        )}
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

        {/* Search Bar */}
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
            {/* Project Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProjects.length > 0 ? (
                currentProjects.map((project) => (
                  <div key={project.id} className="relative">
                    {/* Circular image preview */}
                    <div 
                      className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-gray-200 hover:border-blue-500 transition-all duration-300 cursor-pointer shadow-lg"
                      onClick={() => toggleProjectDetails(project)}
                    >
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center  bg-opacity-50 opacity-0 hover:opacity-100 rounded-full transition-opacity duration-300">
                        <p className="text-white font-semibold text-center px-2">{project.name}</p>
                      </div>
                    </div>
                    
                    {/* Action buttons below circle */}
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

            {/* Project Details Modal */}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedProject.imageUrl && (
                      <div className="md:col-span-1">
                        <div className="w-full h-48 rounded-lg overflow-hidden">
                          <img
                            src={selectedProject.imageUrl}
                            alt={selectedProject.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className={selectedProject.imageUrl ? "md:col-span-2" : "md:col-span-3"}>
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
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Activities</p>
                        <p className="font-medium">{selectedProject.activities}</p>
                      </div>
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

            {/* Pagination Controls */}
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
                
                {/* Show limited page numbers with ellipsis */}
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

            {/* Results Counter */}
            <div className="mt-4 text-center text-gray-600">
              Showing {indexOfFirstProject + 1} - {Math.min(indexOfLastProject, filteredProjects.length)} of{' '}
              {filteredProjects.length} projects
            </div>
          </>
        )}

        {/* Project Form Modal */}
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
                      Project Image <span className="text-gray-500">(Optional)</span>
                    </label>
                    <ImagePicker
                      onImageSelect={handleImageSelect}
                      currentImage={formData.imageUrl || null}
                      previewUrl={previewUrl}
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
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
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