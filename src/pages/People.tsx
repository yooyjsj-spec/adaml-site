import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { Mail, GraduationCap, Phone, Building2, Cpu, History } from 'lucide-react';
import { MetallicBackground } from '../components/MetallicBackground';
import { ASSETS } from '../data/assets';
import { getPeople } from '../api/content';
import { Person, PersonLabGroup, PersonRole } from '../types';
import { AdminActions, AdminAddButton, confirmDelete } from '../components/admin/AdminControls';
import { PersonEditorDraft, PersonEditorModal } from '../components/admin/PersonEditorModal';
import { adminPeople } from '../api/admin';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useI18n } from '../i18n';

const emptyMember = (role: PersonRole, labGroup: PersonLabGroup = 'SEOL'): Person => ({
  id: '',
  name: '',
  role,
  labGroup,
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

const accentForRole = (role: Person['role']): MemberAccent => {
  switch (role) {
    case 'PHD': return 'phd';
    case 'MASTERS': return 'ms';
    case 'POST_PHD': return 'postPhd';
    case 'POST_MS': return 'postMs';
    case 'POST_BS': return 'postBs';
    default: return 'ug';
  }
};

const pulseClass = 'animate-pulse rounded-md bg-slate-200';

const SkeletonBar = ({ className }: { className: string }) => (
  <div className={`${pulseClass} ${className}`} />
);

const MemberCardSkeleton = () => (
  <div className="relative flex h-40 flex-row overflow-hidden rounded-xl border border-slate-100 bg-white shadow-soft md:h-44">
    <div className={`${pulseClass} w-32 shrink-0 rounded-none md:w-36`} />
    <div className="flex min-w-0 flex-grow flex-col justify-center gap-2 p-4">
      <SkeletonBar className="h-5 w-40" />
      <SkeletonBar className="h-3 w-24" />
      <SkeletonBar className="h-3 w-56 max-w-full" />
      <div className="mt-1 flex gap-1">
        <SkeletonBar className="h-4 w-10" />
        <SkeletonBar className="h-4 w-12" />
      </div>
    </div>
  </div>
);

const TimelineItemSkeleton = () => (
  <div className="relative pl-6">
    <div className={`absolute -left-[21px] top-1.5 h-3 w-3 rounded-full ${pulseClass}`} />
    <SkeletonBar className="mb-2 h-3 w-28" />
    <SkeletonBar className="mb-2 h-5 w-72 max-w-full" />
    <SkeletonBar className="h-4 w-48" />
  </div>
);

const PeoplePageSkeleton = ({ label }: { label: string }) => (
  <>
    <section className="relative w-full overflow-hidden py-20" aria-busy="true" aria-live="polite">
      <MetallicBackground />
      <p className="sr-only">{label}</p>
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="relative rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-md md:p-12">
          <div className="flex flex-col gap-12 lg:flex-row">
            <div className="flex w-full flex-col items-center text-center lg:w-1/3">
              <div className={`${pulseClass} mb-6 aspect-[3/4] w-full rounded-2xl`} />
              <SkeletonBar className="mb-3 h-8 w-52" />
              <SkeletonBar className="mb-2 h-4 w-28" />
              <SkeletonBar className="mb-4 h-8 w-64 max-w-full" />
              <div className="w-full space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-6">
                <SkeletonBar className="h-4 w-full" />
                <SkeletonBar className="h-4 w-40" />
                <SkeletonBar className="h-4 w-56" />
              </div>
            </div>
            <div className="w-full space-y-10 lg:w-2/3">
              <div>
                <SkeletonBar className="mb-6 h-7 w-36" />
                <div className="ml-2 space-y-6 border-l-2 border-slate-200 pl-4">
                  <TimelineItemSkeleton />
                  <TimelineItemSkeleton />
                  <TimelineItemSkeleton />
                </div>
              </div>
              <div>
                <SkeletonBar className="mb-6 h-7 w-52" />
                <div className="ml-2 space-y-6 border-l-2 border-slate-200 pl-4">
                  <TimelineItemSkeleton />
                  <TimelineItemSkeleton />
                  <TimelineItemSkeleton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div className="mx-auto max-w-7xl space-y-24 px-6 py-20" aria-hidden="true">
      <div>
        <div className="mb-16 flex justify-center">
          <SkeletonBar className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <MemberCardSkeleton />
          <MemberCardSkeleton />
          <MemberCardSkeleton />
          <MemberCardSkeleton />
        </div>
      </div>
      <div>
        <div className="mb-16 flex justify-center">
          <SkeletonBar className="h-10 w-44" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <MemberCardSkeleton />
          <MemberCardSkeleton />
        </div>
      </div>
    </div>
  </>
);

export const People: React.FC = () => {
  const { m } = useI18n();
  const { isAdmin } = useAdminAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<{
    mode: 'professor' | 'student';
    person?: Person;
    role?: PersonRole;
    labGroup?: PersonLabGroup;
  } | null>(null);

  const load = async () => {
    try {
      setPeople(await getPeople());
    } catch {
      setPeople((current) => current);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const current = people.filter((person) => person.role !== 'PROFESSOR' && person.role !== 'ALUMNI' && person.labGroup !== 'ADAML');
    const adaml = people.filter((person) => person.role !== 'PROFESSOR' && person.role !== 'ALUMNI' && person.labGroup === 'ADAML');
    const byRole = (list: Person[], role: PersonRole) => list.filter((person) => person.role === role);
    return {
      professor: people.find((person) => person.role === 'PROFESSOR'),
      phd: byRole(current, 'PHD'),
      masters: byRole(current, 'MASTERS'),
      postPhd: byRole(current, 'POST_PHD'),
      postMs: byRole(current, 'POST_MS'),
      postBs: byRole(current, 'POST_BS'),
      undergrads: byRole(current, 'UNDERGRAD'),
      adaml,
      alumni: people.filter((person) => person.role === 'ALUMNI'),
    };
  }, [people]);

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
      labGroup: editor?.mode === 'professor' ? 'SEOL' : (values.labGroup || 'SEOL'),
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
  const education = (professor?.education ?? []) as Array<Record<string, unknown>>;
  const experience = (professor?.experience ?? []) as Array<Record<string, unknown>>;

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
        <div className={`text-[10px] font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5 flex-wrap ${memberAccentClass[accent].text}`}>
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${memberAccentClass[accent].dot}`}></span>
          {roleLabel(person.role)}
          {person.labGroup === 'ADAML' && (
            <span className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-slate-500">
              {m.people.adamlBadge}
            </span>
          )}
        </div>
        {person.role === 'ALUMNI' && person.affiliation ? (
          <div className="text-xs text-slate-600 flex items-center gap-1.5 mb-2">
            <Building2 size={12} className="text-slate-400 shrink-0" />
            <span className="font-medium truncate">
              <span className="sr-only">{m.people.currentPosition}: </span>
              {person.affiliation}
            </span>
          </div>
        ) : null}
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

  const memberGroup = (title: string, peopleInGroup: Person[], accent: MemberAccent, addLabel: string, role: PersonRole, labGroup: PersonLabGroup = 'SEOL') => {
    if (!peopleInGroup.length && !isAdmin) return null;
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          <div className="h-px flex-1 bg-slate-200"></div>
          <AdminAddButton label={addLabel} onClick={() => setEditor({ mode: 'student', role, labGroup, person: emptyMember(role, labGroup) })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{peopleInGroup.map((person) => memberCard(person, accent))}</div>
      </div>
    );
  };

  return (
    <Layout>
      {loading ? <PeoplePageSkeleton label={m.people.loading} /> : (
      <>
      {professor ? (
      <section className="relative w-full py-20 overflow-hidden">
        <MetallicBackground />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-white/40">
            {professor.id && (
              <AdminActions onEdit={() => setEditor({ mode: 'professor', person: professor })} />
            )}
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="w-full lg:w-1/3 flex flex-col items-center text-center">
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg mb-6 border-4 border-white group">
                  <img src={professor.image || ASSETS.PEOPLE.PROFESSOR} alt={professor.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">{professor.name}</h2>
                <span className="text-primary-700 font-bold uppercase tracking-widest text-sm mb-1">{professor.title ?? m.people.professorFallback}</span>
                <span className="text-gray-500 text-xs mb-4 text-center leading-relaxed whitespace-pre-line">{professor.affiliation ?? m.people.affiliation}</span>
                <div className="w-full space-y-3 text-left bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <Building2 className="w-4 h-4 mt-1 shrink-0 text-primary-600" />
                    <span className="whitespace-pre-line">{professor.location ?? m.people.locationFallback}</span>
                  </div>
                  {professor.phone ? (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone className="w-4 h-4 shrink-0 text-primary-600" />
                      <span>{professor.phone}</span>
                    </div>
                  ) : null}
                  {professor.email ? (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Mail className="w-4 h-4 shrink-0 text-primary-600" />
                      <a href={`mailto:${professor.email}`} className="hover:text-primary-700">{professor.email}</a>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="w-full lg:w-2/3 space-y-10">
                {education.length ? (
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
                ) : null}
                {experience.length ? (
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
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      ) : null}

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

        {(isAdmin || grouped.adaml.length) ? (
          <motion.section
            id="adaml"
            aria-labelledby="adaml-heading"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">{m.people.adamlSubtitle}</p>
              <h2 id="adaml-heading" className="text-4xl font-serif font-bold text-slate-900 relative inline-block">
                {m.people.adaml}
                <span className="absolute -bottom-3 left-0 w-full h-1.5 bg-slate-400 rounded-full"></span>
              </h2>
              <p className="mt-8 max-w-2xl mx-auto text-sm text-slate-500 leading-relaxed">{m.people.adamlIntro}</p>
            </div>
            <div className="flex justify-end mb-6">
              <AdminAddButton
                label={m.people.addAdamlMember}
                onClick={() => setEditor({ mode: 'student', role: 'PHD', labGroup: 'ADAML', person: emptyMember('PHD', 'ADAML') })}
              />
            </div>
            {grouped.adaml.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {grouped.adaml.map((person) => memberCard(person, accentForRole(person.role)))}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-400">{m.people.adamlEmpty}</p>
            )}
          </motion.section>
        ) : null}

        <motion.section
          id="alumni"
          aria-labelledby="alumni-heading"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-16 px-6 bg-slate-100/50 rounded-[40px] border border-dashed border-slate-200"
        >
          <div className="text-center">
            <div className="p-4 bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <History className="text-slate-400" size={32} aria-hidden="true" />
            </div>
            <h2 id="alumni-heading" className="text-2xl font-serif font-bold text-slate-700 mb-2">{m.people.alumni}</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">{grouped.alumni.length ? m.people.alumniIntro : m.people.alumniEmpty}</p>
          </div>
          {grouped.alumni.length ? (
            <div className="max-w-4xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {grouped.alumni.map((person) => memberCard(person, accentForRole(person.role)))}
            </div>
          ) : null}
          <div className="mt-6 flex justify-center">
            <AdminAddButton
              label={m.people.addAlumni}
              onClick={() => setEditor({ mode: 'student', role: 'ALUMNI', labGroup: 'SEOL', person: emptyMember('ALUMNI', 'SEOL') })}
            />
          </div>
        </motion.section>
      </div>
      </>
      )}

      <PersonEditorModal
        open={Boolean(editor)}
        mode={editor?.mode ?? 'student'}
        person={editor?.person}
        defaultRole={editor?.role}
        defaultLabGroup={editor?.labGroup ?? editor?.person?.labGroup}
        onClose={() => setEditor(null)}
        onSave={savePerson}
      />
    </Layout>
  );
};
