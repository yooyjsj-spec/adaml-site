import { apiRequest } from './client';
import { AnalysisPurpose, AnalysisRequestItem } from '../types';

export interface AnalysisRequestInput {
  title: string;
  category?: string;
  purposes: AnalysisPurpose[];
  purposeOther?: string;
  sampleInfo?: string;
  description: string;
  email?: string;
  name?: string;
  affiliation?: string;
  phone?: string;
  attachmentLink?: string;
  files?: File[];
}

const MAX_REQUEST_ATTACHMENT_BYTES = 1024 * 1024 * 1024;

export const REQUEST_ATTACHMENT_LIMIT_BYTES = MAX_REQUEST_ATTACHMENT_BYTES;

export const createAnalysisRequest = (data: AnalysisRequestInput) => {
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.category) formData.append('category', data.category);
  formData.append('purposes', JSON.stringify(data.purposes));
  if (data.purposeOther) formData.append('purposeOther', data.purposeOther);
  if (data.sampleInfo) formData.append('sampleInfo', data.sampleInfo);
  formData.append('description', data.description);
  if (data.email) formData.append('email', data.email);
  if (data.name) formData.append('name', data.name);
  if (data.affiliation) formData.append('affiliation', data.affiliation);
  if (data.phone) formData.append('phone', data.phone);
  if (data.attachmentLink) formData.append('attachmentLink', data.attachmentLink);
  for (const file of data.files ?? []) {
    formData.append('files', file);
  }
  return apiRequest<AnalysisRequestItem>('/api/analysis-requests', {
    method: 'POST',
    body: formData,
  });
};

export const myAnalysisRequests = () => apiRequest<AnalysisRequestItem[]>('/api/analysis-requests/mine');
