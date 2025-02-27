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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                {project.imageUrl && (
                  <div className="relative h-48 sm:h-56 w-full">
                    <Image
                      src={project.imageUrl}
                      alt={project.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">{project.name}</h2>
                  <p className="text-gray-600 text-sm sm:text-base mb-1">
                    <span className="font-medium">Duration:</span> {project.duration}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base mb-1">
                    <span className="font-medium">Beneficiaries:</span> {project.beneficiaries}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base mb-1">
                    <span className="font-medium">Location:</span> {project.location}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base mb-1">
                    <span className="font-medium">activities:</span> {project.activities}
                  </p>
                  {project.year && (
                    <p className="text-gray-600 text-sm sm:text-base mt-2 line-clamp-3">{project.year}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}