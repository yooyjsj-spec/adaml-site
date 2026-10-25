import React from 'react';
import { Navbar } from './Navbar';
import { motion } from 'framer-motion';
import { ASSETS } from '../data/assets';
import { useI18n } from '../i18n';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { m, t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 flex flex-col font-sans">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-grow pt-20"
      >
        {children}
      </motion.main>

      <footer className="bg-white border-t-2 border-primary-600 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <img
            src={ASSETS.LOGO}
            alt={m.nav.logoAlt}
            className="h-16 w-auto mx-auto mb-4 object-contain"
          />
          <p className="text-gray-500 text-sm mb-6">
            {m.footer.affiliation}
          </p>
          <p className="text-gray-400 text-xs mb-4 leading-relaxed">
            {m.footer.address}
          </p>
          <div className="text-gray-400 text-xs">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </div>
  );
};
