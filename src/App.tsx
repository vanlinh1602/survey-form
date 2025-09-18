import React, { useEffect, useMemo, useRef, useState } from 'react';

// ---
// 📄 SCHEMA: copied from mn.json
// ---

type LeafType = 'string' | 'number';

type SchemaNode = {
  name: string;
  type?: LeafType;
  fields?: Record<string, SchemaNode>;
};

const SCHEMA: Record<string, SchemaNode> = {
  info: {
    name: 'Thông tin cơ bản',
    fields: {
      nhom: { name: 'NHÓM', type: 'string' },
      muc_do_tu_chi: {
        name: 'Mức độ tự chủ chi thường xuyên (%)',
        type: 'number',
      },
      du_toan_thu_2026: {
        name: 'Dự toán thu 2026 (DVT: triệu đồng)',
        type: 'number',
      },
      tong_so_nhom_lop: { name: 'Tổng số nhóm/lớp', type: 'number' },
    },
  },
  nhatre: {
    name: 'Trẻ nhà trẻ',
    fields: {
      tre_3_12: { name: 'Trẻ 3-12 tháng', type: 'number' },
      nhom_3_12: { name: 'Nhóm 3-12 tháng', type: 'number' },
      tre_13_24: { name: 'Trẻ 13-24 tháng', type: 'number' },
      nhom_13_24: { name: 'Nhóm 13-24 tháng', type: 'number' },
      tre_25_36: { name: 'Trẻ 25-36 tháng', type: 'number' },
      nhom_25_36: { name: 'Nhóm 25-36 tháng', type: 'number' },
    },
  },
  maugiao: {
    name: 'Trẻ mẫu giáo',
    fields: {
      '1b_ngay': {
        name: '1b/ngày',
        fields: {
          tre_3_4t: { name: 'Trẻ 3-4 tuổi', type: 'number' },
          lop_3_4t: { name: 'Lớp 3-4 tuổi', type: 'number' },
          tre_4_5t: { name: 'Trẻ 4-5 tuổi', type: 'number' },
          lop_4_5t: { name: 'Lớp 4-5 tuổi', type: 'number' },
          tre_5_6t: { name: 'Trẻ 5-6 tuổi', type: 'number' },
          lop_5_6t: { name: 'Lớp 5-6 tuổi', type: 'number' },
        },
      },
      tre_3_4t: { name: 'Trẻ 3-4 tuổi', type: 'number' },
      lop_3_4t: { name: 'Lớp 3-4 tuổi', type: 'number' },
      tre_4_5t: { name: 'Trẻ 4-5 tuổi', type: 'number' },
      lop_4_5t: { name: 'Lớp 4-5 tuổi', type: 'number' },
      tre_5_6t: { name: 'Trẻ 5-6 tuổi', type: 'number' },
      lop_5_6t: { name: 'Lớp 5-6 tuổi', type: 'number' },
    },
  },
  ts_CBGVNL_thong_tu: {
    name: 'Tổng số CB-GV-NV theo Thông tư',
    fields: {
      ts: { name: 'Tổng số', type: 'number' },
      bgh: { name: 'Ban Giám hiệu', type: 'number' },
      gv_nha_tre: { name: 'GV nhà trẻ', type: 'number' },
      gv_mau_giao: { name: 'GV mẫu giáo', type: 'number' },
      ke_toan_van_thu_thu_quy: {
        name: 'Kế toán, văn thư, thủ quỹ',
        type: 'number',
      },
    },
  },
  sl_lam_viec_2025: {
    name: 'Số lượng người làm việc được giao năm 2025',
    fields: {
      nsnn: {
        name: 'Số lượng người làm việc hưởng lương từ NSNN',
        type: 'number',
      },
      su_nghiep: {
        name: 'Số lượng người làm việc hưởng lương từ nguồn thu sự nghiệp',
        type: 'number',
      },
      hop_dong: { name: 'Hợp đồng chuyên môn nghiệp vụ', type: 'number' },
    },
  },
  ts_CBGVNL_co_mat_thang_8_2025: {
    name: 'Tổng số CB-GV-NV có mặt tháng 8/2025',
    fields: {
      vien_chuc: {
        name: 'Viên chức',
        fields: {
          ts: { name: 'Tổng số', type: 'number' },
          bgh: { name: 'Ban Giám hiệu', type: 'number' },
          gv_nha_tre: { name: 'GV nhà trẻ', type: 'number' },
          gv_mau_giao: { name: 'GV mẫu giáo', type: 'number' },
          ke_toan_van_thu_thu_quy: {
            name: 'Kế toán, văn thư, thủ quỹ',
            type: 'number',
          },
        },
      },
      hop_dong: { name: 'Hợp đồng chuyên môn nghiệp vụ', type: 'number' },
      hop_dong_ho_tro: { name: 'Hợp đồng hỗ trợ', type: 'number' },
    },
  },
  nhu_cau_2026: {
    name: 'Nhu cầu năm 2026',
    fields: {
      nsnn: {
        name: 'Số lượng người làm việc hưởng lương từ NSNN',
        type: 'number',
      },
      su_nghiep: {
        name: 'Số lượng người làm việc hưởng lương từ nguồn thu sự nghiệp',
        type: 'number',
      },
      hop_dong: { name: 'Hợp đồng chuyên môn nghiệp vụ', type: 'number' },
    },
  },
  note: { name: 'Ghi chú', type: 'string' },
};

