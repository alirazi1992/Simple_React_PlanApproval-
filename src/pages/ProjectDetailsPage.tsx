import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { projectsApi, documentsApi } from '../lib/api/client';
import { useAuth } from '../lib/hooks/useAuth';
import type { Project, ProjectStatus, Document } from '../lib/types';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'پیش‌نویس',
  under_review: 'در حال بررسی',
  approved: 'تأیید شده',
  rejected: 'رد شده',
  archived: 'بایگانی شده',
};

export function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [p, docs] = await Promise.all([
          projectsApi.getProjectById(id),
          documentsApi.getProjectDocuments(id),
        ]);
        setProject(p);
        setDocuments(docs);
      } catch (err) {
        console.error('Failed to load project details:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'خطا در بارگذاری اطلاعات پروژه.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  const getStatusBadge = (projectStatus: ProjectStatus) => {
    const variant: 'default' | 'success' | 'warning' | 'danger' | 'info' =
      projectStatus === 'approved'
        ? 'success'
        : projectStatus === 'rejected'
        ? 'danger'
        : projectStatus === 'under_review'
        ? 'info'
        : 'default';

    return <Badge variant={variant}>{STATUS_LABELS[projectStatus]}</Badge>;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!project || !selectedFile) return;
    setUploadError('');
    setIsUploading(true);

    try {
      await documentsApi.uploadDocument(project.id, selectedFile);
      const docs = await documentsApi.getProjectDocuments(project.id);
      setDocuments(docs);
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to upload document:', err);
      setUploadError(
        err instanceof Error
          ? err.message
          : 'خطا در بارگذاری مستند. لطفاً مجدداً تلاش کنید.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">در حال بارگذاری...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      ) : !project ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">پروژه مورد نظر یافت نشد.</div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project.title}
            </h1>
            <p className="text-gray-600 mt-1">
              کد پروژه: <span className="font-mono">{project.code}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-4 justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">وضعیت</div>
                  {getStatusBadge(project.status)}
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">واحد سازمانی</div>
                  <div className="text-sm text-gray-900">
                    {project.organizationalUnit}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">تاریخ ایجاد</div>
                  <div className="text-sm text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString('fa-IR')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Fast-Track</div>
                  <div className="text-sm text-gray-900">
                    {project.isFastTrack ? 'بله' : 'خیر'}
                  </div>
                </div>
              </div>

              {project.description && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-800 mb-1">
                    توضیحات
                  </h2>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
              )}
            </Card>

            {user?.role === 'client' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  بارگذاری مستند جدید
                </h2>
                <form className="space-y-3" onSubmit={handleUpload}>
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    onChange={handleFileChange}
                  />
                  {uploadError && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                      {uploadError}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!selectedFile || isUploading}
                    isLoading={isUploading}
                  >
                    بارگذاری مستند
                  </Button>
                  <p className="text-xs text-gray-500">
                    فرمت‌های رایج (PDF, DOCX و غیره) قابل پذیرش هستند.
                  </p>
                </form>
              </Card>
            )}
          </div>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                مستندات پروژه
              </h2>
            </div>

            <Table
              data={documents}
              columns={[
                {
                  key: 'file',
                  header: 'فایل',
                  render: doc => (
                    <div>
                      <p className="font-medium text-sm">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'وضعیت',
                  render: doc => (
                    <span className="text-sm text-gray-700">{doc.status}</span>
                  ),
                },
                {
                  key: 'version',
                  header: 'نسخه',
                  render: doc => (
                    <span className="text-sm text-gray-700">
                      {doc.version ?? 1}
                    </span>
                  ),
                },
                {
                  key: 'uploadedAt',
                  header: 'تاریخ بارگذاری',
                  render: doc => (
                    <span className="text-sm text-gray-600">
                      {new Date(doc.uploadedAt).toLocaleDateString('fa-IR')}
                    </span>
                  ),
                },
              ]}
              emptyMessage="برای این پروژه هیچ مستندی ثبت نشده است."
            />
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

