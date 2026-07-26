'use client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface Project {
  id?: string;
  name: string;
  duration: string;
  beneficiaries: string;
  location: string;
  activities: string;
  year?: string;
  imageUrls: string[];
  createdAt?: string;
  updatedAt?: string;
}

const metadata: Metadata = {
  title: 'Projects - QuietShelter Empowerment Foundation',
  openGraph: {
    title: 'Projects - QuietShelter Empowerment Foundation',
    url: 'https://www.quietshelterfoundation.com/projects',
    images: ['/images/cham.jpg'],
  },
};

export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [projectsPerPage] = useState<number>(6);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCarouselOpen, setIsCarouselOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (): Promise<void> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        imageUrls: doc.data().imageUrls || (doc.data().imageUrl ? [doc.data().imageUrl] : ['/images/Q5blue.jpg']),
      })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects');
      setLoading(false);
    }
  };

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
    setSelectedImage(null);
    setIsCarouselOpen(false);
  };

  const openImageViewer = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsCarouselOpen(true);
  };

  const closeImageViewer = () => {
    setIsCarouselOpen(false);
    setTimeout(() => setSelectedImage(null), 300); // Delay to allow transition
  };

  // Handle keyboard navigation for the lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCarouselOpen || !selectedProject) return;
      
      const currentIndex = selectedProject.imageUrls.indexOf(selectedImage || '');
      
      if (e.key === 'ArrowRight' && currentIndex < selectedProject.imageUrls.length - 1) {
        setSelectedImage(selectedProject.imageUrls[currentIndex + 1]);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedImage(selectedProject.imageUrls[currentIndex - 1]);
      } else if (e.key === 'Escape') {
        closeImageViewer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedProject, isCarouselOpen]);

  return (
    <main className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-8 sm:mb-12">
          Our Projects
        </h1>

        {!selectedProject && (
          <section
            className="mb-12 overflow-hidden rounded-2xl bg-emerald-950 text-white shadow-xl"
            aria-labelledby="featured-youth-empowerment"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-72">
                <Image
                  src="/images/official-unveiling.jpg"
                  alt="The Future Entrepreneurship Initiative being unveiled to NYSC corps members"
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Featured project
                </p>
                <h2 id="featured-youth-empowerment" className="mt-3 text-3xl font-bold">
                  Youth Empowerment
                </h2>
                <p className="mt-5 text-lg leading-8 text-emerald-50">
                  Through the Future Entrepreneurship Initiative, QuiSEF gives young Nigerians practical
                  business training, mentorship, access to seed support, and a network designed for long-term
                  growth.
                </p>
                <Link
                  href="/youth-empowerment"
                  className="mt-7 inline-flex w-fit rounded-md bg-emerald-400 px-5 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                >
                  Explore Youth Empowerment
                </Link>
              </div>
            </div>
          </section>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No additional projects available at this time.</div>
        ) : (
          <>
            {!selectedProject ? (
              // Circular Project Grid - Keeping original design
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {currentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="relative h-64 w-64 mx-auto rounded-full overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                      <Image
                        src={project.imageUrls[0]}
                        alt={project.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-opacity duration-300 group-hover:opacity-75"
                      />
                      <div className="absolute inset-0 bg-blue-800 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                        <div className="text-center">
                          <h2 className="text-white text-xl font-bold px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {project.name}
                          </h2>
                          <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {project.imageUrls.length} {project.imageUrls.length === 1 ? 'Image' : 'Images'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Project Details with Gallery View
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Back button */}
                <button
                  onClick={closeProjectDetails}
                  className="m-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Projects
                </button>
                
                {/* Featured Image - Circular */}
                <div className="flex justify-center mb-6">
                  <div 
                    className="relative h-64 w-64 rounded-full overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
                    onClick={() => openImageViewer(selectedProject.imageUrls[0])}
                  >
                    <Image
                      src={selectedProject.imageUrls[0]}
                      alt={selectedProject.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-blue-800 bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-white/60 p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{selectedProject.name}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-500 mb-3">Project Details</h3>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="mb-2 text-black">
                          <span className="font-semibold">Duration:</span> {selectedProject.duration}
                        </p>
                        <p className="mb-2 text-black">
                          <span className="font-semibold ">Location:</span> {selectedProject.location}
                        </p>
                        <p className="mb-2 text-black">
                          <span className="font-semibold">Beneficiaries:</span> {selectedProject.beneficiaries}
                        </p>
                        {selectedProject.year && (
                          <p className="mb-2 text-black">
                            <span className="font-semibold">Year:</span> {selectedProject.year}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-blue-500 mb-3">Activities</h3>
                      <div className="bg-gray-50 p-4 rounded-lg h-full">
                        <p className="text-gray-700">{selectedProject.activities}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image Gallery - Circular Thumbnails */}
                  {selectedProject.imageUrls.length > 1 && (
                    <>
                      <h3 className="text-xl font-semibold text-blue-500 mb-4 text-center">Project Gallery</h3>
                      <div className="flex flex-wrap justify-center gap-4">
                        {selectedProject.imageUrls.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="relative w-20 h-20 sm:w-24 sm:h-24 cursor-pointer hover:scale-110 transition-transform duration-300"
                            onClick={() => openImageViewer(imageUrl)}
                          >
                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors duration-300">
                              <Image
                                src={imageUrl}
                                alt={`${selectedProject.name} - Image ${index + 1}`}
                                fill
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {!selectedProject && totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
            )}

            {/* Carousel Image Viewer */}
            {isCarouselOpen && selectedProject && (
              <div 
                className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 transition-opacity duration-300 ${isCarouselOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={closeImageViewer}
              >
                <div className="relative max-w-4xl w-full p-4" onClick={e => e.stopPropagation()}>
                  {/* Carousel Card */}
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300">
                    {/* Image */}
                    <div className="relative h-96 w-full">
                      {selectedImage && (
                        <Image
                          src={selectedImage}
                          alt="Project image"
                          fill
                          style={{ objectFit: 'cover' }}
                          className="transition-opacity duration-300"
                        />
                      )}
                      
                      {/* Project Title Overlay */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="text-white text-xl font-bold">{selectedProject.name}</h3>
                      </div>
                    </div>
                    
                    {/* Bottom Controls and Thumbnails */}
                    <div className="p-4 bg-gray-100">
                      {/* Navigation Row */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Image Counter */}
                        <div className="text-gray-700 font-medium">
                          {selectedProject.imageUrls.indexOf(selectedImage || '') + 1} / {selectedProject.imageUrls.length}
                        </div>
                        
                        {/* Navigation Buttons */}
                        <div className="flex space-x-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentIndex = selectedProject.imageUrls.indexOf(selectedImage || '');
                              if (currentIndex > 0) {
                                setSelectedImage(selectedProject.imageUrls[currentIndex - 1]);
                              }
                            }}
                            disabled={selectedProject.imageUrls.indexOf(selectedImage || '') === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full disabled:opacity-30 transition-all"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentIndex = selectedProject.imageUrls.indexOf(selectedImage || '');
                              if (currentIndex < selectedProject.imageUrls.length - 1) {
                                setSelectedImage(selectedProject.imageUrls[currentIndex + 1]);
                              }
                            }}
                            disabled={selectedProject.imageUrls.indexOf(selectedImage || '') === selectedProject.imageUrls.length - 1}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full disabled:opacity-30 transition-all"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Close Button */}
                        <button
                          onClick={closeImageViewer}
                          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-all"
                        >
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Thumbnail Gallery */}
                      {selectedProject.imageUrls.length > 1 && (
                        <div className="flex overflow-x-auto pb-2 space-x-2 -mx-1 px-1">
                          {selectedProject.imageUrls.map((imageUrl, index) => (
                            <div
                              key={index}
                              className={`relative flex-shrink-0 w-16 h-16 cursor-pointer transition-all duration-200 ${selectedImage === imageUrl ? 'ring-2 ring-blue-600 scale-105' : 'opacity-70 hover:opacity-100'}`}
                              onClick={() => setSelectedImage(imageUrl)}
                            >
                              <div className="w-full h-full rounded-lg overflow-hidden">
                                <Image
                                  src={imageUrl}
                                  alt={`Thumbnail ${index + 1}`}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