// ---
// 🧠 Utilities
// ---

type FormValue = string | number | null;

type FlatValues = Record<string, FormValue>;

function joinPath(parts: string[]) {
  return parts.join('.');
}

function getDefaultValue(t?: LeafType): FormValue {
  if (!t) return null;
  return t === 'number' ? ('' as unknown as number) : '';
}

function flattenSchema(
  node: SchemaNode,
  basePath: string[] = [],
  acc: FlatValues = {}
): FlatValues {
  if (node.type) {
    acc[joinPath(basePath)] = getDefaultValue(node.type);
  }
  if (node.fields) {
    for (const [k, child] of Object.entries(node.fields)) {
      flattenSchema(child, [...basePath, k], acc);
    }
  }
  return acc;
}

function flattenAll(schema: Record<string, SchemaNode>): FlatValues {
  const acc: FlatValues = {};
  for (const [k, node] of Object.entries(schema)) {
    flattenSchema(node, [k], acc);
  }
  return acc;
}

function deepSet(obj: any, path: string[], value: any) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const p = path[i];
    if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[path[path.length - 1]] = value;
}

function unflattenToNested(values: FlatValues) {
  const result: any = {};
  for (const [k, v] of Object.entries(values)) {
    if (v === null || v === '') continue; // skip empty
    const p = k.split('.');
    deepSet(result, p, v);
  }
  return result;
}

// ---
// 🎨 Small UI primitives (TailwindCSS)
// ---

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="mb-6">
    <h2 className="text-lg md:text-xl font-semibold mb-3">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
  </section>
);

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl border border-gray-200 shadow-sm p-4 bg-white">
    {children}
  </div>
);

const FieldWrap: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <label className="flex flex-col gap-1">
    <span className="text-sm text-gray-700">{label}</span>
    {children}
  </label>
);

// ---
// 🧩 Recursive form renderer
// ---

type RendererProps = {
  schema: Record<string, SchemaNode>;
  values: FlatValues;
  onChange: (key: string, next: FormValue) => void;
};

