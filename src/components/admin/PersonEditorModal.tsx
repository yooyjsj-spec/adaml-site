import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Camera,
  ChevronDown,
  ChevronUp,
  Cpu,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { uploadMedia } from '../../api/admin';
import { ASSETS } from '../../data/assets';
import { useI18n } from '../../i18n';
import { Person, PersonRole } from '../../types';

export type EducationDraft = { key: string; year: string; degree: string; loc: string };
export type ExperienceDraft = { key: string; year: string; role: string; loc: string };

export type PersonEditorDraft = {
  name: string;
  email: string;
  role: PersonRole;
  title: string;
  affiliation: string;
  location: string;
  phone: string;
  research: string;
  equipment: string[];
  image: string;
  education: EducationDraft[];
  experience: ExperienceDraft[];
  sortOrder: number;
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const newKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const asText = (value: unknown) => (value == null ? '' : String(value));

const toEducation = (items?: Array<Record<string, unknown>>): EducationDraft[] =>
  (items ?? []).map((item) => ({
    key: newKey(),
    year: asText(item.year),
    degree: asText(item.degree),
    loc: asText(item.loc),
  }));

const toExperience = (items?: Array<Record<string, unknown>>): ExperienceDraft[] =>
  (items ?? []).map((item) => ({
    key: newKey(),
    year: asText(item.year),
    role: asText(item.role),
    loc: asText(item.loc),
  }));

const ghostClass =
  'w-full rounded-lg bg-transparent px-1.5 py-1 outline-none transition-shadow placeholder:text-slate-300 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500';

const GhostField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  describedBy?: string;
  invalid?: boolean;
  autoFocus?: boolean;
}> = ({
  label,
  value,
  onChange,
  multiline,
  className = '',
  inputClassName = '',
  placeholder,
  type = 'text',
  required,
  autoComplete,
  describedBy,
  invalid,
  autoFocus,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!multiline) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [multiline, value]);

  return (
    <label className={`group relative block ${className}`}>
      <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400 transition-colors group-hover:text-slate-500 group-focus-within:text-primary-700">
        {label}
      </span>
      {multiline ? (
        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          required={required}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          className={`${ghostClass} resize-none overflow-hidden ${inputClassName}`}
        />
      ) : (
        <input
          type={type}
          value={value}
          required={required}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          className={`${ghostClass} ${inputClassName}`}
        />
      )}
    </label>
  );
};

const ImagePicker: React.FC<{
  value: string;
  fallback: string;
  alt: string;
  onChange: (url: string) => void;
  onStatus: (message: string) => void;
  onError: (message: string) => void;
  variant: 'portrait' | 'card';
}> = ({ value, fallback, alt, onChange, onStatus, onError, variant }) => {
  const { m, t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const hasPhoto = Boolean(value);
  const src = value || fallback;

  const pickFile = () => inputRef.current?.click();

  const uploadFile = async (file?: File) => {
    if (!file) return;
    if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onError(m.people.editor.imageTypeError);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onError(m.people.editor.imageSizeError);
      return;
    }
    setUploading(true);
    onStatus(m.people.editor.imageUploading);
    try {
      const media = await uploadMedia(file);
      onChange(media.url);
      onStatus(m.people.editor.imageUploaded);
    } catch (err) {
      onError(err instanceof Error ? err.message : m.people.editor.imageTypeError);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 ${
        variant === 'portrait' ? 'aspect-[3/4] w-full rounded-2xl border-4 border-white shadow-lg' : 'h-full min-h-[10rem] w-full'
      }`}
      onDragEnter={(event) => {
        event.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        void uploadFile(event.dataTransfer.files?.[0]);
      }}
    >
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${uploading ? 'opacity-60' : ''}`}
      />
      <button
        type="button"
        onClick={pickFile}
        disabled={uploading}
        aria-label={hasPhoto ? m.people.editor.imageChange : m.people.editor.imageAdd}
        aria-busy={uploading}
        className={`group/photo absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/50 via-black/0 to-transparent p-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-80`}
      >
        <span
          className={
            variant === 'card'
              ? 'inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm ring-1 ring-black/5'
              : 'inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm ring-1 ring-black/5'
          }
        >
          <Camera size={variant === 'card' ? 16 : 14} aria-hidden="true" />
          {variant !== 'card' && (
            <span>{uploading ? m.people.editor.imageUploading : hasPhoto ? m.people.editor.imageChange : m.people.editor.imageAdd}</span>
          )}
        </span>
      </button>
      {hasPhoto && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onStatus(m.people.editor.imageRemove);
          }}
          className="absolute right-3 top-3 z-10 inline-flex h-8 items-center gap-1 rounded-lg bg-white/95 px-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 size={13} aria-hidden="true" />
          {m.people.editor.imageRemove}
        </button>
      )}
      {dragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-4 border-dashed border-primary-400 bg-primary-700/40 px-4 text-center text-sm font-bold text-white">
          {m.people.editor.imageDrop}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => void uploadFile(event.target.files?.[0])}
      />
      {uploading && <span className="sr-only">{t('people.editor.imageUploading')}</span>}
    </div>
  );
};

