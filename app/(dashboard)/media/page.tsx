"use client"
import PageHeader from '../../components/pageHeader';
import Button from '../../components/button';

export default function MediaPage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <PageHeader title="Media Library" />
      <div className="space-y-4">
        <Button onClick={() => alert('Upload Media')}>Upload Media</Button>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="aspect-square bg-gray-100 rounded-lg"></div>
          <div className="aspect-square bg-gray-100 rounded-lg"></div>
          <div className="aspect-square bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
