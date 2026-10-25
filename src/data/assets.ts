
import { VIDEO_ASSETS } from './asset_video';
import { HOME_ASSETS } from './asset_home';
import { RESEARCH_ASSETS } from './asset_research';
import { PEOPLE_ASSETS } from './asset_people';
import { GALLERY_ASSETS } from './asset_gallery';
import { JOURNAL_ASSETS } from './asset_journal';
import { LOGO_ASSETS } from './asset_logo';

// 모든 자산을 통합 관리하는 파일입니다.
// 개별 수정은 data/ 폴더 내의 각 asset_*.ts 파일을 참고하세요.

export const ASSETS = {
  // 로고
  LOGO: LOGO_ASSETS.LOGO,

  // 동영상
  VIDEOS: {
    ABOUT_bg: VIDEO_ASSETS.ABOUT_BG,
    SPACE_STARS: VIDEO_ASSETS.SPACE_STARS
  },

  // 홈 & 리서치 이미지
  IMAGES: {
    HOME_HERO: HOME_ASSETS.HERO_BG,
    HOME_TOP_BANNER: HOME_ASSETS.TOP_BANNER,
    RESEARCH_MICRO: RESEARCH_ASSETS.MICRO,
    RESEARCH_AERO: RESEARCH_ASSETS.AERO,
    RESEARCH_PRINT: RESEARCH_ASSETS.PRINT,
    RESEARCH_AI: RESEARCH_ASSETS.AI
  },

  // 구성원 이미지
  PEOPLE: {
    PROFESSOR: PEOPLE_ASSETS.PROFESSOR,
    STUDENT_PLACEHOLDER: PEOPLE_ASSETS.STUDENT_PLACEHOLDER
  },

  // 갤러리 이미지
  GALLERY: {
    TMS_CONF: GALLERY_ASSETS.TMS_CONF,
    LAB_GROUP: GALLERY_ASSETS.LAB_GROUP,
    SEM_SESSION: GALLERY_ASSETS.SEM_SESSION
  },

  // 저널 이미지
  JOURNALS: {
    DEFAULT_COVER: JOURNAL_ASSETS.DEFAULT_COVER
  }
};
