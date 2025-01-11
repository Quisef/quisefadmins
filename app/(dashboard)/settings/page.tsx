import PageHeader from '../../components/pageHeader';

export default function SettingsPage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <PageHeader title="Settings" />
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">General Settings</h2>
          <div>Settings form will go here</div>
        </div>
      </div>
    </div>
  );
}
