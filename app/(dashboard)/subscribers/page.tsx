'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming you have a firebase config file
import { Search, Mail, Calendar, Trash2, RefreshCcw, Download } from 'lucide-react';

// Type definitions for subscriber data
interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  status: 'active' | 'unconfirmed' | 'unsubscribed';
  preferences?: string[];
}

const SubscribersPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch subscribers from Firebase
  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const subscribersQuery = query(
        collection(db, 'subscriptions'),
        orderBy('subscribedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(subscribersQuery);
      const subscribersList: Subscriber[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        subscribersList.push({
          id: doc.id,
          email: data.email,
          name: data.name || '',
          subscribedAt: data.subscribedAt?.toDate() || new Date(),
          status: data.status || 'active',
          preferences: data.preferences || [],
        });
      });
      
      setSubscribers(subscribersList);
      setFilteredSubscribers(subscribersList);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load subscribers on component mount
  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Filter subscribers when search term or status filter changes
  useEffect(() => {
    let results = subscribers;
    
    if (searchTerm) {
      results = results.filter(
        (subscriber) =>
          subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== 'all') {
      results = results.filter((subscriber) => subscriber.status === statusFilter);
    }
    
    setFilteredSubscribers(results);
  }, [searchTerm, statusFilter, subscribers]);

  // Handle selecting all subscribers
  const handleSelectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredSubscribers.map((subscriber) => subscriber.id));
    }
  };

  // Handle selecting individual subscriber
  const handleSelectSubscriber = (id: string) => {
    if (selectedSubscribers.includes(id)) {
      setSelectedSubscribers(selectedSubscribers.filter((subId) => subId !== id));
    } else {
      setSelectedSubscribers([...selectedSubscribers, id]);
    }
  };

  // Delete selected subscribers
  const handleDeleteSelected = async () => {
    if (selectedSubscribers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedSubscribers.length} subscriber(s)?`)) {
      setIsDeleting(true);
      
      try {
        for (const id of selectedSubscribers) {
          await deleteDoc(doc(db, 'subscriptions', id));
        }
        
        // Refresh the list after deletion
        fetchSubscribers();
        setSelectedSubscribers([]);
      } catch (error) {
        console.error('Error deleting subscribers:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Export subscribers to CSV
  const exportToCSV = () => {
    const subscribersToExport = filteredSubscribers.length > 0 ? filteredSubscribers : subscribers;
    
    if (subscribersToExport.length === 0) {
      alert('No subscribers to export');
      return;
    }
    
    const csvContent = [
      ['Email', 'Name', 'Subscribed Date', 'Status', 'Preferences'].join(','),
      ...subscribersToExport.map((subscriber) => [
        subscriber.email,
        subscriber.name || '',
        subscriber.subscribedAt.toLocaleDateString(),
        subscriber.status,
        (subscriber.preferences || []).join(';')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Blog Subscribers</h1>
        <p className="text-gray-600">
          Manage your blog subscribers and their subscription preferences
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        {/* Search */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by email or name..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="unconfirmed">Unconfirmed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>

          <button
            onClick={fetchSubscribers}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          {selectedSubscribers.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete ({selectedSubscribers.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-20">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No subscribers found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Start growing your subscriber list by adding a signup form to your blog'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={
                          filteredSubscribers.length > 0 &&
                          selectedSubscribers.length === filteredSubscribers.length
                        }
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Subscribed Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Preferences
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onChange={() => handleSelectSubscriber(subscriber.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {subscriber.name || <span className="text-gray-400">Not provided</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(subscriber.subscribedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          subscriber.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : subscriber.status === 'unconfirmed'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {subscriber.preferences && subscriber.preferences.length > 0 ? (
                          subscriber.preferences.map((pref, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                            >
                              {pref}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleSelectSubscriber(subscriber.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {!isLoading && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total Subscribers</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{subscribers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Active Subscribers</h3>
            <p className="mt-1 text-3xl font-semibold text-green-600">
              {subscribers.filter((sub) => sub.status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Unconfirmed</h3>
            <p className="mt-1 text-3xl font-semibold text-yellow-600">
              {subscribers.filter((sub) => sub.status === 'unconfirmed').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribersPage;