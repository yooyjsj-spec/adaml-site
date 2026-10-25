import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useI18n } from '../i18n';
import { RequestPanel } from '../components/RequestPanel';
import { AdminRequestsPanel } from './admin/AdminRequestsPanel';
import { AdminUsersPanel } from './admin/AdminUsersPanel';

type Tab = 'requests' | 'manage' | 'users';

export const Dashboard: React.FC = () => {
  const { ready, isLoggedIn, isAdmin, isStaff, signOut } = useAdminAuth();
  const { m } = useI18n();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('requests');

  useEffect(() => {
    if (ready && !isLoggedIn) navigate('/login');
  }, [ready, isLoggedIn, navigate]);

  if (!ready || !isLoggedIn) return null;

  const tabs: { id: Tab; label: string }[] = [
    // Submitting requests is a MEMBER-only action — staff/admin manage requests instead.
    ...(!isStaff ? [{ id: 'requests' as Tab, label: m.dashboard.tabRequests }] : []),
    ...(isStaff ? [{ id: 'manage' as Tab, label: m.dashboard.tabManage }] : []),
    ...(isAdmin ? [{ id: 'users' as Tab, label: m.dashboard.tabUsers }] : []),
  ];
  const activeTab = tabs.some((t) => t.id === tab) ? tab : tabs[0]?.id;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">{m.dashboard.title}</h1>

        <div className="mb-8 inline-flex flex-wrap rounded-xl bg-slate-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${activeTab === t.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'requests' && !isStaff && <RequestPanel />}
        {activeTab === 'manage' && isStaff && <AdminRequestsPanel />}
        {activeTab === 'users' && isAdmin && <AdminUsersPanel />}

        <div className="mt-16 flex justify-end border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-red-700"
          >
            <LogOut size={16} /> {m.nav.logout}
          </button>
        </div>
      </div>
    </Layout>
  );
};
