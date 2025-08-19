import React, { useMemo, useRef, useState } from 'react';

// Controlled TagInput that displays a comma-separated string as chips
// Props: value (string), onChange (string => void), placeholder?
export default function TagInput({ value = '', onChange, placeholder = '' }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const tags = useMemo(() => (value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean), [value]);

  const commitDraft = () => {
    const next = draft.trim();
    if (!next) return;
    const nextTags = Array.from(new Set([...tags, next]));
    onChange?.(nextTags.join(', '));
    setDraft('');
  };

  const removeTag = (idx) => {
    const nextTags = tags.filter((_, i) => i !== idx);
    onChange?.(nextTags.join(', '));
    // keep focus for fast editing
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Backspace' && draft.length === 0 && tags.length > 0) {
      // quick remove last
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  };

  const normalizeOnBlur = () => {
    if (draft.trim()) commitDraft();
  };

  return (
    <div className="p-2 border rounded flex flex-wrap items-center gap-2 bg-white dark:bg-gray-900">
      {tags.map((t, i) => (
        <span key={`${t}-${i}`} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-sm">
          {t}
          <button type="button" onClick={() => removeTag(i)} className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e)=>setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={normalizeOnBlur}
        placeholder={tags.length ? '' : placeholder}
        className="flex-1 min-w-[8rem] outline-none bg-transparent"
      />
    </div>
  );
}
