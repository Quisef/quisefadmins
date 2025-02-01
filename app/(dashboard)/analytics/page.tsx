import PageHeader from '@/components/pageHeader';

export default function AnalyticsPage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <PageHeader title="Analytics" />
      <div className="space-y-6">
        <div className="h-64 bg-gray-100 rounded-lg"></div>
        <div className="h-64 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
}
