import { upperCase } from 'lodash';
import { Edit, LogOut, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useShallow } from 'zustand/shallow';

import { Loading } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSystemStore } from '@/features/system/hooks';
import cities from '@/lib/cities.json';
import schools from '@/lib/schools.json';
import { generateID } from '@/lib/utils';
import { auth } from '@/services/firebase';
import { ReportsService } from '@/services/reports';

export default function FormInputPage() {
  const navigate = useNavigate();
  const {
    isLoading,
    setIsLoading,
    systemSchools,
    user,
    setReports,
    allReports,
    clearData,
  } = useSystemStore(
    useShallow((state) => ({
      isLoading: state.isLoading,
      setIsLoading: state.setIsLoading,
      systemSchools: state.schools,
      user: state.user,
      setReports: state.setReports,
      allReports: state.reports,
      clearData: state.clearData,
    }))
  );

  const [handling, setHandling] = useState<boolean>(false);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setHandling(true);
        setIsLoading(true);
        const all = await ReportsService.getUserReport(
          user?.id || '',
          user?.email || ''
        );
        setReports(all ?? {});
      } catch (error: any) {
        toast.error(error?.message || 'Không thể tải danh sách báo cáo');
      } finally {
        setHandling(false);
        setIsLoading(false);
      }
    };
    if (!allReports) {
      loadReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSchoolName = (level: string, school: string) => {
    return (
      systemSchools?.[level]?.find((s) => s.value === school)?.label ||
      schools[level as keyof typeof schools]?.[school as any]
    );
  };

  const getWardName = (ward: string) => {
    return (cities[68] as any).wards[ward as any]?.name;
  };

  return (
    <div className="min-h-screen bg-background">
      {isLoading || handling ? <Loading /> : null}
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground text-balance text-center">
            Danh sách báo cáo đã nhập
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Email: {user?.email}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-2 pb-24 space-y-2">
        <div className="flex justify-end">
          <Button
            variant="destructive"
            onClick={() => {
              auth.signOut();
              clearData();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
        {/* Reports Table */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Tổng số: {Object.keys(allReports || {}).length}
              </h2>

              <Button onClick={() => navigate(`/${generateID({ size: 20 })}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm báo cáo
              </Button>
            </div>
            {/* Mobile list */}
            <div className="block md:hidden">
              <div className="space-y-3">
                {Object.entries(allReports || {}).map(([key, r], idx) => {
                  const wardName = getWardName(r.info?.ward || '');
                  const levelName = upperCase(r.info?.level || '');
                  const schoolName = getSchoolName(
                    r.info?.level || '',
                    r.info?.school || ''
                  );
                  return (
                    <div
                      key={idx}
                      className="rounded-md border border-border bg-card p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Phường/Xã:{' '}
                            </span>
                            <span className="font-medium text-foreground">
                              {wardName}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Cấp học:{' '}
                            </span>
                            <span className="font-medium text-foreground">
                              {levelName}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-muted-foreground">
                              Trường:{' '}
                            </span>
                            <span className="font-medium text-foreground break-words">
                              {schoolName}
                            </span>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate(`/${key}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-3 py-2 font-medium">
                      Phường/Xã
                    </th>
                    <th className="text-left px-3 py-2 font-medium">Cấp học</th>
                    <th className="text-left px-3 py-2 font-medium">Trường</th>
                    <th className="text-left px-3 py-2 font-medium">
                      Tình trạng
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(allReports || {}).map(([key, r], idx) => {
                    const wardName = getWardName(r.info?.ward || '');
                    const levelName = upperCase(r.info?.level || '');
                    const schoolName = getSchoolName(
                      r.info?.level || '',
                      r.info?.school || ''
                    );
                    return (
                      <tr
                        key={idx}
                        className="border-b border-border hover:bg-muted/20"
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          {wardName}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {levelName}
                        </td>
                        <td className="px-3 py-2 min-w-[240px]">
                          {schoolName}
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            variant="default"
                            onClick={() => navigate(`/${key}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
