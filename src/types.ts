
export interface JournalPaper {
  id?: string;
  title: string;
  doi: string;
  image: string;
  journal: string;
  date: string;
  sortOrder?: number;
}

export interface PatentItem {
  id?: string;
  title: string;
  country: string;
  date: string;
  number: string;
  applicantsCount: number;
  inventors: string[];
  link: string;
  image: string;
  sortOrder?: number;
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
  PHD = 'Ph.D. Student',
  MASTERS = 'M.S. Student',
  POST_PHD = 'Post Ph.D. Researcher',
  POST_MS = 'Post M.S. Researcher',
  POST_BS = 'Post B.S. Researcher',
  UNDERGRAD = 'Undergraduate Researcher',
}

export interface Person {
  id: string;
  name: string;
  role: Role | PersonRole;
  email?: string | null;
  image?: string;
  researchInterests?: string[];
  title?: string | null;
  affiliation?: string | null;
  location?: string | null;
  phone?: string | null;
  research?: string | null;
  equipment?: string[];
  education?: Array<Record<string, unknown>>;
  experience?: Array<Record<string, unknown>>;
  visible?: boolean;
  sortOrder?: number;
}

export type PersonRole = 'PROFESSOR' | 'PHD' | 'MASTERS' | 'POST_PHD' | 'POST_MS' | 'POST_BS' | 'UNDERGRAD' | 'ALUMNI';

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

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type UserRoleName = 'MEMBER' | 'STAFF' | 'ADMIN';

export interface AdminUserDto {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  role: UserRoleName;
  emailVerified: boolean;
  csrfToken: string;
  totpEnabled: boolean;
}

export interface AuthMeResponse {
  user?: AdminUserDto;
  csrfToken?: string;
  requiresTotpSetup?: boolean;
}

export interface ManagedUser {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  affiliation: string | null;
  role: UserRoleName;
  emailVerified: boolean;
  totpEnabled: boolean;
  createdAt: string;
}

export type AnalysisRequestStatus =
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface AnalysisRequestItem {
  id: string;
  title: string;
  category?: string | null;
  sampleInfo?: string | null;
  description: string;
  status: AnalysisRequestStatus;
  assigneeId?: string | null;
  assignee?: { id: string; name: string | null; email?: string | null } | null;
  requester?: {
    id: string;
    name: string | null;
    email: string | null;
    affiliation?: string | null;
    phone?: string | null;
  } | null;
  guestEmail?: string | null;
  guestName?: string | null;
  guestAffiliation?: string | null;
  guestPhone?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}
