import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { Mail, GraduationCap, Phone, Building2, Cpu, Microscope } from 'lucide-react';
import { MetallicBackground } from '../components/MetallicBackground';
import { ASSETS } from '../data/assets';
import { getPeople } from '../api/content';
import { Person, PersonRole } from '../types';
import { AdminActions, AdminAddButton, confirmDelete } from '../components/admin/AdminControls';
import { PersonEditorDraft, PersonEditorModal } from '../components/admin/PersonEditorModal';
import { adminPeople } from '../api/admin';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { LAB_NAME } from '../config/lab';
import { useI18n } from '../i18n';

const peopleImage = (filename: string) => `${import.meta.env.BASE_URL}images/people/${filename}`;

const fallbackEducation = [
  { year: '2007 – 2011', degree: 'Ph.D. in Materials Science and Engineering', loc: 'POSTECH, Pohang' },
  { year: '2004 – 2006', degree: 'M.S. in Materials Science and Engineering', loc: 'POSTECH, Pohang' },
  { year: '1997 – 2004', degree: 'B.S. in Materials Science and Engineering', loc: 'Korea University, Seoul' },
];

const fallbackExperience = [
  { year: '2026.09 – Present', role: `Professor (Head of ${LAB_NAME})`, loc: 'Graduate Institute of Ferrous & Eco Materials Technology (GIFT), POSTECH', current: true },
  { year: '2024 – 2026.08', role: 'Associate Professor (Head of ADAML)', loc: 'School of Materials Science & Engineering, Kookmin University (KMU)' },
  { year: '2011 – 2013', role: 'Postdoctoral Fellow', loc: 'Max Planck Institute for Iron Research (MPIE), Germany' },
];

const emptyMember = (role: PersonRole): Person => ({
  id: '',
  name: '',
  role,
  equipment: [],
  sortOrder: 0,
});

type MemberAccent = 'phd' | 'ms' | 'postPhd' | 'postMs' | 'postBs' | 'ug';

const memberAccentClass: Record<MemberAccent, { text: string; dot: string }> = {
  phd: { text: 'text-primary-700', dot: 'bg-primary-600' },
  ms: { text: 'text-gold-700', dot: 'bg-gold-500' },
  postPhd: { text: 'text-violet-700', dot: 'bg-violet-600' },
  postMs: { text: 'text-amber-700', dot: 'bg-amber-500' },
  postBs: { text: 'text-teal-700', dot: 'bg-teal-600' },
  ug: { text: 'text-slate-500', dot: 'bg-slate-400' },
};

