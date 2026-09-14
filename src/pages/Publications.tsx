
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layout } from '../components/Layout';
import { PublicationSearchBar } from '../components/PublicationSearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, BookOpen, Award, Calendar, Loader2, Users, Search } from 'lucide-react';
import { journalData } from '../data/journals';
import { patentData } from '../data/asset_patents';
import { PUBLICATION_SEARCH_ASSET } from '../data/asset_publication_search';
import { formatPublicationsUpdatedDate, PUBLICATIONS_LAST_UPDATED } from '../data/publicationsMeta';
import { ASSETS } from '../data/assets';
import { JournalPaper, PatentItem } from '../types';
import { getJournals, getPatents } from '../api/content';
import { adminJournals, adminPatents } from '../api/admin';
import { AdminActions, AdminAddButton, AdminEditorModal, EditorField, confirmDelete } from '../components/admin/AdminControls';
import { useI18n } from '../i18n';

type Tab = 'journals' | 'patents';

const journalFields: EditorField[] = [
  { key: 'title', label: 'Title', type: 'textarea' },
  { key: 'journal', label: 'Journal' },
  { key: 'date', label: 'Date' },
  { key: 'doi', label: 'DOI / Link' },
  { key: 'image', label: 'Cover Image URL' },
  { key: 'sortOrder', label: 'Sort Order', type: 'number' },
];

const patentFields: EditorField[] = [
  { key: 'title', label: 'Title', type: 'textarea' },
  { key: 'country', label: 'Country' },
  { key: 'date', label: 'Date' },
  { key: 'number', label: 'Patent Number' },
  { key: 'applicantsCount', label: 'Applicants Count', type: 'number' },
  { key: 'inventors', label: 'Inventors', type: 'csv' },
  { key: 'link', label: 'Link' },
  { key: 'image', label: 'Image URL' },
  { key: 'sortOrder', label: 'Sort Order', type: 'number' },
];

