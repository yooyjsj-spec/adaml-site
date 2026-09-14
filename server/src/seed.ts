import { prisma } from './prisma.js';
import { cleanHtml } from './sanitize.js';
import { coverForJournalName, isPaperFigureCover, isPlaceholderCover } from './journalCover.js';
import { LAB_NAME } from '../../src/config/lab.js';
import { journalData } from '../../src/data/journals.js';
import { patentData } from '../../src/data/asset_patents.js';
import { conferenceData } from '../../src/data/asset_conferences.js';
import { ASSETS } from '../../src/data/assets.js';

const peopleImage = (filename: string) => `/images/people/${filename}`;

const seedPeople = async () => {
  const people = [
    {
      id: 'prof-jae-bok-seol',
      name: 'Jae Bok Seol',
      email: 'jb.seol@postech.ac.kr',
      role: 'PROFESSOR' as const,
      title: 'Professor',
      affiliation: 'Graduate Institute of Ferrous & Eco Materials Technology (GIFT), POSTECH',
      location: 'GIFT, POSTECH\n77 Cheongam-ro, Nam-gu, Pohang',
      phone: '+82-54-279-XXXX',
      image: ASSETS.PEOPLE.PROFESSOR,
      education: [
        { year: '2007 - 2011', degree: 'Ph.D. in Materials Science and Engineering', loc: 'POSTECH, Pohang' },
        { year: '2004 - 2006', degree: 'M.S. in Materials Science and Engineering', loc: 'POSTECH, Pohang' },
        { year: '1997 - 2004', degree: 'B.S. in Materials Science and Engineering', loc: 'Korea University, Seoul' },
      ],
      experience: [
        {
          year: '2026.09 - Present',
          role: `Professor (Head of ${LAB_NAME})`,
          loc: 'Graduate Institute of Ferrous & Eco Materials Technology (GIFT), POSTECH',
          current: true,
        },
        {
          year: '2024 - 2026.08',
          role: 'Associate Professor (Head of ADAML)',
          loc: 'School of Materials Science & Engineering, Kookmin University (KMU)',
        },
        { year: '2011 - 2013', role: 'Postdoctoral Fellow', loc: 'Max Planck Institute for Iron Research (MPIE), Germany' },
      ],
      sortOrder: 0,
    },
    { id: 'phd-chohyun-lee', name: 'Chohyun Lee', email: 'cho0410@kookmin.ac.kr', role: 'PHD' as const, research: '금속 적층제조', equipment: ['TEM', 'APT'], image: peopleImage('Chohyun.jpg'), sortOrder: 10 },
    { id: 'phd-wonhui-jo', name: 'Wonhui Jo', email: 'jwonh0104@kookmin.ac.kr', role: 'PHD' as const, research: '금속 적층제조 및 미세조직 분석', equipment: ['TEM', 'APT'], image: peopleImage('Wonhui.jpg'), sortOrder: 20 },
    { id: 'ms-jeongung-park', name: 'Jeongung Park', email: 'wjddnd636@kookmin.ac.kr', role: 'MASTERS' as const, research: '철강소재 적층제조 및 미세조직 분석', equipment: ['TEM'], image: peopleImage('Jeongung.jpg'), sortOrder: 30 },
    { id: 'ms-minyoung-lee', name: 'Minyoung Lee', email: '5368min@kookmin.ac.kr', role: 'MASTERS' as const, research: '중망간강 DED 적층', equipment: ['SEM'], image: peopleImage('Minyoung.jpg'), sortOrder: 40 },
    { id: 'ms-minyu-kang', name: 'Minyu Kang', email: 'kminyu@kookmin.ac.kr', role: 'MASTERS' as const, research: '제진합금 미세조직 분석', equipment: ['SEM'], image: peopleImage('Minyu.jpg'), sortOrder: 50 },
    { id: 'ms-seonghyeon-yang', name: 'Seonghyeon Yang', email: 'sorntmf@kookmin.ac.kr', role: 'MASTERS' as const, research: '철강소재 미세조직 분석', equipment: ['SEM'], image: peopleImage('Seonghyeon.png'), sortOrder: 60 },
    { id: 'ms-seunggyu-hong', name: 'Seunggyu Hong', email: 'hongsg4665@kookmin.ac.kr', role: 'MASTERS' as const, research: '니켈 초내열합금 미세조직 분석', equipment: ['SEM', 'Optical Microscope'], image: peopleImage('Seunggyu.jpg'), sortOrder: 70 },
    { id: 'ms-hyunyoung-park', name: 'Hyunyoung Park', email: 'jury1390@kookmin.ac.kr', role: 'MASTERS' as const, research: '주조용 Al 및 Ni 합금 미세조직 분석', equipment: ['APT'], image: peopleImage('Hyunyoung.jpg'), sortOrder: 80 },
    { id: 'ug-dawon-kang', name: 'Dawon Kang', email: 'dawon1242@kookmin.ac.kr', role: 'UNDERGRAD' as const, research: 'Ti-6AI-4V Microstructure Analysis, EBSD', image: peopleImage('Dawon.jpg'), sortOrder: 90 },
    { id: 'ug-hyeongjin-park', name: 'Hyeongjin Park', email: 'chemilk02@kookmin.ac.kr', role: 'UNDERGRAD' as const, research: 'EBSD, Sample Prep', image: peopleImage('Hyeongjin.jpg'), sortOrder: 100 },
    { id: 'ug-youngjae-yoo', name: 'Youngjae Yoo', email: 'yooyjsj@kookmin.ac.kr', role: 'UNDERGRAD' as const, research: 'Simulation Support', image: peopleImage('Youngjae.jpg'), sortOrder: 110 },
    { id: 'ug-bogeun-park', name: 'Bogeun Park', email: 'qkrqhrms9@kookmin.ac.kr', role: 'UNDERGRAD' as const, research: 'Literature Review', image: peopleImage('Bogeun.jpg'), sortOrder: 120 },
    { id: 'ug-sihyun-park', name: 'Sihyun Park', email: 'sihyun00@kookmin.ac.kr', role: 'UNDERGRAD' as const, research: 'Literature Review', image: peopleImage('Sihyun.jpg'), sortOrder: 130 },
  ];

  for (const person of people) {
    await prisma.person.upsert({
      where: { id: person.id },
      update: person,
      create: person,
    });
  }
};

