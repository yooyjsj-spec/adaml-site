import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Paperclip, X } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { ko } from '../i18n/messages';
import { resendVerification } from '../api/auth';
import { createAnalysisRequest, myAnalysisRequests, REQUEST_ATTACHMENT_LIMIT_BYTES } from '../api/requests';
import { AnalysisPurpose, ANALYSIS_PURPOSES, AnalysisRequestItem, AnalysisRequestStatus, formatAnalysisPurpose } from '../types';
import { TwoFactorSettings } from './TwoFactorSettings';

const statusColor: Record<AnalysisRequestStatus, string> = {
  SUBMITTED: 'bg-slate-100 text-slate-700',
  IN_REVIEW: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

const MAX_REQUEST_FILES = 10;

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const emptyForm = { title: '', category: '', sampleInfo: '', description: '', email: '', name: '', affiliation: '', phone: '', attachmentLink: '' };

const fieldStyles = {
  default: {
    form: 'space-y-4 rounded-3xl bg-white p-8 shadow-soft border border-gray-100 mb-12',
    title: 'text-xl font-serif font-bold text-slate-900 mb-1',
    subtitle: 'text-sm text-slate-500 mb-4',
    notice: 'rounded-2xl border border-primary-100 bg-primary-50 px-4 py-4 text-sm text-slate-700 space-y-2',
    noticeLink: 'font-bold text-primary-700 hover:underline',
    label: 'text-xs font-bold uppercase tracking-wide text-slate-500',
    hint: 'mt-1 text-xs text-slate-500',
    checkGroup: 'mt-2 flex flex-wrap gap-x-4 gap-y-2',
    checkLabel: 'inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer',
    checkbox: 'h-4 w-4 border-slate-300 text-primary-700 accent-primary-700',
    input: 'mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400',
    textarea: 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
    file: 'mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-primary-800 hover:file:bg-primary-100',
    fileRow: 'flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm',
    fileText: 'flex min-w-0 items-center gap-2 text-slate-700',
    fileMeta: 'shrink-0 text-xs text-slate-400',
    fileRemove: 'shrink-0 rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700',
    empty: 'mt-2 text-xs text-slate-400',
    overLimit: 'mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900',
    fileError: 'mt-2 text-xs text-red-600',
    success: 'rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800',
    error: 'rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700',
    submit: 'w-full h-11 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 disabled:opacity-60',
    verify: 'rounded-3xl bg-amber-50 border border-amber-200 p-8 text-center text-amber-900 mb-12 space-y-3',
    verifyNote: 'text-xs text-amber-700',
    verifyButton: 'rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-60',
    manage: 'mb-8 text-sm text-slate-500',
    manageLink: 'font-bold text-primary-700 hover:underline',
  },
  glass: {
    form: 'space-y-3 rounded-3xl border border-white/20 bg-white/[0.1] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl backdrop-saturate-50 scheme-dark',
    title: 'text-lg font-serif font-bold text-white mb-1',
    subtitle: 'text-xs text-white/70 mb-3',
    notice: 'rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-xs text-white/80 space-y-1.5',
    noticeLink: 'font-bold text-white hover:underline',
    label: 'text-[11px] font-bold uppercase tracking-wide text-white/70',
    hint: 'mt-1 text-[11px] leading-relaxed text-white/60',
    checkGroup: 'mt-2 flex flex-wrap gap-x-4 gap-y-2',
    checkLabel: 'inline-flex items-center gap-2 text-sm text-white/90 cursor-pointer',
    checkbox: 'h-4 w-4 border-white/30 bg-white/10 accent-primary-500',
    input:
      'mt-1 h-10 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/35',
    textarea:
      'mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/35',
    file: 'mt-2 block w-full text-xs text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/15 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/25',
    fileRow: 'flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm',
    fileText: 'flex min-w-0 items-center gap-2 text-white/90',
    fileMeta: 'shrink-0 text-xs text-white/50',
    fileRemove: 'shrink-0 rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white',
    empty: 'mt-2 text-xs text-white/45',
    overLimit: 'mt-3 rounded-xl border border-amber-200/30 bg-amber-400/15 px-3 py-2.5 text-xs text-amber-100',
    fileError: 'mt-2 text-xs text-red-200',
    success: 'rounded-xl border border-emerald-200/30 bg-emerald-400/15 px-3 py-2.5 text-xs text-emerald-100',
    error: 'rounded-xl border border-red-200/30 bg-red-400/15 px-3 py-2.5 text-xs text-red-100',
    submit: 'w-full h-10 rounded-xl bg-primary-600/90 text-white font-bold hover:bg-primary-600 disabled:opacity-60',
    verify: 'rounded-3xl border border-amber-200/30 bg-amber-400/15 p-6 text-center text-amber-50 space-y-3',
    verifyNote: 'text-xs text-amber-100/80',
    verifyButton: 'rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 disabled:opacity-60',
    manage: 'mt-3 text-sm text-white/70',
    manageLink: 'font-bold text-white hover:underline',
  },
} as const;

export const RequestPanel: React.FC<{
  showAccountTools?: boolean;
  variant?: 'default' | 'glass';
  collapsibleOnMobile?: boolean;
}> = ({ showAccountTools = true, variant = 'default', collapsibleOnMobile = false }) => {
  // Analysis Request는 사이트 언어 설정과 무관하게 항상 한국어로 표시합니다.
  const m = ko;
  const { ready, isLoggedIn, user } = useAdminAuth();
  const [form, setForm] = useState(emptyForm);
  const [purpose, setPurpose] = useState<AnalysisPurpose | ''>('');
  const [purposeOther, setPurposeOther] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<AnalysisRequestItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [overLimit, setOverLimit] = useState(false);
  const [fileMessage, setFileMessage] = useState('');
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMine = () => {
    setLoadingList(true);
    myAnalysisRequests()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    if (isLoggedIn) loadMine();
  }, [isLoggedIn]);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const selectPurpose = (value: AnalysisPurpose) => {
    setPurpose(value);
    if (value !== 'OTHER') setPurposeOther('');
  };

  const addFiles = (incoming: File[]) => {
    setOverLimit(false);
    setFileMessage('');
    if (files.length + incoming.length > MAX_REQUEST_FILES) {
      setFileMessage(m.request.attachmentsMaxFiles);
      return;
    }
    const next = [...files, ...incoming];
    const total = next.reduce((sum, file) => sum + file.size, 0);
    if (incoming.some((file) => file.size > REQUEST_ATTACHMENT_LIMIT_BYTES) || total > REQUEST_ATTACHMENT_LIMIT_BYTES) {
      setOverLimit(true);
      return;
    }
    setFiles(next);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!purpose) {
      setError(m.request.purposeRequired);
      return;
    }
    if (purpose === 'OTHER' && !purposeOther.trim()) {
      setError(m.request.purposeOtherRequired);
      return;
    }
    setSubmitting(true);
    try {
      const { email, name, affiliation, phone, attachmentLink, ...fields } = form;
      await createAnalysisRequest({
        ...(isLoggedIn ? fields : { ...fields, email, name, affiliation, phone }),
        purposes: [purpose],
        purposeOther: purpose === 'OTHER' ? purposeOther.trim() : undefined,
        attachmentLink: attachmentLink.trim() || undefined,
        files,
      });
      setForm(emptyForm);
      setPurpose('');
      setPurposeOther('');
      setFiles([]);
      setOverLimit(false);
      setFileMessage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccess(m.request.submitSuccess);
      if (isLoggedIn) loadMine();
    } catch (err) {
      setError(err instanceof Error ? err.message : m.request.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setResendMessage('');
    try {
      await resendVerification();
      setResendMessage(m.request.resendSent);
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : m.request.resendError);
    } finally {
      setResending(false);
    }
  };

  const locale = 'ko-KR';
  const s = fieldStyles[variant];
  const collapsed = collapsibleOnMobile && !expanded;

  if (!ready && showAccountTools) return null;

  const formFields = (
    <form
      onSubmit={submit}
      className={`${s.form} ${collapsed ? 'max-lg:overflow-hidden max-lg:pb-0 max-lg:border-b-0' : ''}`}
    >
      {variant === 'glass' && (
        <div>
          <h2 className={s.title}>{m.contact.requestTitle}</h2>
          <p className={s.subtitle}>{m.contact.requestSubtitle}</p>
        </div>
      )}
      {!isLoggedIn && (
        <div className={s.notice}>
          <p>{m.request.guestNotice}</p>
          <p>
            {m.request.loginNudge}{' '}
            <Link to="/login" className={s.noticeLink}>
              {m.request.login}
            </Link>
            {' · '}
            <Link to="/signup" className={s.noticeLink}>
              {m.request.signup}
            </Link>
          </p>
        </div>
      )}
      {!isLoggedIn && (
        <label className="block">
          <span className={s.label}>{m.request.emailLabel}</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            className={s.input}
            placeholder={m.request.emailPlaceholder}
          />
        </label>
      )}
      <div className={collapsed ? 'relative max-lg:max-h-[5.5rem] max-lg:overflow-hidden' : 'relative'}>
        <div className="space-y-3">
          <div className={!isLoggedIn && variant === 'glass' ? 'grid grid-cols-2 gap-3' : 'contents'}>
            {!isLoggedIn && (
              <label className="block">
                <span className={s.label}>{m.auth.name}</span>
                <input required autoComplete="name" value={form.name} onChange={update('name')} className={s.input} />
              </label>
            )}
            {!isLoggedIn && (
              <label className="block">
                <span className={s.label}>{m.request.affiliationLabel}</span>
                <input required autoComplete="organization" value={form.affiliation} onChange={update('affiliation')} className={s.input} />
              </label>
            )}
          </div>
          {!isLoggedIn && (
            <label className="block">
              <span className={s.label}>{m.auth.phone}</span>
              <input autoComplete="tel" value={form.phone} onChange={update('phone')} className={s.input} />
            </label>
          )}
          <label className="block">
            <span className={s.label}>{m.request.titleLabel}</span>
            <input required value={form.title} onChange={update('title')} className={s.input} placeholder={m.request.titlePlaceholder} />
          </label>
          <label className="block">
            <span className={s.label}>{m.request.categoryLabel}</span>
            <input value={form.category} onChange={update('category')} className={s.input} placeholder={m.request.categoryPlaceholder} />
          </label>
          <fieldset className="block min-w-0 border-0 p-0 m-0">
            <legend className={s.label}>{m.request.purposeLabel}</legend>
            <div className={s.checkGroup}>
              {ANALYSIS_PURPOSES.map((value) => (
                <label key={value} className={s.checkLabel}>
                  <input
                    type="radio"
                    name="analysisPurpose"
                    checked={purpose === value}
                    onChange={() => selectPurpose(value)}
                    className={s.checkbox}
                  />
                  {m.request.purpose[value]}
                </label>
              ))}
            </div>
            {purpose === 'OTHER' && (
              <input
                required
                value={purposeOther}
                onChange={(event) => setPurposeOther(event.target.value)}
                className={s.input}
                placeholder={m.request.purposeOtherPlaceholder}
              />
            )}
          </fieldset>
          <label className="block">
            <span className={s.label}>{m.request.sampleInfoLabel}</span>
            <textarea value={form.sampleInfo} onChange={update('sampleInfo')} rows={variant === 'glass' ? 1 : 2} className={s.textarea} placeholder={m.request.sampleInfoPlaceholder} />
          </label>
          <label className="block">
            <span className={s.label}>{m.request.descriptionLabel}</span>
            <textarea required value={form.description} onChange={update('description')} rows={variant === 'glass' ? 2 : 4} className={s.textarea} placeholder={m.request.descriptionPlaceholder} />
          </label>
          <div className="block">
            <span className={s.label}>{m.request.attachmentsLabel}</span>
            <p className={s.hint}>{m.request.attachmentsHint}</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className={s.file}
              onChange={(event) => {
                addFiles(Array.from(event.target.files ?? []));
                event.target.value = '';
              }}
            />
            {files.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <li key={`${file.name}-${file.size}-${index}`} className={s.fileRow}>
                    <span className={s.fileText}>
                      <Paperclip size={14} className="shrink-0 opacity-60" />
                      <span className="truncate">{file.name}</span>
                      <span className={s.fileMeta}>{formatBytes(file.size)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                      className={s.fileRemove}
                      aria-label={m.request.removeFile}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={s.empty}>{m.request.noFiles}</p>
            )}
            {overLimit && <p className={s.overLimit}>{m.request.attachmentsOverLimit}</p>}
            {fileMessage && <p className={s.fileError}>{fileMessage}</p>}
          </div>
          <label className="block">
            <span className={s.label}>{m.request.attachmentLinkLabel}</span>
            <input
              value={form.attachmentLink}
              onChange={update('attachmentLink')}
              className={s.input}
              placeholder={m.request.attachmentLinkPlaceholder}
            />
          </label>
          {success && <p className={s.success}>{success}</p>}
          {error && <p className={s.error}>{error}</p>}
          <button disabled={submitting} className={s.submit}>
            {submitting ? m.request.submitting : m.request.submit}
          </button>
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="absolute inset-0 z-10 hidden max-lg:block"
            aria-expanded={false}
            aria-label={m.request.expandForm}
          >
            <span
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(26,20,22,0) 0%, rgba(26,20,22,0.18) 28%, rgba(26,20,22,0.72) 68%, rgba(26,20,22,0.96) 100%)',
              }}
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center text-white/50">
              <ChevronDown className="h-5 w-5" />
            </span>
          </button>
        )}
      </div>
    </form>
  );

  return (
    <div>
      {!isLoggedIn ? (
        formFields
      ) : !user?.emailVerified ? (
        <div className={s.verify}>
          <p>{m.request.verifyPrompt}</p>
          <p className={s.verifyNote}>{m.auth.spamNote}</p>
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className={s.verifyButton}
          >
            {resending ? m.request.resendSending : m.request.resendButton}
          </button>
          {resendMessage && <p className="text-xs text-amber-800">{resendMessage}</p>}
        </div>
      ) : (
        formFields
      )}

      {isLoggedIn && !showAccountTools && (
        <p className={s.manage}>
          <Link to="/dashboard" className={s.manageLink}>
            {m.request.manageInDashboard}
          </Link>
        </p>
      )}

      {showAccountTools && isLoggedIn && <TwoFactorSettings />}

      {showAccountTools && isLoggedIn && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">{m.request.myRequests}</h3>
          {loadingList ? (
            <p className="text-sm text-gray-400">{m.request.loadingList}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-400">{m.request.noRequests}</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      {item.category && <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>}
                  {item.purposes && item.purposes.length > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {m.request.purposeLabel}: {formatAnalysisPurpose(item.purposes, item.purposeOther, m.request.purpose)}
                    </p>
                  )}
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusColor[item.status]}`}>
                      {m.request.status[item.status]}
                    </span>
                  </div>
                  {item.sampleInfo && (
                    <p className="mt-2 text-xs text-slate-500 whitespace-pre-line">
                      {m.request.sampleInfoLabel}: {item.sampleInfo}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">{item.description}</p>
                  {item.attachments && item.attachments.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {item.attachments.map((attachment) =>
                        attachment.kind === 'link' ? (
                          <li key={attachment.url}>
                            <a href={attachment.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary-700 hover:underline">
                              {attachment.url}
                            </a>
                          </li>
                        ) : (
                          <li key={attachment.fileName}>
                            <a
                              href={`/api/analysis-requests/${item.id}/files/${encodeURIComponent(attachment.fileName)}`}
                              className="text-xs font-bold text-primary-700 hover:underline"
                            >
                              {attachment.originalName}
                            </a>
                            <span className="ml-2 text-xs text-slate-400">{formatBytes(attachment.size)}</span>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                  {item.adminNote && (
                    <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      {m.request.adminNote}: {item.adminNote}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-slate-400">
                    {m.request.submittedOn} {new Date(item.createdAt).toLocaleDateString(locale)}
                    {item.assignee?.name && ` · ${m.request.assignedTo} ${item.assignee.name}`}
                    {item.dueDate && ` · ${m.request.dueDate} ${new Date(item.dueDate).toLocaleDateString(locale)}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
