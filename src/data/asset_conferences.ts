import { assetPath } from '../utils/assetPath';

type ConferenceSection = {
  title: string;
  date: string; // user-editable
  summary: string; // card subtitle
  images: string[]; // all conference photos for the section
  content: string; // HTML shown in the detail modal
};

const toAsset = (relativePublicPath: string) => assetPath(relativePublicPath);

// Conferences data for the Community page (grouped sections with multiple photos)
export const conferenceData: ConferenceSection[] = [
  {
    title: '2025 대한금속학회',
    date: '2025.10.29', 
    summary: '2025 대한금속학회 참가',
    images: [
      toAsset('/images/Conferences/2025_Kr_Metal/2025_Kr_Metal_1.jpg'),
      toAsset('/images/Conferences/2025_Kr_Metal/2025_Kr_Metal_2.jpg'),
      toAsset('/images/Conferences/2025_Kr_Metal/2025_Kr_Metal_3.jpg'),
    ],
    content: `
      <p class="mb-4 font-bold">2025대한금속학회</p>
      <p class="mb-4">본 학회에서 ADAM Lab 연구진이 금속 소재 및 공정 관련 연구 성과를 공유했습니다.</p>
      <p class="mb-4">발표/토론을 통해 데이터 기반 분석 접근과 소재 특성 간의 연계를 확장하는 방향을 논의했습니다.</p>
      <p>주요 관심 주제: 미세조직 예측, 소재 데이터 분석, 실험-모델링 연계.</p>
    `,
  },
  {
    title: 'APT Workshop (Taiwan)',
    date: '2025.08.25~2028.08.26', 
    summary: 'APT 기반 분석 관련 워크숍',
    images: [
      toAsset('/images/Conferences/2025_Taiwan_AtomProbeWorkshop/2025_Taiwan_Atom%20Probe%20Workshop.jpg'),
    ],
    content: `
      <p class="mb-4 font-bold">대만APT Workshop</p>
      <p class="mb-4">APT(Atom Probe Tomography) 기반 분석 기술과 실험 운영 노하우를 중심으로 진행된 워크숍에 참가했습니다.</p>
      <p class="mb-4">데이터 전처리/해석 과정에서의 주의점, 재현성 확보 방법, 그리고 해석 품질을 높이는 실무 팁을 공유했습니다.</p>
      <p>이번 워크숍을 통해 APT 분석 워크플로우를 한 단계 더 고도화할 수 있는 인사이트를 얻었습니다.</p>
    `,
  },
  {
    title: 'ICSMA20 (JAPAN)',
    date: '2025.06.12', 
    summary: '일본 ICSMA20 학회',
    images: [
      toAsset('/images/Conferences/20250602_JP_ICSMA20/20250602_JP_ICSMA20_1.jpg'),
      toAsset('/images/Conferences/20250602_JP_ICSMA20/20250602_JP_ICSMA20_2.jpg'),
      toAsset('/images/Conferences/20250602_JP_ICSMA20/20250602_JP_ICSMA20_3.jpg'),
      toAsset('/images/Conferences/20250602_JP_ICSMA20/20250602_JP_ICSMA20_4.png'),
      toAsset('/images/Conferences/20250602_JP_ICSMA20/20250602_JP_ICSMA20_5.png'),
    ],
    content: `
      <p class="mb-4 font-bold">일본ICSMA20</p>
      <p class="mb-4">ICSMA20 현장에서 ADAM Lab 연구진이 최신 연구 주제를 소개하고 다양한 분야 연구자들과 교류했습니다.</p>
      <p class="mb-4">특히 소재 특성 분석과 데이터 기반 해석 방법을 결합하는 접근에 대해 심도 있게 논의했습니다.</p>
      <p>현장 발표/네트워킹을 통해 후속 협력 가능성을 확인하고, 향후 연구 로드맵을 정리했습니다.</p>
    `,
  },
];
