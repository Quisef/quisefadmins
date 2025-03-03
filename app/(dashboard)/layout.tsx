import Link from 'next/link'
import { Sidebar } from "@/components/Sidebar"
import { TopNav } from "@/components/TopNav"
import { AuthProvider } from '@/context/AuthContext';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
        <AuthProvider>{children}</AuthProvider>
        </main>
      </div>
    </div>
  )
}