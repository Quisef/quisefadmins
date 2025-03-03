'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Define Project type
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

const metadata: Metadata = {
  title: 'Projects - QuietShelter Empowerment Foundation',
  openGraph: {
    title: 'Projects - QuietShelter Empowerment Foundation',
    url: 'https://your-domain.com/projects',
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

  // Get current projects for pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle project selection
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  // Close project details modal
  const closeProjectDetails = () => {
    setSelectedProject(null);
  };

  return (
    <main className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-8 sm:mb-12">
          Our Projects
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No projects available at this time.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {currentProjects.map((project) => (
                <div
                  key={project.id}
                  className="relative group cursor-pointer"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="relative h-64 w-64 mx-auto rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                    <Image
                      src={project.imageUrl || '/images/Q5blue.jpg'}
                      alt={project.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-blue-800 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                      <h2 className="text-white text-xl font-bold text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {project.name}
                      </h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <ul className="flex space-x-2">
                {Array.from({ length: Math.ceil(projects.length / projectsPerPage) }, (_, i) => (
                  <li key={i}>
                    <button
                      onClick={() => paginate(i + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Project Details Modal */}
            {selectedProject && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                  <div className="relative h-56 w-full">
                    <Image
                      src={selectedProject.imageUrl || '/images/placeholder.jpg'}
                      alt={selectedProject.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedProject.name}</h2>
                    <div className="space-y-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Duration:</span> {selectedProject.duration}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Beneficiaries:</span> {selectedProject.beneficiaries}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Location:</span> {selectedProject.location}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Activities:</span> {selectedProject.activities}
                      </p>
                      {selectedProject.year && (
                        <p className="text-gray-700">
                          <span className="font-semibold">Year:</span> {selectedProject.year}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={closeProjectDetails}
                      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
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