import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useI18n } from '../i18n';
import { resendVerification } from '../api/auth';
import { createAnalysisRequest, myAnalysisRequests } from '../api/requests';
import { AnalysisRequestItem, AnalysisRequestStatus } from '../types';
import { TwoFactorSettings } from './TwoFactorSettings';

const statusColor: Record<AnalysisRequestStatus, string> = {
  SUBMITTED: 'bg-slate-100 text-slate-700',
  IN_REVIEW: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

const emptyForm = { title: '', category: '', sampleInfo: '', description: '', email: '', name: '', affiliation: '', phone: '' };

export const RequestPanel: React.FC<{ showAccountTools?: boolean }> = ({ showAccountTools = true }) => {
  const { m } = useI18n();
  const { ready, isLoggedIn, user } = useAdminAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<AnalysisRequestItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const { email, name, affiliation, phone, ...fields } = form;
      await createAnalysisRequest(isLoggedIn ? fields : { ...fields, email, name, affiliation, phone });
      setForm(emptyForm);
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

  const locale = document.documentElement.lang === 'en' ? 'en-US' : 'ko-KR';

  if (!ready && showAccountTools) return null;

  const formFields = (
    <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-8 shadow-soft border border-gray-100 mb-12">
      {!isLoggedIn && (
        <div className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-4 text-sm text-slate-700 space-y-2">
          <p>{m.request.guestNotice}</p>
          <p>
            {m.request.loginNudge}{' '}
            <Link to="/login" className="font-bold text-primary-700 hover:underline">
              {m.request.login}
            </Link>
            {' · '}
            <Link to="/signup" className="font-bold text-primary-700 hover:underline">
              {m.request.signup}
            </Link>
          </p>
        </div>
      )}
      {!isLoggedIn && (
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.request.emailLabel}</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
            placeholder={m.request.emailPlaceholder}
          />
        </label>
      )}
      {!isLoggedIn && (
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.auth.name}</span>
          <input
            required
            autoComplete="name"
            value={form.name}
            onChange={update('name')}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
      )}
      {!isLoggedIn && (
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.auth.affiliation}</span>
          <input
            autoComplete="organization"
            value={form.affiliation}
            onChange={update('affiliation')}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
      )}
      {!isLoggedIn && (
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.auth.phone}</span>
          <input
            autoComplete="tel"
            value={form.phone}
            onChange={update('phone')}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
      )}
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.request.titleLabel}</span>
        <input required value={form.title} onChange={update('title')} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder={m.request.titlePlaceholder} />
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.request.categoryLabel}</span>
        <input value={form.category} onChange={update('category')} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder={m.request.categoryPlaceholder} />
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.request.sampleInfoLabel}</span>
        <textarea value={form.sampleInfo} onChange={update('sampleInfo')} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder={m.request.sampleInfoPlaceholder} />
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.request.descriptionLabel}</span>
        <textarea required value={form.description} onChange={update('description')} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder={m.request.descriptionPlaceholder} />
      </label>
      {success && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button disabled={submitting} className="w-full h-11 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 disabled:opacity-60">
        {submitting ? m.request.submitting : m.request.submit}
      </button>
    </form>
  );

  return (
    <div>
      {!isLoggedIn ? (
        formFields
      ) : !user?.emailVerified ? (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-8 text-center text-amber-900 mb-12 space-y-3">
          <p>{m.request.verifyPrompt}</p>
          <p className="text-xs text-amber-700">{m.auth.spamNote}</p>
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
          >
            {resending ? m.request.resendSending : m.request.resendButton}
          </button>
          {resendMessage && <p className="text-xs text-amber-800">{resendMessage}</p>}
        </div>
      ) : (
        formFields
      )}

      {isLoggedIn && !showAccountTools && (
        <p className="mb-8 text-sm text-slate-500">
          <Link to="/dashboard" className="font-bold text-primary-700 hover:underline">
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