const EquipmentEditor: React.FC<{
  values: string[];
  onChange: (values: string[]) => void;
}> = ({ values, onChange }) => {
  const { m, t } = useI18n();
  const hintId = useId();
  const [draft, setDraft] = useState('');

  const addTags = (raw: string) => {
    const next = raw
      .split(/[,|\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => !values.includes(item));
    if (!next.length) return;
    onChange([...values, ...next]);
    setDraft('');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1">
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] text-slate-500"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== tag))}
              className="rounded p-0.5 hover:bg-slate-200 hover:text-slate-800"
              aria-label={t('people.editor.equipmentRemove', { name: tag })}
            >
              <X size={10} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              addTags(draft);
            } else if (event.key === 'Backspace' && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => {
            if (draft.trim()) addTags(draft);
          }}
          aria-label={m.people.editor.equipmentAdd}
          aria-describedby={hintId}
          placeholder={m.people.editor.equipmentAdd}
          className="min-w-[7rem] flex-1 bg-transparent px-1 py-0.5 text-xs outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-primary-500 rounded"
        />
      </div>
      <p id={hintId} className="mt-1 text-[11px] text-slate-400">
        {m.people.editor.equipmentHint}
      </p>
    </div>
  );
};

const ItemActions: React.FC<{
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
}> = ({ onUp, onDown, onRemove, disableUp, disableDown }) => {
  const { m } = useI18n();
  const btn = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30';
  return (
    <div className="flex shrink-0 flex-col gap-0.5 pt-4">
      <button type="button" className={btn} onClick={onUp} disabled={disableUp} aria-label={m.people.editor.moveUp}>
        <ChevronUp size={16} aria-hidden="true" />
      </button>
      <button type="button" className={btn} onClick={onDown} disabled={disableDown} aria-label={m.people.editor.moveDown}>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <button type="button" className={`${btn} hover:bg-red-50 hover:text-red-700`} onClick={onRemove} aria-label={m.people.editor.removeItem}>
        <Trash2 size={14} aria-hidden="true" />
      </button>
    </div>
  );
};

const moveItem = <T,>(items: T[], index: number, offset: number) => {
  const next = [...items];
  const target = index + offset;
  if (target < 0 || target >= next.length) return items;
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
};

interface PersonEditorModalProps {
  open: boolean;
  mode: 'professor' | 'student';
  person?: Person;
  defaultRole?: PersonRole;
  onClose: () => void;
  onSave: (values: PersonEditorDraft) => Promise<void>;
}

