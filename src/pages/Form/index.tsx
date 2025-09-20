import {
  ChevronDown,
  ChevronRight,
  LogOut,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useShallow } from 'zustand/shallow';

import { Loading } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSystemStore } from '@/features/system/hooks';
import cities from '@/lib/cities.json';
import { resources } from '@/lib/options';
import schools from '@/lib/schools.json';
import { auth } from '@/services/firebase';
import { ReportsService } from '@/services/reports';

interface FormField {
  name: string;
  type: 'string' | 'number';
  fields?: Record<string, FormField>;
}

interface FormData {
  [key: string]: any;
}

export default function HierarchicalForm() {
  const params = useParams();
  const levelType = params.id;
  const navigate = useNavigate();
  const { title, data: formSchema } = resources[levelType || 'mn'] ?? {
    title: '',
    data: {},
  };

  const {
    user,
    userInfo,
    currentForm,
    updateCurrentForm,
    setIsLoading,
    isLoading,
    systemSchools,
  } = useSystemStore(
    useShallow((state) => ({
      isLoading: state.isLoading,
      user: state.user,
      userInfo: state.info,
      currentForm: state.form,
      updateCurrentForm: state.setForm,
      setIsLoading: state.setIsLoading,
      systemSchools: state.schools,
    }))
  );

  useEffect(() => {
    if (!userInfo?.level || !userInfo.ward || !userInfo.school || !user?.id) {
      navigate('/', { replace: true });
    }
  }, [navigate, user?.id, userInfo]);

  const [formData, setFormData] = useState<FormData>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const schema = formSchema as unknown as Record<string, FormField>;
    const expanded = new Set<string>();

    const traverse = (fields: Record<string, FormField>, parentPath = '') => {
      for (const [key, field] of Object.entries(fields)) {
        const path = parentPath ? `${parentPath}.${key}` : key;
        // Expand all top-level sections and any nested section that has children
        if (parentPath === '' || field.fields) {
          expanded.add(path);
        }
        if (field.fields) {
          traverse(field.fields, path);
        }
      }
    };

    traverse(schema);
    return expanded;
  });

  const [errors, setErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentForm) {
      setFormData(currentForm);
    }
  }, [currentForm]);

  useEffect(() => {
    if (levelType && !resources[levelType]) {
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelType]);

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const updateFormData = (path: string, value: string | number) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      if (errors.size) {
        const schema = formSchema as unknown as Record<string, FormField>;
        const nextErrors = validateAll(schema, newData as Record<string, any>);
        setErrors(nextErrors);
      }

      return newData;
    });
  };

  const getFormValue = (path: string): string | number => {
    const keys = path.split('.');
    let current = formData;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return '';
      }
    }

    if (typeof current !== 'string' && typeof current !== 'number') {
      return '';
    }

    return current;
  };

  const renderField = (fieldKey: string, field: FormField, parentPath = '') => {
    const fieldPath = parentPath ? `${parentPath}.${fieldKey}` : fieldKey;
    const value = getFormValue(fieldPath);
    const isInvalid = errors.has(fieldPath);

    if (field.type === 'string') {
      if (fieldKey === 'note') {
        return (
          <div key={fieldPath} className="col-span-full ">
            <Label
              htmlFor={fieldPath}
              className="text-sm font-medium text-foreground"
            >
              {field.name}
            </Label>
            <Textarea
              id={fieldPath}
              value={value as string}
              onChange={(e) => updateFormData(fieldPath, e.target.value)}
              aria-invalid={isInvalid || undefined}
              className="mt-1 bg-input border-border focus:ring-primary focus:border-primary rounded-lg shadow-sm"
              rows={4}
              placeholder="Nhập ghi chú..."
            />
            {isInvalid ? (
              <p className="mt-1 text-sm text-destructive">
                Trường này là bắt buộc.
              </p>
            ) : null}
          </div>
        );
      }

      return (
        <div key={fieldPath} className="flex flex-col justify-end">
          <Label
            htmlFor={fieldPath}
            className="text-sm font-medium text-foreground"
          >
            {field.name}
          </Label>
          <Input
            id={fieldPath}
            type="text"
            value={value as string}
            onChange={(e) => updateFormData(fieldPath, e.target.value)}
            aria-invalid={isInvalid || undefined}
            className="mt-1 bg-input border-border focus:ring-primary focus:border-primary rounded-lg shadow-sm"
            placeholder={`Nhập ${field.name.toLowerCase()}...`}
          />
          {isInvalid ? (
            <p className="mt-1 text-sm text-destructive">
              Trường này là bắt buộc.
            </p>
          ) : null}
        </div>
      );
    }

    if (field.type === 'number') {
      return (
        <div key={fieldPath} className="flex flex-col justify-end">
          <Label
            htmlFor={fieldPath}
            className="text-sm font-medium text-foreground"
          >
            {field.name}
          </Label>
          <Input
            id={fieldPath}
            type="number"
            value={value as number}
            onChange={(e) =>
              updateFormData(fieldPath, Number.parseFloat(e.target.value) || 0)
            }
            aria-invalid={isInvalid || undefined}
            className="mt-1 bg-input border-border focus:ring-primary focus:border-primary rounded-lg shadow-sm"
            placeholder={'Nhập số'}
          />
          {isInvalid ? (
            <p className="mt-1 text-sm text-destructive">
              Trường này là bắt buộc.
            </p>
          ) : null}
        </div>
      );
    }

    return null;
  };

  const renderNestedFields = (
    fields: Record<string, FormField>,
    parentPath = ''
  ) => {
    return Object.entries(fields).map(([fieldKey, field]) => {
      if (field.fields) {
        // Nested subsection
        const sectionPath = parentPath ? `${parentPath}.${fieldKey}` : fieldKey;
        const isExpanded = expandedSections.has(sectionPath);

        return (
          <div key={sectionPath} className="col-span-full">
            <div className="ml-2 border-l-2 border-border pl-4">
              <button
                onClick={() => toggleSection(sectionPath)}
                className="flex items-center gap-2 w-full text-left p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-foreground">
                  {field.name}
                </span>
              </button>

              {isExpanded && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderNestedFields(field.fields, sectionPath)}
                </div>
              )}
            </div>
          </div>
        );
      }

      return renderField(fieldKey, field, parentPath);
    });
  };

  const renderSection = (sectionKey: string, section: FormField) => {
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <Card key={sectionKey} className="bg-card border-border shadow-sm py-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full p-4 py-0 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-primary" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
            <h2 className="text-lg font-semibold text-foreground">
              {section.name}
            </h2>
          </div>
        </button>

        {isExpanded && (
          <CardContent className="pt-0 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields && renderNestedFields(section.fields, sectionKey)}
              {section.type && renderField(sectionKey, section)}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  const OPTIONAL_KEYS = ['note', 'muc_do_tu_chi', 'du_toan_thu_2026'];

  function validateAll(
    fields: Record<string, FormField>,
    data: Record<string, any> | undefined,
    parentPath = ''
  ): Set<string> {
    const invalidPaths = new Set<string>();

    for (const [key, field] of Object.entries(fields)) {
      if (OPTIONAL_KEYS.includes(key)) continue;
      const path = parentPath ? `${parentPath}.${key}` : key;

      if (field.fields) {
        const nestedData =
          data && typeof data === 'object' ? (data as any)[key] : undefined;
        const nestedInvalid = validateAll(field.fields, nestedData, path);
        nestedInvalid.forEach((p) => invalidPaths.add(p));
        continue;
      }

      if (field.type === 'string') {
        const value = (data as any)?.[key];
        if (typeof value !== 'string' || value.trim() === '')
          invalidPaths.add(path);
        continue;
      }

      if (field.type === 'number') {
        const value = (data as any)?.[key];
        if (typeof value !== 'number' || Number.isNaN(value))
          invalidPaths.add(path);
        continue;
      }
    }

    return invalidPaths;
  }

  const checkInput = (): boolean => {
    const schema = formSchema as unknown as Record<string, FormField>;
    const invalid = validateAll(schema, formData as Record<string, any>);
    setErrors(invalid);

    if (invalid.size > 0) {
      // auto-expand ancestor sections that contain errors
      setExpandedSections((prev) => {
        const next = new Set(prev);
        invalid.forEach((path) => {
          const parts = path.split('.');
          let acc = '';
          for (let i = 0; i < parts.length - 1; i++) {
            acc = acc ? `${acc}.${parts[i]}` : parts[i];
            next.add(acc);
          }
        });
        return next;
      });

      // focus first invalid field
      const first = Array.from(invalid)[0];
      setTimeout(() => {
        const el = document.getElementById(first);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (el as HTMLElement | null)?.focus?.();
      }, 0);

      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!checkInput()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      setIsLoading(true);
      await ReportsService.updateReport(user?.id as string, {
        info: userInfo,
        form: formData,
      });
      updateCurrentForm(formData);
      toast.success('Lưu thành công');
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const schoolInfo = useMemo(() => {
    return (
      systemSchools?.[userInfo?.level || '']?.find(
        (s) => s.value === userInfo?.school
      )?.label ||
      schools[userInfo?.level as keyof typeof schools]?.[
        userInfo?.school as any
      ] || {
        label: '',
        value: '',
      }
    );
  }, [systemSchools, userInfo?.level, userInfo?.school]);

  const handleReset = () => {
    setFormData({});
  };

  return (
    <div className="min-h-screen bg-background">
      {isLoading ? <Loading /> : null}
      {/* Sticky Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground text-balance text-center">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {`${schoolInfo} - ${
              (cities[68] as any).wards[userInfo?.ward as any]?.name
            }`}
          </p>
        </div>
      </header>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-4 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {Object.entries(formSchema).map(([sectionKey, section]) =>
            renderSection(sectionKey, section as FormField)
          )}
        </div>
      </main>

      {/* Sticky Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 justify-between">
            <div>
              <Button
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await auth.signOut();
                  } catch (error: any) {
                    toast.error(error.message);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
            <div className="space-x-2">
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-border hover:bg-muted bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Đặt lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