const fallbackPeople: Person[] = [
  { id: '', name: 'Chohyun Lee', email: 'cho0410@kookmin.ac.kr', role: 'PHD', research: '금속 적층제조', equipment: ['TEM', 'APT'], image: peopleImage('Chohyun.jpg') },
  { id: '', name: 'Wonhui Jo', email: 'jwonh0104@kookmin.ac.kr', role: 'PHD', research: '금속 적층제조 및 미세조직 분석', equipment: ['TEM', 'APT'], image: peopleImage('Wonhui.jpg') },
  { id: '', name: 'Jeongung Park', email: 'wjddnd636@kookmin.ac.kr', role: 'MASTERS', research: '철강소재 적층제조 및 미세조직 분석', equipment: ['TEM'], image: peopleImage('Jeongung.jpg') },
  { id: '', name: 'Minyoung Lee', email: '5368min@kookmin.ac.kr', role: 'MASTERS', research: '중망간강 DED 적층', equipment: ['SEM'], image: peopleImage('Minyoung.jpg') },
  { id: '', name: 'Minyu Kang', email: 'kminyu@kookmin.ac.kr', role: 'MASTERS', research: '제진합금 미세조직 분석', equipment: ['SEM'], image: peopleImage('Minyu.jpg') },
  { id: '', name: 'Seonghyeon Yang', email: 'sorntmf@kookmin.ac.kr', role: 'MASTERS', research: '철강소재 미세조직 분석', equipment: ['SEM'], image: peopleImage('Seonghyeon.png') },
  { id: '', name: 'Seunggyu Hong', email: 'hongsg4665@kookmin.ac.kr', role: 'MASTERS', research: '니켈 초내열합금 미세조직 분석', equipment: ['SEM', 'Optical Microscope'], image: peopleImage('Seunggyu.jpg') },
  { id: '', name: 'Hyunyoung Park', email: 'jury1390@kookmin.ac.kr', role: 'MASTERS', research: '주조용 Al 및 Ni 합금 미세조직 분석', equipment: ['APT'], image: peopleImage('Hyunyoung.jpg') },
  { id: '', name: 'Dawon Kang', email: 'dawon1242@kookmin.ac.kr', role: 'UNDERGRAD', research: 'Ti-6AI-4V Microstructure Analysis, EBSD', image: peopleImage('Dawon.jpg') },
  { id: '', name: 'Hyeongjin Park', email: 'chemilk02@kookmin.ac.kr', role: 'UNDERGRAD', research: 'EBSD, Sample Prep', image: peopleImage('Hyeongjin.jpg') },
  { id: '', name: 'Youngjae Yoo', email: 'yooyjsj@kookmin.ac.kr', role: 'UNDERGRAD', research: 'Simulation Support', image: peopleImage('Youngjae.jpg') },
  { id: '', name: 'Bogeun Park', email: 'qkrqhrms9@kookmin.ac.kr', role: 'UNDERGRAD', research: 'Literature Review', image: peopleImage('Bogeun.jpg') },
  { id: '', name: 'Sihyun Park', email: 'sihyun00@kookmin.ac.kr', role: 'UNDERGRAD', research: 'Literature Review', image: peopleImage('Sihyun.jpg') },
];

