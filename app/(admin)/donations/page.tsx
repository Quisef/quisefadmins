'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';

interface Cause {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  raised: number | undefined;
  goal: number | undefined;
  color: string;
  paystackLink: string; // NEW: Paystack payment link
}

interface Progress {
  raised: number;
  goal: number;
  donors: number;
}

const DonationPage: React.FC = () => {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [progress, setProgress] = useState<Progress>({
    raised: 0,
    goal: 0,
    donors: 0,
  });
  const [newCause, setNewCause] = useState<Omit<Cause, 'id'>>({
    title: '',
    description: '',
    imageUrl: '',
    raised: undefined,
    goal: undefined,
    color: 'blue',
    paystackLink: '', // NEW
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCause, setEditCause] = useState<Cause | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCauseId, setDeleteCauseId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const causesSnapshot = await getDocs(collection(db, 'causes'));
      const causesData = causesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Cause));
      setCauses(causesData);

      const progressSnapshot = await getDocs(collection(db, 'progress'));
      if (!progressSnapshot.empty) {
        setProgress(progressSnapshot.docs[0].data() as Progress);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setCauses([]);
      setProgress({ raised: 0, goal: 0, donors: 0 });
    }
  };

  async function uploadImageToCloudinary(file: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration is missing. Check environment variables.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    console.log('Uploading to Cloudinary:', file.name);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/ ₦{cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload error details:', errorData);
      throw new Error(`Upload failed:  ₦{errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Upload successful:', data.secure_url);
    return data.secure_url;
  }

  const handleAddCause = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = newCause.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      } else if (!imageUrl) {
        alert('Please upload an image for a new cause');
        setLoading(false);
        return;
      }

      if (newCause.raised === undefined || newCause.goal === undefined) {
        alert('Please provide values for raised and goal');
        setLoading(false);
        return;
      }

      if (!newCause.paystackLink.trim()) {
        alert('Please provide a Paystack payment link');
        setLoading(false);
        return;
      }

      const newDocRef = doc(collection(db, 'causes'));
      await setDoc(newDocRef, { ...newCause, imageUrl });
      setNewCause({
        title: '',
        description: '',
        imageUrl: '',
        raised: undefined,
        goal: undefined,
        color: 'blue',
        paystackLink: '',
      });
      setImageFile(null);
      setIsAddModalOpen(false);
      await fetchData();
      alert('Cause added successfully');
    } catch (error) {
      console.error('Error adding cause:', error);
      alert(
        'Failed to add cause: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCause = async (e: FormEvent) => {
    e.preventDefault();
    if (!editCause) return;
    setLoading(true);

    try {
      let imageUrl = editCause.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      if (!editCause.paystackLink.trim()) {
        alert('Please provide a Paystack payment link');
        setLoading(false);
        return;
      }

      await updateDoc(doc(db, 'causes', editCause.id), {
        ...editCause,
        imageUrl,
        raised: editCause.raised ?? 0,
        goal: editCause.goal ?? 0,
      });
      setEditCause(null);
      setImageFile(null);
      setIsEditModalOpen(false);
      await fetchData();
      alert('Cause updated successfully');
    } catch (error) {
      console.error('Error updating cause:', error);
      alert(
        'Failed to update cause: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCause = async (e: FormEvent) => {
    e.preventDefault();
    if (!deleteCauseId) return;
    setLoading(true);

    try {
      await deleteDoc(doc(db, 'causes', deleteCauseId));
      setDeleteCauseId(null);
      setIsDeleteModalOpen(false);
      await fetchData();
      alert('Cause deleted successfully');
    } catch (error) {
      console.error('Error deleting cause:', error);
      alert('Failed to delete cause');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'progress', 'current'), {
        raised: progress.raised || 0,
        goal: progress.goal || 0,
        donors: progress.donors || 0,
      });
      alert('Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const resetForm = () => {
    setNewCause({
      title: '',
      description: '',
      imageUrl: '',
      raised: undefined,
      goal: undefined,
      color: 'blue',
      paystackLink: '',
    });
    setImageFile(null);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditCause(null);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold mb-4">Donation Management</h1>

      {/* Progress Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Progress Management</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block mb-2">Raised ( ₦)</label>
              <input
                type="number"
                min="0"
                value={progress.raised}
                onChange={(e) =>
                  setProgress({ ...progress, raised: Number(e.target.value) || 0 })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Goal ( ₦)</label>
              <input
                type="number"
                min="0"
                value={progress.goal}
                onChange={(e) =>
                  setProgress({ ...progress, goal: Number(e.target.value) || 0 })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Donors</label>
              <input
                type="number"
                min="0"
                value={progress.donors}
                onChange={(e) =>
                  setProgress({ ...progress, donors: Number(e.target.value) || 0 })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button
            onClick={updateProgress}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Updating...' : 'Update Progress'}
          </button>
        </div>
      </section>

      {/* Add Cause Button */}
      <section className="mb-8 sm:mb-12">
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base disabled:bg-green-300"
        >
          Add New Cause
        </button>
      </section>

      {/* Add Cause Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Add New Cause</h2>
            <form onSubmit={handleAddCause} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={newCause.title}
                onChange={(e) => setNewCause({ ...newCause, title: e.target.value })}
                className="w-full p-2 border rounded text-sm sm:text-base"
                required
              />
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 border rounded text-sm sm:text-base"
                  disabled={loading}
                  required={!newCause.imageUrl}
                />
              </div>
              <textarea
                placeholder="Description"
                value={newCause.description}
                onChange={(e) => setNewCause({ ...newCause, description: e.target.value })}
                className="w-full p-2 border rounded text-sm sm:text-base"
                rows={3}
                required
              />
              <input
                placeholder="Raised ( ₦)"
                type="number"
                min="0"
                value={newCause.raised ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value) || 0;
                  setNewCause({ ...newCause, raised: value });
                }}
                className="w-full p-2 border rounded text-sm sm:text-base"
                required
              />
              <input
                placeholder="Goal ( ₦)"
                type="number"
                min="0"
                value={newCause.goal ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value) || 0;
                  setNewCause({ ...newCause, goal: value });
                }}
                className="w-full p-2 border rounded text-sm sm:text-base"
                required
              />
              <input
                type="url"
                placeholder="Paystack Payment Link (e.g., https://paystack.shop/pay/...)"
                value={newCause.paystackLink}
                onChange={(e) => setNewCause({ ...newCause, paystackLink: e.target.value })}
                className="w-full p-2 border rounded text-sm sm:text-base"
                required
              />
              <div className="mt-6 flex justify-end space-x-2 sm:space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 sm:px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm sm:text-base"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm sm:text-base disabled:bg-green-300"
                >
                  {loading ? 'Adding...' : 'Add Cause'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Cause Modal */}
      {isEditModalOpen && editCause && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Edit Cause</h2>
            <form onSubmit={handleUpdateCause} className="space-y-4">
              <input
                type="text"
                value={editCause.title}
                onChange={(e) => setEditCause({ ...editCause, title: e.target.value })}
                className="w-full p-2 border rounded text-sm sm:text-base"
                required
              />
              <div>
                {editCause.imageUrl && (
                  <img
                    src={editCause.imageUrl || '/images/fallback.jpg'}
                    alt="Current cause"
                    className="w-24 h-24 rounded object-cover mb-2"
                    onError={(e) => console.error(`Failed to load image:  ₦{editCause.imageUrl}`)}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 border rounded text-sm sm:text-base"
                  disabled={loading}
                />
              </div>
              <textarea
                value={editCause.description}
                onChange={(e) => setEditCause({ ...editCause, description: e.target.value })}
                className="w-full p-2 border rounded text-sm sm:text-base"
                rows={3}
                required
              />
              <input
                placeholder="Raised ( ₦)"
                type="number"
                min="0"
                value={editCause.raised ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value) || 0;
                  setEditCause({ ...editCause, raised: value });
                }}
                className="w-full p-2 border rounded text-sm sm:text-base"
                required
              />
              <input
                placeholder="Goal ( ₦)"
                type="number"
                min="0"
                value={editCause.goal ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value) || 0;
                  setEditCause({ ...editCause, goal: value });
                }}
                className="w-full p-2 border rounded text-sm sm:text-base"
                required
              />
              <input
                type="url"
                placeholder="Paystack Payment Link (e.g., https://paystack.shop/pay/...)"
                value={editCause.paystackLink}
                onChange={(e) => setEditCause({ ...editCause, paystackLink: e.target.value })}
                className="w-full p-2 border rounded text-sm sm:text-base"
                required
              />
              <div className="mt-6 flex justify-end space-x-2 sm:space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 sm:px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm sm:text-base"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base disabled:bg-blue-300"
                >
                  {loading ? 'Updating...' : 'Update Cause'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Cause Modal */}
      {isDeleteModalOpen && deleteCauseId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4 text-sm sm:text-base">Are you sure you want to delete this cause?</p>
            <form onSubmit={handleDeleteCause}>
              <div className="flex justify-end space-x-2 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3 sm:px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm sm:text-base"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm sm:text-base disabled:bg-red-300"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Existing Causes */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Existing Causes</h2>
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">#</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Image</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Title</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Description</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Raised</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Goal</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Payment Link</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {causes.map((cause, index) => (
                <tr key={cause.id} className="border-t">
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{index + 1}</td>
                  <td className="p-2 sm:p-3">
                    {cause.imageUrl && (
                      <img
                        src={cause.imageUrl || '/images/fallback.jpg'}
                        alt={cause.title}
                        className="w-12 h-12 rounded object-cover"
                        onError={(e) =>
                          console.error(`Failed to load image:  ₦{cause.imageUrl}`)
                        }
                      />
                    )}
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{cause.title}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]">
                    {cause.description}
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm"> ₦{cause.raised ?? 0}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm"> ₦{cause.goal ?? 0}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">
                    <a 
                      href={cause.paystackLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate block max-w-[150px]"
                    >
                      {cause.paystackLink ? 'View Link' : 'N/A'}
                    </a>
                  </td>
                  <td className="p-2 sm:p-3 space-x-1 sm:space-x-2">
                    <button
                      onClick={() => {
                        setEditCause(cause);
                        setIsEditModalOpen(true);
                      }}
                      className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-700 text-xs sm:text-sm"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteCauseId(cause.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-700 text-xs sm:text-sm"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DonationPage;