export const PersonEditorModal: React.FC<PersonEditorModalProps> = ({
  open,
  mode,
  person,
  defaultRole,
  onClose,
  onSave,
}) => {
  const { m, t } = useI18n();
  const titleId = useId();
  const hintId = useId();
  const errorId = useId();
  const dialogRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<PersonEditorDraft | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const roleOptions = useMemo(
    () =>
      [
        { value: 'PHD' as const, label: m.people.phdStudent },
        { value: 'MASTERS' as const, label: m.people.msStudent },
        { value: 'POST_PHD' as const, label: m.people.postPhdResearcher },
        { value: 'POST_MS' as const, label: m.people.postMsResearcher },
        { value: 'POST_BS' as const, label: m.people.postBsResearcher },
        { value: 'UNDERGRAD' as const, label: m.people.undergradResearcher },
        { value: 'ALUMNI' as const, label: m.people.alumni },
      ],
    [m]
  );

  useEffect(() => {
    if (!open) {
      setValues(null);
      return;
    }
    setError('');
    setStatus('');
    setValues({
      name: person?.name ?? '',
      email: asText(person?.email),
      role: mode === 'professor' ? 'PROFESSOR' : ((person?.role as PersonRole) || defaultRole || 'UNDERGRAD'),
      title: asText(person?.title),
      affiliation: asText(person?.affiliation),
      location: asText(person?.location),
      phone: asText(person?.phone),
      research: asText(person?.research),
      equipment: person?.equipment ?? [],
      image: asText(person?.image),
      education: toEducation(person?.education),
      experience: toExperience(person?.experience),
      sortOrder: Number(person?.sortOrder || 0),
    });
  }, [open, person, mode, defaultRole]);

  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirst = window.requestAnimationFrame(() => {
      const first = node?.querySelector<HTMLElement>('input:not([type="file"]), textarea, select');
      first?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.tabIndex !== -1 && !el.hasAttribute('disabled') && (el.offsetParent !== null || el.getClientRects().length > 0)
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFirst);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open || !values) return null;

  const patch = (partial: Partial<PersonEditorDraft>) => setValues((prev) => (prev ? { ...prev, ...partial } : prev));
  const isProfessor = mode === 'professor';
  const accentClass =
    values.role === 'PHD'
      ? { text: 'text-primary-700', dot: 'bg-primary-600' }
      : values.role === 'MASTERS'
        ? { text: 'text-gold-700', dot: 'bg-gold-500' }
        : values.role === 'POST_PHD'
          ? { text: 'text-violet-700', dot: 'bg-violet-600' }
          : values.role === 'POST_MS'
            ? { text: 'text-amber-700', dot: 'bg-amber-500' }
            : values.role === 'POST_BS'
              ? { text: 'text-teal-700', dot: 'bg-teal-600' }
              : { text: 'text-slate-500', dot: 'bg-slate-400' };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.name.trim()) {
      setError(m.people.editor.nameRequired);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...values,
        name: values.name.trim(),
        education: values.education.filter((item) => item.year.trim() || item.degree.trim() || item.loc.trim()),
        experience: values.experience.filter((item) => item.year.trim() || item.role.trim() || item.loc.trim()),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : m.people.editor.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />
      <form
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hintId}
        noValidate
        onSubmit={submit}
        className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ${
          isProfessor ? 'max-w-6xl' : 'max-w-3xl'
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 id={titleId} className="text-xl font-black text-slate-900">
              {person?.id ? m.people.editor.editTitle : m.people.editor.addTitle}
            </h2>
            <p id={hintId} className="mt-1 text-sm text-slate-500">
              {m.people.editor.hint}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={m.people.editor.close}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {isProfessor ? (
            <div className="flex flex-col gap-10 xl:flex-row">
              <div className="flex w-full flex-col items-center text-center xl:sticky xl:top-0 xl:w-1/3 xl:self-start">
                <div className="mb-6 w-full">
                  <ImagePicker
                    value={values.image}
                    fallback={ASSETS.PEOPLE.PROFESSOR}
                    alt={values.name || m.people.editor.name}
                    variant="portrait"
                    onChange={(image) => patch({ image })}
                    onStatus={setStatus}
                    onError={setError}
                  />
                </div>
                <GhostField
                  label={m.people.editor.name}
                  value={values.name}
                  required
                  autoFocus
                  invalid={Boolean(error) && !values.name.trim()}
                  describedBy={error ? errorId : undefined}
                  onChange={(name) => patch({ name })}
                  placeholder={m.people.editor.name}
                  inputClassName="text-center text-3xl font-serif font-bold text-slate-900"
                />
                <GhostField
                  label={m.people.editor.titleField}
                  value={values.title}
                  onChange={(title) => patch({ title })}
                  placeholder={m.people.professorFallback}
                  inputClassName="text-center text-sm font-bold uppercase tracking-widest text-primary-700"
                />
                <GhostField
                  label={m.people.editor.affiliation}
                  value={values.affiliation}
                  multiline
                  onChange={(affiliation) => patch({ affiliation })}
                  placeholder={m.people.affiliation}
                  inputClassName="text-center text-xs leading-relaxed text-gray-500"
                />
                <div className="mt-4 w-full space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-left">
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <Building2 className="mt-2 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                    <GhostField
                      label={m.people.editor.location}
                      value={values.location}
                      multiline
                      onChange={(location) => patch({ location })}
                      placeholder={m.people.locationFallback}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                    <GhostField
                      label={m.people.editor.phone}
                      value={values.phone}
                      type="tel"
                      autoComplete="tel"
                      onChange={(phone) => patch({ phone })}
                      placeholder="+82-54-279-XXXX"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                    <GhostField
                      label={m.people.editor.email}
                      value={values.email}
                      type="email"
                      autoComplete="email"
                      onChange={(email) => patch({ email })}
                      placeholder="name@postech.ac.kr"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full min-w-0 space-y-10 xl:w-2/3">
                <section>
                  <div className="mb-6 flex flex-wrap items-center gap-2 border-b-2 border-primary-200 pb-2">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                      <GraduationCap className="text-primary-600" aria-hidden="true" /> {m.people.education}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        patch({ education: [...values.education, { key: newKey(), year: '', degree: '', loc: '' }] })
                      }
                      className="ml-auto inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold text-primary-700 hover:bg-primary-50"
                    >
                      <Plus size={14} aria-hidden="true" /> {m.people.editor.educationAdd}
                    </button>
                  </div>
                  {values.education.length ? (
                    <ol className="ml-2 space-y-6 border-l-2 border-slate-200 pl-4">
                      {values.education.map((item, index) => (
                        <li key={item.key} className="group relative flex gap-2 pl-6">
                          <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500" aria-hidden="true" />
                          <div className="min-w-0 flex-1" role="group" aria-label={t('people.editor.educationItem', { n: index + 1 })}>
                            <GhostField
                              label={m.people.editor.year}
                              value={item.year}
                              onChange={(year) =>
                                patch({
                                  education: values.education.map((row) => (row.key === item.key ? { ...row, year } : row)),
                                })
                              }
                              placeholder="2007 – 2011"
                              inputClassName="text-sm font-bold text-primary-700"
                            />
                            <GhostField
                              label={m.people.editor.degree}
                              value={item.degree}
                              multiline
                              onChange={(degree) =>
                                patch({
                                  education: values.education.map((row) => (row.key === item.key ? { ...row, degree } : row)),
                                })
                              }
                              placeholder="Ph.D. in Materials Science and Engineering"
                              inputClassName="text-lg font-semibold text-slate-900"
                            />
                            <GhostField
                              label={m.people.editor.loc}
                              value={item.loc}
                              multiline
                              onChange={(loc) =>
                                patch({
                                  education: values.education.map((row) => (row.key === item.key ? { ...row, loc } : row)),
                                })
                              }
                              placeholder="POSTECH, Pohang"
                              inputClassName="text-slate-500"
                            />
                          </div>
                          <ItemActions
                            disableUp={index === 0}
                            disableDown={index === values.education.length - 1}
                            onUp={() => patch({ education: moveItem(values.education, index, -1) })}
                            onDown={() => patch({ education: moveItem(values.education, index, 1) })}
                            onRemove={() => patch({ education: values.education.filter((row) => row.key !== item.key) })}
                          />
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-slate-400">{m.people.editor.emptyEducation}</p>
                  )}
                </section>

                <section>
                  <div className="mb-6 flex flex-wrap items-center gap-2 border-b-2 border-primary-200 pb-2">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                      <Building2 className="text-primary-600" aria-hidden="true" /> {m.people.experience}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        patch({ experience: [...values.experience, { key: newKey(), year: '', role: '', loc: '' }] })
                      }
                      className="ml-auto inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold text-primary-700 hover:bg-primary-50"
                    >
                      <Plus size={14} aria-hidden="true" /> {m.people.editor.experienceAdd}
                    </button>
                  </div>
                  {values.experience.length ? (
                    <ol className="ml-2 space-y-6 border-l-2 border-slate-200 pl-4">
                      {values.experience.map((item, index) => (
                        <li key={item.key} className="group relative flex gap-2 pl-6">
                          <div
                            className={`absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white ${
                              index === 0 ? 'bg-primary-600 ring-4 ring-primary-100' : 'bg-slate-400'
                            }`}
                            aria-hidden="true"
                          />
                          <div className="min-w-0 flex-1" role="group" aria-label={t('people.editor.experienceItem', { n: index + 1 })}>
                            <GhostField
                              label={m.people.editor.year}
                              value={item.year}
                              onChange={(year) =>
                                patch({
                                  experience: values.experience.map((row) => (row.key === item.key ? { ...row, year } : row)),
                                })
                              }
                              placeholder="2026.09 – Present"
                              inputClassName={`text-sm font-bold ${index === 0 ? 'text-primary-700' : 'text-slate-500'}`}
                            />
                            <GhostField
                              label={m.people.editor.roleField}
                              value={item.role}
                              multiline
                              onChange={(role) =>
                                patch({
                                  experience: values.experience.map((row) => (row.key === item.key ? { ...row, role } : row)),
                                })
                              }
                              placeholder="Professor"
                              inputClassName="text-lg font-semibold text-slate-900"
                            />
                            <GhostField
                              label={m.people.editor.loc}
                              value={item.loc}
                              multiline
                              onChange={(loc) =>
                                patch({
                                  experience: values.experience.map((row) => (row.key === item.key ? { ...row, loc } : row)),
                                })
                              }
                              placeholder="POSTECH"
                              inputClassName="text-slate-600"
                            />
                          </div>
                          <ItemActions
                            disableUp={index === 0}
                            disableDown={index === values.experience.length - 1}
                            onUp={() => patch({ experience: moveItem(values.experience, index, -1) })}
                            onDown={() => patch({ experience: moveItem(values.experience, index, 1) })}
                            onRemove={() => patch({ experience: values.experience.filter((row) => row.key !== item.key) })}
                          />
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-slate-400">{m.people.editor.emptyExperience}</p>
                  )}
                </section>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-soft">
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-40">
                  <ImagePicker
                    value={values.image}
                    fallback={ASSETS.PEOPLE.STUDENT_PLACEHOLDER}
                    alt={values.name || m.people.editor.name}
                    variant="card"
                    onChange={(image) => patch({ image })}
                    onStatus={setStatus}
                    onError={setError}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
                  <GhostField
                    label={m.people.editor.name}
                    value={values.name}
                    required
                    autoFocus
                    invalid={Boolean(error) && !values.name.trim()}
                    describedBy={error ? errorId : undefined}
                    onChange={(name) => patch({ name })}
                    placeholder={m.people.editor.name}
                    inputClassName="text-lg font-bold leading-tight text-slate-900"
                  />
                  <label className="mt-1 flex items-center gap-1">
                    <span className="sr-only">{m.people.editor.memberRole}</span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${accentClass.dot}`}
                      aria-hidden="true"
                    />
                    <select
                      value={values.role}
                      onChange={(event) => patch({ role: event.target.value as PersonRole })}
                      className={`rounded-md bg-transparent py-0.5 pr-6 text-[10px] font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-primary-500 ${accentClass.text}`}
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
                    <Cpu size={12} className="mt-2 shrink-0 text-slate-400" aria-hidden="true" />
                    <GhostField
                      label={m.people.editor.research}
                      value={values.research}
                      onChange={(research) => patch({ research })}
                      placeholder={m.people.editor.research}
                      className="flex-1"
                      inputClassName="font-medium"
                    />
                  </div>
                  <div className="mt-2">
                    <span className="sr-only">{m.people.editor.equipment}</span>
                    <EquipmentEditor values={values.equipment} onChange={(equipment) => patch({ equipment })} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                    <Mail size={12} aria-hidden="true" />
                    <GhostField
                      label={m.people.editor.email}
                      value={values.email}
                      type="email"
                      autoComplete="email"
                      onChange={(email) => patch({ email })}
                      placeholder="name@postech.ac.kr"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <details className="border-t border-slate-100 px-4 py-3">
                <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-slate-500">
                  {m.people.editor.adminOptions}
                </summary>
                <label className="mt-3 block max-w-xs">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.people.editor.sortOrder}</span>
                  <input
                    type="number"
                    value={values.sortOrder}
                    onChange={(event) => patch({ sortOrder: Number(event.target.value || 0) })}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  />
                </label>
              </details>
            </div>
          )}

          <div aria-live="polite" className="sr-only">
            {status}
          </div>
          {error && (
            <p id={errorId} role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl px-4 text-sm font-bold text-slate-500 hover:bg-slate-50"
          >
            {m.people.editor.cancel}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Save size={16} aria-hidden="true" />
            {saving ? m.people.editor.saving : m.people.editor.save}
          </button>
        </div>
      </form>
    </div>
  );
};