const seedCommunity = async () => {
  const posts = [
    {
      id: 'news-world-top-scientists-2025',
      title: "'2025 World's Top 2% Scientists' 선정",
      date: '2024-10-10',
      summary: "국민대학교 신소재공학부 설재복 교수가 미국 스탠퍼드 대학교와 엘스비어(Elsevier)가 공동으로 발표한 '2025 세계 최상위 2% 연구자' 명단에 이름을 올렸습니다.",
      category: 'Award' as const,
      link: 'https://www.kookmin.ac.kr/comm/board/user/be8e117863cfd580d7ed5931a799207c/view.do?currentPageNo=1&searchTy=0000&searchValue=&dataSeq=1076476&parentSeq=1076476',
      content: `
        <p class="mb-4">국민대학교(총장 정승렬) 신소재공학부 설재복 교수가 미국 스탠퍼드 대학교와 엘스비어(Elsevier)가 공동으로 발표한 '2025 세계 최상위 2% 연구자(World's Top 2% Scientists)' 명단에 이름을 올렸다.</p>
        <p class="mb-4">설재복 교수는 재료공학 분야, 특히 항공우주 및 방위산업 소재와 첨단 분석 기술 분야에서의 탁월한 연구 성과를 인정받았다.</p>
        <p class="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">※ 설재복 교수는 2026년 9월부로 포항공과대학교(POSTECH) 친환경소재대학원(GIFT)으로 자리를 옮겼으며, 위 내용은 선정 당시(국민대학교 재직) 기준입니다.</p>
      `,
    },
    {
      id: 'notice-postech-gift-move',
      title: `${LAB_NAME} POSTECH 친환경소재대학원(GIFT) 이전 안내`,
      date: '2026-09-01',
      summary: `${LAB_NAME}이 2026년 9월부로 포항공과대학교 친환경소재대학원(GIFT)으로 이전하였습니다.`,
      category: 'Notice' as const,
      content: `
        <p class="mb-4 font-bold">${LAB_NAME}이 포항공과대학교(POSTECH) 친환경소재대학원(GIFT)으로 이전하였습니다.</p>
        <p class="mb-4">연구실 명칭도 기존 <strong>ADAM Lab</strong>에서 <strong>${LAB_NAME}</strong>로 변경되었습니다.</p>
        <p class="mb-4">설재복 교수는 2026년 8월까지 국민대학교 신소재공학부에 재직하였으며, 2026년 9월부로 POSTECH 친환경소재대학원 교수로 부임하였습니다.</p>
        <p>연구 협력 및 대학원 진학 문의는 jb.seol@postech.ac.kr 로 연락 바랍니다.</p>
      `,
    },
    {
      id: 'notice-2026-recruiting',
      title: '2026학년도 연구실 신입생 모집',
      date: '2026-01-01',
      summary: `${LAB_NAME}에서 열정적인 석/박사 통합과정 신입생을 모집합니다.`,
      category: 'Notice' as const,
      content: `<p class="mb-4 font-bold">${LAB_NAME}에서 2026학년도 대학원 신입생을 모집합니다.</p><p>관심 있는 학생은 설재복 교수님 이메일(jb.seol@postech.ac.kr)로 연락 바랍니다.</p>`,
    },
    {
      id: 'gallery-tms-2024',
      title: 'TMS 2024',
      date: '2024-03-05',
      summary: 'Presentation at TMS 2024 Annual Meeting.',
      category: 'Gallery' as const,
      image: '/images/gallery/20241204.jpg',
      content: `Members of ${LAB_NAME} attended the TMS 2024 Annual Meeting. We presented our latest findings on AI-driven microstructure analysis.`,
    },
    {
      id: 'gallery-lab-group-photo',
      title: 'Lab Group Photo',
      date: '2025-01-20',
      summary: `Group photo of ${LAB_NAME} members.`,
      category: 'Gallery' as const,
      image: '/images/gallery/20250120.jpg',
      content: 'Group photo taken during the 2025 winter semester.',
    },
    {
      id: 'gallery-industry-visit',
      title: 'Industry Visit',
      date: '2025-04-25',
      summary: 'On-site visit to an industry partner.',
      category: 'Gallery' as const,
      image: '/images/gallery/20250425.jpg',
      content: `${LAB_NAME} members visited an industrial research facility.`,
    },
    {
      id: 'gallery-doosan-visit',
      title: '두산에너빌리티 본사 방문',
      date: '2025-07-16',
      summary: '두산에너빌리티 본사 방문.',
      category: 'Gallery' as const,
      image: '/images/gallery/20250716.jpg',
      content: '두산에너빌리티 본사 및 창원공장 방문기념사진진',
    },
    {
      id: 'gallery-academic-workshop',
      title: 'Academic Workshop',
      date: '2025-07-29',
      summary: 'Participation in academic workshop.',
      category: 'Gallery' as const,
      image: '/images/gallery/20250729.jpg',
      content: 'Workshop focused on materials data analysis.',
    },
    {
      id: 'gallery-lab-retreat',
      title: 'Lab Retreat',
      date: '2025-08-28',
      summary: 'Annual lab retreat.',
      category: 'Gallery' as const,
      image: '/images/gallery/20250828.jpg',
      content: 'Annual retreat for discussion and collaboration.',
    },
    ...conferenceData.map((item, index) => ({
      id: `conference-${index + 1}`,
      title: item.title,
      date: item.date,
      summary: item.summary,
      category: 'Conference' as const,
      images: item.images,
      content: item.content,
      sortOrder: index,
    })),
  ];

  for (const post of posts) {
    await prisma.communityPost.upsert({
      where: { id: post.id },
      update: { ...post, content: cleanHtml(post.content) },
      create: { ...post, content: cleanHtml(post.content) },
    });
  }
};

