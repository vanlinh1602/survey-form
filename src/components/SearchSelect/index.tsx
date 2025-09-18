import React, { useEffect, useMemo, useRef, useState } from 'react';

export type Option = { label: string; value: string };

type CreatableSearchSelectProps = {
  options: Option[];
  value: Option | null;
  onChange: (option: Option | null) => void;
  placeholder?: string;
  noOptionsText?: string;
  allowCreate?: boolean;
  onCreateOption?: (label: string) => Promise<Option> | Option;
  disabled?: boolean;
  className?: string;
  name?: string; // optional form integration
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function CreatableSearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Chọn một mục...',
  noOptionsText = 'Không có kết quả',
  allowCreate = false,
  onCreateOption,
  disabled = false,
  className = '',
  name,
}: CreatableSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [localOptions, setLocalOptions] = useState<Option[]>(options ?? []);
  const [highlight, setHighlight] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Keep local options in sync when props.options change
  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  // Close when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return localOptions ?? [];
    return (
      localOptions.filter((o) =>
        [o.label, o.value].some((t) => t.toLowerCase().includes(q))
      ) ?? []
    );
  }, [query, localOptions]);

  const existsExact = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return localOptions.some((o) => o.label.toLowerCase() === q);
  }, [query, localOptions]);

  const showCreate = allowCreate && query.trim() && !existsExact;

  useEffect(() => {
    // Reset highlight when list changes or opens
    setHighlight(filtered?.length ? 0 : showCreate ? 0 : -1);
  }, [open, query, filtered?.length, showCreate]);

  useEffect(() => {
    // Ensure highlighted item is visible
    if (!listRef.current || highlight < 0) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-index="${highlight}"]`
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlight]);

  async function handleCreate(label: string) {
    const base: Option = { label: label.trim(), value: slugify(label) };
    try {
      const created = onCreateOption ? await onCreateOption(label) : base;
      setLocalOptions((prev) => {
        const next = [...prev, created];
        return next;
      });
      onChange(created);
      setQuery('');
      setOpen(false);
    } catch {
      // Do nothing
    }
  }

  function handleSelect(opt: Option) {
    if (opt.value === value?.value) {
      onChange(null);
    } else {
      onChange(opt);
    }
    setOpen(false);
    setQuery('');
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen((o) => !o);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key.length === 1 || e.key === 'ArrowDown')) {
      setOpen(true);
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlight((h) => {
          const count = filtered.length + (showCreate ? 1 : 0);
          if (count === 0) return -1;
          return (h + 1 + count) % count;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlight((h) => {
          const count = filtered.length + (showCreate ? 1 : 0);
          if (count === 0) return -1;
          return (h - 1 + count) % count;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (highlight === -1) return;
        if (showCreate && highlight === 0) {
          handleCreate(query);
        } else {
          const idx = highlight - (showCreate ? 1 : 0);
          const opt = filtered[idx];
          if (opt) handleSelect(opt);
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
    }
  }

  return (
    <div
      ref={rootRef}
      className={
        'relative w-full max-w-md ' +
        (disabled ? 'opacity-60 cursor-not-allowed ' : '') +
        className
      }
      onKeyDown={onKeyDown}
    >
      {name && (
        // Hidden input for form submissions
        <input type="hidden" name={name} value={value?.value ?? ''} />
      )}

      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggleOpen}
        className={`flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-pink-500 ${
          open ? 'ring-2 ring-pink-500' : ''
        }`}
        disabled={disabled}
      >
        <span className="truncate text-left text-sm text-gray-800">
          {value ? (
            value.label
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 shrink-0 text-gray-500 transition ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Popup */}
      {open && (
        <div
          role="dialog"
          aria-label="Select options"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-xl"
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-4 w-4 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm hoặc thêm mới..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* List */}
          <ul
            ref={listRef}
            role="listbox"
            aria-activedescendant={
              highlight >= 0 ? `opt-${highlight}` : undefined
            }
            className="max-h-56 overflow-auto py-1"
          >
            {showCreate && (
              <li
                id={`opt-${0}`}
                data-index={0}
                role="option"
                aria-selected={highlight === 0}
                onMouseEnter={() => setHighlight(0)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleCreate(query)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                  highlight === 0 ? 'bg-pink-50 text-pink-700' : 'text-gray-700'
                }`}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border text-xs">
                  +
                </span>
                Thêm "{query.trim()}"
              </li>
            )}

            {filtered.length === 0 && !showCreate && (
              <li className="px-3 py-2 text-sm text-gray-500">
                {noOptionsText}
              </li>
            )}

            {filtered.map((opt, i) => {
              const idx = i + (showCreate ? 1 : 0);
              const selected = value?.value === opt.value;
              return (
                <li
                  key={opt.value}
                  id={`opt-${idx}`}
                  data-index={idx}
                  role="option"
                  aria-selected={highlight === idx}
                  onMouseEnter={() => setHighlight(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt)}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${
                    highlight === idx
                      ? 'bg-pink-50 text-pink-700'
                      : 'text-gray-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.42l2.293 2.293 6.793-6.793a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
