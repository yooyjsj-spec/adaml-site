import { apiRequest } from './client';
import { CommunityItem, JournalPaper, PaginatedResponse, PatentItem, Person } from '../types';

export const getPeople = () => apiRequest<Person[]>('/api/people');

export const getCommunity = (category?: CommunityItem['category']) => {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiRequest<CommunityItem[]>(`/api/community${query}`);
};

export const getJournals = (page: number, pageSize: number, q?: string) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q) params.set('q', q);
  return apiRequest<PaginatedResponse<JournalPaper>>(`/api/publications/journals?${params}`);
};

export const getPatents = (page: number, pageSize: number, q?: string) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q) params.set('q', q);
  return apiRequest<PaginatedResponse<PatentItem>>(`/api/publications/patents?${params}`);
};