const normalizeDoi = (doi?: string | null) =>
  (doi ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/\/+$/, '');

const seedPublications = async () => {
  for (const [index, journal] of journalData.entries()) {
    await prisma.journalPublication.upsert({
      where: { id: `journal-${index + 1}` },
      update: { ...journal, id: `journal-${index + 1}`, sortOrder: index },
      create: { ...journal, id: `journal-${index + 1}`, sortOrder: index },
    });
  }

  for (const [index, patent] of patentData.entries()) {
    await prisma.patentPublication.upsert({
      where: { id: `patent-${index + 1}` },
      update: { ...patent, id: `patent-${index + 1}`, sortOrder: index },
      create: { ...patent, id: `patent-${index + 1}`, sortOrder: index },
    });
  }
};

const seedMissingPublications = async () => {
  const existing = await prisma.journalPublication.findMany({
    select: { doi: true, title: true, sortOrder: true },
  });
  const dois = new Set(existing.map((item) => normalizeDoi(item.doi)).filter(Boolean));
  const titles = new Set(existing.map((item) => item.title.trim().toLowerCase()));
  const missing = journalData.filter((journal) => {
    const doi = normalizeDoi(journal.doi);
    const title = journal.title.trim().toLowerCase();
    return !((doi && dois.has(doi)) || titles.has(title));
  });
  const minSort = existing.reduce((min, item) => Math.min(min, item.sortOrder), 0);

  for (const [index, journal] of missing.entries()) {
    const doi = normalizeDoi(journal.doi);
    const id = doi ? `journal-${doi.replace(/[^a-z0-9]+/g, '-').slice(0, 72)}` : undefined;
    await prisma.journalPublication.create({
      data: {
        ...(id ? { id } : {}),
        title: journal.title,
        doi: journal.doi || null,
        image: journal.image,
        journal: journal.journal,
        date: journal.date,
        sortOrder: minSort - missing.length + index,
      },
    });
  }

  console.log(`Inserted ${missing.length} missing journal publication(s).`);
};

