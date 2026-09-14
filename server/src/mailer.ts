import nodemailer from 'nodemailer';
import { env } from './env.js';
import { LAB_NAME } from './lab.js';
import { prisma } from './prisma.js';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

const getTransporter = () => {
  if (!env.smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
      // Lets SMTP_HOST be an IP (avoids DNS/hairpin-NAT issues) while still
      // verifying the server's TLS certificate against its real hostname.
      tls: env.smtp.tlsServername ? { servername: env.smtp.tlsServername } : undefined,
    });
  }
  return transporter;
};

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  template: string;
  relatedRequestId?: string;
}

export const sendMail = async ({ to, subject, html, template, relatedRequestId }: SendMailInput) => {
  const client = getTransporter();
  try {
    if (!client) {
      throw new Error('SMTP is not configured (SMTP_HOST missing)');
    }
    await client.sendMail({ from: env.smtp.from, to, subject, html });
    await prisma.emailLog.create({
      data: { to, subject, template, relatedRequestId, status: 'SENT' },
    });
  } catch (error) {
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        template,
        relatedRequestId,
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeMultiline = (value: string) => escapeHtml(value).replace(/\r\n/g, '\n').replace(/\n/g, '<br />');

const dashboardUrl = () => `${env.publicOrigin}/#/dashboard`;

const layout = (title: string, body: string) => `
  <div style="font-family: -apple-system, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1e293b;">
    <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: #2a4b76; text-transform: uppercase;">${LAB_NAME}</p>
    <h1 style="font-size: 20px; margin: 8px 0 20px;">${title}</h1>
    <div style="font-size: 14px; line-height: 1.7;">${body}</div>
    <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">본 메일은 발신 전용입니다.</p>
  </div>
`;

const cta = (href: string, label: string) =>
  `<p style="margin: 24px 0;"><a href="${escapeHtml(href)}" style="background:#2a4b76;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;">${escapeHtml(label)}</a></p>`;

const statusLabel: Record<string, string> = {
  SUBMITTED: '접수됨',
  IN_REVIEW: '검토 중',
  IN_PROGRESS: '처리 중',
  COMPLETED: '완료',
  REJECTED: '반려',
  CANCELLED: '취소',
};

const formatDateTime = (value?: Date | string | null) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
};

const formatDate = (value?: Date | string | null) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
};

export interface RequestParty {
  name: string | null;
  email: string | null;
  affiliation?: string | null;
  phone?: string | null;
}

export interface RequestNotifyDetails {
  id: string;
  title: string;
  category?: string | null;
  sampleInfo?: string | null;
  description: string;
  status?: string;
  createdAt?: Date | string | null;
  dueDate?: Date | string | null;
  adminNote?: string | null;
  requester: RequestParty;
}

