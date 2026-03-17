import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ASSETS } from '../data/assets';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Research', path: '/research' },
    { name: 'Publications', path: '/publications' },
    { name: 'People', path: '/people' },
    { name: 'Community', path: '/community' },
    { name: 'Contact', path: '/contact' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [location]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 h-20 font-sans">
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo / Home Link - Prominent Top Left */}
          <Link to="/" className="flex items-center gap-2 group">
             <img 
               src={ASSETS.LOGO} 
               alt="ADAM LAB" 
               className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
             />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm ring-1 ring-primary-100' 
                      : 'text-gray-600 hover:text-primary-900 hover:bg-gray-50'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu} 
              className="text-gray-600 hover:text-primary-900 focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-b border-gray-100 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors
                ${location.pathname === link.path 
                  ? 'bg-primary-50 text-primary-900' 
                  : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};