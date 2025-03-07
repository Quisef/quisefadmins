'use client';

import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming you have Firebase configured
import Card from "@/components/card";
import { Users, FileText, Mail } from 'lucide-react';

// Define the card data interface
interface DashboardCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
}

export default function DashboardPage() {
  // State to store collection counts
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [blogsCount, setBlogsCount] = useState<number | null>(null);
  const [subscriptionsCount, setSubscriptionsCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollectionCounts() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch counts from all three collections in parallel
        const [usersSnapshot, blogsSnapshot, subscriptionsSnapshot] = await Promise.all([
          getCountFromServer(collection(db, 'contacts')),
          getCountFromServer(collection(db, 'blogs')),
          getCountFromServer(collection(db, 'subscriptions'))
        ]);

        // Update state with the counts
        setUsersCount(usersSnapshot.data().count);
        setBlogsCount(blogsSnapshot.data().count);
        setSubscriptionsCount(subscriptionsSnapshot.data().count);
      } catch (err) {
        console.error('Error fetching collection counts:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCollectionCounts();
  }, []);

  // Prepare card data
  const dashboardCards: DashboardCard[] = [
    {
      title: 'Total Users',
      value: usersCount ?? 0,
      icon: <Users className="h-8 w-8" />,
      color: 'bg-blue-100 text-blue-700',
      isLoading
    },
    {
      title: 'Blog Posts',
      value: blogsCount ?? 0,
      icon: <FileText className="h-8 w-8" />,
      color: 'bg-purple-100 text-purple-700',
      isLoading
    },
    {
      title: 'Subscribers',
      value: subscriptionsCount ?? 0,
      icon: <Mail className="h-8 w-8" />,
      color: 'bg-green-100 text-green-700',
      isLoading
    }
  ];

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-700">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card) => (
          <Card 
            key={card.title} 
            title={card.title} 
            value={card.value} 
            icon={card.icon}
            color={card.color}
            isLoading={card.isLoading}
          />
        ))}
      </div>
    </div>
  );
}