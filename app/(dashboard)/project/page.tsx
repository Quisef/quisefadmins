'use client';

import { useState, useEffect, FormEvent, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';


const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// types/project.ts
export interface Project {
  id?: string;
  name: string;
  duration: string;
  beneficiaries: string;
  location: string;
  activities: string;
  year?: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

// lib/cloudinary.ts (Mocked for this example; replace with actual Cloudinary logic)
async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'YOUR_UPLOAD_PRESET'); // Replace with your Cloudinary upload preset

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, // Replace with your Cloudinary cloud name
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) throw new Error('Failed to upload image');
  const data = await response.json();
  return data.secure_url;
}

export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const projectsPerPage = 5;

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

  useEffect(() => {
    fetchProjects();
  }, []);

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
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        setUploadProgress(0);
        imageUrl = await uploadImageToCloudinary(imageFile);
        setUploadProgress(100);
      }

      const projectData = {
        ...formData,
        imageUrl,
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
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (projectId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'projects', projectId));
        await fetchProjects();
      } catch (err) {
        setError('Failed to delete project');
        setLoading(false);
      }
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
      imageUrl: project.imageUrl,
    });
    setIsModalOpen(true);
  };

  const resetForm = (): void => {
    setFormData(initialFormData);
    setCurrentProject(null);
    setImageFile(null);
    setUploadProgress(0);
  };

  interface ImagePickerProps {
    onImageSelect: (file: File) => void;
    currentImage: string | null;
    onRemoveImage: () => void;
  }

  const ImagePicker = ({ onImageSelect, currentImage, onRemoveImage }: ImagePickerProps) => {
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

    return (
      <div>
        {currentImage ? (
          <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
            <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
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
            className={`border-2 border-dashed rounded p-4 text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onImageSelect(e.target.files[0])}
              className="hidden"
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className="cursor-pointer">
              <p className="text-gray-600">{isDragging ? 'Drop image here' : 'Drag & drop image here or click to select'}</p>
              <span className="text-blue-600 hover:underline">Browse files</span>
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
            <div className="grid gap-6">
              {currentProjects.length > 0 ? (
                currentProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {project.imageUrl && (
                          <img
                            src={project.imageUrl}
                            alt={project.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded"
                          />
                        )}
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold mb-2">{project.name}</h2>
                          <p className="text-gray-600 mb-1">Duration: {project.duration}</p>
                          <p className="text-gray-600 mb-1">Location: {project.location}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 sm:mt-0">
                        <button
                          onClick={() => openEditModal(project)}
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => project.id && handleDelete(project.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600">No projects found matching your search</div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Next
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

        {/* Modal */}
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
                    <label className="block text-sm font-medium mb-1 text-gray-700">Year</label>
                    <textarea
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Project Image</label>
                    <ImagePicker
                      onImageSelect={handleImageSelect}
                      currentImage={formData.imageUrl}
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
      </div>
    </main>
  );
}