export const Publications: React.FC = () => {
  const { m, t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('journals');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiItems, setApiItems] = useState<(JournalPaper | PatentItem)[]>([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [editor, setEditor] = useState<Record<string, unknown> | null>(null);

  // Infinite Scroll State (10개씩 로딩)
  const itemsPerLoad = 10;
  const [visibleCount, setVisibleCount] = useState(itemsPerLoad);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visible items when tab or search changes
  useEffect(() => {
    setVisibleCount(itemsPerLoad);
  }, [activeTab, searchQuery]);

  const load = async () => {
    try {
      const result =
        activeTab === 'journals'
          ? await getJournals(1, visibleCount, searchQuery.trim())
          : await getPatents(1, visibleCount, searchQuery.trim());
      setApiItems(result.items);
      setApiTotal(result.total);
      setApiAvailable(true);
    } catch {
      setApiAvailable(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeTab, searchQuery, visibleCount]);

  // Determine which dataset to use
  const getActiveData = (): (JournalPaper | PatentItem)[] => {
    if (activeTab === 'journals') return journalData;
    if (activeTab === 'patents') return patentData;
    return [];
  };

  // Filter by search query (제목, 저널명/발명자)
  const currentDataList = useMemo(() => {
    if (apiAvailable) return apiItems;
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
  }, [activeTab, searchQuery, apiAvailable, apiItems]);

  // Infinite Scroll Logic
  const currentItems = apiAvailable ? currentDataList : currentDataList.slice(0, visibleCount);
  const totalItems = apiAvailable ? apiTotal : currentDataList.length;
  const hasMore = visibleCount < totalItems;

  // Load the next batch when the sentinel scrolls into view.
  // visibleCount을 deps에 포함해 sentinel이 계속 보이는 경우에도 다음 배치가 이어서 로드되도록 한다.
  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + itemsPerLoad, totalItems)
          );
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visibleCount, totalItems]);

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

  const savePublication = async (values: Record<string, unknown>) => {
    if (activeTab === 'journals') {
      const payload = {
        title: String(values.title ?? ''),
        journal: String(values.journal ?? ''),
        date: String(values.date ?? ''),
        doi: String(values.doi ?? ''),
        image: String(values.image ?? ''),
        sortOrder: Number(values.sortOrder || 0),
      };
      if (values.id) await adminJournals.update(String(values.id), payload);
      else await adminJournals.create(payload);
    } else {
      const payload = {
        title: String(values.title ?? ''),
        country: String(values.country ?? ''),
        date: String(values.date ?? ''),
        number: String(values.number ?? ''),
        applicantsCount: Number(values.applicantsCount || 0),
        inventors: Array.isArray(values.inventors) ? values.inventors : [],
        link: String(values.link ?? ''),
        image: String(values.image ?? ''),
        sortOrder: Number(values.sortOrder || 0),
      };
      if (values.id) await adminPatents.update(String(values.id), payload);
      else await adminPatents.create(payload);
    }
    await load();
  };

  const removePublication = async (item: JournalPaper | PatentItem) => {
    if (!item.id || !confirmDelete(item.title)) return;
    if (activeTab === 'journals') await adminJournals.remove(item.id);
    else await adminPatents.remove(item.id);
    await load();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-10 pb-16">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2 tracking-tight">{m.publications.title}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg">
            {m.publications.subtitle}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {t('publications.lastUpdated', { date: formatPublicationsUpdatedDate(PUBLICATIONS_LAST_UPDATED) })}
          </p>
          <div className="mt-3 flex justify-center">
            <AdminAddButton
              label={activeTab === 'journals' ? '저널 추가' : '특허 추가'}
              onClick={() => setEditor(activeTab === 'journals'
                ? { title: '', journal: '', date: new Date().toISOString().slice(0, 10), doi: '', image: '', sortOrder: 0 }
                : { title: '', country: 'KR', date: new Date().toISOString().slice(0, 10), number: '', applicantsCount: 0, inventors: [], link: '', image: '', sortOrder: 0 })}
            />
          </div>
        </motion.div>

        {/* Custom Tab Navigation */}
        <div className="flex justify-center mb-5">
          <div className="flex space-x-2 bg-gray-100/50 p-1.5 rounded-xl border border-gray-200">
            {[
              { id: 'journals', label: m.publications.journals, icon: BookOpen },
              { id: 'patents', label: m.publications.patents, icon: Award }
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
          <div className="w-full mb-6">
            <PublicationSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={m.publications.searchPlaceholder}
              ariaLabel={m.publications.searchAria}
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
                      key={`${activeTab}-${pub.id ?? index}`}
                      variants={itemVariants}
                      className="relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-hover border border-gray-100 transition-all duration-300 group"
                    >
                      {pub.id && (
                        <AdminActions
                          onEdit={() => setEditor(pub)}
                          onDelete={() => removePublication(pub)}
                        />
                      )}
                      <div className="flex flex-col md:flex-row h-full">
                        {/* Image Section */}
                        <div className="md:w-48 lg:w-64 h-48 md:h-auto bg-gray-50 shrink-0 relative overflow-hidden border-b md:border-b-0 md:border-r border-gray-100 flex items-center justify-center">
                           <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                           <img 
                              src={pub.image || ASSETS.JOURNALS.DEFAULT_COVER}
                              alt={`${pub.journal || pub.title} cover`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover relative z-10 opacity-90 group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                const fallback = ASSETS.JOURNALS.DEFAULT_COVER;
                                if (!e.currentTarget.src.includes('default.svg')) {
                                    e.currentTarget.src = fallback;
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
                                {isPatent ? m.publications.viewPatent : m.publications.readPaper}
                                {isPatent && !pub.link ? (
                                  <Search size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                ) : (
                                  <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                )}
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm italic">
                                {isPatent ? m.publications.linkUnavailable : m.publications.accessUnavailable}
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
                      ? t('publications.noResults', { query: searchQuery })
                      : m.publications.noItems}
                  </p>
                </div>
              )}
            </div>

            {/* Infinite Scroll Sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex items-center justify-center py-10">
                <Loader2 size={24} className="animate-spin text-gray-400" />
              </div>
            )}

            {!hasMore && totalItems > itemsPerLoad && (
              <p className="text-center text-sm text-gray-400 py-10">
                {t('publications.allLoaded', { total: totalItems })}
              </p>
            )}

          </motion.div>
        </AnimatePresence>
        <AdminEditorModal
          open={Boolean(editor)}
          title={editor?.id ? '출판물 수정' : '출판물 추가'}
          fields={activeTab === 'journals' ? journalFields : patentFields}
          initial={editor ?? undefined}
          onClose={() => setEditor(null)}
          onSave={savePublication}
        />
      </div>
    </Layout>
  );
};
