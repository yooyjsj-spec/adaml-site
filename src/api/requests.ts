import { apiRequest } from './client';
import { AnalysisRequestItem } from '../types';

export interface AnalysisRequestInput {
  title: string;
  category?: string;
  sampleInfo?: string;
  description: string;
  email?: string;
  name?: string;
  affiliation?: string;
  phone?: string;
}

export const createAnalysisRequest = (data: AnalysisRequestInput) =>
  apiRequest<AnalysisRequestItem>('/api/analysis-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const myAnalysisRequests = () => apiRequest<AnalysisRequestItem[]>('/api/analysis-requests/mine');
