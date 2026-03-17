import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Plane, Shield, Globe, Database, Zap, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ASSETS } from '../data/assets';

export const Home: React.FC = () => {
  return (
    <Layout>
      <div className="w-full bg-[#0d1117] text-white">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={ASSETS.IMAGES.HOME_HERO}
              alt="Aerospace Background" 
              className="w-full h-full object-cover opacity-80"
            />
            {/* Gradient Overlay - Adjusted for Teal/Cyan Galaxy */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d1117]/30 to-[#0d1117]"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117]/60 via-transparent to-[#0d1117]/60"></div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
                ADAM LAB
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
                Bridging the gap between <span className="font-semibold text-white">Artificial Intelligence</span> and <span className="font-semibold text-white">Aerospace Defense Materials</span>.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/research" className="px-8 py-4 bg-white text-gray-900 rounded-md font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group">
                  Explore Research <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="px-8 py-4 bg-transparent border border-gray-600 text-white rounded-md font-bold hover:border-gray-400 transition-all text-center">
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Video Section (Scroll-triggered) */}
        <section className="py-24 bg-[#0d1117] relative">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-[#161b22]"
            >
              <div className="absolute top-0 left-0 right-0 h-8 bg-[#0d1117] border-b border-gray-700 flex items-center px-4 gap-2 z-10">
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
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {/* Overlay Content on Video */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/30 backdrop-blur-sm">
                    <Database className="text-blue-400 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Real-time Microstructure Analysis</h3>
                    <p className="text-gray-400 text-sm">Processing terabytes of material data for predictive modeling</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-24 bg-[#0d1117] border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3">About Us</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Innovating for the Future of <br/>Defense & Aerospace
              </h3>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                ADAM Lab (AI Analysis & Defense Aerospace Materials) is a premier research facility dedicated to the convergence of material science and artificial intelligence. We focus on designing next-generation superalloys that can withstand the most extreme environments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: Cpu, 
                  title: "AI Analysis", 
                  desc: "Data-driven insights",
                  detail: "Leveraging machine learning to predict material behavior and accelerate discovery."
                },
                { 
                  icon: Plane, 
                  title: "Aerospace", 
                  desc: "Next-gen materials",
                  detail: "Developing high-performance alloys for extreme flight conditions and environments."
                },
                { 
                  icon: Shield, 
                  title: "Defense", 
                  desc: "Strategic applications",
                  detail: "Engineering advanced armor and structural components for national security."
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#161b22] p-8 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-900/30 transition-colors">
                    <item.icon className="w-6 h-6 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-blue-400 text-sm font-medium mb-4">{item.desc}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Research Section */}
        <section className="py-24 bg-[#161b22] border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Research Areas</h2>
                <p className="text-gray-400 max-w-xl">
                  Our multidisciplinary approach combines experimental metallurgy with computational modeling.
                </p>
              </div>
              <Link to="/research" className="text-blue-400 font-bold hover:text-blue-300 flex items-center gap-2 group">
                View all research <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "High-Temperature Superalloys", icon: Zap, desc: "Nickel-based alloys for turbine engines", sectionId: "aerospace" },
                { title: "ML-based Prediction", icon: Database, desc: "Neural networks for property forecasting", sectionId: "ai" },
                { title: "Additive Manufacturing", icon: Layers, desc: "3D printing of complex metal parts", sectionId: "additive" },
                { title: "Microstructure Analysis", icon: Cpu, desc: "Advanced microscopy and characterization", sectionId: "microstructure" }
              ].map((item, idx) => (
                <Link to={`/research#${item.sectionId}`} key={idx} className="block group">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="h-full bg-[#0d1117] p-6 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <item.icon className="w-8 h-8 text-gray-500 group-hover:text-blue-400 transition-colors" />
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};