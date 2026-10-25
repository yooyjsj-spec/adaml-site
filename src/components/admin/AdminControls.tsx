import React, { useEffect, useState } from 'react';
import { ImagePlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useAdminAuth } from '../../auth/AdminAuthContext';
import { uploadMedia } from '../../api/admin';

export type EditorField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'number' | 'csv' | 'lines';
  options?: string[];
  placeholder?: string;
};

export const AdminActions: React.FC<{
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}> = ({ onEdit, onDelete, className = '' }) => {
  const { isAdmin } = useAdminAuth();
  if (!isAdmin) return null;

  return (
    <div className={`absolute top-3 right-3 z-20 flex gap-1 ${className}`} onClick={(event) => event.stopPropagation()}>
      {onEdit && (
        <button type="button" onClick={onEdit} className="inline-flex h-8 items-center gap-1 rounded-lg bg-white/95 px-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-primary-50 hover:text-primary-700">
          <Pencil size={13} /> 편집
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className="inline-flex h-8 items-center rounded-lg bg-white/95 px-2 text-red-600 shadow-sm ring-1 ring-red-200 hover:bg-red-50">
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
};

export const AdminAddButton: React.FC<{
  label?: string;
  onClick: () => void;
}> = ({ label = '추가', onClick }) => {
  const { isAdmin } = useAdminAuth();
  if (!isAdmin) return null;
  return (
    <button type="button" onClick={onClick} className="inline-flex h-9 items-center gap-1 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white hover:bg-primary-700">
      <Plus size={14} /> {label}
    </button>
  );
};

interface AdminEditorModalProps {
  open: boolean;
  title: string;
  fields: EditorField[];
  initial?: Record<string, unknown>;
  onClose: () => void;
  onSave: (values: Record<string, unknown>) => Promise<void>;
}

const toInputValue = (field: EditorField, value: unknown) => {
  if (field.type === 'csv' && Array.isArray(value)) return value.join(', ');
  if (field.type === 'lines' && Array.isArray(value)) return value.join('\n');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return value == null ? '' : String(value);
};

export const AdminEditorModal: React.FC<AdminEditorModalProps> = ({ open, title, fields, initial, onClose, onSave }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next: Record<string, string> = {};
    for (const field of fields) {
      next[field.key] = toInputValue(field, initial?.[field.key]);
    }
    setValues(next);
    setError('');
  }, [open, fields, initial]);

  if (!open) return null;

  const parseValues = () => {
    const payload: Record<string, unknown> = { ...initial };
    for (const field of fields) {
      const raw = values[field.key] ?? '';
      if (field.type === 'csv') payload[field.key] = raw.split(',').map((item) => item.trim()).filter(Boolean);
      else if (field.type === 'lines') payload[field.key] = raw.split('\n').map((item) => item.trim()).filter(Boolean);
      else if (field.type === 'number') payload[field.key] = Number(raw || 0);
      else payload[field.key] = raw;
    }
    return payload;
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(parseValues());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file?: File) => {
    if (!file) return;
    try {
      const media = await uploadMedia(file);
      setValues((prev) => ({ ...prev, image: media.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <form onSubmit={save} onClick={(event) => event.stopPropagation()} className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-4 overflow-y-auto px-6 py-5">
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">{field.label}</span>
              {field.type === 'select' ? (
                <select
                  value={values[field.key] ?? ''}
                  onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                >
                  {field.options?.map((option) => <option key={option}>{option}</option>)}
                </select>
              ) : field.type === 'textarea' || field.type === 'lines' ? (
                <textarea
                  value={values[field.key] ?? ''}
                  placeholder={field.placeholder}
                  rows={field.type === 'lines' ? 4 : 3}
                  onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={values[field.key] ?? ''}
                  placeholder={field.placeholder}
                  onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                />
              )}
            </label>
          ))}
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            <ImagePlus size={16} /> 이미지 업로드
            <input type="file" accept="image/*" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
          </label>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="h-11 rounded-xl px-4 text-sm font-bold text-slate-500 hover:bg-slate-50">취소</button>
          <button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50">
            <Save size={16} /> 저장
          </button>
        </div>
      </form>
    </div>
  );
};

export const confirmDelete = (label: string) => window.confirm(`"${label}" 항목을 삭제할까요?`);
