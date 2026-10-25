import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { signup } from '../api/auth';
import { useI18n } from '../i18n';

export const SignUp: React.FC = () => {
  const { m, t } = useI18n();
  const [form, setForm] = useState({ email: '', password: '', name: '', affiliation: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : m.auth.signupError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md px-6 py-20">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2 text-center">{m.auth.signupTitle}</h1>
        <p className="text-sm text-gray-500 mb-8 text-center">{m.auth.signupSubtitle}</p>

        {done ? (
          <div className="rounded-3xl bg-white p-8 shadow-soft border border-gray-100 text-center space-y-3">
            <p className="text-lg font-bold text-slate-900">{m.auth.signupDoneTitle}</p>
            <p className="text-sm text-gray-500">{t('auth.signupDoneBody', { email: form.email })}</p>
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">{m.auth.spamNote}</p>
            <Link to="/login" className="inline-block mt-4 font-bold text-primary-700 hover:underline">{m.auth.goToLogin}</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-8 shadow-soft border border-gray-100">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.auth.name}</span>
              <input required value={form.name} onChange={update('name')} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.auth.email}</span>
              <input type="email" required value={form.email} onChange={update('email')} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" autoComplete="username" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.auth.passwordHint}</span>
              <input type="password" required minLength={8} value={form.password} onChange={update('password')} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" autoComplete="new-password" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.auth.affiliation}</span>
              <input value={form.affiliation} onChange={update('affiliation')} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.auth.phone}</span>
              <input value={form.phone} onChange={update('phone')} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" />
            </label>
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="w-full h-11 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 disabled:opacity-60">
              {loading ? m.auth.signingUp : m.auth.signupButton}
            </button>
            <p className="text-center text-sm text-gray-500">
              {m.auth.alreadyHaveAccount} <Link to="/login" className="font-bold text-primary-700 hover:underline">{m.auth.loginLink}</Link>
            </p>
          </form>
        )}
      </div>
    </Layout>
  );
};
