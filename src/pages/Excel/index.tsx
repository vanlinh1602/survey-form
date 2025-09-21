import { excelColToInt, intToExcelCol } from 'excel-column-name';
import { Download, FileDown, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';
import { useShallow } from 'zustand/shallow';

import { Loading } from '@/components';
import type { Option } from '@/components/SearchSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useSystemStore } from '@/features/system/hooks';
import cities from '@/lib/cities.json';
import { otherReports, resources } from '@/lib/options';
import schools from '@/lib/schools.json';
import {
  parseReportDanhSachTruong,
  parseReportTienDo,
  parseReportTruongLopHS,
} from '@/lib/utils';
import { ReportsService, type ReportsStore } from '@/services/reports';
import { SchoolsService } from '@/services/schools';

function ExcelPage() {
  // const navigate = useNavigate();

  const { isLoading, user, systemSchools, setIsLoading, setSchools } =
    useSystemStore(
      useShallow((state) => ({
        user: state.user,
        isLoading: state.isLoading,
        setIsLoading: state.setIsLoading,
        systemSchools: state.schools,
        setSchools: state.setSchools,
      }))
    );

  useEffect(() => {
    if (!systemSchools) {
      setIsLoading(true);
      SchoolsService.getAllSchools().then((schoolsData) => {
        const groupedSchools = schoolsData.reduce((acc, s) => {
          const { type, label, value } = s;
          acc[type] = [...(acc[type] ?? []), { label, value }];
          return acc;
        }, {} as Record<string, Option[]>);
        setSchools(groupedSchools);
        setIsLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (!user?.isAdmin) {
  //     navigate('/');
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [user?.isAdmin]);

  const [exporting, setExporting] = useState<Record<string, boolean>>({
    mn: false,
    th: false,
    thcs: false,
    thpt: false,
  });

  const [handling, setHandling] = useState<boolean>(false);

  const getSchoolName = (level: string, school: string) => {
    return (
      systemSchools?.[level]?.find((s) => s.value === school)?.label ||
      schools[level as keyof typeof schools]?.[school as any]
    );
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = async (level: string, template: string) => {
    try {
      const res = await fetch(template);
      if (!res.ok) throw new Error('Không tải được mẫu.');
      const blob = await res.blob();
      downloadBlob(blob, `${level.toUpperCase()}_template.xlsx`);
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi tải mẫu');
    }
  };

  const writeData = (
    dataSheet: any,
    rowIndex: number,
    data: ReportsStore['form'],
    schema: any
  ) => {
    Object.entries(schema).forEach(([key, item]: any) => {
      if (item.fields) {
        writeData(dataSheet, rowIndex, data[key], item.fields);
      } else {
        const col = item.col;
        const value = data[key] ?? '';
        dataSheet.cell(`${col}${rowIndex}`).value(value as any);
      }
    });
  };

  const handleExportWithData = async (level: string, data: ReportsStore[]) => {
    try {
      setExporting((s) => ({ ...s, [level]: true }));
      const levelConfig = resources[level as string];
      const { rowIndex, data: schema, template, endColumn } = levelConfig;
      const res = await fetch(template);
      if (!res.ok) throw new Error('Không tải được mẫu.');
      const arrayBuffer = await res.arrayBuffer();
      const workbook = await XlsxPopulate.fromDataAsync(arrayBuffer);

      const dataSheet = workbook.sheet(0);

      let startRow = rowIndex;

      data.forEach((item, index) => {
        const wardName = (cities as any)?.[68]?.wards?.[item.info.ward as any]
          ?.name;
        dataSheet.cell(`A${startRow}`).value(index + 1);
        dataSheet
          .cell(`B${startRow}`)
          .value(getSchoolName(item.info.level, item.info.school));
        dataSheet.cell(`C${startRow}`).value(wardName);
        writeData(dataSheet, startRow, item.form, schema);
        startRow += 1;
      });

      dataSheet.range(`A${rowIndex}:${endColumn}${startRow}`).style({
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

      dataSheet
        .range(`A${startRow}:C${startRow}`)
        .value('TỔNG CỘNG')
        .merged(true)
        .style({
          bold: true,
        });
      const endColumnInt = excelColToInt(endColumn);
      for (let i = 4; i <= endColumnInt - 1; i++) {
        const formula = `=SUM(${intToExcelCol(i)}${rowIndex}:${intToExcelCol(
          i
        )}${startRow - 1})`;
        dataSheet.cell(`${intToExcelCol(i)}${startRow}`).formula(formula);
      }

      const blob = await workbook.outputAsync();
      const filename = `${level.toUpperCase()}.xlsx`;
      downloadBlob(blob as Blob, filename);
      toast.success('Xuất Excel thành công');
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi xuất Excel');
    } finally {
      setExporting((s) => ({ ...s, [level]: false }));
      setHandling(false);
    }
  };

  const handleExportOtherReport = async (
    level: string,
    data: ReportsStore[]
  ) => {
    try {
      const levelConfig = otherReports[level as string];
      const { template } = levelConfig;
      const res = await fetch(template);
      if (!res.ok) throw new Error('Không tải được mẫu.');
      const arrayBuffer = await res.arrayBuffer();
      const workbook = await XlsxPopulate.fromDataAsync(arrayBuffer);
      const dataSheet = workbook.sheet(0);

      if (level === 'tienDo') {
        parseReportTienDo(dataSheet, data);
      } else if (level === 'truongLopHS') {
        parseReportTruongLopHS(dataSheet, data);
      } else if (level === 'danhSachTruong') {
        parseReportDanhSachTruong(workbook, data, systemSchools ?? {});
      }

      const blob = await workbook.outputAsync();
      downloadBlob(blob, `${level.toUpperCase()}.xlsx`);
      toast.success('Xuất Excel thành công');
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi xuất Excel');
    } finally {
      setHandling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {handling || isLoading ? <Loading /> : null}
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground text-center">
            Xuất dữ liệu
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="text-2xl font-bold text-foreground text-balance mb-2">
          Báo cáo ban đầu
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {Object.values(resources).map((lv) => {
            const disabledExport = !user?.id;
            return (
              <Card key={lv.key} className="bg-card border-border shadow-sm">
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-primary mt-3" />
                      <div>
                        <h2 className="text-base font-semibold text-foreground mt-3">
                          {lv.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {lv.key.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 justify-between">
                  <Button
                    variant="outline"
                    className="border-border"
                    onClick={() => handleDownloadTemplate(lv.key, lv.template)}
                    disabled={isLoading || exporting[lv.key]}
                  >
                    <Download className="h-4 w-4 mr-2" /> Tải mẫu
                  </Button>
                  <Button
                    onClick={async () => {
                      setHandling(true);
                      const data = await ReportsService.queryReport(lv.key);
                      handleExportWithData(lv.key, data);
                    }}
                    disabled={isLoading || exporting[lv.key] || disabledExport}
                  >
                    <FileDown className="h-4 w-4 mr-2" /> Xuất kèm dữ liệu
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        <div className="text-2xl font-bold text-foreground text-balance my-2">
          Báo cáo khác
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {Object.values(otherReports).map((lv) => {
            const disabledExport = !user?.id;
            return (
              <Card key={lv.key} className="bg-card border-border shadow-sm">
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-primary mt-3" />
                      <div>
                        <h2 className="text-base font-semibold text-foreground mt-3">
                          {lv.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {lv.key.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 justify-between">
                  <Button
                    variant="outline"
                    className="border-border"
                    onClick={() => handleDownloadTemplate(lv.key, lv.template)}
                    disabled={isLoading || exporting[lv.key]}
                  >
                    <Download className="h-4 w-4 mr-2" /> Tải mẫu
                  </Button>
                  <Button
                    onClick={async () => {
                      setHandling(true);
                      const allReports = await ReportsService.getAllReport();
                      handleExportOtherReport(lv.key, allReports);
                    }}
                    disabled={isLoading || exporting[lv.key] || disabledExport}
                  >
                    <FileDown className="h-4 w-4 mr-2" /> Xuất kèm dữ liệu
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default ExcelPage;
