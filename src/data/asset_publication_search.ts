/**
 * Publications 페이지 검색창 에셋
 * enabled: false로 설정하면 검색창을 숨깁니다.
 */

export const PUBLICATION_SEARCH_ASSET = {
  /** 검색창 표시 여부 (false로 설정 시 검색창 미표시) */
  enabled: true,

  /** 검색창 placeholder */
  placeholder: 'Search by journal name, paper/patent title...',

  /** 저널 검색 필드: title(제목), journal(저널명) */
  journalSearchFields: ['title', 'journal'] as const,

  /** 특허 검색 필드: title(제목), inventors(발명자 이름) */
  patentSearchFields: ['title', 'inventors'] as const,
};
