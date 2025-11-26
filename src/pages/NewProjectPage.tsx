import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { projectsApi, documentsApi } from '../lib/api/client';

export function NewProjectPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizationalUnit, setOrganizationalUnit] = useState('');
  const [isFastTrack, setIsFastTrack] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const project = await projectsApi.createProject({
        title,
        description,
        organizationalUnit,
        isFastTrack,
      });

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i += 1) {
          const file = files.item(i);
          if (file) {
            // Initial attachments for the new marine project
            // eslint-disable-next-line no-await-in-loop
            await documentsApi.uploadDocument(project.id, file);
          }
        }
      }

      navigate(`/projects/${project.id}`, { replace: true });
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'خطا در ایجاد پروژه دریایی. لطفاً مجدداً تلاش کنید.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ثبت پروژه دریایی جدید</h1>
          <p className="text-gray-600 mt-1">
            مشخصات پروژه دریایی خود را وارد کنید تا فرایند بررسی برای شناورها و تأسیسات
            دریایی آغاز شود.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="عنوان پروژه دریایی"
              type="text"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                توضیحات
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="توضیحات تکمیلی درباره پروژه دریایی، شناور یا تأسیسات بندری..."
              />
            </div>

            <Input
              label="واحد سازمانی / شرکت دریایی"
              type="text"
              value={organizationalUnit}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setOrganizationalUnit(e.target.value)
              }
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                پیوست‌ها (امکان انتخاب چند فایل)
              </label>
              <input
                type="file"
                multiple
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                onChange={handleFilesChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                می‌توانید نقشه‌های دریایی، مشخصات فنی شناورها و سایر فایل‌های مرتبط را به صورت
                همزمان بارگذاری کنید.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={isFastTrack}
                onChange={e => setIsFastTrack(e.target.checked)}
              />
              این پروژه در اولویت سریع (Fast-Track) بررسی شود.
            </label>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                انصراف
              </Button>
              <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                ثبت پروژه
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

