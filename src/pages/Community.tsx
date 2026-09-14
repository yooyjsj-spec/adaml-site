import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { CommunityItem } from '../types';
import { Calendar, Tag, ExternalLink, X, Newspaper, Bell, Image as ImageIcon, ChevronRight, Mic2 } from 'lucide-react';
import { conferenceData } from '../data/asset_conferences';
import { assetPath } from '../utils/assetPath';
import { getCommunity } from '../api/content';
import { adminCommunity } from '../api/admin';
import { AdminActions, AdminAddButton, AdminEditorModal, EditorField, confirmDelete } from '../components/admin/AdminControls';
import { LAB_NAME } from '../config/lab';
import { useI18n } from '../i18n';

type Tab = 'news' | 'notice' | 'conferences' | 'gallery';

const communityFields: EditorField[] = [
  { key: 'title', label: 'Title' },
  { key: 'date', label: 'Date' },
  { key: 'category', label: 'Category', type: 'select', options: ['Award', 'Conference', 'Paper', 'General', 'Notice', 'Gallery'] },
  { key: 'summary', label: 'Summary', type: 'textarea' },
  { key: 'content', label: 'Content', type: 'textarea' },
  { key: 'link', label: 'External Link' },
  { key: 'image', label: 'Cover Image URL' },
  { key: 'images', label: 'Gallery Images', type: 'lines', placeholder: '이미지 URL을 한 줄에 하나씩 입력' },
];

const tabCategory: Record<Tab, CommunityItem['category']> = {
  news: 'Award',
  notice: 'Notice',
  conferences: 'Conference',
  gallery: 'Gallery',
};

