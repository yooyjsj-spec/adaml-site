
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { PublicationSearchBar } from '../components/PublicationSearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, BookOpen, Award, Calendar, ChevronLeft, ChevronRight, Users, Search } from 'lucide-react';
import { journalData } from '../data/journals';
import { patentData } from '../data/asset_patents';
import { PUBLICATION_SEARCH_ASSET } from '../data/asset_publication_search';
import { ASSETS } from '../data/assets';
import { JournalPaper, PatentItem } from '../types';

type Tab = 'journals' | 'patents';

export const Publications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('journals');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Determine which dataset to use
  const getActiveData = (): (JournalPaper | PatentItem)[] => {
    if (activeTab === 'journals') return journalData;
    if (activeTab === 'patents') return patentData;
    return [];
  };

  // Filter by search query (제목, 저널명/발명자)
  const currentDataList = useMemo(() => {
    const data = getActiveData();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;

    return data.filter((item) => {
      const pub = item as JournalPaper | PatentItem;
      const isPatent = activeTab === 'patents';

      if (isPatent) {
        const p = pub as PatentItem;
        const titleMatch = p.title.toLowerCase().includes(q);
        const inventorsMatch = p.inventors?.some((name) =>
          name.toLowerCase().includes(q)
        );
        return titleMatch || inventorsMatch;
      } else {
        const j = pub as JournalPaper;
        const titleMatch = j.title.toLowerCase().includes(q);
        const journalMatch = j.journal.toLowerCase().includes(q);
        return titleMatch || journalMatch;
      }
    });
  }, [activeTab, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(currentDataList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentDataList.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight">Publications</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Our research output across leading scientific journals and intellectual property.
          </p>
        </motion.div>

        {/* Custom Tab Navigation */}
        <div className="flex justify-center mb-4">
          <div className="flex space-x-2 bg-gray-100/50 p-1.5 rounded-xl border border-gray-200">
            {[
              { id: 'journals', label: 'Journals', icon: BookOpen },
              { id: 'patents', label: 'Patents', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`
                  relative px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-bold tracking-wide transition-all duration-300
                  ${activeTab === tab.id ? 'text-primary-700' : 'text-gray-500 hover:text-gray-900'}
                `}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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

        {/* Search Bar (에셋으로 on/off 가능) */}
        {PUBLICATION_SEARCH_ASSET.enabled && (
          <div className="w-full mb-12">
            <PublicationSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={PUBLICATION_SEARCH_ASSET.placeholder}
            />
          </div>
        )}

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 gap-6">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => {
                  const isPatent = activeTab === 'patents';
                  const pub = item as any; // Cast for flexibility in rendering logic below
                  
                  
                  // Determine Link URL
                  // For patents: Use explicit link if available, otherwise search Google Patents by number
                  const linkUrl = isPatent 
                    ? (pub.link || (pub.number ? `https://patents.google.com/?q=${encodeURIComponent(pub.number)}` : ''))
                    : pub.doi;
                  return (
                    <motion.div
                      key={`${activeTab}-${currentPage}-${index}`}
                      variants={itemVariants}
                      className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-hover border border-gray-100 transition-all duration-300 group"
                    >
                      <div className="flex flex-col md:flex-row h-full">
                        {/* Image Section */}
                        <div className="md:w-48 lg:w-64 h-48 md:h-auto bg-gray-50 shrink-0 relative overflow-hidden border-b md:border-b-0 md:border-r border-gray-100 flex items-center justify-center">
                           <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                           <img 
                              src={pub.image || ASSETS.JOURNALS.DEFAULT_COVER}
                              alt="Cover"
                              className="w-full h-full object-cover relative z-10 opacity-90 group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                if (e.currentTarget.src !== ASSETS.JOURNALS.DEFAULT_COVER) {
                                    e.currentTarget.src = ASSETS.JOURNALS.DEFAULT_COVER;
                                }
                              }}
                           />
                        </div>

                        {/* Content Section */}
                        <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                          <div>
                            {/* Metadata Row */}
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              {isPatent ? (
                                <>
                                  <span className="text-primary-700 font-bold text-sm tracking-wide bg-primary-50 px-2 py-1 rounded">
                                    {pub.country}
                                  </span>
                                  <span className="text-gray-300">|</span>
                                  <span className="text-gray-400 text-sm font-mono">{pub.number}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-primary-700 font-bold text-sm tracking-wide bg-primary-50 px-2 py-1 rounded">
                                    {pub.journal}
                                  </span>
                                </>
                              )}
                              
                              <span className="text-gray-400 text-sm flex items-center gap-1 ml-auto">
                                <Calendar size={14} /> {pub.date}
                              </span>
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-3 leading-snug group-hover:text-primary-800 transition-colors">
                              {pub.title}
                            </h3>

                            {/* Inventors (Patents only) */}
                            {isPatent && pub.inventors && (
                              <div className="flex items-start gap-2 text-sm text-gray-500 mt-2">
                                <Users size={16} className="mt-0.5 shrink-0 text-gray-400" />
                                <span>{pub.inventors.join(', ')}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-end">
                            {linkUrl ? (
                              <a 
                                href={linkUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white font-medium text-sm hover:bg-primary-600 transition-colors group/btn"
                              >
                                {isPatent ? 'View Patent' : 'Read Paper'}
                                {isPatent && !pub.link ? (
                                  <Search size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                ) : (
                                  <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                )}
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm italic">
                                {isPatent ? 'Link unavailable' : 'Access unavailable'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500">
                    {searchQuery.trim()
                      ? `"${searchQuery}"에 맞는 결과가 없습니다.`
                      : 'No items available in this section yet.'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-200
                    ${currentPage === 1 
                      ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'border-gray-200 text-gray-600 hover:bg-white hover:border-primary-500 hover:text-primary-600 shadow-sm hover:shadow'
                    }`}
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all duration-200
                      ${currentPage === number
                        ? 'bg-primary-600 text-white shadow-md transform scale-105' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-200
                    ${currentPage === totalPages 
                      ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'border-gray-200 text-gray-600 hover:bg-white hover:border-primary-500 hover:text-primary-600 shadow-sm hover:shadow'
                    }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
};
