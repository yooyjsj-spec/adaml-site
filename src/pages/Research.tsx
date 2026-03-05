import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/Layout';
import { BrainCircuit, Plane, Microscope, Printer, ArrowRight } from 'lucide-react';
import { ASSETS } from '../data/assets';

interface ResearchArea {
  id: string;
  title: string;
  summary: string;
  fullContent: React.ReactNode;
  icon: React.ElementType;
  image: string;
}

export const Research: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('microstructure');

  const areas: ResearchArea[] = useMemo(
    () => [
      {
        id: "microstructure",
        title: "Microstructure Analysis",
        icon: Microscope,
        image: ASSETS.IMAGES.RESEARCH_MICRO,
        summary: "We investigate the relationships between processing, microstructure, and properties using advanced characterization techniques and AI-based image analysis.",
        fullContent: (
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
            <h3 className="text-xl font-bold text-gray-900">Advanced characterization and analysis of material microstructures</h3>
            <p>
              We conduct comprehensive microstructure analysis using state-of-the-art characterization techniques to understand the fundamental relationships between material structure and properties. Our research employs scanning electron microscopy (SEM), transmission electron microscopy (TEM), electron backscatter diffraction (EBSD), X-ray diffraction (XRD), atom probe tomography (APT), and advanced spectroscopy methods to investigate phase distributions, grain structures, crystallographic orientations, precipitation behavior, and defect characteristics.
            </p>
            <p>
              Through detailed quantitative analysis of microstructural features including grain size distribution, texture evolution, phase fractions, and interface characteristics, we establish correlations between processing conditions, microstructural evolution, and resulting material properties. Our work encompasses in-situ and ex-situ characterization under various thermal and mechanical loading conditions to understand dynamic microstructural changes.
            </p>
            <p>
              We develop advanced image analysis algorithms and machine learning approaches for automated microstructure quantification and pattern recognition. Our research provides critical insights for optimizing material processing routes, heat treatment schedules, and alloy compositions to achieve desired microstructural features that enhance mechanical properties, corrosion resistance, and high-temperature performance.
            </p>
          </div>
        )
      },
      {
        id: "aerospace",
        title: "Aerospace and Defense Materials",
        icon: Plane,
        image: ASSETS.IMAGES.RESEARCH_AERO,
        summary: "We design and optimize advanced alloys for aerospace and defense applications, focusing on performance under extreme conditions.",
        fullContent: (
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
            <h3 className="text-xl font-bold text-gray-900">Advanced materials for extreme aerospace and defense environments</h3>
            <p>
              Our research focuses on the development of advanced materials capable of operating under extreme high-temperature and harsh environmental conditions for next-generation aircraft, spacecraft, and defense systems. We specialize in the design and development of high-performance alloy systems, including superalloys and high-entropy alloys (HEAs), as well as high-temperature composite materials and advanced armor systems that maintain exceptional mechanical properties and structural integrity under severe operating conditions.
            </p>
            
            <h4 className="text-lg font-bold text-primary-700 mt-6">High-Entropy Alloys (HEAs)</h4>
            <p>
              High-entropy alloys, composed of multiple principal elements in near-equimolar ratios, represent a key materials strategy in our research due to their outstanding mechanical strength, high-temperature stability, and superior corrosion and oxidation resistance. We investigate the fundamental relationships between composition, microstructure, and properties to tailor HEAs and conventional alloys for aerospace and defense applications requiring high reliability and durability.
            </p>
            <p>
              Through comprehensive microstructure analysis using advanced characterization techniques such as scanning electron microscopy (SEM), transmission electron microscopy (TEM), electron backscatter diffraction (EBSD), and X-ray diffraction (XRD), we examine the effects of processing parameters on microstructural evolution and material performance. Our research encompasses detailed analyses of phase transformations, grain boundary characteristics, precipitation behavior, and defect structures that govern creep resistance, fatigue life, fracture toughness, and oxidation resistance under extreme conditions.
            </p>
            <p>
              By integrating microstructure-driven insights with predictive modeling, we establish clear links between alloy design, heat treatment processes, and resulting mechanical properties. This approach enables the optimization of alloy compositions, thermal processing routes, and manufacturing strategies to develop materials suitable for aerospace propulsion systems, thermal protection systems, and defense applications exposed to extreme thermal, mechanical, and environmental loading.
            </p>
          </div>
        )
      },
      {
        id: "additive",
        title: "Additive Manufacturing",
        icon: Printer,
        image: ASSETS.IMAGES.RESEARCH_PRINT,
        summary: "We develop and optimize metal additive manufacturing processes to control microstructure and enhance mechanical performance.",
        fullContent: (
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
            <h3 className="text-xl font-bold text-gray-900">3D printing and advanced manufacturing technologies</h3>
            <p>
              Development of additive manufacturing processes for complex metallic components, including selective laser melting (SLM), electron beam melting (EBM), and directed energy deposition (DED). We optimize process parameters, investigate microstructure evolution, and enhance mechanical properties of additively manufactured materials for aerospace and defense applications.
            </p>
            <p>
               Our approach addresses key challenges in AM such as residual stress management, porosity reduction, and anisotropy control. By understanding the rapid solidification physics inherent to these processes, we tailor thermal histories to achieve specific microstructural gradients and site-specific properties impossible to achieve with conventional manufacturing.
            </p>
          </div>
        )
      },
      {
        id: "ai",
        title: "AI Material Analysis",
        icon: BrainCircuit,
        image: ASSETS.IMAGES.RESEARCH_AI,
        summary: "We apply machine learning and deep learning to automate microstructure analysis, predict material properties, and accelerate data-driven materials design.",
        fullContent: (
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
            <h3 className="text-xl font-bold text-gray-900">Intelligent analysis and prediction of material properties</h3>
            <p>
              We utilize artificial intelligence and machine learning to analyze complex microstructures, predict material properties, and optimize material design. By integrating deep learning with advanced microscopy data, computational modeling, and experimental results, we achieve rapid and accurate material characterization that accelerates the development of new materials.
            </p>
            <p>
              Our models include Convolutional Neural Networks (CNNs) for segmentation of phases and defects in microscopy images, Generative Adversarial Networks (GANs) for super-resolution imaging and structure generation, and physics-informed neural networks to predict material behavior under load. This data-driven approach significantly reduces the time and cost associated with traditional trial-and-error experimental methods.
            </p>
          </div>
        )
      }
    ],
    []
  );

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
              <span className="text-primary-600 font-bold uppercase tracking-widest text-sm block mb-3">Core Competencies</span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
                Research Areas
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
              {areas.map((area, index) => (
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
                          <span className="font-bold uppercase tracking-wider text-sm">Research Focus</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">{area.title}</h2>
                        <p className="text-gray-200 text-lg max-w-2xl">{area.summary}</p>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-8 md:p-12">
                      {area.fullContent}
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