import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { login, verifyOtp } from '../api/auth';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useI18n } from '../i18n';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { refresh } = useAdminAuth();
  const { m } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const afterLogin = async () => {
    await refresh();
    navigate('/dashboard');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (challengeId) {
        await verifyOtp(challengeId, otp);
        await afterLogin();
        return;
      }
      const result = await login(email, password);
      if ('requiresOtp' in result) {
        setChallengeId(result.challengeId);
        return;
      }
      await afterLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : challengeId ? m.auth.otpError : m.auth.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md px-6 py-20">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2 text-center">{m.auth.loginTitle}</h1>
        <p className="text-sm text-gray-500 mb-8 text-center">{challengeId ? m.auth.otpHint : m.auth.loginSubtitle}</p>
        <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-8 shadow-soft border border-gray-100">
          {!challengeId ? (
            <>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.auth.loginIdentifier}</span>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  autoComplete="username"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.auth.password}</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  autoComplete="current-password"
                />
              </label>
            </>
          ) : (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.auth.otpLabel}</span>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm tracking-widest"
                autoComplete="one-time-code"
              />
            </label>
          )}
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="w-full h-11 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 disabled:opacity-60">
            {loading ? m.auth.loggingIn : challengeId ? m.auth.otpButton : m.auth.loginButton}
          </button>
          {!challengeId && (
            <p className="text-center text-sm text-gray-500">
              {m.auth.noAccount} <Link to="/signup" className="font-bold text-primary-700 hover:underline">{m.auth.signupLink}</Link>
            </p>
          )}
        </form>
      </div>
    </Layout>
  );
};
