
import { JournalPaper } from '../types';
import { ASSETS } from './assets';
import { coverForJournalName } from './journalTitleCovers';
import { assetPath } from '../utils/assetPath';

// NOTE:
// - 이미지가 로컬에 없을 경우 자동으로 기본 커버(ASSETS.JOURNALS.DEFAULT_COVER)로 대체됩니다.
// - 경로는 "/images/..."처럼 루트 기준이어도 됩니다. GitHub Pages 서브 디렉토리 배포 시에도
//   assetPath에서 BASE_URL을 붙여서 안전하게 처리합니다.

type JournalEntry = Omit<JournalPaper, 'image'> & { image?: string };

const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    title: "Dual role of B in hydrogen embrittlement resistance of high-strength martensitic medium-Mn steel",
    doi: "https://doi.org/10.1016/j.actamat.2026.122499",
    journal: "Acta Materialia",
    date: "2026.09.01."
  },
  {
    title: "Effects of pre-segregated B and C on H interphase boundary segregation in medium-Mn steel",
    doi: "https://doi.org/10.1016/j.scriptamat.2026.117419",
    journal: "Scripta Materialia",
    date: "2026.09.01."
  },
  {
    title: "Short-range order in face-centered cubic multi-principal element alloys: identification, structure–property relationships, and superfunctional implications",
    doi: "https://doi.org/10.1007/s10853-026-13515-z",
    journal: "Journal of Materials Science",
    date: "2026.08.12."
  },
  {
    title: "Dual precipitation pathway of lamellar B2–CuPd and ordered β′ phases in a Pd–Ag–Cu alloy: Microstructural evolution and coupled mechanical-electrical response",
    doi: "https://doi.org/10.1016/j.jmrt.2026.07.202",
    journal: "Journal of Materials Research and Technology",
    date: "2026.07.01."
  },
  {
    title: "Heat-affected-zone heterogeneity and environment-assisted damage localization in a welded API X70 pipeline steel",
    doi: "https://doi.org/10.1016/j.jmrt.2026.06.294",
    journal: "Journal of Materials Research and Technology",
    date: "2026.07.01."
  },
  {
    title: "Modeling Hardness in Industrial C–Mn Cast Steels with Neural Network Models",
    doi: "https://doi.org/10.1007/s12666-026-03921-x",
    journal: "Transactions of the Indian Institute of Metals",
    date: "2026.05.17."
  },
  {
    title: "Design of hydrogen-resistant high-strength medium-Mn steels via Pareto active learning",
    doi: "https://doi.org/10.1016/j.actamat.2026.122264",
    journal: "Acta Materialia",
    date: "2026.04.22."
  },
  {
    title: "Etching methods for revealing nanoscale precipitates and carbides in Ni-based superalloys",
    doi: "https://doi.org/10.1186/s42649-026-00125-x",
    journal: "Applied Microscopy",
    date: "2026.03.10."
  },
  {
    title: "Emerging Trends in Additive Manufacturing of Metal Matrix Composites: Opportunities and Obstacles",
    doi: "https://doi.org/10.1002/metm.70020",
    journal: "MetalMat",
    date: "2025.11.14."
  },
  {
    title: "Intragranular-heterostructured FeCuNi medium-entropy alloy through immiscibility design approach",
    doi: "https://doi.org/10.1016/j.jmst.2025.10.059",
    journal: "Journal of Materials Science & Technology",
    date: "2025.11.06."
  },
  {
    title: "Linkage between process-induced microstructure and magnetic property of Nd-Fe-B permanent magnets additively manufactured by laser powder bed fusion",
    doi: "https://doi.org/10.1016/j.matdes.2025.114929",
    journal: "Materials & Design",
    date: "2025.10.13."
  },
  {
    title: "Revealing the activation energies for H desorption from spherical semi-coherent and incoherent V4C3 precipitates in martensitic medium-Mn steel",
    doi: "https://doi.org/10.1016/j.actamat.2025.121618",
    journal: "Acta Materialia",
    date: "2025.10.09."
  },
  {
    title: "Effects of Fe content on plane-stress fracture toughness of Fex(CoCrMnNi)100-x complex concentrated alloys",
    doi: "https://doi.org/10.1016/j.msea.2025.149149",
    journal: "Materials Science and Engineering A",
    date: "2025.09.17."
  },
  {
    title: "Dynamic strain aging behavior of Inconel 625 alloy processed via directed energy deposition",
    doi: "https://doi.org/10.1016/j.msea.2025.149001",
    journal: "Materials Science and Engineering A",
    date: "2025.08.20."
  },
  {
    title: "Hydrogen desorption mechanism associated with ε carbide decomposition in martensitic medium-Mn steel",
    doi: "https://doi.org/10.1016/j.jmrt.2025.07.082",
    journal: "Journal of Materials Research and Technology",
    date: "2025.07.01."
  },
  {
    title: "Development of Aluminum Alloys for Additive Manufacturing Using Machine Learning",
    doi: "https://doi.org/10.4150/jpm.2025.00150",
    journal: "Journal of Powder Materials",
    date: "2025.06.30."
  },
  {
    title: "Observation of interface disruption and Lomer-Cottrell locks in a crept L12-strengthened Ni-based superalloy",
    doi: "https://doi.org/10.1016/j.msea.2025.148570",
    journal: "Materials Science and Engineering A",
    date: "2025.05.27."
  },
  {
    title: "Enhancing corrosion resistance of Ti-based amorphous alloy powders via misch metal addition",
    doi: "https://doi.org/10.1177/00325899251332425",
    journal: "Powder Metallurgy",
    date: "2025.04.15."
  },
  {
    title: "Multi-scale design of deformation mechanisms at hetero-zone boundaries: Dual HDI strengthening driven by TRIP effect",
    doi: "https://doi.org/10.1016/j.jmst.2025.01.032",
    image: "/images/journals/journal128.png",
    journal: "Journal of Materials Science & Technology",
    date: "2025.03.08."
  },
  {
    title: "Simple and scalable manufacturing of metal/carbon hybrid EMI shielding fabric across a broad frequency range",
    doi: "https://doi.org/10.1016/j.jmrt.2025.01.094",
    image: "/images/journals/journal127.png",
    journal: "Journal of Materials Research and Technology",
    date: "2025.03.01."
  },
  {
    title: "Complex deformation behavior of a partially recrystallized metastable medium-entropy alloy: in-situ synchrotron X-ray diffraction study",
    doi: "https://doi.org/10.1016/j.actamat.2025.120757",
    image: "/images/journals/journal126.png",
    journal: "Acta Materialia",
    date: "2025.03.01."
  },
  {
    title: "Mechanical Properties and Microstructure of Laser Powder Bed Fusion-Processed 18Ni300 Maraging Steel According to Direct Aging Treatment Conditions",
    doi: "https://doi.org/10.1002/srin.202400348",
    image: "/images/journals/journal125.png",
    journal: "Steel Research International",
    date: "2024.09.24."
  },
  {
    title: "Serration-induced plasticity in phase transformative stainless steel 316L upon ultracold deformation at 4.2 K",
    doi: "https://doi.org/10.1016/j.msea.2024.147591",
    image: "/images/journals/journal124.png",
    journal: "Materials Science and Engineering: A",
    date: "2025.01.01."
  },
  {
    title: "Strengthening Effect of Fe60Mn16Ni12Cr12 Medium-Entropy Alloys via Co-Doping Al/C",
    doi: "https://doi.org/10.1007/s12540-024-01865-9",
    image: "/images/journals/journal123.png",
    journal: "Metals and Materials International",
    date: "2024.12.13."
  },
  {
    title: "Neural Network-Based Modeling of the Interplay between Composition, Service Temperature, and Thermal Conductivity in Steels for Engineering Applications",
    doi: "https://doi.org/10.1007/s10765-024-03434-z",
    image: "/images/journals/journal122.png",
    journal: "International Journal of Thermophysics",
    date: "2024.12.23."
  },
  {
    title: "Periodic spinodal decomposition in double–strengthened medium–entropy alloy",
    doi: "https://doi.org/10.1038/s41467-024-50078-6",
    image: "/images/journals/journal121.png",
    journal: "Nature Communications",
    date: "2024.07.09."
  },
  {
    title: "Enhanced high-temperature ductility without strength drop in a lean Co Ni-based superalloy",
    doi: "https://doi.org/10.1016/j.jallcom.2024.174407",
    image: "/images/journals/journal120.png",
    journal: "Journal of Alloys and Compounds",
    date: "2024.07.05."
  },
  {
    title: "Maraging and reversion-driven passivation engineering of Fe68Ni10Mn10Co10Ti1.5Si0.5 medium entropy alloy",
    doi: "https://doi.org/10.1016/j.jallcom.2024.173929",
    image: "/images/journals/journal119.png",
    journal: "Journal of Alloys and Compounds",
    date: "2024.05.15."
  },
  {
    title: "Microscopic-plastic deformation behavior of grain boundary precipitates in an Al–Zn–Mg alloy",
    doi: "https://doi.org/10.1016/j.jmrt.2024.04.044",
    image: "/images/journals/journal118.png",
    journal: "Journal of Materials Research and Technology",
    date: "2024.05.01."
  },
  {
    title: "Mechanical properties of lamellar-structured 18Ni300 maraging steel manufactured via directed energy deposition",
    doi: "https://doi.org/10.1016/j.msea.2023.146031",
    image: "/images/journals/journal117.png",
    journal: "Materials Science and Engineering A",
    date: "2024.02.01."
  },
  {
    title: "The influence of chemical short-range order on the nanoindentation properties of high-entropy alloys prepared via laser powder bed fusion",
    doi: "https://doi.org/10.1016/j.matchar.2023.113560",
    image: "/images/journals/journal116.png",
    journal: "Materials Characterization",
    date: "2024.01.01."
  },
  {
    title: "Effect of Heat Treatment Temperature on Microstructure, Tensile Properties and δ-Precipitate Phase in Ni-based Superalloy",
    doi: "http://dx.doi.org/10.3365/KJMM.2024.62.1.32",
    image: "/images/journals/journal115.png",
    journal: "Korean Journal of Metals and Materials",
    date: "2023.12.29."
  },
  {
    title: "Hetero-deformation induced strengthening, precipitation hardening, and metastability engineering in a novel maraging Fe68Ni10Mn10Co10Ti1.5Si0.5 medium entropy alloy",
    doi: "https://doi.org/10.1016/j.jallcom.2023.171870",
    image: "/images/journals/journal114.png",
    journal: "Journal of Alloys and Compounds",
    date: "2023.12.15."
  },
  {
    title: "Cellular structure engineering of additive manufactured CoCrFeMnNi high-entropy composite The role of hard ceramic reinforcements in elemental segregation of constitutive elements",
    doi: "https://doi.org/10.1016/j.addlet.2023.100172",
    image: "/images/journals/journal113.png",
    journal: "Additive Manufacturing Letters",
    date: "2023.12.01."
  },
  {
    title: "Microstructural evolution and tensile property enhancement of low-cost Fe-24Mn-22Ni-12Cr medium-entropy alloy by cryogenic caliber rolling",
    doi: "https://doi.org/10.1016/j.jallcom.2023.170709",
    image: "/images/journals/journal112.png",
    journal: "Journal of Alloys and Compounds",
    date: "2023.10.15."
  },
  {
    title: "A new transformation-induced plasticity-assisted dual-phase medium-entropy alloy with ultra-high cryogenic mechanical properties",
    doi: "https://doi.org/10.1016/j.scriptamat.2023.115617",
    image: "/images/journals/journal111.png",
    journal: "Scripta Materialia",
    date: "2023.10.01."
  },
  {
    title: "Chemical core-shell metastability-induced large ductility in medium-entropy maraging and reversion alloys",
    doi: "https://doi.org/10.1016/j.actamat.2023.119115",
    image: "/images/journals/journal110.png",
    journal: "Acta Materialia",
    date: "2023.09.01."
  },
  {
    title: "Genetic design of new aluminum alloys to overcome strength-ductility trade-off dilemma",
    doi: "https://doi.org/10.1016/j.jallcom.2023.169546",
    image: "/images/journals/journal109.png",
    journal: "Journal of Alloys and Compounds",
    date: "2023.06.25."
  },
  {
    title: "Optimization of laser-powder bed fusion processed Fe-4.5Si alloy via response surface methodology",
    doi: "https://doi.org/10.1002/srin.202200155",
    image: "/images/journals/journal108.png",
    journal: "Steel Research International",
    date: "2022.06.09."
  },
  {
    title: "Experimental and Crystal Plasticity Finite Element Study of the Deformation Behavior of HighMn Steel Micropillars",
    doi: "https://doi.org/10.1002/srin.202200254",
    image: "/images/journals/journal107.png",
    journal: "Steel Research International",
    date: "2022.10.13."
  },
  {
    title: "Microstructural Effects on J-Integral Fracture Toughness of Welded High-Mn Steels at 298 and 77 K",
    doi: "https://doi.org/10.1002/srin.202200259",
    image: "/images/journals/journal106.png",
    journal: "Steel Research International",
    date: "2022.09.18."
  },
  {
    title: "Microstructural evolution and mechanical properties of laser-powder bed fusion processed 316L stainless steel with an ultrasonic-nanocrystalline surface modification",
    doi: "https://doi.org/10.1016/j.msea.2022.144436",
    image: "/images/journals/journal105.png",
    journal: "Materials Science and Engineering A",
    date: "2023.01.18."
  },
  {
    title: "Dynamics Equations of Power and Force on Wind Speed and Mass Parameters of Wind Turbine Blades I",
    doi: "",
    image: "/images/journals/journal104.png",
    journal: "TESS Res Res Rev",
    date: ""
  },
  {
    title: "Fe55Co17.5Ni10Cr12.5Mo5 High-Entropy Alloy with outstanding cryogenic mechanical properties driven by deformation-induced phase transformation behavior",
    doi: "https://doi.org/10.1007/s12540-022-01215-7",
    image: "/images/journals/journal103.png",
    journal: "Metals and Materials International",
    date: "2022.05.12."
  },
  {
    title: "Mechanical Properties and Microstructural Evolutions of High-Pressure Torsion-Processed Al7068 Alloy",
    doi: "http://dx.doi.org/10.3365/KJMM.2023.61.1.1",
    image: "/images/journals/journal102.png",
    journal: "Korean Journal of Metals and Materials",
    date: "2022.12.28."
  },
  {
    title: "Mechanically derived short-range order and its impact on the multi-principal-element alloys",
    doi: "https://doi.org/10.1038/s41467-022-34470-8",
    image: "/images/journals/journal101.png",
    journal: "Nature Communications",
    date: "2022.10.26."
  },
  {
    title: "Effect of heat treatment conditions on the plastic deformation behavior of the Inconel 706 alloy",
    doi: "https://doi.org/10.1016/j.jmrt.2022.10.058",
    image: "/images/journals/journal100.png",
    journal: "Journal of Materials Research and Technology",
    date: "2022.11.01."
  },
  {
    title: "Strengthening of cost-effective Co-free medium entropy alloys by Al/C alloying",
    doi: "https://doi.org/10.1016/j.msea.2022.144080",
    image: "/images/journals/journal099.png",
    journal: "Materials Science and Engineering A",
    date: "2022.11.01."
  },
  {
    title: "Microstructural, mechanical, and electrochemical analysis of carbon doped AISI carbon steels",
    doi: "https://doi.org/10.1186/s42649-022-00079-w",
    image: "/images/journals/journal098.png",
    journal: "Applied Microscopy",
    date: "2022.10.20."
  },
  {
    title: "Ultrastrong and stress corrosion cracking-resistant martensitic steels",
    doi: "https://doi.org/10.1016/j.actamat.2022.118291",
    image: "/images/journals/journal097.png",
    journal: "Acta Materialia",
    date: "2022.10.15."
  },
  {
    title: "Transformation-induced plasticity in the heterogeneous microstructured Ti-Zr-Nb-Sn alloy via in-situ alloying with directed energy deposition",
    doi: "https://doi.org/10.1016/j.addma.2022.102990",
    image: "/images/journals/journal096.png",
    journal: "Additive Manufacturing",
    date: "2022.10.01."
  },
  {
    title: "Dislocation-aided electrochemical behavior of precipitates in stress corrosion cracking of Al‒Zn‒Mg‒Cu alloys",
    doi: "https://doi.org/10.1016/j.matchar.2022.112019",
    image: "/images/journals/journal095.png",
    journal: "Materials Characterization",
    date: "2022.08.01."
  },
  {
    title: "Manufacturing of Fe-Mn-Al-C Based Low Mn Lightweight Steel Via Direct Energy Deposition",
    doi: "https://doi.org/10.4150/KPMI.2022.29.4.320",
    image: "/images/journals/journal094.png",
    journal: "Journal of Powder Materials",
    date: "2022.07.31."
  },
  {
    title: "A feasible route to produce 1.1 GPa ferritic-based low-Mn lightweight steels with ductility of 47%",
    doi: "https://doi.org/10.1016/j.jmst.2021.11.052",
    image: "/images/journals/journal093.png",
    journal: "Journal of Materials Science & Technology",
    date: "2022.08.01."
  },
  {
    title: "On the stacking fault forming probability and stacking fault energy in carbon-doped 17 at% Mn steels via transmission electron microscopy and atom probe tomography",
    doi: "https://doi.org/10.1016/j.jmst.2021.11.027",
    image: "/images/journals/journal092.png",
    journal: "Journal of Materials Science & Technology",
    date: "2022.07.10."
  },
  {
    title: "Quantitative analysis of retained austenite in Nb added Fe-based alloy",
    doi: "https://doi.org/10.1186/s42649-022-00074-1",
    image: "/images/journals/journal091.png",
    journal: "Applied Microscopy",
    date: "2022.06.18."
  },
  {
    title: "Direct observation of chemical short-range order in 25 wt% Mn steel by transmission electron microscopy",
    doi: "https://doi.org/10.1016/j.scriptamat.2022.114642",
    image: "/images/journals/journal090.png",
    journal: "Scripta Materialia",
    date: "2022.05.01."
  },
  {
    title: "Post-annealing effect on the tensile deformation mechanism of a Ti–6Al–4V alloy manufactured via directed energy deposition",
    doi: "https://doi.org/10.1016/j.msea.2022.142729",
    image: "/images/journals/journal089.png",
    journal: "Materials Science and Engineering A",
    date: "2022.03.02."
  },
  {
    title: "Mechanical properties and microstructural evolution of high-pressure torsion-processed Al7075 alloy at elevated temperatures",
    doi: "https://doi.org/10.1016/j.msea.2022.142692",
    image: "/images/journals/journal088.png",
    journal: "Materials Science and Engineering A",
    date: "2022.02.17."
  },
  {
    title: "Evolution of nanosized Cu-rich clusters in a Fe–15Cu–15Ni alloy produced by laser powder bed fusion",
    doi: "https://doi.org/10.1016/j.msea.2021.142462",
    image: "/images/journals/journal087.png",
    journal: "Materials Science and Engineering A",
    date: "2022.01.14."
  },
  {
    title: "Effects of laser power on the microstructure evolution and mechanical properties of Ti-6Al-4V alloy manufactured by direct energy deposition",
    doi: "https://doi.org/10.1007/s12540-021-01081-9",
    image: "/images/journals/journal086.png",
    journal: "Metals and Materials International",
    date: "2021.10.01."
  },
  {
    title: "Annealing Effect on the Mechanical Properties of Hot-Rolled Fe55Co17.5Ni10Cr12.5Mo5 High-Entropy Alloy",
    doi: "http://doi.org/10.5228/KSTP.2022.31.5.273",
    image: "/images/journals/journal085.png",
    journal: "Transactions of Materials Processing",
    date: "2022.10.01."
  },
  {
    title: "Metastable δ-ferrite and twinning-induced plasticity on the strain hardening behavior of directed energy deposition-processed 304 L austenitic stainless steel",
    doi: "https://doi.org/10.1016/j.addma.2021.102363",
    image: "/images/journals/journal084.png",
    journal: "Additive Manufacturing",
    date: "2021.11.01."
  },
  {
    title: "Effect of Sn content on microstructure, texture evolution, transformation behavior and superelastic properties of Ti–20Zr–9Nb‒(2–5) Sn (at.%) shape memory alloys",
    doi: "https://doi.org/10.1016/j.msea.2021.141994",
    image: "/images/journals/journal083.png",
    journal: "Materials Science and Engineering A",
    date: "2021.10.19."
  },
  {
    title: "Near atomic-scale comparison of passive film on a 17 wt% Cr-added 18 wt% Mn steel with those on typical austenitic stainless steels.",
    doi: "https://doi.org/10.1016/j.scriptamat.2021.114112",
    image: "/images/journals/journal082.png",
    journal: "Scripta Materialia",
    date: "2021.10.01."
  },
  {
    title: "Effect of interdendritic precipitations on the mechanical properties of GBF or EMS processed Al-Zn-Mg-Cu alloys",
    doi: "https://doi.org/10.3390/cryst11101162",
    image: "/images/journals/journal081.png",
    journal: "Crystals",
    date: "2021.09.24."
  },
  {
    title: "Hydrogen-induced ordering on the deformation mechanism of the as-cast high-Mn steel",
    doi: "https://doi.org/10.1016/j.msea.2021.141923",
    image: "/images/journals/journal080.png",
    journal: "Materials Science and Engineering A",
    date: "2021.09.21."
  },
  {
    title: "Development of 1.2 GPa Ferrite-based Lightweight Steels via Low-temperature Tempering",
    doi: "http://dx.doi.org/10.3365/KJMM.2021.59.10.695",
    image: "/images/journals/journal079.png",
    journal: "Korean Journal of Metals and Materials",
    date: "2021.10.01."
  },
  {
    title: "Enhanced microstructural stability of γ /γ' -strengthened Co-Ti-Mo-based alloys through Al additions",
    doi: "https://doi.org/10.1016/j.actamat.2021.117011",
    image: "/images/journals/journal078.png",
    journal: "Acta Materialia",
    date: "2021.08.01."
  },
  {
    title: "Effects of cell network structure on the strength of additively manufactured stainless steels",
    doi: "https://doi.org/10.1007/s12540-021-00991-y",
    image: "/images/journals/journal077.png",
    journal: "Metals and Materials International",
    date: "2021.03.20."
  },
  {
    title: "Mechanical property enhancement in gradient structured aluminum alloy by ultrasonic nanocrystalline surface modification",
    doi: "https://doi.org/10.1016/j.msea.2021.141101",
    image: "/images/journals/journal076.png",
    journal: "Materials Science and Engineering A",
    date: "2021.04.22."
  },
  {
    title: "Outstanding mechanical properties of ultrafine-grained Al7075 alloys by high-pressure torsion",
    doi: "https://doi.org/10.1016/j.msea.2021.141020",
    image: "/images/journals/journal075.png",
    journal: "Materials Science and Engineering A",
    date: "2021.04.08."
  },
  {
    title: "Hydrogen-doped viscoplastic liquid metal microparticles for stretchable printed metal lines",
    doi: "https://doi.org/10.1038/s41563-020-00863-7",
    image: "/images/journals/journal074.png",
    journal: "Nature Materials",
    date: "2021.01.04."
  },
  {
    title: "Reverse effect of hot isostatic pressing on high-speed selective laser melted Ti–6Al–4V alloy",
    doi: "https://doi.org/10.1016/j.msea.2021.140880",
    image: "/images/journals/journal073.png",
    journal: "Materials Science and Engineering A",
    date: "2021.03.11."
  },
  {
    title: "Three-dimensional imaging of carbon clusters in thermally stable nickel silicides by carbon pre-implantation",
    doi: "https://doi.org/10.1016/j.apsusc.2020.148152",
    image: "/images/journals/journal072.png",
    journal: "Applied Surface Science",
    date: "2021.02.15."
  },
  {
    title: "Uncommon Cr-rich γ′ precipitation during creep at 950 ˚C in Inconel 617 superalloy with serrated grain boundaries through pre-straining",
    doi: "https://doi.org/10.1016/j.msea.2020.140715",
    image: "/images/journals/journal071.png",
    journal: "Materials Science and Engineering A",
    date: "2021.01.28."
  },
  {
    title: "Measurement Method of Prior Austenite Grain Size of Nb-added Fe-based Alloys",
    doi: "https://doi.org/10.4150/KPMI.2021.28.4.317",
    image: "/images/journals/journal070.png",
    journal: "Journal of Powder Materials",
    date: "2021.08.28."
  },
  {
    title: "Additive Manufacturing Optimization of Directed Energy Deposition-Processed Ti-6Al-4V Alloy using Energy Density and Powder Deposition Density",
    doi: "http://dx.doi.org/10.4150/KPMI.2021.28.6.491",
    image: "/images/journals/journal069.png",
    journal: "Journal of Powder Materials",
    date: "2021.11.30."
  },
  {
    title: "On the mechanistic understanding of annealing-induced strength enhancement of ultrafine-grained high-Mn steel",
    doi: "https://doi.org/10.1016/j.mtla.2020.100837",
    image: "/images/journals/journal068.png",
    journal: "Materialia",
    date: "2020.09.01."
  },
  {
    title: "Characterization of Pd and Pd@ Au core-shell nanoparticles using atom probe tomography and field evaporation simulation",
    doi: "https://doi.org/10.1016/j.jallcom.2020.154721",
    image: "/images/journals/journal067.png",
    journal: "Journal of Alloys and Compounds",
    date: "2020.08.05."
  },
  {
    title: "Short-range order strengthening in boron-doped high-entropy alloys",
    doi: "https://doi.org/10.1016/j.actamat.2020.04.052",
    image: "/images/journals/journal066.png",
    journal: "Acta Materialia",
    date: "2020.08.01."
  },
  {
    title: "The mechanism of dynamic strain aging for type A serrations in tensile flow curves of Fe-18Mn-0.55C (wt.%) twinning-induced plasticity steel",
    doi: "https://doi.org/10.1016/j.actamat.2020.02.020",
    image: "/images/journals/journal065.png",
    journal: "Acta Materialia",
    date: "2020.04.15."
  },
  {
    title: "Nano-scale solute heterogeneities in the ultrastrong selectively laser melted carbon-doped CoCrFeMnNi alloy",
    doi: "https://doi.org/10.1016/j.msea.2019.138726",
    image: "/images/journals/journal064.png",
    journal: "Materials Science and Engineering A",
    date: "2020.01.31."
  },
  {
    title: "Strain-rate sensitivity of high-entropy alloys and its significance in deformation",
    doi: "https://doi.org/10.1080/21663831.2019.1668489",
    image: "/images/journals/journal063.png",
    journal: "Materials Research Letters",
    date: "2019.09.25."
  },
  {
    title: "p-Type Conductivity of Hydrated Amorphous V2O5 and Its Enhanced Photocatalytic Performance in ZnO/V2O5/rGO",
    doi: "https://doi.org/10.1021/acsaelm.9b00397",
    image: "/images/journals/journal062.png",
    journal: "ACS Applied Electronic Materials",
    date: "2019.08.12."
  },
  {
    title: "First principles determination of formation of a Cr shell on the interface between Y–Ti–O nanoparticles and a ferritic steel matrix",
    doi: "https://doi.org/10.1016/j.apsusc.2019.03.081",
    image: "/images/journals/journal061.png",
    journal: "Applied Surface Science",
    date: "2019.07.01."
  },
  {
    title: "Interfacial structure and bonding mechanism of AZ31/carbon-fiber-reinforced plastic composites fabricated by thermal laser",
    doi: "https://doi.org/10.1016/j.compositesb.2018.12.002",
    image: "/images/journals/journal060.png",
    journal: "Composites Part B - Engineering",
    date: "2019.06.15."
  },
  {
    title: "Effect of Tempering on the Microstructure and Tensile Properties of a Martensitic Medium-Mn Lightweight Steel",
    doi: "https://doi.org/10.1007/s11661-019-05190-4",
    image: "/images/journals/journal059.png",
    journal: "Metallurgical and Materials Transactions A",
    date: "2019.03.18."
  },
  {
    title: "Correlative transmission electron microscopy and atom probe tomography on field evaporation mechanism of a bulk LaAlO3 oxide",
    doi: "https://doi.org/10.1016/j.apsusc.2019.02.058",
    image: "/images/journals/journal058.png",
    journal: "Applied Surface Science",
    date: "2019.06.15."
  },
  {
    title: "Effects of phase composition and elemental partitioning on soft magnetic properties of AlFeCoCrMn high entropy alloys",
    doi: "https://doi.org/10.1016/j.actamat.2019.04.007",
    image: "/images/journals/journal057.png",
    journal: "Acta Materialia",
    date: "2019.06.01."
  },
  {
    title: "On the microstructural evolution and partitioning behavior of L12-structured γ′-based Co-Ti-W alloys upon Cr and Al alloying",
    doi: "https://doi.org/10.1016/j.intermet.2018.10.027",
    image: "/images/journals/journal056.png",
    journal: "Intermetallics",
    date: "2019.01.01."
  },
  {
    title: "Exceptional phase-transformation strengthening of ferrous medium-entropy alloys at cryogenic temperatures",
    doi: "https://doi.org/10.1016/j.actamat.2018.09.057",
    image: "/images/journals/journal055.png",
    journal: "Acta Materialia",
    date: "2018.12.01."
  },
  {
    title: "Direct Three-Dimensional Observation of Core/Shell Structured Quantum Dots with a Composition Competitive Gradient",
    doi: "https://doi.org/10.1021/acsnano.8b05379",
    image: "/images/journals/journal054.png",
    journal: "ACS Nano",
    date: "2018.11.26."
  },
  {
    title: "Competitive grain boundary segregation of phosphorus and carbon governs delamination crack in a ferritic steel",
    doi: "https://doi.org/10.1016/j.matchar.2018.08.060",
    image: "/images/journals/journal053.png",
    journal: "Materials Characterization",
    date: "2018.11.01."
  },
  {
    title: "Superior strength and multiple strengthening mechanisms in nanocrystalline TWIP steel",
    doi: "https://doi.org/10.1038/s41598-018-29632-y",
    image: "/images/journals/journal052.png",
    journal: "Scientific Reports",
    date: "2018.07.25."
  },
  {
    title: "Enhanced chemical stability of Ag nanowires by slight surface modification with Pd",
    doi: "https://doi.org/10.1002/admi.201800250",
    image: "/images/journals/journal051.png",
    journal: "Advanced Materials Interfaces",
    date: "2018.05.04."
  },
  {
    title: "A new method for mapping the three-dimensional atomic distribution within nanoparticles by atom probe tomography (APT)",
    doi: "https://doi.org/10.1016/j.ultramic.2018.04.005",
    image: "/images/journals/journal050.png",
    journal: "Ultramicroscopy",
    date: "2018.07.01."
  },
  {
    title: "Influences of interstitial and extrusion temperature on grain boundary segregation, Y-Ti-O nanofeatures, and mechanical properties of ferritic steels",
    doi: "https://doi.org/10.1016/j.actamat.2018.04.046",
    image: "/images/journals/journal049.png",
    journal: "Acta Materialia",
    date: "2018.07.01."
  },
  {
    title: "Boron doped ultrastrong and ductile high-entropy alloys.",
    doi: "https://doi.org/10.1016/j.actamat.2018.04.004",
    image: "/images/journals/journal048.png",
    journal: "Acta Materialia",
    date: "2018.06.01."
  },
  {
    title: "Isothermal Treatment Effects on Precipitates and Tensile Properties of an HSLA Steel",
    doi: "https://doi.org/10.1007/s12540-018-0041-7",
    image: "/images/journals/journal047.png",
    journal: "Metals and Materials International",
    date: "2018.03.21."
  },
  {
    title: "Observation of anisotropic growth and compositional discontinuity in AlGaN electron-blocking layers on GaN microrods",
    doi: "https://doi.org/10.1021/acs.cgd.7b01554",
    image: "/images/journals/journal046.png",
    journal: "Crystal Growth & Design",
    date: "2018.01.31."
  },
  {
    title: "A new observation of strain-induced grain boundary serration and its underlying mechanism in a Ni-20Cr binary model alloy",
    doi: "https://doi.org/10.1016/j.matchar.2017.11.047",
    image: "/images/journals/journal045.png",
    journal: "Materials Characterization",
    date: "2018.01.01."
  },
  {
    title: "A brief review of κ-carbide in Fe-Mn-Al-C model alloys",
    doi: "http://doi.org/10.9729/AM.2018.48.4.117",
    image: "/images/journals/journal044.png",
    journal: "Applied Microscopy",
    date: "2018.12.28."
  },
  {
    title: "Tribological properties of HVOF-spayed WC-Co coatings deposited from Ni-plated powders at elevated temperatures",
    doi: "https://doi.org/10.1016/j.surfcoat.2017.08.026",
    image: "/images/journals/journal043.png",
    journal: "Surface and Coatings Technology",
    date: "2017.10.25."
  },
  {
    title: "Nanometer-scale phase transformation determines threshold and memory switching mechanism",
    doi: "https://doi.org/10.1002/adma.201701752",
    image: "/images/journals/journal042.png",
    journal: "Advanced Materials",
    date: "2017.06.12."
  },
  {
    title: "Microstructure-property relations in WC-Co coatings sprayed from combinatorial Ni-plated and nanostructured powders",
    doi: "https://doi.org/10.1016/j.matchar.2017.05.005",
    image: "/images/journals/journal041.png",
    journal: "Materials Characterization",
    date: "2017.07.01."
  },
  {
    title: "Deformation rate controls atomic-scale dynamic strain aging and phase transformation in high Mn TRIP steels",
    doi: "https://doi.org/10.1016/j.actamat.2017.03.076",
    image: "/images/journals/journal040.png",
    journal: "Acta Materialia",
    date: "2017.06.01."
  },
  {
    title: "Correlation of Controllable Aggregation with Light-Emitting Property in Polymer Blend Optoelectronic Devices",
    doi: "https://doi.org/10.1002/smll.201602874",
    image: "/images/journals/journal039.png",
    journal: "Small",
    date: "2017.02.03."
  },
  {
    title: "Understanding of Capping Effects on the Tip Shape Evolution and on the Atom Probe Data of Bulk LaAlO3 Using Transmission Electron Microscopy",
    doi: "https://doi.org/10.1017/S1431927617000149",
    image: "/images/journals/journal038.png",
    journal: "Microscopy and Microanalysis",
    date: "2017.02.20."
  },
  {
    title: "Amorphous Phase Separation in an Fe-based Bulk Metallic Glass",
    doi: "https://doi.org/10.1016/j.matlet.2017.01.012",
    image: "/images/journals/journal037.png",
    journal: "Materials Letters",
    date: "2017.03.01."
  },
  {
    title: "Laser-assisted atom probe tomography of four paired poly-Si/SiO2 multiple-stacks with each thickness of 10 nm",
    doi: "https://doi.org/10.1016/j.apsusc.2016.10.182",
    image: "/images/journals/journal036.png",
    journal: "Applied Surface Science",
    date: "2017.02.28."
  },
  {
    title: "Core-shell nanoparticle arrays double the strength of steel",
    doi: "https://doi.org/10.1038/srep42547",
    image: "/images/journals/journal035.png",
    journal: "Scientific Reports",
    date: "2017.02.22."
  },
  {
    title: "A Correlative Approach for Identifying Complex Phases by Electron Backscatter Diffraction and Transmission Electron Microscopy",
    doi: "https://doi.org/10.9729/AM.2017.47.1.43",
    image: "/images/journals/journal034.png",
    journal: "Applied Microscopy",
    date: "2017.03.30."
  },
  {
    title: "Influence of Solid Solution Treatment on the Mechanical Properties of A286 Stainless Steels",
    doi: "https://doi.org/10.1166/sam.2016.2849",
    image: "/images/journals/journal033.png",
    journal: "Science of Advanced Materials",
    date: "2016.12.01."
  },
  {
    title: "Atomic-scale quantification of interdiffusion and dopant localization in GeSbTe-based memory devices",
    doi: "https://doi.org/10.1063/1.4962807",
    image: "/images/journals/journal032.png",
    journal: "Applied Physics Letters",
    date: "2016.09.12."
  },
  {
    title: "DirectIn situObservation of Tempering-induced Austenite Decomposition and Atom Probe Analyses ofk-Carbide Precipitates in Lightweight Fe-Mn-Al-C Steels",
    doi: "https://doi.org/10.1017/S1431927616004372",
    image: "/images/journals/journal031.png",
    journal: "Microscopy and Microanalysis",
    date: "2016.07.25."
  },
  {
    title: "Influence of Laser-Pulse Energy on Field Evaporation of LaAlO3in Atom Probe Tomography Analysis",
    doi: "https://doi.org/10.1017/S1431927616008862",
    image: "/images/journals/journal030.png",
    journal: "Microscopy and Microanalysis",
    date: "2016.07.25."
  },
  {
    title: "Grain Boundary Segregation and Core/Shell Structured Nanofeatures in Oxide-Dispersion Strengthened Fe-Cr Alloys",
    doi: "https://doi.org/10.1017/S1431927616004220",
    image: "/images/journals/journal029.png",
    journal: "Microscopy and Microanalysis",
    date: "2016.07.25."
  },
  {
    title: "Understanding of the field evaporation of surface modified oxide materials through transmission electron microscopy and atom probe tomography",
    doi: "https://doi.org/10.1016/j.apsusc.2016.01.196",
    image: "/images/journals/journal028.png",
    journal: "Applied Surface Science",
    date: "2016.04.15."
  },
  {
    title: "Three-Dimensional Indium Distribution in Electron-Beam Irradiated Multiple Quantum Wells of Blue-Emitting InGaN/GaN Devices",
    doi: "https://doi.org/10.1063/1.4943656",
    image: "/images/journals/journal027.png",
    journal: "Applied Physics Letters",
    date: "2016.03.14."
  },
  {
    title: "Effect of Combination Milling on the Microstructure and Mechanical Properties of Ferritic Oxide Dispersion-Strengthened Steels",
    doi: "http://dx.doi.org/10.3365/KJMM.2016.54.3.171",
    image: "/images/journals/journal026.png",
    journal: "Korean Journal of Metals and Materials",
    date: "2016.03.01."
  },
  {
    title: "Combined atom probe tomography and density functional theory investigation of the Al offstoichiometry of k-carbides in an austenitic Fe-Mn-Al-C low density steel",
    doi: "https://doi.org/10.1016/j.actamat.2016.01.007",
    image: "/images/journals/journal025.png",
    journal: "Acta Materialia",
    date: "2016.03.01."
  },
  {
    title: "A Brief Comment on Atom Probe Tomography Applications",
    doi: "http://dx.doi.org/10.9729/AM.2016.46.3.127",
    image: "/images/journals/journal024.png",
    journal: "Applied Microscopy",
    date: "2016.09.30."
  },
  {
    title: "Novel approach for observing the asymmetrical evolution and the compositional nonuniformity of laser pulsed atom probe tomography of a single ZnO nanowire",
    doi: "https://doi.org/10.1007/s12540-015-5360-3",
    image: "/images/journals/journal023.png",
    journal: "Metals and Materials International",
    date: "2016.01.04."
  },
  {
    title: "Small angle neutron scattering analyses and high temperature mechanical properties of nano-structured oxide dispersion strengthened steels produced via cryomilling",
    doi: "https://doi.org/10.1016/j.jallcom.2015.08.100",
    image: "/images/journals/journal022.png",
    journal: "Journal of Alloys and Compounds",
    date: "2015.12.05."
  },
  {
    title: "Atomically resolved cementite dissolution governed by the strain state in pearlite steel wires",
    doi: "https://doi.org/10.1016/j.scriptamat.2015.07.004",
    image: "/images/journals/journal021.png",
    journal: "Scripta Materialia",
    date: "2015.11.01."
  },
  {
    title: "Self-relaxed conductive filament in ReRAM analyzed by in-situ TEM and Atom Probe Tomography",
    doi: "https://doi.org/10.1093/jmicro/dfv094",
    image: "/images/journals/journal020.png",
    journal: "Microscopy",
    date: "2015.11.01."
  },
  {
    title: "In-situ observation of temperature dependent nanomorphology-performance relations in emitting layer of OLEDs by TEM",
    doi: "https://doi.org/10.1093/jmicro/dfv111",
    image: "/images/journals/journal019.png",
    journal: "Microscopy",
    date: "2015.10.30."
  },
  {
    title: "Understanding of off-stoichiometry of Nano-sized Carbides in Fe-Mn-Al-C Low-Density Steels using Transmission Electron Microscopy, Atom Probe Tomography, and Density Functional Theory",
    doi: "https://doi.org/10.1093/jmicro/dfv257",
    image: "/images/journals/journal018.png",
    journal: "Microscopy",
    date: "2015.10.30."
  },
  {
    title: "Study of the decomposition behavior of retained austenite and the partitioning of alloying elements during tempering in CMnSiAl TRIP steels",
    doi: "https://doi.org/10.1016/j.matdes.2015.05.059",
    image: "/images/journals/journal017.png",
    journal: "Materials & Design",
    date: "2015.10.05."
  },
  {
    title: "Nano-scale observation on the transformation behavior and mechanical stability of individual retained austenite in CMnSiAl TRIP Steels",
    doi: "https://doi.org/10.1016/j.msea.2015.01.005",
    image: "/images/journals/journal016.png",
    journal: "Materials Science and Engineering A",
    date: "2015.03.11."
  },
  {
    title: "Temperature-dependent nanomorphology-performance relations in binary iridium complex blend films for OLED",
    doi: "https://doi.org/10.1039/C5CP03436A",
    image: "/images/journals/journal015.png",
    journal: "Physical Chemistry Chemical Physics",
    date: "2015.07.17."
  },
  {
    title: "Alloy Design, Combinatorial Synthesis, and Microstructure–Property Relations for Low-Density Fe-Mn-Al-C Austenitic Steels",
    doi: "https://doi.org/10.1007/s11837-014-1032-x",
    image: "/images/journals/journal014.png",
    journal: "JOM",
    date: "2014.06.24."
  },
  {
    title: "Application of NiMoNb adhesion layer on plasma-treated polyimide substrate for flexible electronic devices",
    doi: "https://doi.org/10.1016/j.tsf.2014.02.085",
    image: "/images/journals/journal013.png",
    journal: "Thin Solid Films",
    date: "2014.05.02."
  },
  {
    title: "Combined nano-SIMS/AFM/EBSD analysis and atom probe tomography, of carbon distribution in austenite/ε-martensite high-Mn steels",
    doi: "https://doi.org/10.1016/j.ultramic.2013.01.009",
    image: "/images/journals/journal012.png",
    journal: "Ultramicroscopy",
    date: "2013.09.01."
  },
  {
    title: "Three-dimensional characterization of bainitic microstructures in low-carbon high-strength low-alloy steel studied by electron backscatter diffraction",
    doi: "https://doi.org/10.1016/j.matchar.2013.02.009",
    image: "/images/journals/journal011.png",
    journal: "Materials Characterization",
    date: "2013.05.01."
  },
  {
    title: "Direct evidence for the formation of ordered carbides in a ferrite-based low-density Fe–Mn–Al–C alloy studied by transmission electron microscopy and atom probe tomography",
    doi: "https://doi.org/10.1016/j.scriptamat.2012.08.013",
    image: "/images/journals/journal010.png",
    journal: "Scripta Materialia",
    date: "2013.03.01."
  },
  {
    title: "Influence of carbon content on the microstructure, martensitic transformation and mechanical properties in austenite/ε-martensite dual-phase Fe–Mn–C steels",
    doi: "https://doi.org/10.1016/j.actamat.2012.09.078",
    image: "/images/journals/journal009.png",
    journal: "Acta Materialia",
    date: "2013.01.01."
  },
  {
    title: "Atomic scale effects of alloying, partitioning, solute drag and austempering on the mechanical properties of high-carbon bainitic– austenitic TRIP steels",
    doi: "https://doi.org/10.1016/j.actamat.2012.07.064",
    image: "/images/journals/journal008.png",
    journal: "Acta Materialia",
    date: "2012.10.17."
  },
  {
    title: "Microscopic analysis of Fe–Cr alloy produced by single roll strip casting",
    doi: "https://doi.org/10.1179/026708310X12738371693058",
    image: "/images/journals/journal007.png",
    journal: "Materials Science and Technology",
    date: "2013.11.12."
  },
  {
    title: "Atom probe tomography and nano secondary ion mass spectroscopy investigation of the segregation of boron at austenite grain boundaries in 0.5 wt.% carbon steels",
    doi: "https://doi.org/10.1007/s12540-011-0617-y",
    image: "/images/journals/journal006.png",
    journal: "Metals and Materials International",
    date: "2011.06.29."
  },
  {
    title: "Formation of NiO nanowires on the surface of nickel strips",
    doi: "https://doi.org/10.1016/j.jallcom.2010.05.180",
    image: "/images/journals/journal005.png",
    journal: "Journal of Alloys and Compounds",
    date: "2010.08.27."
  },
  {
    title: "Atomic scale investigation on the distribution of boron in medium carbon steels by atom probe tomography and EELS",
    doi: "https://doi.org/10.1016/j.ultramic.2009.12.006",
    image: "/images/journals/journal004.png",
    journal: "Ultramicroscopy",
    date: "2010.06.01."
  },
  {
    title: "Effect of the rolling speed on microstructural and mechanical properties of aluminum–magnesium alloys prepared by twin roll casting",
    doi: "https://doi.org/10.1016/j.matdes.2009.08.032",
    image: "/images/journals/journal003.png",
    journal: "Materials & Design",
    date: "2010.03.01."
  },
  {
    title: "Structure and mechanical properties of Ni–Cr alloy produced by single roll strip casting",
    doi: "https://doi.org/10.1016/j.matdes.2009.07.006",
    image: "/images/journals/journal002.png",
    journal: "Materials & Design",
    date: "2010.01.01."
  },
  {
    title: "2-D & 3-D Observations on the Microstructure of Super Bainite TRIP Steels using Total Analysis System",
    doi: "http://dx.doi.org/10.5228/KSPP.2010.19.1.044",
    image: "/images/journals/journal001.png",
    journal: "Transactions of Materials Processing",
    date: "2010.02.01."
  }


];

const resolveImageSource = (entry: JournalEntry) =>
  coverForJournalName(entry.journal) || entry.image || ASSETS.JOURNALS.DEFAULT_COVER;

const buildImage = (image: string) =>
  /^https?:\/\//i.test(image) ? image : assetPath(image);

export const journalData: JournalPaper[] = JOURNAL_ENTRIES.map((entry) => ({
  ...entry,
  image: buildImage(resolveImageSource(entry)),
}));
