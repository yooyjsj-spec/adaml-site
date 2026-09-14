import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { BrainCircuit, Plane, Microscope, Layers, ArrowRight } from 'lucide-react';
import { ASSETS } from '../data/assets';
import { useI18n } from '../i18n';

type AreaId = 'microstructure' | 'aerospace' | 'additive' | 'ai';

const AREA_META: { id: AreaId; icon: React.ElementType; image: string }[] = [
  { id: 'microstructure', icon: Microscope, image: ASSETS.IMAGES.RESEARCH_MICRO },
  { id: 'aerospace', icon: Plane, image: ASSETS.IMAGES.RESEARCH_AERO },
  { id: 'additive', icon: Layers, image: ASSETS.IMAGES.RESEARCH_PRINT },
  { id: 'ai', icon: BrainCircuit, image: ASSETS.IMAGES.RESEARCH_AI },
];

export const Research: React.FC = () => {
  const location = useLocation();
  const { m } = useI18n();
  const [activeId, setActiveId] = useState<string>('microstructure');

  const areas = useMemo(
    () =>
      AREA_META.map((meta) => ({
        ...meta,
        ...m.research.areas[meta.id],
      })),
    [m]
  );

  // Hash 기반 스크롤: /research#sectionId 로 진입 시 해당 섹션으로 스크롤
  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (hash) {
      const scrollToHashSection = () => {
        const element = document.getElementById(hash);
        if (element) {
          const offset = 100;
          const elementRect = element.getBoundingClientRect();
          const offsetPosition = elementRect.top + window.scrollY - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          setActiveId(hash);
        }
      };
      // DOM 렌더 완료 후 스크롤 (React Router 네비게이션 후 레이아웃 안정화 대기)
      const timer = setTimeout(scrollToHashSection, 50);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  useEffect(() => {
    const handleScroll = () => {
      // Find the section that is currently most visible
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      for (const area of areas) {
        const element = document.getElementById(area.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveId(area.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [areas]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Adjust for sticky header or spacing
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveId(id);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <span className="text-primary-600 font-bold uppercase tracking-widest text-sm block mb-3">{m.research.eyebrow}</span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
                {m.research.title}
              </h1>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            {/* Left Sidebar - Sticky */}
            <div className="hidden lg:block w-1/4">
              <div className="sticky top-32 space-y-2">
                {areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => scrollToSection(area.id)}
                    className={`w-full text-left px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-between group ${
                      activeId === area.id 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' 
                        : 'bg-white text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`font-medium ${activeId === area.id ? 'font-bold' : ''}`}>
                      {area.title}
                    </span>
                    {activeId === area.id && (
                      <motion.div layoutId="activeArrow">
                        <ArrowRight size={18} />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Content - Scrolling */}
            <div className="w-full lg:w-3/4 space-y-24 pb-24">
              {areas.map((area) => (
                <motion.section 
                  id={area.id} 
                  key={area.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="scroll-mt-32"
                >
                  {/* Mobile Title (visible only on mobile) */}
                  <div className="lg:hidden mb-6 sticky top-20 z-10 bg-gray-50/95 backdrop-blur-sm py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <area.icon className="text-primary-600" size={24} />
                      {area.title}
                    </h2>
                  </div>

                  <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                    {/* Image Header */}
                    <div className="relative h-[300px] md:h-[400px] overflow-hidden group">
                      <img 
                        src={area.image} 
                        alt={area.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                      
                      <div className="absolute bottom-0 left-0 p-8 text-white">
                        <div className="flex items-center gap-3 mb-3 text-primary-300">
                          <area.icon size={28} />
                          <span className="font-bold uppercase tracking-wider text-sm">{m.research.focus}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">{area.title}</h2>
                        <p className="text-gray-200 text-lg max-w-2xl">{area.summary}</p>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-8 md:p-12">
                      <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                        <h3 className="text-xl font-bold text-gray-900">{area.heading}</h3>
                        {area.paragraphs.map((paragraph) => (
                          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                        ))}
                        {area.subsections.map((section) => (
                          <React.Fragment key={section.title}>
                            <h4 className="text-lg font-bold text-primary-700 mt-6">{section.title}</h4>
                            {section.paragraphs.map((paragraph) => (
                              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>
              ))}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};