import Card from "@/components/card";

export default function DashboardPage() {
  const data = [
    { title: 'Total Users', value: 12 },
    { title: 'Blog Posts', value: 1 },
    { title: 'Subscribers', value: 7 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
        <Card key={item.title} title={item.title} value={item.value} />
      ))}
    </div>
  );
}
