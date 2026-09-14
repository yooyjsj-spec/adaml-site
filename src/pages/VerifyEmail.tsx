import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { verifyEmail } from '../api/auth';
import { useI18n } from '../i18n';

export const VerifyEmail: React.FC = () => {
  const { m } = useI18n();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'ok' | 'error'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage(m.auth.verifyNoToken);
      return;
    }
    verifyEmail(token)
      .then(() => setStatus('ok'))
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : m.auth.verifyError);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <Layout>
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="rounded-3xl bg-white p-10 shadow-soft border border-gray-100">
          {status === 'pending' && <p className="text-gray-500">{m.auth.verifyPending}</p>}
          {status === 'ok' && (
            <>
              <p className="text-lg font-bold text-slate-900 mb-2">{m.auth.verifySuccess}</p>
              <Link to="/login" className="font-bold text-primary-700 hover:underline">{m.auth.verifySuccessLink}</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-lg font-bold text-red-700 mb-2">{m.auth.verifyFailedTitle}</p>
              <p className="text-sm text-gray-500">{message}</p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};