export const People: React.FC = () => {
  const { m } = useI18n();
  const { isAdmin } = useAdminAuth();
  const [people, setPeople] = useState<Person[]>(fallbackPeople);
  const [editor, setEditor] = useState<{ mode: 'professor' | 'student'; person?: Person; role?: PersonRole } | null>(null);

  const load = async () => {
    try {
      const data = await getPeople();
      if (data.length) setPeople(data);
    } catch {
      setPeople(fallbackPeople);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => ({
    professor: people.find((person) => person.role === 'PROFESSOR'),
    phd: people.filter((person) => person.role === 'PHD'),
    masters: people.filter((person) => person.role === 'MASTERS'),
    postPhd: people.filter((person) => person.role === 'POST_PHD'),
    postMs: people.filter((person) => person.role === 'POST_MS'),
    postBs: people.filter((person) => person.role === 'POST_BS'),
    undergrads: people.filter((person) => person.role === 'UNDERGRAD'),
    alumni: people.filter((person) => person.role === 'ALUMNI'),
  }), [people]);

  const savePerson = async (values: PersonEditorDraft) => {
    const role = editor?.mode === 'professor'
      ? 'PROFESSOR'
      : (values.role || editor?.person?.role || editor?.role || 'UNDERGRAD');
    const payload = {
      name: values.name,
      email: values.email || null,
      role,
      title: values.title || null,
      affiliation: values.affiliation || null,
      location: values.location || null,
      phone: values.phone || null,
      research: values.research || null,
      equipment: values.equipment,
      image: values.image || null,
      education: editor?.mode === 'professor'
        ? values.education.map(({ year, degree, loc }) => ({ year, degree, loc }))
        : [],
      experience: editor?.mode === 'professor'
        ? values.experience.map(({ year, role: expRole, loc }) => ({ year, role: expRole, loc }))
        : [],
      visible: true,
      sortOrder: Number(values.sortOrder || 0),
    };
    if (editor?.person?.id) await adminPeople.update(editor.person.id, payload);
    else await adminPeople.create(payload);
    await load();
  };

  const removePerson = async (person: Person) => {
    if (!person.id || !confirmDelete(person.name)) return;
    await adminPeople.remove(person.id);
    await load();
  };

  const professor = grouped.professor;
  const education = (professor?.education?.length ? professor.education : fallbackEducation) as Array<Record<string, unknown>>;
  const experience = (professor?.experience?.length ? professor.experience : fallbackExperience) as Array<Record<string, unknown>>;

  const roleLabel = (role: Person['role']) => {
    switch (role) {
      case 'PHD': return m.people.phdStudent;
      case 'MASTERS': return m.people.msStudent;
      case 'POST_PHD': return m.people.postPhdResearcher;
      case 'POST_MS': return m.people.postMsResearcher;
      case 'POST_BS': return m.people.postBsResearcher;
      case 'UNDERGRAD': return m.people.undergradResearcher;
      case 'ALUMNI': return m.people.alumni;
      default: return String(role);
    }
  };

  const memberCard = (person: Person, accent: MemberAccent) => (
    <motion.div
      key={person.id || person.name}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-lg border border-slate-100 transition-all duration-300 group flex flex-row h-40 md:h-44"
    >
      {person.id && (
        <AdminActions
          onEdit={() => setEditor({ mode: 'student', person })}
          onDelete={() => removePerson(person)}
        />
      )}
      <div className="w-32 md:w-36 shrink-0 relative overflow-hidden">
        <img src={person.image || ASSETS.PEOPLE.STUDENT_PLACEHOLDER} alt={person.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      <div className="p-4 flex-grow flex flex-col justify-center min-w-0">
        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-0.5 truncate">{person.name}</h3>
        <div className={`text-[10px] font-bold uppercase tracking-wide mb-2 flex items-center gap-1 ${memberAccentClass[accent].text}`}>
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${memberAccentClass[accent].dot}`}></span>
          {roleLabel(person.role)}
        </div>
        <div className="text-xs text-slate-600 flex items-center gap-1.5 mb-2">
          <Cpu size={12} className="text-slate-400 shrink-0" />
          <span className="font-medium truncate">{person.research}</span>
        </div>
        {!!person.equipment?.length && (
          <div className="flex flex-wrap gap-1">
            {person.equipment.slice(0, 2).map((eq) => (
              <span key={eq} className="text-[9px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-200">{eq}</span>
            ))}
          </div>
        )}
        {person.email && (
          <a href={`mailto:${person.email}`} className="mt-auto pt-2 text-xs text-slate-400 hover:text-primary-700 flex items-center gap-1.5">
            <Mail size={12} /> <span className="truncate">{person.email}</span>
          </a>
        )}
      </div>
    </motion.div>
  );

  const memberGroup = (title: string, peopleInGroup: Person[], accent: MemberAccent, addLabel: string, role: PersonRole) => {
    if (!peopleInGroup.length && !isAdmin) return null;
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          <div className="h-px flex-1 bg-slate-200"></div>
          <AdminAddButton label={addLabel} onClick={() => setEditor({ mode: 'student', role, person: emptyMember(role) })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{peopleInGroup.map((person) => memberCard(person, accent))}</div>
      </div>
    );
  };

  return (
    <Layout>
      <section className="relative w-full py-20 overflow-hidden">
        <MetallicBackground />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-white/40">
            {professor?.id && (
              <AdminActions onEdit={() => setEditor({ mode: 'professor', person: professor })} />
            )}
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="w-full lg:w-1/3 flex flex-col items-center text-center">
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg mb-6 border-4 border-white group">
                  <img src={professor?.image ?? ASSETS.PEOPLE.PROFESSOR} alt={professor?.name ?? 'Prof. Jae Bok-Seol'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">{professor?.name ?? 'Jae Bok Seol'}</h2>
                <span className="text-primary-700 font-bold uppercase tracking-widest text-sm mb-1">{professor?.title ?? m.people.professorFallback}</span>
                <span className="text-gray-500 text-xs mb-4 text-center leading-relaxed whitespace-pre-line">{professor?.affiliation ?? m.people.affiliation}</span>
                <div className="w-full space-y-3 text-left bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <Building2 className="w-4 h-4 mt-1 shrink-0 text-primary-600" />
                    <span className="whitespace-pre-line">{professor?.location ?? m.people.locationFallback}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="w-4 h-4 shrink-0 text-primary-600" />
                    <span>{professor?.phone ?? '+82-54-279-XXXX'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="w-4 h-4 shrink-0 text-primary-600" />
                    <a href={`mailto:${professor?.email ?? 'jb.seol@postech.ac.kr'}`} className="hover:text-primary-700">{professor?.email ?? 'jb.seol@postech.ac.kr'}</a>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-2/3 space-y-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 border-b-2 border-primary-200 pb-2 mb-6 flex items-center gap-2">
                    <GraduationCap className="text-primary-600" /> {m.people.education}
                  </h3>
                  <div className="space-y-6 pl-4 border-l-2 border-slate-200 ml-2">
                    {education.map((edu, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></div>
                        <span className="text-sm font-bold text-primary-700 block mb-1">{String(edu.year ?? '')}</span>
                        <h4 className="text-lg font-semibold text-slate-900">{String(edu.degree ?? '')}</h4>
                        <p className="text-slate-500">{String(edu.loc ?? '')}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 border-b-2 border-primary-200 pb-2 mb-6 flex items-center gap-2">
                    <Building2 className="text-primary-600" /> {m.people.experience}
                  </h3>
                  <div className="space-y-6 pl-4 border-l-2 border-slate-200 ml-2">
                    {experience.map((exp, i) => (
                      <div key={i} className="relative pl-6">
                        <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${i === 0 ? 'bg-primary-600 ring-4 ring-primary-100' : 'bg-slate-400'}`}></div>
                        <span className={`text-sm font-bold block mb-1 ${i === 0 ? 'text-primary-700' : 'text-slate-500'}`}>{String(exp.year ?? '')}</span>
                        <h4 className="text-lg font-semibold text-slate-900">{String(exp.role ?? '')}</h4>
                        <p className="text-slate-600">{String(exp.loc ?? '')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {(isAdmin || grouped.phd.length || grouped.masters.length) ? (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-slate-900 relative inline-block">
                {m.people.students}
                <span className="absolute -bottom-3 left-0 w-full h-1.5 bg-primary-600 rounded-full"></span>
              </h2>
            </div>
            <div className="space-y-14">
              {memberGroup(m.people.phdStudents, grouped.phd, 'phd', 'Ph.D. 추가', 'PHD')}
              {memberGroup(m.people.msStudents, grouped.masters, 'ms', 'M.S. 추가', 'MASTERS')}
            </div>
          </motion.div>
        ) : null}

        {(isAdmin || grouped.postPhd.length || grouped.postMs.length || grouped.postBs.length || grouped.undergrads.length) ? (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-slate-900 relative inline-block">
                {m.people.researchers}
                <span className="absolute -bottom-3 left-0 w-full h-1.5 bg-slate-400 rounded-full"></span>
              </h2>
            </div>
            <div className="space-y-14">
              {memberGroup(m.people.postPhdResearchers, grouped.postPhd, 'postPhd', 'Post Ph.D. 추가', 'POST_PHD')}
              {memberGroup(m.people.postMsResearchers, grouped.postMs, 'postMs', 'Post M.S. 추가', 'POST_MS')}
              {memberGroup(m.people.postBsResearchers, grouped.postBs, 'postBs', 'Post B.S. 추가', 'POST_BS')}
              {memberGroup(m.people.undergradResearchers, grouped.undergrads, 'ug', '학부연구생 추가', 'UNDERGRAD')}
            </div>
          </motion.div>
        ) : null}

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center py-16 bg-slate-100/50 rounded-[40px] border border-dashed border-slate-200">
          <div className="p-4 bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Microscope className="text-slate-300" size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-400 mb-2">{m.people.alumni}</h2>
          {grouped.alumni.length ? (
            <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {grouped.alumni.map((person) => memberCard(person, 'ug'))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm max-w-md mx-auto">{m.people.alumniEmpty}</p>
          )}
          <div className="mt-6 flex justify-center">
            <AdminAddButton label="Alumni 추가" onClick={() => setEditor({ mode: 'student', role: 'ALUMNI', person: emptyMember('ALUMNI') })} />
          </div>
        </motion.div>
      </div>

      <PersonEditorModal
        open={Boolean(editor)}
        mode={editor?.mode ?? 'student'}
        person={editor?.person}
        defaultRole={editor?.role}
        onClose={() => setEditor(null)}
        onSave={savePerson}
      />
    </Layout>
  );
};
