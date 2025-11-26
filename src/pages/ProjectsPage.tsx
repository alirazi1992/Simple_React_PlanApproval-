import { useEffect, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { projectsApi } from '../lib/api/client';
import { useAuth } from '../lib/hooks/useAuth';
import type { Project, ProjectStatus, ProjectFilters } from '../lib/types';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'پیش‌نویس',
  under_review: 'در حال بررسی',
  approved: 'تأیید شده',
  rejected: 'رد شده',
  archived: 'بایگانی شده',
};

export function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<ProjectStatus | ''>('');
  const [search, setSearch] = useState('');
  const [fastTrackOnly, setFastTrackOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const filters: ProjectFilters = {};
        if (status) filters.status = status;
        if (fastTrackOnly) filters.isFastTrack = true;
        if (search.trim()) filters.search = search.trim();

        const all = await projectsApi.getProjects(filters);
        const visible =
          user?.role === 'client' ? all.filter(p => p.clientId === user.id) : all;
        setProjects(visible);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [status, search, fastTrackOnly, user]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">پروژه‌ها</h1>
            <p className="text-gray-600 mt-1">
              فهرست پروژه‌های ثبت‌شده در سامانه بر اساس نقش شما.
            </p>
          </div>

          {user?.role === 'client' && (
            <Link to="/projects/new">
              <Button>ایجاد پروژه جدید</Button>
            </Link>
          )}
        </div>

        <Card className="mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="جستجو"
                placeholder="جستجو بر اساس عنوان یا کد پروژه"
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                وضعیت
              </label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={status}
                onChange={e => setStatus(e.target.value as ProjectStatus | '')}
              >
                <option value="">همه وضعیت‌ها</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={fastTrackOnly}
                onChange={e => setFastTrackOnly(e.target.checked)}
              />
              فقط پروژه‌های Fast-Track
            </label>
          </div>
        </Card>

        <Card>
          {isLoading ? (
            <div className="py-12 text-center text-gray-500">در حال بارگذاری...</div>
          ) : (
            <Table
              data={projects}
              columns={[
                {
                  key: 'code',
                  header: 'کد پروژه',
                  render: project => (
                    <span className="font-mono text-sm">{project.code}</span>
                  ),
                },
                {
                  key: 'title',
                  header: 'عنوان',
                  render: project => (
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-xs text-gray-500">
                        {project.organizationalUnit}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'وضعیت',
                  render: project => (
                    <div className="flex items-center gap-2">
                      {getStatusBadge(project.status)}
                      {project.status === 'approved' && (
                        <Badge variant="success">دارای گواهی</Badge>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'fastTrack',
                  header: 'Fast-Track',
                  render: project =>
                    project.isFastTrack ? (
                      <Badge variant="warning">Fast-Track</Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    ),
                },
                {
                  key: 'date',
                  header: 'تاریخ ایجاد',
                  render: project => (
                    <span className="text-sm text-gray-600">
                      {new Date(project.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  header: 'عملیات',
                  render: project => (
                    <Link to={`/projects/${project.id}`}>
                      <Button size="sm">نمایش جزئیات</Button>
                    </Link>
                  ),
                },
              ]}
              emptyMessage="هیچ پروژه‌ای برای نمایش وجود ندارد."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

