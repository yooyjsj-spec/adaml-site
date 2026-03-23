
import React from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { Mail, GraduationCap, MapPin, Phone, Building2, Cpu, Wrench, Microscope } from 'lucide-react';
import { MetallicBackground } from '../components/MetallicBackground';
import { ASSETS } from '../data/assets';

interface GraduateStudent {
  name: string;
  email: string;
  research: string;
  equipment: string[];
  image: string;
}

interface UndergradStudent {
  name: string;
  email: string;
  research: string;
  image: string;
}

export const People: React.FC = () => {
  const peopleImage = (filename: string) => `${import.meta.env.BASE_URL}images/people/${filename}`;

  const phdStudents: GraduateStudent[] = [
    { 
      name: "Chohyun Lee", 
      email: "cho0410@kookmin.ac.kr", 
      research: "금속 적층제조",
      equipment: ["TEM", "APT"],
      image: peopleImage("Chohyun.jpg")
    },
    { 
      name: "Wonhui Jo", 
      email: "jwonh0104@kookmin.ac.kr", 
      research: "금속 적층제조 및 미세조직 분석",
      equipment: ["TEM", "APT"],
      image: peopleImage("Wonhui.jpg")
    },
  ];
  const mastersStudents: GraduateStudent[] = [
    
    { 
      name: "Jeongung Park", 
      email: "wjddnd636@kookmin.ac.kr", 
      research: "철강소재 적층제조 및 미세조직 분석",
      equipment: ["TEM"],
      image: peopleImage("Jeongung.jpg")
    },
    { 
      name: "Minyoung Lee", 
      email: "5368min@kookmin.ac.kr", 
      research: "중망간강 DED 적층",
      equipment: ["SEM"],
      image: peopleImage("Minyoung.jpg")
    },
    { 
      name: "Minyu Kang", 
      email: "kminyu@kookmin.ac.kr", 
      research: "제진합금 미세조직 분석",
      equipment: ["SEM"],
      image: peopleImage("Minyu.jpg")
    },
    { 
      name: "Seonghyeon Yang", 
      email: "sorntmf@kookmin.ac.kr", 
      research: "철강소재 미세조직 분석",
      equipment: ["SEM"],
      image: peopleImage("Seonghyeon.png")
    },
    { 
      name: "Seunggyu Hong", 
      email: "hongsg4665@kookmin.ac.kr", 
      research: "니켈 초내열합금 미세조직 분석",
      equipment: ["SEM", "Optical Microscope"],
      image: peopleImage("Seunggyu.jpg")
    },
    { 
      name: "Hyunyoung Park", 
      email: "jury1390@kookmin.ac.kr", 
      research: "주조용 Al 및 Ni 합금 미세조직 분석",
      equipment: ["APT"],
      image: peopleImage("Hyunyoung.jpg")
    },
  ];

  const undergradStudents: UndergradStudent[] = [
    { name: "Dawon Kang", email: "dawon1242@kookmin.ac.kr", research: "Material Synthesis", image: peopleImage("Dawon.jpg") },
    { name: "Hyungjin Park", email: "chemilk02@kookmin.ac.kr", research: "Sample Prep", image: peopleImage("Hyungjin.jpg") },
    { name: "Youngjae Yoo", email: "yooyjsj@kookmin.ac.kr", research: "Simulation Support", image: peopleImage("Youngjae.jpg") },
    { name: "Bogeun Park", email: "qkrqhrms9@kookmin.ac.kr", research: "Literature Review", image: peopleImage("Bogeun.jpg") },
    { name: "Sihyun Park", email: "sihyun00@kookmin.ac.kr", research: "Literature Review", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop" },
  ];

  return (
    <Layout>
      {/* Professor Section */}
      <section className="relative w-full py-20 overflow-hidden">
        <MetallicBackground />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-white/40"
          >
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="w-full lg:w-1/3 flex flex-col items-center text-center">
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg mb-6 border-4 border-white group">
                  <img 
                    src={ASSETS.PEOPLE.PROFESSOR}
                    alt="Prof. Jae Bok-Seol" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Jae Bok Seol</h2>
                <span className="text-primary-700 font-bold uppercase tracking-widest text-sm mb-4">Associate Professor</span>
                
                <div className="w-full space-y-3 text-left bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <Building2 className="w-4 h-4 mt-1 shrink-0 text-primary-600" />
                    <span>Office 431, Engineering Building<br/>Kookmin University</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="w-4 h-4 shrink-0 text-primary-600" />
                    <span>+82-2-910-5014</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="w-4 h-4 shrink-0 text-primary-600" />
                    <a href="mailto:jb.seol@kookmin.ac.kr" className="hover:text-primary-700 transition-colors">jb.seol@kookmin.ac.kr</a>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-2/3 space-y-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 border-b-2 border-primary-200 pb-2 mb-6 flex items-center gap-2">
                    <GraduationCap className="text-primary-600" /> Education
                  </h3>
                  <div className="space-y-6 pl-4 border-l-2 border-slate-200 ml-2">
                    {[
                      { year: "2007 – 2011", degree: "Ph.D. in Materials Science and Engineering", loc: "POSTECH, Pohang" },
                      { year: "2004 – 2006", degree: "M.S. in Materials Science and Engineering", loc: "POSTECH, Pohang" },
                      { year: "1997 – 2004", degree: "B.S. in Materials Science and Engineering", loc: "Korea University, Seoul" }
                    ].map((edu, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></div>
                        <span className="text-sm font-bold text-primary-700 block mb-1">{edu.year}</span>
                        <h4 className="text-lg font-semibold text-slate-900">{edu.degree}</h4>
                        <p className="text-slate-500">{edu.loc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-800 border-b-2 border-primary-200 pb-2 mb-6 flex items-center gap-2">
                    <Building2 className="text-primary-600" /> Professional Experience
                  </h3>
                  <div className="space-y-6 pl-4 border-l-2 border-slate-200 ml-2">
                    {[
                      { year: "2024 – Present", role: "Associate Professor (Head of ADAM Lab)", loc: "School of Materials Science & Engineering, Kookmin University (KMU)" },
                      { year: "2011 – 2013", role: "Postdoctoral Fellow", loc: "Max Planck Institute for Iron Research (MPIE), Germany" }
                    ].map((exp, i) => (
                      <div key={i} className="relative pl-6">
                         <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-slate-400 rounded-full border-2 border-white"></div>
                        <span className="text-sm font-bold text-slate-500 block mb-1">{exp.year}</span>
                        <h4 className="text-lg font-semibold text-slate-900">{exp.role}</h4>
                        <p className="text-slate-600">{exp.loc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Graduate Students Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 relative inline-block">
              Graduate Students
              <span className="absolute -bottom-3 left-0 w-full h-1.5 bg-primary-500 rounded-full"></span>
            </h2>
            <p className="text-slate-500 mt-6 max-w-2xl mx-auto">
              Ph.D. and M.S. students leading advanced research in superalloys, additive manufacturing, and AI-driven materials analysis.
            </p>
          </div>

          {/* Ph.D. Students */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Ph.D. Students</h3>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {phdStudents.map((student, idx) => (
                <motion.div
                  key={`phd-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-lg border border-slate-100 transition-all duration-300 group flex flex-row h-40 md:h-44"
                >
                  <div className="w-32 md:w-36 shrink-0 relative overflow-hidden">
                    <img 
                      src={student.image} 
                      alt={student.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-center min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-0.5 truncate">{student.name}</h3>
                    <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block"></span>
                      Ph.D. Student
                    </div>
                    
                    <div className="space-y-1 mb-2">
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Cpu size={12} className="text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{student.research}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-1">
                        {student.equipment.slice(0, 2).map((eq, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-200 truncate max-w-[120px]">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-slate-50">
                      <a
                        href={`mailto:${student.email}`}
                        className="text-xs text-slate-400 hover:text-purple-600 flex items-center gap-1.5 transition-colors group-hover:text-purple-600"
                      >
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* M.S. Students */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-2xl font-bold text-slate-900">M.S. Students</h3>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mastersStudents.map((student, idx) => (
                <motion.div
                  key={`ms-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-lg border border-slate-100 transition-all duration-300 group flex flex-row h-40 md:h-44"
                >
                  <div className="w-32 md:w-36 shrink-0 relative overflow-hidden">
                    <img 
                      src={student.image} 
                      alt={student.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-center min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-0.5 truncate">{student.name}</h3>
                    <div className="text-[10px] font-bold text-primary-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 inline-block"></span>
                      M.S. Student
                    </div>
                    
                    <div className="space-y-1 mb-2">
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Cpu size={12} className="text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{student.research}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-1">
                        {student.equipment.slice(0, 2).map((eq, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-200 truncate max-w-[120px]">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-slate-50">
                      <a
                        href={`mailto:${student.email}`}
                        className="text-xs text-slate-400 hover:text-primary-600 flex items-center gap-1.5 transition-colors group-hover:text-primary-600"
                      >
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Undergraduate Researchers Section */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-slate-900 relative inline-block">
              Undergraduate Researchers
              <span className="absolute -bottom-3 left-0 w-full h-1 bg-slate-300 rounded-full"></span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {undergradStudents.map((student, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-lg border border-slate-100 transition-all duration-300 group flex flex-row h-32 md:h-36"
              >
                {/* Image Section (Left) */}
                <div className="w-28 shrink-0 relative overflow-hidden">
                  <img src={student.image} alt={student.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Content Section (Right) */}
                <div className="p-4 flex-grow flex flex-col justify-center min-w-0">
                  <h3 className="text-base font-bold text-slate-900 mb-0.5 truncate">{student.name}</h3>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-2">Undergrad Researcher</div>
                  <div className="text-xs text-slate-600 italic mb-2 truncate">
                    "{student.research}"
                  </div>
                  <div className="mt-auto">
                    <a href={`mailto:${student.email}`} className="text-xs text-slate-400 hover:text-primary-600 flex items-center gap-1.5 transition-colors">
                      <Mail size={12} className="shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Alumni Section */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center py-16 bg-slate-100/50 rounded-[40px] border border-dashed border-slate-200">
           <div className="p-4 bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Microscope className="text-slate-300" size={32} />
           </div>
           <h2 className="text-2xl font-serif font-bold text-slate-400 mb-2">Alumni</h2>
           <p className="text-slate-400 text-sm max-w-md mx-auto">We are currently building our alumni network. Check back soon for updates on our past members' journeys.</p>
        </motion.div>

      </div>
    </Layout>
  );
};