export const Community: React.FC = () => {
  const { m, t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('news');
  const [selectedItem, setSelectedItem] = useState<CommunityItem | null>(null);
  const [conferencePage, setConferencePage] = useState(1);
  const [apiCommunity, setApiCommunity] = useState<CommunityItem[] | null>(null);
  const [editor, setEditor] = useState<Partial<CommunityItem> | null>(null);

  const load = async () => {
    try {
      setApiCommunity(await getCommunity());
    } catch {
      setApiCommunity(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Data for the News section
  const newsItems: CommunityItem[] = [
    {
      id: '1',
      title: "'2025 World's Top 2% Scientists' 선정",
      date: "2024-10-10",
      summary: "국민대학교 신소재공학부 설재복 교수가 미국 스탠퍼드 대학교와 엘스비어(Elsevier)가 공동으로 발표한 '2025 세계 최상위 2% 연구자' 명단에 이름을 올렸습니다.",
      category: "Award",
      link: "https://www.kookmin.ac.kr/comm/board/user/be8e117863cfd580d7ed5931a799207c/view.do?currentPageNo=1&searchTy=0000&searchValue=&dataSeq=1076476&parentSeq=1076476",
      content: `
        <p class="mb-4">국민대학교(총장 정승렬) 신소재공학부 설재복 교수가 미국 스탠퍼드 대학교와 엘스비어(Elsevier)가 공동으로 발표한 '2025 세계 최상위 2% 연구자(World's Top 2% Scientists)' 명단에 이름을 올렸다.</p>
        <p class="mb-4">설재복 교수는 재료공학 분야, 특히 항공우주 및 방위산업 소재와 첨단 분석 기술 분야에서의 탁월한 연구 성과를 인정받았다.</p>
        <p class="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">※ 설재복 교수는 2026년 9월부로 포항공과대학교(POSTECH) 친환경소재대학원(GIFT)으로 자리를 옮겼으며, 위 내용은 선정 당시(국민대학교 재직) 기준입니다.</p>
      `
    }
  ];

  // Notice Data
  const notices: CommunityItem[] = [
    {
      id: 'n2',
      title: `${LAB_NAME} POSTECH 친환경소재대학원(GIFT) 이전 안내`,
      date: '2026-09-01',
      summary: `${LAB_NAME}이 2026년 9월부로 포항공과대학교 친환경소재대학원(GIFT)으로 이전하였습니다.`,
      category: 'Notice',
      content: `
        <p class="mb-4 font-bold">${LAB_NAME}이 포항공과대학교(POSTECH) 친환경소재대학원(GIFT)으로 이전하였습니다.</p>
        <p class="mb-4">연구실 명칭도 기존 <strong>ADAM Lab</strong>에서 <strong>${LAB_NAME}</strong>로 변경되었습니다.</p>
        <p class="mb-4">설재복 교수는 2026년 8월까지 국민대학교 신소재공학부에 재직하였으며, 2026년 9월부로 POSTECH 친환경소재대학원(Graduate Institute of Ferrous &amp; Eco Materials Technology, GIFT) 교수로 부임하였습니다.</p>
        <p class="mb-4"><strong>새 주소</strong><br/>(37673) 경상북도 포항시 남구 청암로 77, 포항공과대학교 친환경소재대학원<br/>77 Cheongam-ro, Nam-gu, Pohang-si, Gyeongsangbuk-do 37673, Republic of Korea</p>
        <p>연구 협력 및 대학원 진학 문의는 jb.seol@postech.ac.kr 로 연락 바랍니다.</p>
      `
    },
    { 
      id: 'n1', 
      title: '2026학년도 연구실 신입생 모집', 
      date: '2026-01-01', 
      summary: `${LAB_NAME}에서 열정적인 석/박사 통합과정 신입생을 모집합니다.`, 
      category: 'Notice',
      content: `
        <p class="mb-4 font-bold">${LAB_NAME}에서 2026학년도 대학원 신입생을 모집합니다.</p>
        <p>관심 있는 학생은 설재복 교수님 이메일(jb.seol@postech.ac.kr)로 연락 바랍니다.</p>
      `
    }
  ];

  // Convert conferenceData to CommunityItem
  const conferences: CommunityItem[] = conferenceData.map((c, i) => ({
    id: `conf-${i}`,
    title: c.title,
    date: c.date,
    summary: c.summary,
    category: 'Conference',
    images: c.images,
    content: c.content,
  }));

  // Sort conferences by oldest first
  const apiConferences = apiCommunity?.filter((item) => item.category === 'Conference') ?? [];
  const displayConferences = apiConferences.length ? apiConferences : conferences;

  const sortedConferences = [...displayConferences].sort((a, b) =>
    (a.date || '').localeCompare(b.date || '')
  );

  // Pagination for conferences (10 per page)
  const conferencesPerPage = 10;
  const totalConferencePages = Math.max(
    1,
    Math.ceil(sortedConferences.length / conferencesPerPage)
  );
  const currentConferenceItems = sortedConferences.slice(
    (conferencePage - 1) * conferencesPerPage,
    conferencePage * conferencesPerPage
  );

  const stripHtml = (html: string) =>
    html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const getExcerpt = (html?: string, maxChars = 140) => {
    if (!html) return '';
    const text = stripHtml(html);
    if (text.length <= maxChars) return text;
    return `${text.slice(0, maxChars - 1)}...`;
  };

  // Gallery Data
const galleryItems: CommunityItem[] = [
    {
    id: 'g1',
    title: 'TMS 2024',
    date: '2024-03-05',
    summary: 'Presentation at TMS 2024 Annual Meeting.',
    category: 'Gallery',
    image: assetPath('/images/gallery/20241204.jpg'),
    content: `Members of ${LAB_NAME} attended the TMS 2024 Annual Meeting. We presented our latest findings on AI-driven microstructure analysis.`
  },
  {
    id: 'g2',
    title: 'Lab Group Photo',
    date: '2025-01-20',
    summary: `Group photo of ${LAB_NAME} members.`,
    category: 'Gallery',
    image: assetPath('/images/gallery/20250120.jpg'),
    content: 'Group photo taken during the 2025 winter semester.'
  },
  {
    id: 'g3',
    title: 'Industry Visit',
    date: '2025-04-25',
    summary: 'On-site visit to an industry partner.',
    category: 'Gallery',
    image: assetPath('/images/gallery/20250425.jpg'),
    content: `${LAB_NAME} members visited an industrial research facility.`
  },
  {
    id: 'g4',
    title: '두산에너빌리티 본사 방문',
    date: '2025-07-16',
    summary: '두산에너빌리티 본사 방문.',
    category: 'Gallery',
    image: assetPath('/images/gallery/20250716.jpg'),
    content: '두산에너빌리티 본사 및 창원공장 방문기념사진진'
  },
  {
    id: 'g5',
    title: 'Academic Workshop',
    date: '2025-07-29',
    summary: 'Participation in academic workshop.',
    category: 'Gallery',
    image: assetPath('/images/gallery/20250729.jpg'),
    content: 'Workshop focused on materials data analysis.'
  },
  {
    id: 'g6',
    title: 'Lab Retreat',
    date: '2025-08-28',
    summary: 'Annual lab retreat.',
    category: 'Gallery',
    image: assetPath('/images/gallery/20250828.jpg'),
    content: 'Annual retreat for discussion and collaboration.'
  },
];

  const apiNewsItems = apiCommunity?.filter((item) => ['Award', 'Paper', 'General'].includes(item.category)) ?? [];
  const apiNotices = apiCommunity?.filter((item) => item.category === 'Notice') ?? [];
  const apiGalleryItems = apiCommunity?.filter((item) => item.category === 'Gallery') ?? [];
  const displayNewsItems = apiNewsItems.length ? apiNewsItems : newsItems;
  const displayNotices = apiNotices.length ? apiNotices : notices;
  const displayGalleryItems = apiGalleryItems.length ? apiGalleryItems : galleryItems;

  const saveItem = async (values: Record<string, unknown>) => {
    const payload = {
      title: String(values.title ?? ''),
      date: String(values.date ?? ''),
      summary: String(values.summary ?? ''),
      content: String(values.content ?? ''),
      category: (values.category as CommunityItem['category']) || tabCategory[activeTab],
      link: values.link || null,
      image: values.image || null,
      images: Array.isArray(values.images) ? values.images : [],
      published: true,
      sortOrder: 0,
    };
    if (editor?.id) await adminCommunity.update(editor.id, payload);
    else await adminCommunity.create(payload);
    await load();
  };

  const removeItem = async (item: CommunityItem, event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (!item.id || !confirmDelete(item.title)) return;
    await adminCommunity.remove(item.id);
    if (selectedItem?.id === item.id) setSelectedItem(null);
    await load();
  };

  const canEdit = (id?: string) => Boolean(id && apiCommunity?.some((item) => item.id === id));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12 min-h-[80vh]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">{m.community.title}</h1>
              <p className="text-gray-500 text-lg">{m.community.subtitle}</p>
            </div>
            <AdminAddButton
              label={`${activeTab} 추가`}
              onClick={() => setEditor({
                title: '',
                date: new Date().toISOString().slice(0, 10),
                summary: '',
                content: '',
                category: tabCategory[activeTab],
                images: [],
              })}
            />
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Navigation Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-soft p-2 sticky top-28 border border-gray-100">
              {[
                { id: 'news', label: m.community.news, icon: Newspaper },
                { id: 'notice', label: m.community.notice, icon: Bell },
                { id: 'conferences', label: m.community.conferences, icon: Mic2 },
                { id: 'gallery', label: m.community.gallery, icon: ImageIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as Tab);
                    if (tab.id === 'conferences') {
                      setConferencePage(1);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 mb-1 last:mb-0
                    ${activeTab === tab.id ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              {activeTab === 'news' && (
                <motion.div key="news" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  {displayNewsItems.map((item) => (
                    <div key={item.id} onClick={() => setSelectedItem(item)} className="relative bg-white rounded-2xl p-8 shadow-soft hover:shadow-soft-hover border border-gray-100 cursor-pointer group">
                      {canEdit(item.id) && <AdminActions onEdit={() => setEditor(item)} onDelete={() => removeItem(item)} />}
                      <div className="flex justify-between items-center mb-4">
                        <span className="bg-gold-200 text-gold-700 px-3 py-1 rounded-full text-xs font-bold uppercase"><Tag size={12} className="inline mr-1"/> {item.category}</span>
                        <span className="text-gray-400 text-sm"><Calendar size={14} className="inline mr-1"/> {item.date}</span>
                      </div>
                      <h3 className="text-2xl font-serif font-bold group-hover:text-primary-700 transition-colors">{item.title}</h3>
                      <p className="text-gray-600 mt-2">{item.summary}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'notice' && (
                <motion.div key="notice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase">
                      <tr><th className="px-6 py-4 w-24">{m.community.tableNo}</th><th className="px-6 py-4">{m.community.tableTitle}</th><th className="px-6 py-4 w-32 text-right">{m.community.tableDate}</th><th className="px-6 py-4 w-28"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayNotices.map((notice, index) => (
                        <tr key={notice.id} onClick={() => setSelectedItem(notice)} className="hover:bg-primary-50/30 cursor-pointer group">
                          <td className="px-6 py-4 text-gray-400 font-mono text-sm">{displayNotices.length - index}</td>
                          <td className="px-6 py-4 font-medium text-gray-900 group-hover:text-primary-700">{notice.title}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm text-right">{notice.date}</td>
                          <td className="px-6 py-4">
                            <div className="relative h-8">
                              {canEdit(notice.id) && <AdminActions className="top-0 right-0" onEdit={() => setEditor(notice)} onDelete={() => removeItem(notice)} />}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'conferences' && (
                <motion.div
                  key="conferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {sortedConferences.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {currentConferenceItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="relative bg-white rounded-2xl p-4 shadow-soft hover:shadow-soft-hover border border-gray-100 cursor-pointer group flex flex-col"
                          >
                            {canEdit(item.id) && <AdminActions onEdit={() => setEditor(item)} onDelete={() => removeItem(item)} />}
                          <div className="mb-4">
                            {item.images?.length ? (
                              <div className="grid grid-cols-2 gap-2">
                                {item.images.map((src, idx) => (
                                  <div
                                    key={`${src}-${idx}`}
                                    className="aspect-[4/3] rounded-xl bg-gray-100 overflow-hidden border border-gray-100"
                                  >
                                    <img
                                      src={src}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              item.image && (
                                <div className="w-full aspect-[4/3] rounded-xl bg-gray-100 overflow-hidden border border-gray-100">
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                              )
                            )}
                          </div>
                            <div className="flex flex-col flex-grow">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-primary-700 font-bold text-xs uppercase bg-primary-50 px-2 py-1 rounded">
                                  {m.community.conference}
                                </span>
                                <span className="text-gray-400 text-xs">{item.date}</span>
                              </div>
                              <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-primary-700 leading-snug line-clamp-3">
                                {item.title}
                              </h3>
                              <p className="text-gray-500 text-xs md:text-sm mt-2 line-clamp-2">
                                {item.summary}
                              </p>
                              {item.content && (
                                <p className="text-gray-500 text-[11px] md:text-xs mt-2 line-clamp-3">
                                  {getExcerpt(item.content)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {totalConferencePages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-4">
                          <button
                            onClick={() => setConferencePage((p) => Math.max(1, p - 1))}
                            disabled={conferencePage === 1}
                            className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-1 ${
                              conferencePage === 1
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            ← {m.community.prev}
                          </button>
                          <span className="text-xs text-gray-500">
                            {t('community.page', { current: conferencePage, total: totalConferencePages })}
                          </span>
                          <button
                            onClick={() =>
                              setConferencePage((p) => Math.min(totalConferencePages, p + 1))
                            }
                            disabled={conferencePage === totalConferencePages}
                            className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-1 ${
                              conferencePage === totalConferencePages
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {m.community.next} →
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                      <p className="text-gray-500">{m.community.noConferences}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'gallery' && (
                <motion.div key="gallery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayGalleryItems.map((item) => (
                    <div key={item.id} onClick={() => setSelectedItem(item)} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-soft cursor-pointer border border-gray-100">
                      {canEdit(item.id) && <AdminActions onEdit={() => setEditor(item)} onDelete={() => removeItem(item)} />}
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className="text-white/70 text-xs font-bold uppercase block mb-1">{item.date}</span>
                        <h3 className="text-white font-bold text-lg">{item.title}</h3>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
               <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors z-20"><X size={20}/></button>
               
               <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
                  {selectedItem.images?.length ? (
                    <div className="mb-8">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedItem.images.map((src, idx) => (
                          <div
                            key={`${src}-${idx}`}
                            className="aspect-[4/3] rounded-xl bg-gray-100 overflow-hidden border border-gray-100"
                          >
                            <img src={src} alt={selectedItem.title} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    selectedItem.image && (
                      <div className="h-64 md:h-80 bg-gray-100 overflow-hidden shrink-0 mb-8">
                        <img src={selectedItem.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{selectedItem.category}</span>
                    <span className="text-gray-400 text-sm"><Calendar size={14} className="inline mr-1"/> {selectedItem.date}</span>
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 leading-tight">{selectedItem.title}</h2>
                  <div className="prose prose-lg text-gray-600 max-w-none" dangerouslySetInnerHTML={{ __html: selectedItem.content || selectedItem.summary }} />
                  
                  {selectedItem.link && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                      <a href={selectedItem.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-primary-700 transition-colors">{m.community.viewResource} <ExternalLink size={18}/></a>
                    </div>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AdminEditorModal
        open={Boolean(editor)}
        title={editor?.id ? '게시물 수정' : '게시물 추가'}
        fields={communityFields}
        initial={editor as Record<string, unknown> | undefined}
        onClose={() => setEditor(null)}
        onSave={saveItem}
      />
    </Layout>
  );
};
