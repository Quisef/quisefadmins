"use client"
import Link from 'next/link';

export const Sidebar = () => {
  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' }, // Represents analytics and overview
    { href: '/slider', label: 'Home', icon: '🏠' }, // Home is best represented by a house
    { href: '/blog', label: 'Blog', icon: '📝' }, // Writing or blog post icon
    { href: '/donations', label: 'Donation', icon: '❤️' }, // Heart for donations (charity)
    { href: '/project', label: 'Project', icon: '🚀' }, // Rocket for projects (growth/launch)
    { href: '/membership', label: 'Members', icon: '👥' }, // Group of people for members
    { href: '/contact', label: 'Contact', icon: '✉️' }, // Envelope for contact/messages
    { href: '/subscribers', label: 'Subscribers', icon: '📧' }, // Email for subscribers
    { href: '/careers', label: 'Career', icon: '💼' }, // Briefcase for careers/jobs
    { href: '/settings', label: 'Settings', icon: '⚙️' }, // Gear for settings
    { href: 'https://www.quietshelterfoundation.com/home', label: 'Website', icon: '🌐' }, // Globe for website
  ]

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};