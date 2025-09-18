import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useShallow } from 'zustand/shallow';

import { Loading, SearchSelect } from '@/components';
import type { Option } from '@/components/SearchSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

export default function FormInputPage() {
  const navigate = useNavigate();

  const { info, setInfo, isLoading } = useSystemStore(
    useShallow((state) => ({
      info: state.info,
      isLoading: state.isLoading,
      setInfo: state.setInfo,
    }))
  );

  const [ward, setWard] = useState<Option | null>(null);
  const [level, setLevel] = useState<string>();
  const [schoolName, setSchoolName] = useState<string>();

  useEffect(() => {
    if (info?.level && info.schoolName && info.ward) {
      navigate(`/${info.level}`);
    }
  }, [info, navigate]);

  const handleSubmit = () => {
    if (!ward || !level || !schoolName) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setInfo({
      ward: ward?.value,
      level,
      schoolName,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {isLoading ? <Loading /> : null}
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
                  <SelectItem value="mn">Mần non</SelectItem>
                  <SelectItem value="th">Tiểu Học</SelectItem>
                  <SelectItem value="thcs">Trung học Cơ Sở</SelectItem>
                  <SelectItem value="thpt">Trung học Phổ Thông</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schoolName">Tên trường</Label>
              <Input
                id="schoolName"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Nhập tên trường"
                required
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
