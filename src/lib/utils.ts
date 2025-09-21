import { type ClassValue, clsx } from 'clsx';
import { intToExcelCol } from 'excel-column-name';
import { get, set } from 'lodash';
import { nanoid } from 'nanoid';
import { twMerge } from 'tailwind-merge';

import type { Option } from '@/components/SearchSelect';
import cities from '@/lib/cities.json';
import schools from '@/lib/schools.json';
import type { ReportsStore } from '@/services/reports';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateID = ({
  ids = [],
  size = 10,
  options = { prefix: '', suffix: '', ignore: [] },
}: {
  ids?: string[];
  size?: number;
  options?: { prefix?: string; suffix?: string; ignore?: string[] };
} = {}): string => {
  const id = `${options.prefix ?? ''}${nanoid(size)}${options.suffix ?? ''}`;
  if (ids.includes(id) || options.ignore?.some((ignore) => id.includes(ignore)))
    return generateID({ ids, size, options });
  return id;
};

export const getSchoolName = (systemSchools: Record<string, Option[]>, level: string, school: string) => {
  return (
    systemSchools?.[level]?.find((s) => s.value === school)?.label ||
    schools[level as keyof typeof schools]?.[school as any]
  );
};


export function generateKeyFromName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const parseReportTienDo = (sheet: any, data: ReportsStore[]) => {
  const cleanData = data.reduce((acc, item) => {
    if (!acc[item.info.ward]) {
      acc[item.info.ward] = {};
    }
    const currentValue = get(acc, [item.info.ward, item.info.level], 0);
    set(acc, [item.info.ward, item.info.level], currentValue + 1);
    return acc;
  }, {} as Record<string, Record<string, number>>);
  let row = 6;

  Object.entries(cleanData).forEach(([ward, result]) => {
    const wardName = (cities as any)?.[68]?.wards?.[ward as any]?.name;
    sheet.cell(`A${row}`).value(wardName);
    sheet.cell(`B${row}`).value(result.mn ?? '');
    sheet.cell(`C${row}`).value(result.th ?? '');
    sheet.cell(`D${row}`).value(result.thcs ?? '');
    sheet.cell(`F${row}`).value(result.thpt ?? '');
    sheet.cell(`H${row}`).formula(`=SUM(B${row}:G${row})`);
    row += 1;
  });

  for (let i = 2; i <= 8; i++) {
    sheet.cell(`${intToExcelCol(i)}${row}`).formula(`=SUM(${intToExcelCol(i)}${6}:${intToExcelCol(i)}${row - 1})`);
  }

  sheet
    .range(`A6:H${row}`)
    .style({
      border: {
        top: {
          style: 'thin',
          color: '000000',
        },
        left: {
          style: 'thin',
          color: '000000',
        },
        right: {
          style: 'thin',
          color: '000000',
        },
        bottom: {
          style: 'thin',
          color: '000000',
        },
      },
    });
  sheet
    .cell(`A${row}`)
    .value('TỔNG CỘNG')
    .style({
      bold: true,
    });
};


export const parseReportTruongLopHS = (sheet: any, data: ReportsStore[]) => {
  const result: Record<string, Record<string, number>> = {
    cs: {
      mn: 0,
      th: 0,
      thcs: 0,
      thpt: 0,
      gdnn: 0
    },
    gv: {
      mn: 0,
      th: 0,
      thcs: 0,
      thpt: 0,
      gdnn: 0,
    },
    hs: {
      mn: 0,
      th: 0,
      thcs: 0,
      thpt: 0,
      gdnn: 0
    }
  };

  const mappingData: Record<string, string[][]> = {
    mn: [['nhatre', 'tre_3_12'], ['nhatre', 'tre_13_24'], ['nhatre', 'tre_25_36'], ['maugiao', 'tre_3_4t'], ['maugiao', 'tre_4_5t'], ['maugiao', 'tre_5_6t']],
    th: [['lop_1b', 'hs'], ['lop_2b', 'hs']],
    thcs: [['th', 'lop_1b', 'hs'], ['th', 'lop_2b', 'hs'], ['thcs', 'lop_1b', 'hs'], ['thcs', 'lop_2b', 'hs']],
    thpt: [['tong_so', 'hs']]
  };

  data.forEach((item) => {
    result.cs[item.info.level] += 1;
    result.gv[item.info.level] += get(item.form, ['ts_CBGVNL_thong_tu', 'ts'], 0);
    mappingData[item.info.level]?.forEach((path) => {
      result.hs[item.info.level] += get(item.form, path, 0);
    });
  });

  sheet.cell('D5').value(result.cs.mn);
  sheet.cell('D6').value(result.cs.th);
  sheet.cell('D7').value(result.cs.thcs);
  sheet.cell('D8').value(result.cs.thpt);
  sheet.cell('D9').value(result.cs.gdnn);

  sheet.cell('D11').value(result.gv.mn);
  sheet.cell('D12').value(result.gv.th);
  sheet.cell('D13').value(result.gv.thcs);
  sheet.cell('D14').value(result.gv.thpt);
  sheet.cell('D15').value(result.gv.gdnn);

  sheet.cell('D17').value(result.hs.mn);
  sheet.cell('D18').value(result.hs.th);
  sheet.cell('D19').value(result.hs.thcs);
  sheet.cell('D20').value(result.hs.thpt);
  sheet.cell('D21').value(result.hs.gdnn);
};

export const parseReportDanhSachTruong = (workbook: any, data: ReportsStore[], systemSchools: Record<string, Option[]>) => {
  const results: Record<string, { name: string, ward: string }[]> = {
    mn: [],
    th: [],
    thcs: [],
    thpt: [],
  };

  data.forEach((item) => {
    const name = getSchoolName(systemSchools, item.info.level, item.info.school);
    const ward = (cities as any)?.[68]?.wards?.[item.info.ward as any]?.name;
    results[item.info.level].push({ name, ward });
  });

  Object.entries(results).forEach(([level, result]) => {
    const sheet = workbook.sheet(level);
    const sortedResult = result.sort((a, b) => {
      const byWard = a.ward.localeCompare(b.ward);
      if (byWard !== 0) return byWard;
      return a.name.localeCompare(b.name);
    });
    let row = 4;
    sortedResult.forEach((item, index) => {
      sheet.cell(`A${row}`).value(index + 1);
      sheet.cell(`B${row}`).value(item.name);
      sheet.cell(`C${row}`).value(item.ward);
      row += 1;
    });
  });
};
