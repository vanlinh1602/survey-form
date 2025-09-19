import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useShallow } from 'zustand/shallow';

import { Loading, SearchSelect } from '@/components';
import type { Option } from '@/components/SearchSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSystemStore } from '@/features/system/hooks';
import cities from '@/lib/cities.json';
import schools from '@/lib/schools.json';
import { generateKeyFromName } from '@/lib/utils';
import { SchoolsService } from '@/services/schools';

export default function FormInputPage() {
  const navigate = useNavigate();

  const { info, setInfo, isLoading, setSchools, systemSchools } =
    useSystemStore(
      useShallow((state) => ({
        info: state.info,
        isLoading: state.isLoading,
        setInfo: state.setInfo,
        setSchools: state.setSchools,
        systemSchools: state.schools,
      }))
    );

  const [handling, setHandling] = useState<boolean>(false);
  const [ward, setWard] = useState<Option | null>(null);
  const [level, setLevel] = useState<string>();
  const [school, setSchool] = useState<Option | null>(null);
  const [schoolCreated, setSchoolCreated] = useState<Record<string, Option[]>>(
    {}
  );

  useEffect(() => {
    if (info?.level && info.school && info.ward) {
      navigate(`/${info.level}`);
    }
  }, [info, navigate]);

  const schoolsOptions: Option[] = useMemo(() => {
    if (!level) return [];
    const currentSchools = (schools[level as keyof typeof schools] ?? []).map(
      (value, index) => ({
        label: value,
        value: index.toString(),
      })
    );
    return [
      ...currentSchools,
      ...(systemSchools?.[level] ?? []),
      ...(schoolCreated[level] ?? []),
    ];
  }, [level, schoolCreated, systemSchools]);

  const handleSubmit = async () => {
    if (!ward || !level || !school) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setHandling(true);
    if (schoolCreated[level]?.find((s) => s.value === school?.value)) {
      await SchoolsService.updateSchool(school?.value, {
        label: school?.label,
        value: school?.value,
        type: level,
      });
      const updatedSchools = [...(systemSchools?.[level] ?? []), school];
      setSchools({
        ...(systemSchools ?? {}),
        [level]: updatedSchools,
      });
    }
    setInfo({
      ward: ward?.value,
      level,
      school: school?.value,
    });
    setHandling(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {isLoading || handling ? <Loading /> : null}
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground text-balance text-center">
            Thông tin nhập liệu
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Tỉnh Lâm Đồng
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-0  space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="ward">Phường/Xã</Label>
              <SearchSelect
                className="w-full"
                placeholder="Chọn phường xã"
                value={ward}
                options={Object.entries(cities[68].wards).map(
                  ([key, value]) => ({
                    label: value.name,
                    value: key,
                  })
                )}
                onChange={setWard}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="level">Cấp học</Label>
              <Select
                key="level"
                value={level}
                onValueChange={(value) => setLevel(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn cấp học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mn">MẦM NON</SelectItem>
                  <SelectItem value="th">TIỂU HỌC</SelectItem>
                  <SelectItem value="thcs">TRUNG HỌC CƠ SỞ</SelectItem>
                  <SelectItem value="thpt">TRUNG HỌC PHỔ THÔNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schoolName">Tên trường</Label>
              <SearchSelect
                className="w-full"
                placeholder="Chọn trường..."
                value={school}
                options={schoolsOptions}
                allowCreate={!!level}
                onCreateOption={(label) => {
                  if (!level)
                    return {
                      label: '',
                      value: '',
                    };
                  const newOptions = {
                    label,
                    value: generateKeyFromName(label),
                  };
                  setSchoolCreated((prev) => ({
                    ...prev,
                    [level]: [...(prev[level] ?? []), newOptions],
                  }));
                  return newOptions;
                }}
                onChange={setSchool}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit}>Xác nhận</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