const refreshPlaceholderCovers = async () => {
  const existing = await prisma.journalPublication.findMany({
    select: { id: true, doi: true, title: true, image: true },
  });
  let updated = 0;
  for (const row of existing) {
    if (!isPlaceholderCover(row.image) && !isPaperFigureCover(row.image)) continue;
    const catalog = coverForJournalName(row.journal);
    const match = journalData.find((journal) => {
      const doi = normalizeDoi(journal.doi);
      const rowDoi = normalizeDoi(row.doi);
      return (Boolean(doi && rowDoi && doi === rowDoi)) || journal.title.trim().toLowerCase() === row.title.trim().toLowerCase();
    });
    const nextImage = catalog || (match && !isPlaceholderCover(match.image) ? match.image : null);
    if (!nextImage) continue;
    await prisma.journalPublication.update({ where: { id: row.id }, data: { image: nextImage } });
    updated += 1;
  }
  console.log(`Refreshed ${updated} journal cover path(s) from source data.`);
};

const main = async () => {
  const existingCount = await prisma.person.count();
  if (existingCount > 0 && process.env.SEED_FORCE !== 'true') {
    console.log('Seed skipped: CMS data already exists. Set SEED_FORCE=true to overwrite.');
    await seedMissingPublications();
    await refreshPlaceholderCovers();
    return;
  }

  await seedPeople();
  await seedCommunity();
  await seedPublications();
  await refreshPlaceholderCovers();
  console.log('Seed completed');
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
