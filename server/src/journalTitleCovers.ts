const covers: Record<string, string> = {
  'acta materialia': '/images/journals/journal126.png',
  'scripta materialia': '/images/journals/journal111.png',
  'journal of materials science': '/images/journals/cover-journal-of-materials-science.png',
  'journal of materials research and technology': '/images/journals/journal127.png',
  'transactions of the indian institute of metals': '/images/journals/cover-tiim.png',
  'applied microscopy': '/images/journals/cover-applied-microscopy.png',
  'metalmat': '/images/journals/cover-metalmat.svg',
  'journal of materials science & technology': '/images/journals/journal128.png',
  'journal of materials science and technology': '/images/journals/journal128.png',
  'materials & design': '/images/journals/cover-materials-design.gif',
  'materials and design': '/images/journals/cover-materials-design.gif',
  'materials science and engineering a': '/images/journals/journal124.png',
  'journal of powder materials': '/images/journals/cover-jpm.svg',
  'powder metallurgy': '/images/journals/cover-powder-metallurgy.svg',
};

export const normalizeJournalName = (name?: string | null) =>
  (name ?? '')
    .toLowerCase()
    .replace(/[:.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const coverForJournalName = (name?: string | null) => {
  const key = normalizeJournalName(name);
  if (!key) return undefined;
  return covers[key] ?? covers[key.replace(/&/g, 'and')];
};
