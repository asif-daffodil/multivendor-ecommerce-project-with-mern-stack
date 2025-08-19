import React, { useEffect, useRef } from 'react';

const ToolbarButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2 py-1 text-sm rounded border mr-1 mb-1 transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
  >
    {children}
  </button>
);

const RichText = ({ value = '', onChange, placeholder = 'Write something…' }) => {
  const ref = useRef(null);

  // initialize content when value changes from outside
  useEffect(() => {
    if (ref.current && typeof value === 'string' && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    ref.current && ref.current.focus();
  };

  const onInput = () => {
    onChange?.(ref.current?.innerHTML || '');
  };

  const applyHeading = (level) => {
    // toggle heading by wrapping selection
    exec('formatBlock', 'H' + level);
  };

  return (
    <div className="border rounded">
      <div className="p-2 border-b bg-gray-50 dark:bg-gray-900 dark:border-gray-700 flex flex-wrap">
        <ToolbarButton active={false} onClick={() => exec('bold')}>B</ToolbarButton>
        <ToolbarButton active={false} onClick={() => exec('italic')}><em>I</em></ToolbarButton>
        <ToolbarButton active={false} onClick={() => exec('strikeThrough')}><s>S</s></ToolbarButton>
        <ToolbarButton active={false} onClick={() => applyHeading(1)}>H1</ToolbarButton>
        <ToolbarButton active={false} onClick={() => applyHeading(2)}>H2</ToolbarButton>
        <ToolbarButton active={false} onClick={() => applyHeading(3)}>H3</ToolbarButton>
        <ToolbarButton active={false} onClick={() => exec('insertUnorderedList')}>• List</ToolbarButton>
        <ToolbarButton active={false} onClick={() => exec('insertOrderedList')}>1. List</ToolbarButton>
        <ToolbarButton active={false} onClick={() => exec('formatBlock', 'BLOCKQUOTE')}>❝ Quote</ToolbarButton>
        <ToolbarButton active={false} onClick={() => exec('undo')}>Undo</ToolbarButton>
        <ToolbarButton active={false} onClick={() => exec('redo')}>Redo</ToolbarButton>
      </div>
      <div
        ref={ref}
        className="prose prose-sm max-w-none p-2 min-h-[160px] focus:outline-none dark:prose-invert bg-white dark:bg-gray-900"
        contentEditable
        onInput={onInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichText;
