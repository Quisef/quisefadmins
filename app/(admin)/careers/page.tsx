'use client';

import { useState, useEffect, FormEvent } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

interface Opportunity {
  id: string;
  imageUrl: string;
  type: 'Full Time' | 'Part Time' | 'Volunteer';
  title: string;
  location: string;
  description: string;
  href: string;
  category: 'Jobs' | 'Volunteer';
}

interface Stats {
  totalOpenings: number | string;
  totalLocations: number | string;
  totalVolunteers: number | string;
}

const AdminCareers: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [newOpportunity, setNewOpportunity] = useState<Omit<Opportunity, 'id'>>({
    imageUrl: '',
    type: 'Full Time',
    title: '',
    location: '',
    description: '',
    href: '',
    category: 'Jobs'
  });
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [stats, setStats] = useState<Stats>({ totalOpenings: 0, totalLocations: 0, totalVolunteers: 0 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const opportunitiesCollection = collection(db, 'opportunities');
      const opportunitiesSnapshot = await getDocs(opportunitiesCollection);
      const opportunitiesList: Opportunity[] = opportunitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Opportunity));
      setOpportunities(opportunitiesList);

      const statsCollection = collection(db, 'stats');
      const statsSnapshot = await getDocs(statsCollection);
      const statsData = statsSnapshot.docs[0]?.data() || { totalOpenings: 0, totalLocations: 0, totalVolunteers: 0 };
      setStats(statsData as Stats);

      console.log('Fetched opportunities:', opportunitiesList);
      console.log('Fetched stats:', statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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
      console.error('Upload error details:', errorData);
      throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
    }
  
    const data = await response.json();
    console.log('Upload successful:', data.secure_url);
    return data.secure_url;
  }

  const handleAddOpportunity = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = newOpportunity.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const opportunityData = { ...newOpportunity, imageUrl };
      await addDoc(collection(db, 'opportunities'), opportunityData);
      
      setNewOpportunity({ imageUrl: '', type: 'Full Time', title: '', location: '', description: '', href: '', category: 'Jobs' });
      setImageFile(null);
      setIsAddModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Error adding opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'opportunities', id));
      setOpportunities(opportunities.filter(opp => opp.id !== id));
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    }
  };

  const handleUpdateOpportunity = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingOpportunity) return;
    setLoading(true);

    try {
      let imageUrl = editingOpportunity.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const updatedOpportunity = { ...editingOpportunity, imageUrl };
      await updateDoc(doc(db, 'opportunities', editingOpportunity.id), updatedOpportunity);
      setEditingOpportunity(null);
      setImageFile(null);
      await fetchData();
    } catch (error) {
      console.error('Error updating opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStats = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const statsToSave = {
        totalOpenings: stats.totalOpenings === '' ? 0 : Number(stats.totalOpenings),
        totalLocations: stats.totalLocations === '' ? 0 : Number(stats.totalLocations),
        totalVolunteers: stats.totalVolunteers === '' ? 0 : Number(stats.totalVolunteers),
      };
      await setDoc(doc(db, 'stats', 'currentStats'), statsToSave);
      console.log('Stats updated:', statsToSave);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Manage Career Opportunities</h1>

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="bg-blue-500 text-white p-2 rounded w-full sm:w-auto hover:bg-blue-600 mb-6 sm:mb-8"
      >
        Add New Opportunity
      </button>

      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Update Stats</h2>
        <form onSubmit={handleUpdateStats} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Total Openings"
              value={stats.totalOpenings === 0 ? '' : stats.totalOpenings}
              onChange={(e) => setStats({ ...stats, totalOpenings: e.target.value === '' ? '' : Number(e.target.value) })}
              className="border p-2 rounded w-full placeholder-gray-500 placeholder-opacity-75"
              min={0}
            />
            <input
              type="number"
              placeholder="Total Locations"
              value={stats.totalLocations === 0 ? '' : stats.totalLocations}
              onChange={(e) => setStats({ ...stats, totalLocations: e.target.value === '' ? '' : Number(e.target.value) })}
              className="border p-2 rounded w-full placeholder-gray-500 placeholder-opacity-75"
              min={0}
            />
            <input
              type="number"
              placeholder="Total Volunteers"
              value={stats.totalVolunteers === 0 ? '' : stats.totalVolunteers}
              onChange={(e) => setStats({ ...stats, totalVolunteers: e.target.value === '' ? '' : Number(e.target.value) })}
              className="border p-2 rounded w-full placeholder-gray-500 placeholder-opacity-75"
              min={0}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded w-full sm:w-auto hover:bg-blue-600"
          >
            Update Stats
          </button>
        </form>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 overflow-x-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Current Opportunities</h2>
        {opportunities.length === 0 ? (
          <p className="text-gray-500">No opportunities available</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Link</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {opportunities.map((opp, index) => (
                <tr key={opp.id}>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                    <img
                      src={opp.imageUrl || '/placeholder.jpg'}
                      alt={opp.title}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                      onError={(e) => console.error(`Failed to load image: ${opp.imageUrl}`)}
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">{opp.title}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">{opp.type}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">{opp.category}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">{opp.location}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm text-gray-500 line-clamp-2">{opp.description}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm text-blue-500 underline">{opp.href}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingOpportunity(opp)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-xs sm:text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOpportunity(opp.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs sm:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Opportunity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Add New Opportunity</h2>
            <form onSubmit={handleAddOpportunity} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={newOpportunity.title}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, title: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
              <select
                value={newOpportunity.type}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, type: e.target.value as 'Full Time' | 'Part Time' | 'Volunteer' })}
                className="border p-2 rounded w-full"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Volunteer">Volunteer</option>
              </select>
              <input
                type="text"
                placeholder="Location"
                value={newOpportunity.location}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, location: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
              <textarea
                placeholder="Description"
                value={newOpportunity.description}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, description: e.target.value })}
                className="border p-2 rounded w-full"
                rows={3}
                required
              />
              <input
                type="text"
                placeholder="Application Link (e.g., /careers/apply/...)"
                value={newOpportunity.href}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, href: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
              <select
                value={newOpportunity.category}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, category: e.target.value as 'Jobs' | 'Volunteer' })}
                className="border p-2 rounded w-full"
              >
                <option value="Jobs">Jobs</option>
                <option value="Volunteer">Volunteer</option>
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="border p-2 rounded w-full"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setImageFile(null);
                  }}
                  className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 text-sm sm:text-base"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Opportunity Modal */}
      {editingOpportunity && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Edit Opportunity</h2>
            <form onSubmit={handleUpdateOpportunity} className="space-y-4">
              <input
                type="text"
                value={editingOpportunity.title}
                onChange={(e) => setEditingOpportunity({ ...editingOpportunity, title: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
              <select
                value={editingOpportunity.type}
                onChange={(e) => setEditingOpportunity({ ...editingOpportunity, type: e.target.value as 'Full Time' | 'Part Time' | 'Volunteer' })}
                className="border p-2 rounded w-full"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Volunteer">Volunteer</option>
              </select>
              <input
                type="text"
                value={editingOpportunity.location}
                onChange={(e) => setEditingOpportunity({ ...editingOpportunity, location: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
              <textarea
                value={editingOpportunity.description}
                onChange={(e) => setEditingOpportunity({ ...editingOpportunity, description: e.target.value })}
                className="border p-2 rounded w-full"
                rows={3}
                required
              />
              <input
                type="text"
                value={editingOpportunity.href}
                onChange={(e) => setEditingOpportunity({ ...editingOpportunity, href: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
              <select
                value={editingOpportunity.category}
                onChange={(e) => setEditingOpportunity({ ...editingOpportunity, category: e.target.value as 'Jobs' | 'Volunteer' })}
                className="border p-2 rounded w-full"
              >
                <option value="Jobs">Jobs</option>
                <option value="Volunteer">Volunteer</option>
              </select>
              <div>
                <img
                  src={editingOpportunity.imageUrl || '/placeholder.jpg'}
                  alt="Current opportunity"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded mb-2"
                  onError={(e) => console.error(`Failed to load image: ${editingOpportunity.imageUrl}`)}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingOpportunity(null);
                    setImageFile(null);
                  }}
                  className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 text-sm sm:text-base"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCareers;