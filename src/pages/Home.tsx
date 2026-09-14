import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Recycle, Microscope, Database, Zap, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ASSETS } from '../data/assets';
import { HighlightText, useI18n } from '../i18n';

const pillarIcons = [Recycle, Microscope, Cpu];
const researchIcons = [Zap, Database, Layers, Cpu];

export const Home: React.FC = () => {
  const { m } = useI18n();

  return (
    <Layout>
      <div className="w-full bg-[#1a1416] text-white">
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <motion.img
              src={ASSETS.IMAGES.HOME_HERO}
              alt="Aerospace Background"
              initial={{ scale: 1.6 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1416]/30 to-[#1a1416]"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1416]/60 via-transparent to-[#1a1416]/60"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full border border-primary-400/40 bg-primary-900/30 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-primary-400"></span>
                <span className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-primary-200">
                  {m.home.badge}
                </span>
              </span>

              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 leading-tight drop-shadow-lg">
                {m.home.title}
              </h1>

              <p className="text-sm md:text-base text-gray-300 mb-6 tracking-wide">
                {m.home.affiliation}
              </p>

              <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
                <HighlightText text={m.home.tagline} highlightClassName="font-semibold text-white" />
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/research" className="px-8 py-4 bg-primary-600 text-white rounded-md font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 group">
                  {m.home.exploreResearch} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="px-8 py-4 bg-transparent border border-gray-600 text-white rounded-md font-bold hover:border-gray-400 transition-all text-center">
                  {m.home.contactUs}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-[#1a1416] relative">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-[#241b1f]"
            >
              <div className="absolute top-0 left-0 right-0 h-8 bg-[#1a1416] border-b border-gray-700 flex items-center px-4 gap-2 z-10">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="ml-4 text-xs text-gray-500 font-mono">simulation_preview.mp4</div>
              </div>

              <div
                className="pt-8 select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full aspect-video object-cover"
                >
                  <source src={ASSETS.VIDEOS.ABOUT_bg} type="video/mp4" />
                  {m.home.videoUnsupported}
                </video>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gold-500/15 rounded-lg border border-gold-500/40 backdrop-blur-sm">
                    <Database className="text-gold-400 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{m.home.videoTitle}</h3>
                    <p className="text-gray-400 text-sm">{m.home.videoCaption}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-[#1a1416] border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-gold-400 uppercase tracking-widest mb-3">{m.home.aboutEyebrow}</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 whitespace-pre-line">
                {m.home.aboutTitle}
              </h3>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                {m.home.aboutBody}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {m.home.pillars.map((item, idx) => {
                const Icon = pillarIcons[idx];
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-[#241b1f] p-8 rounded-xl border border-gray-700 hover:border-gold-500/50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gold-600/20 transition-colors">
                      <Icon className="w-6 h-6 text-gray-300 group-hover:text-gold-400 transition-colors" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-gold-400 text-sm font-medium mb-4">{item.desc}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.detail}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#241b1f] border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{m.home.researchTitle}</h2>
                <p className="text-gray-400 max-w-xl">
                  {m.home.researchIntro}
                </p>
              </div>
              <Link to="/research" className="text-gold-400 font-bold hover:text-gold-300 flex items-center gap-2 group">
                {m.home.viewAllResearch} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {m.home.researchCards.map((item, idx) => {
                const Icon = researchIcons[idx];
                return (
                  <Link to={`/research#${item.sectionId}`} key={item.sectionId} className="block group">
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="h-full bg-[#1a1416] p-6 rounded-lg border border-gray-700 hover:border-gold-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-8 h-8 text-gray-500 group-hover:text-gold-400 transition-colors" />
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gold-400 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};
