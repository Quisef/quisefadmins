'use client'; // Required for client-side interactivity (hamburger menu)

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/home" className="flex items-center transition-transform duration-300 hover:scale-105">
          <Image
            src="/images/Logo.png"
            alt="QuietShelter Logo"
            width={120}
            height={50}
            className="object-contain"
          />
        </Link>

        {/* Hamburger Icon (Mobile) */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            className="focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded p-2 transition-colors duration-200"
          >
            <FontAwesomeIcon
              icon={isMenuOpen ? faTimes : faBars}
              className="text-2xl text-white hover:text-yellow-300"
            />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`${
            isMenuOpen ? 'flex' : 'hidden'
          } md:flex flex-col md:flex-row md:items-center absolute md:static top-full left-0 w-full md:w-auto bg-gray-800 md:bg-transparent shadow-lg md:shadow-none transition-all duration-300 ease-in-out`}
        >
          <ul className="flex flex-col md:flex-row md:space-x-8 p-6 md:p-0 text-lg font-medium">
            {[
              { href: '/home', label: 'Home' },
              { href: '/strategy', label: 'Strategy' },
              { href: '/about', label: 'Our Story' },
              { href: '/donation', label: 'Donation' },
              { href: '/news', label: 'Blog' },
              { href: '/projects', label: 'Projects' },
              
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 px-4 md:px-0 text-white hover:text-yellow-300 hover:bg-gray-700 md:hover:bg-transparent transition-colors duration-200 rounded-md"
                  onClick={() => setIsMenuOpen(false)} // Close menu on link click (mobile)
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;