const tableRow = (label: string, value: string | null | undefined, multiline = false) => {
  const trimmed = value?.trim();
  const display = trimmed ? (multiline ? escapeMultiline(trimmed) : escapeHtml(trimmed)) : '—';
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;width:132px;font-weight:700;color:#64748b;vertical-align:top;font-size:13px;">${label}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top;font-size:14px;color:#0f172a;">${display}</td>
  </tr>`;
};

const sectionTable = (title: string, rows: string) => `
  <h2 style="font-size:14px;margin:24px 0 8px;color:#2a4b76;">${title}</h2>
  <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;">${rows}</table>
`;

const requesterSection = (requester: RequestParty) =>
  sectionTable(
    '요청자 정보',
    tableRow('이름', requester.name) +
      tableRow('이메일', requester.email) +
      tableRow('소속', requester.affiliation) +
      tableRow('연락처', requester.phone)
  );

const requestContentSection = (details: RequestNotifyDetails) =>
  sectionTable(
    '요청 내용',
    tableRow('제목', details.title) +
      tableRow('분석 종류', details.category) +
      tableRow('시료 정보', details.sampleInfo, true) +
      tableRow('상세 내용', details.description, true) +
      (details.status ? tableRow('상태', statusLabel[details.status] ?? details.status) : '') +
      (details.createdAt ? tableRow('접수 일시', formatDateTime(details.createdAt)) : '') +
      (details.dueDate ? tableRow('처리 예정일', formatDate(details.dueDate)) : '') +
      (details.adminNote ? tableRow('관리자 메모', details.adminNote, true) : '')
  );

const staffRequestBody = (intro: string, details: RequestNotifyDetails) =>
  `${intro}
   ${requesterSection(details.requester)}
   ${requestContentSection(details)}
   ${cta(dashboardUrl(), '대시보드에서 확인하기')}
   <p style="color:#64748b;">관리자 대시보드의 "분석 요청 관리"에서 요청자 정보와 처리 상태를 확인하고 담당자를 지정할 수 있습니다.</p>`;

export const sendVerificationEmail = async (to: string, name: string | null, verifyUrl: string) => {
  await sendMail({
    to,
    subject: `[${LAB_NAME}] 이메일 인증을 완료해주세요`,
    template: 'verify-email',
    html: layout(
      '이메일 인증',
      `<p>${escapeHtml(name ?? '회원')}님, 가입해주셔서 감사합니다.</p>
       <p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요. (24시간 내 유효)</p>
       ${cta(verifyUrl, '이메일 인증하기')}
       <p style="color:#64748b;">버튼이 동작하지 않으면 다음 링크를 주소창에 붙여넣으세요: <br />${escapeHtml(verifyUrl)}</p>`
    ),
  });
};

export const sendRequestSubmittedEmail = async (
  to: string,
  requestTitle: string,
  requestId: string,
  options?: { guest?: boolean }
) => {
  await sendMail({
    to,
    subject: `[${LAB_NAME}] 분석 요청이 접수되었습니다`,
    template: 'request-submitted',
    relatedRequestId: requestId,
    html: layout(
      '분석 요청 접수 완료',
      `<p>요청하신 <strong>${escapeHtml(requestTitle)}</strong> 건이 정상적으로 접수되었습니다.</p>
       <p>담당자 검토 후 처리 현황을 이 이메일로 안내해 드립니다.</p>
       ${
         options?.guest
           ? `<p>로그인하시면 요청 현황을 한곳에서 편하게 확인하고 관리할 수 있습니다.</p>${cta(dashboardUrl(), '로그인하기')}`
           : cta(dashboardUrl(), '내 요청 확인하기')
       }`
    ),
  });
};

export const sendAdminNewRequestEmail = async (to: string, details: RequestNotifyDetails) => {
  await sendMail({
    to,
    subject: `[${LAB_NAME}] 새 분석 요청: ${details.title}`,
    template: 'admin-new-request',
    relatedRequestId: details.id,
    html: layout(
      '새 분석 요청 접수',
      staffRequestBody(
        `<p><strong>${escapeHtml(details.requester.name ?? details.requester.email ?? '비회원')}</strong>님이 새 분석 요청을 제출했습니다. 담당자를 지정하고 처리를 진행해주세요.</p>`,
        details
      )
    ),
  });
};

export const sendAssigneeAssignedEmail = async (to: string, assigneeName: string | null, details: RequestNotifyDetails) => {
  await sendMail({
    to,
    subject: `[${LAB_NAME}] 분석 요청 담당자로 지정되었습니다: ${details.title}`,
    template: 'assignee-assigned',
    relatedRequestId: details.id,
    html: layout(
      '분석 요청 담당 지정',
      staffRequestBody(
        `<p>${escapeHtml(assigneeName ?? '담당자')}님, <strong>${escapeHtml(details.title)}</strong> 요청의 담당자로 지정되었습니다. 아래 요청자 정보와 요청 내용을 확인하고 처리해주세요.</p>`,
        details
      )
    ),
  });
};

export const sendRequestStatusEmail = async (
  to: string,
  details: {
    id: string;
    title: string;
    status: string;
    previousStatus?: string;
    adminNote?: string | null;
    assigneeName?: string | null;
    guest?: boolean;
  }
) => {
  const nextLabel = statusLabel[details.status] ?? details.status;
  const prevLabel = details.previousStatus ? statusLabel[details.previousStatus] ?? details.previousStatus : null;
  await sendMail({
    to,
    subject: `[${LAB_NAME}] 분석 요청 상태 변경: ${nextLabel}`,
    template: 'request-status-changed',
    relatedRequestId: details.id,
    html: layout(
      '분석 요청 상태 업데이트',
      `<p><strong>${escapeHtml(details.title)}</strong> 요청의 상태가${
        prevLabel ? ` <strong>${escapeHtml(prevLabel)}</strong>에서` : ''
      } <strong>${escapeHtml(nextLabel)}</strong>(으)로 변경되었습니다.</p>
       ${details.assigneeName ? `<p>담당자: ${escapeHtml(details.assigneeName)}</p>` : ''}
       ${
         details.adminNote
           ? `<p style="margin-top:12px;padding:12px;background:#f1f5f9;border-radius:8px;">관리자 메모: ${escapeMultiline(details.adminNote)}</p>`
           : ''
       }
       ${
         details.guest
           ? '<p>이후 안내도 이 이메일로 보내드립니다.</p>'
           : cta(dashboardUrl(), '내 요청 확인하기')
       }`
    ),
  });
};
