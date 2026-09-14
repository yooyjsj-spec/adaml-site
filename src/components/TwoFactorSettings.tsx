import React, { useState } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { useI18n } from '../i18n';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { disableOtp } from '../api/admin';
import { AdminOtpSetupModal } from '../pages/admin/AdminOtpSetup';

export const TwoFactorSettings: React.FC = () => {
  const { m } = useI18n();
  const { user, refresh } = useAdminAuth();
  const [setupOpen, setSetupOpen] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user || user.role === 'ADMIN') return null;

  const submitDisable = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await disableOtp(password);
      setPassword('');
      setDisabling(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : m.auth.twoFactorDisableError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-full ${user.totpEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            {user.totpEnabled ? <ShieldCheck size={18} /> : <ShieldOff size={18} />}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{m.auth.twoFactorTitle}</p>
            <p className="text-xs text-slate-500">{m.auth.twoFactorHint}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.totpEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
            {user.totpEnabled ? m.auth.twoFactorEnabled : m.auth.twoFactorDisabled}
          </span>
          {user.totpEnabled ? (
            <button type="button" onClick={() => setDisabling((v) => !v)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
              {m.auth.twoFactorDisableButton}
            </button>
          ) : (
            <button type="button" onClick={() => setSetupOpen(true)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-700">
              {m.auth.twoFactorEnableButton}
            </button>
          )}
        </div>
      </div>

      {disabling && (
        <form onSubmit={submitDisable} className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
          <p className="w-full text-xs text-slate-500">{m.auth.twoFactorDisablePrompt}</p>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 flex-1 min-w-[160px] rounded-lg border border-slate-200 px-3 text-sm"
            autoComplete="current-password"
          />
          <button disabled={submitting} type="submit" className="h-9 rounded-lg bg-red-600 px-3 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
            {m.auth.twoFactorDisableSubmit}
          </button>
          <button type="button" onClick={() => { setDisabling(false); setError(''); }} className="h-9 rounded-lg px-3 text-xs font-bold text-slate-500 hover:bg-slate-50">
            {m.auth.twoFactorCancel}
          </button>
          {error && <p className="w-full text-xs text-red-700">{error}</p>}
        </form>
      )}

      <AdminOtpSetupModal
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        onComplete={async () => {
          await refresh();
          setSetupOpen(false);
        }}
      />
    </div>
  );
};
