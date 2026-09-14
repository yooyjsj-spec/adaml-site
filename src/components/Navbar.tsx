import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, Menu, User, X } from 'lucide-react';
import { ASSETS } from '../data/assets';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../i18n';
import { useAdminAuth } from '../auth/AdminAuthContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { m } = useI18n();
  const { isLoggedIn } = useAdminAuth();

  const navLinks = [
    { name: m.nav.home, path: '/' },
    { name: m.nav.research, path: '/research' },
    { name: m.nav.publications, path: '/publications' },
    { name: m.nav.people, path: '/people' },
    { name: m.nav.community, path: '/community' },
    { name: m.nav.contact, path: '/contact' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => setIsOpen(false), [location]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 h-20 font-sans">
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary-600" />
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          <Link to="/" className="flex items-center group shrink-0">
            <img
              src={ASSETS.LOGO}
              alt={m.nav.logoAlt}
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

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
            <LanguageSwitcher />
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                aria-label={m.nav.dashboard}
                title={m.nav.dashboard}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <User size={18} />
              </Link>
            ) : (
              <Link
                to="/login"
                aria-label={m.nav.login}
                title={m.nav.login}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <LogIn size={18} />
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            <LanguageSwitcher />
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-primary-900 focus:outline-none p-2"
              aria-label={isOpen ? m.nav.closeMenu : m.nav.openMenu}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

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
          <div className="mt-2 border-t border-gray-100 pt-2">
            {isLoggedIn ? (
              <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-base font-medium rounded-lg text-gray-700 hover:bg-gray-50">
                <User size={18} /> {m.nav.dashboard}
              </Link>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-4 py-3 text-base font-medium rounded-lg text-gray-700 hover:bg-gray-50">
                <LogIn size={18} /> {m.nav.login}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
