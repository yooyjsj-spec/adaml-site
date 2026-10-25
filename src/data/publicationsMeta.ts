/** Last time Publications were reconciled with Google Scholar / ResearchGate (2024+). */
export const PUBLICATIONS_LAST_UPDATED = '2026-09-13';

export const formatPublicationsUpdatedDate = (isoDate = PUBLICATIONS_LAST_UPDATED) => {
  const [year, month, day] = isoDate.split('-');
  return `${year}.${month}.${day}`;
};
