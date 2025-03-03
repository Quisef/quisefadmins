"use client"
import Link from 'next/link';

export const Sidebar = () => {
  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/users', label: 'Users', icon: '👥' },
    { href: '/blog', label: 'Blog', icon: '📝' },
    { href: '/media', label: 'Media', icon: '🖼️' },
    { href: '/project', label: 'Project', icon: '🚀' },
    { href: '/membership', label: 'Members', icon: '🎟️' },
    { href: '/contact', label: 'Contact', icon: '✉️' },
    { href: '/subscribers', label: 'Subscribers', icon: '📮' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
    { href: 'https://quisefadmin.vercel.app/home', label: 'Website', icon: '🌍' },
  ];

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