
export interface JournalPaper {
  title: string;
  doi: string;
  image: string;
  journal: string;
  date: string;
}

export interface PatentItem {
  title: string;
  country: string;
  date: string;
  number: string;
  applicantsCount: number;
  inventors: string[];
  link: string;
  image: string;
}

// Placeholders for future data
export interface ConferencePaper {
  id: string;
  title: string;
  conference: string;
  year: string;
}

export interface Patent {
  id: string;
  title: string;
  number: string;
  year: string;
}

export enum Role {
  PROFESSOR = 'Principal Investigator',
  PHD = 'Ph.D. Candidate',
  MASTERS = 'M.S. Student',
  UNDERGRAD = 'Undergraduate Researcher',
}

export interface Person {
  id: string;
  name: string;
  role: Role;
  email: string;
  image?: string;
  researchInterests: string[];
}

export interface CommunityItem {
  id: string;
  title: string;
  date: string;
  summary: string; // Short description for the card
  content?: string; // Full HTML/Text content for the expanded view
  category: 'Award' | 'Conference' | 'Paper' | 'General' | 'Notice' | 'Gallery';
  link?: string; // External link
  image?: string;
  images?: string[]; // For gallery-style items (e.g., conferences with multiple photos)
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  category: string;
}

export interface ResearchArea {
  id: string;
  title: string;
  description: string;
  image: string; // URL placeholder
}
