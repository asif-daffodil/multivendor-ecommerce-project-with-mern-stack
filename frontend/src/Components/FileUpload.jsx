import React, { useEffect, useMemo, useRef, useState } from 'react';

// A styled file upload with button UI and optional image previews
// Props:
// - label: string
// - multiple?: boolean
// - accept?: string (e.g. 'image/*')
// - onChange: (File[]|null) => void
// - helperText?: string
export default function FileUpload({ label = 'Upload', multiple = false, accept, onChange, helperText }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const previews = useMemo(() => {
    return files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
  }, [files]);

  useEffect(() => {
    return () => {
      // revoke on unmount
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const trigger = () => inputRef.current?.click();

  const handleChange = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
    onChange?.(multiple ? list : (list.length ? list : null));
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={trigger} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-800 text-white hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
          <span>📤</span>
          <span>{label}</span>
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {files.length === 0 ? 'No file selected' : (multiple ? `${files.length} file(s) selected` : files[0]?.name)}
        </span>
      </div>
      {helperText && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helperText}</div>}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
      />

      {/* Image previews */}
      {accept?.includes('image') && files.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {previews.map((p, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden bg-white dark:bg-gray-800">
              <img src={p.url} alt={p.file.name} className="w-full h-28 object-cover" />
              <div className="p-2 text-xs truncate">{p.file.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
