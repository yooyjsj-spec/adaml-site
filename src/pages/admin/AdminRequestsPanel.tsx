import React, { useEffect, useState } from 'react';
import { adminAnalysisRequests, assignableStaff } from '../../api/admin';
import { AnalysisRequestItem, AnalysisRequestStatus } from '../../types';
import { useI18n } from '../../i18n';
import { displayName } from '../../utils/displayName';

const statusLabel: Record<AnalysisRequestStatus, string> = {
  SUBMITTED: '접수됨',
  IN_REVIEW: '검토 중',
  IN_PROGRESS: '처리 중',
  COMPLETED: '완료',
  REJECTED: '반려',
  CANCELLED: '취소',
};

const statusOptions = Object.keys(statusLabel) as AnalysisRequestStatus[];

const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : '');

const DetailRow: React.FC<{ label: string; value?: string | null; multiline?: boolean }> = ({ label, value, multiline }) => (
  <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-slate-100 py-2 last:border-b-0 sm:grid-cols-[8rem_1fr]">
    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className={`text-sm text-slate-800 ${multiline ? 'whitespace-pre-line' : ''}`}>{value?.trim() ? value : '—'}</dd>
  </div>
);

const RequestRow: React.FC<{
  item: AnalysisRequestItem;
  staff: Array<{ id: string; name: string | null; email: string | null; username: string | null; role: string }>;
  onSaved: (item: AnalysisRequestItem) => void;
}> = ({ item, staff, onSaved }) => {
  const { m } = useI18n();
  const [status, setStatus] = useState(item.status);
  const [assigneeId, setAssigneeId] = useState(item.assigneeId ?? '');
  const [dueDate, setDueDate] = useState(toDateInput(item.dueDate));
  const [adminNote, setAdminNote] = useState(item.adminNote ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const dirty =
    status !== item.status || assigneeId !== (item.assigneeId ?? '') || dueDate !== toDateInput(item.dueDate) || adminNote !== (item.adminNote ?? '');

  const requesterEmail = item.requester?.email ?? item.guestEmail;
  const requesterName = item.requester?.name ?? item.guestName ?? (requesterEmail ? '비회원' : '알 수 없음');
  const requesterSummary = [requesterName, item.requester?.affiliation ?? item.guestAffiliation, requesterEmail]
    .filter((value, index, list) => Boolean(value) && list.indexOf(value) === index)
    .join(' · ');

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await adminAnalysisRequests.update(item.id, {
        status,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
        adminNote: adminNote || null,
      });
      onSaved(updated);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-3 text-left">
        <div>
          <p className="font-bold text-slate-900">{item.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {requesterSummary} · {new Date(item.createdAt).toLocaleString('ko-KR')}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{statusLabel[item.status]}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-5 border-t border-gray-100 pt-4">
          <section className="rounded-xl bg-slate-50 px-4 py-3">
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">요청자 정보</h3>
            <dl>
              <DetailRow label="이름" value={item.requester?.name ?? item.guestName} />
              <DetailRow label="이메일" value={item.requester?.email ?? item.guestEmail} />
              <DetailRow label="소속" value={item.requester?.affiliation ?? item.guestAffiliation} />
              <DetailRow label="연락처" value={item.requester?.phone ?? item.guestPhone} />
            </dl>
          </section>

          <section className="rounded-xl border border-slate-100 px-4 py-3">
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">요청 내용</h3>
            <dl>
              <DetailRow label="제목" value={item.title} />
              <DetailRow label="분석 종류" value={item.category} />
              <DetailRow label="시료 정보" value={item.sampleInfo} multiline />
              <DetailRow label="상세 내용" value={item.description} multiline />
              <DetailRow label="접수 일시" value={new Date(item.createdAt).toLocaleString('ko-KR')} />
            </dl>
          </section>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">상태</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as AnalysisRequestStatus)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm">
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {statusLabel[option]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">담당자</span>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm">
                <option value="">미배정</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {displayName(s, m.nav.adminLabel, '이름 없음')}
                    {s.email ? ` (${s.email})` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">처리 예정일</span>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm" />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">관리자 메모 (상태 변경 시 요청자 이메일에 포함됩니다)</span>
            <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

          <p className="text-xs text-slate-500">담당자를 지정하면 담당자에게, 상태를 변경하면 요청자에게 이메일이 발송됩니다.</p>

          <button
            type="button"
            disabled={!dirty || saving}
            onClick={save}
            className="rounded-xl bg-primary-700 px-4 py-2 text-sm font-bold text-white hover:bg-primary-800 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}
    </div>
  );
};

export const AdminRequestsPanel: React.FC = () => {
  const [items, setItems] = useState<AnalysisRequestItem[]>([]);
  const [staff, setStaff] = useState<Array<{ id: string; name: string | null; email: string | null; username: string | null; role: string }>>([]);
  const [statusFilter, setStatusFilter] = useState<AnalysisRequestStatus | ''>('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminAnalysisRequests
      .list(statusFilter ? { status: statusFilter } : {})
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    assignableStaff().then(setStaff).catch(() => setStaff([]));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          className={`rounded-full px-4 py-1.5 text-sm font-bold ${statusFilter === '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          전체
        </button>
        {statusOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatusFilter(option)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${statusFilter === option ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {statusLabel[option]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">해당 요청이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <RequestRow
              key={item.id}
              item={item}
              staff={staff}
              onSaved={(updated) => setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))}
            />
          ))}
        </div>
      )}
    </div>
  );
};
