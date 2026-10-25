import React, { useEffect, useState } from 'react';
import { adminUsers } from '../../api/admin';
import { ManagedUser, UserRoleName } from '../../types';

const roleLabel: Record<UserRoleName, string> = {
  MEMBER: '일반회원',
  STAFF: '연구원',
  ADMIN: '관리자',
};

export const AdminUsersPanel: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminUsers
      .list(q)
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : '목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRole = async (id: string, role: UserRoleName) => {
    setSavingId(id);
    setError('');
    try {
      const updated = await adminUsers.setRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : '권한 변경에 실패했습니다.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          load();
        }}
        className="mb-5 flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름 또는 이메일 검색"
          className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm"
        />
        <button className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-primary-700">검색</button>
      </form>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">이메일 / 아이디</th>
                <th className="px-4 py-3">소속</th>
                <th className="px-4 py-3">이메일 인증</th>
                <th className="px-4 py-3">권한</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email ?? u.username ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{u.affiliation ?? '-'}</td>
                  <td className="px-4 py-3">
                    {u.emailVerified ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">인증됨</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">미인증</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) => changeRole(u.id, e.target.value as UserRoleName)}
                      className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                    >
                      {(Object.keys(roleLabel) as UserRoleName[]).map((role) => (
                        <option key={role} value={role}>
                          {roleLabel[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    회원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