const FormRenderer: React.FC<RendererProps> = ({
  schema,
  values,
  onChange,
}) => {
  const renderNode = (key: string, node: SchemaNode, path: string[]) => {
    const fullKey = joinPath(path);

    if (node.type) {
      const val = values[fullKey] ?? getDefaultValue(node.type);
      return (
        <Card key={fullKey}>
          <FieldWrap label={node.name}>
            {node.type === 'string' ? (
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="text"
                value={(val as string) ?? ''}
                onChange={(e) => onChange(fullKey, e.target.value)}
                placeholder={node.name}
              />
            ) : (
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                inputMode="decimal"
                type="number"
                value={val === null || val === undefined ? '' : String(val)}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') return onChange(fullKey, '');
                  const num = Number(raw);
                  if (!Number.isNaN(num)) onChange(fullKey, num);
                }}
                placeholder={node.name}
              />
            )}
          </FieldWrap>
        </Card>
      );
    }

    // Group / Section
    return (
      <div key={fullKey} className="col-span-1 md:col-span-2">
        <Section title={node.name}>
          {node.fields &&
            Object.entries(node.fields).map(([k, child]) =>
              renderNode(k, child, [...path, k])
            )}
        </Section>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(schema).map(([k, node]) => renderNode(k, node, [k]))}
    </div>
  );
};

// ---
// 💾 Toolbar: import/export + localStorage draft
// ---

const Toolbar: React.FC<{
  onExport: () => void;
  onImport: (data: any) => void;
  onReset: () => void;
}> = ({ onExport, onImport, onReset }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="sticky bottom-3 md:top-0 md:bottom-auto z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-2xl border border-gray-200 shadow p-3 flex flex-wrap gap-2 items-center">
      <button
        onClick={onExport}
        className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99]"
      >
        Tải JSON
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.99]"
      >
        Nhập JSON
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          try {
            const text = await f.text();
            const json = JSON.parse(text);
            onImport(json);
          } catch (err) {
            alert('File JSON không hợp lệ');
          } finally {
            e.currentTarget.value = '';
          }
        }}
      />
      <button
        onClick={onReset}
        className="px-3 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50"
      >
        Xóa sạch
      </button>
      <span className="ml-auto text-xs text-gray-500">
        Tự động lưu bản nháp
      </span>
    </div>
  );
};

// ---
// 🌿 App
// ---

export default function App() {
  const [values, setValues] = useState<FlatValues>(() => flattenAll(SCHEMA));

  // autosave
  useEffect(() => {
    const saved = localStorage.getItem('mn_form_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setValues((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mn_form_draft', JSON.stringify(values));
  }, [values]);

  const handleChange = (key: string, next: FormValue) => {
    setValues((v) => ({ ...v, [key]: next }));
  };

  const exportJSON = () => {
    const nested = unflattenToNested(values);
    const blob = new Blob([JSON.stringify(nested, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mn_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (data: any) => {
    // merge flat keys
    const next: FlatValues = { ...values };
    const walk = (obj: any, path: string[] = []) => {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        for (const [k, v] of Object.entries(obj)) {
          walk(v, [...path, k]);
        }
      } else {
        const key = joinPath(path);
        next[key] = obj as any;
      }
    };
    walk(data);
    setValues(next);
  };

  const resetAll = () => setValues(flattenAll(SCHEMA));

  const nonEmptyCount = useMemo(
    () => Object.values(values).filter((v) => v !== '' && v !== null).length,
    [values]
  );

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="size-8 rounded-xl bg-indigo-600" />
          <h1 className="text-base md:text-lg font-semibold">
            Biểu mẫu nhập liệu (mn.json)
          </h1>
          <div className="ml-auto text-xs text-gray-500">
            {nonEmptyCount} trường đã nhập
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="mb-4 text-gray-600 text-sm">
          Điền vào các trường có đánh dấu. Trường số chỉ nhận số. Dữ liệu được
          lưu bản nháp tự động trong trình duyệt.
        </div>

        <FormRenderer schema={SCHEMA} values={values} onChange={handleChange} />
      </main>

      <div className="max-w-5xl mx-auto px-4 pb-6">
        <Toolbar
          onExport={exportJSON}
          onImport={importJSON}
          onReset={resetAll}
        />
      </div>

      <footer className="max-w-5xl mx-auto px-4 pb-10 text-xs text-gray-400">
        Giao diện dùng TailwindCSS (utility classes), hỗ trợ responsive trên mọi
        thiết bị.
      </footer>
    </div>
  );
}
