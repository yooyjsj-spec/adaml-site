import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, MapPin, Mail, Phone, Info } from 'lucide-react';
import { useI18n } from '../i18n';
import { RequestPanel } from '../components/RequestPanel';

type Tab = 'contact' | 'request';

export const Contact: React.FC = () => {
  const { m } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(searchParams.get('tab') === 'request' ? 'request' : 'contact');

  const setTab = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'request' ? { tab: 'request' } : {}, { replace: true });
  };

  const tabs = [
    { id: 'contact' as const, label: m.contact.tabContact, icon: Mail },
    { id: 'request' as const, label: m.contact.tabRequest, icon: ClipboardList },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{m.contact.title}</h1>
          <p className="text-gray-500">{m.contact.subtitle}</p>
        </motion.div>

        <div className="flex justify-center mb-10">
          <div className="flex space-x-2 bg-gray-100/50 p-1.5 rounded-xl border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTab(tab.id)}
                className={`
                  relative px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-bold tracking-wide transition-all duration-300
                  ${activeTab === tab.id ? 'text-primary-700' : 'text-gray-500 hover:text-gray-900'}
                `}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="contactActiveTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon size={16} />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'contact' ? (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-12 flex items-start gap-4 rounded-2xl border border-primary-200 bg-primary-50 px-6 py-5">
                <Info className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  <p className="font-bold text-primary-800 mb-1">{m.contact.relocationTitle}</p>
                  <p className="text-gray-600">{m.contact.relocationBody}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-soft overflow-hidden border border-gray-100">
                <div className="p-10 lg:p-16 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8">{m.contact.getInTouch}</h3>
                  <div className="space-y-8">
                    <div className="flex items-start gap-5">
                      <div className="p-3 bg-primary-50 rounded-full text-primary-600 shrink-0">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-bold mb-1 uppercase text-sm tracking-wide">{m.contact.address}</h4>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {m.contact.addressLines}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-5">
                      <div className="p-3 bg-primary-50 rounded-full text-primary-600 shrink-0">
                        <Phone size={24} />
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-bold mb-1 uppercase text-sm tracking-wide">{m.contact.office}</h4>
                        <p className="text-gray-600">+82-54-279-XXXX</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-5">
                      <div className="p-3 bg-primary-50 rounded-full text-primary-600 shrink-0">
                        <Mail size={24} />
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-bold mb-1 uppercase text-sm tracking-wide">{m.contact.email}</h4>
                        <p className="text-gray-600 hover:text-primary-600 transition-colors cursor-pointer">
                          <a href="mailto:jb.seol@postech.ac.kr">jb.seol@postech.ac.kr</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[400px] lg:h-auto bg-gray-100 relative min-h-[400px]">
                  <iframe
                    src="https://www.google.com/maps?q=77%20Cheongam-ro%2C%20Nam-gu%2C%20Pohang-si%2C%20Gyeongsangbuk-do%2C%2037673%2C%20Republic%20of%20Korea&z=16&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    title={m.contact.mapTitle}
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                  ></iframe>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="request"
              id="request"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">{m.contact.requestTitle}</h2>
                <p className="text-gray-500">{m.contact.requestSubtitle}</p>
              </div>
              <RequestPanel showAccountTools={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};
