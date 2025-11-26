import { useEffect, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatsCard } from '../components/dashboard/StatsCard';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileTextIcon, ClockIcon, ZapIcon, AwardIcon } from 'lucide-react';
import { dashboardApi, projectsApi, adminApi } from '../lib/api/client';
import type { DashboardStats, Project, User } from '../lib/types';

export function ManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [fastTrackQuery, setFastTrackQuery] = useState('');
  const [fastTrackClient, setFastTrackClient] = useState<User | null>(null);
  const [fastTrackError, setFastTrackError] = useState('');
  const [isFastTrackBusy, setIsFastTrackBusy] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, projectsData] = await Promise.all([
          dashboardApi.getStats('manager'),
          projectsApi.getProjects({ status: 'under_review' }),
        ]);
        setStats(statsData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load manager dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  const handleFastTrackSearch = async () => {
    setFastTrackError('');
    setFastTrackClient(null);
    const query = fastTrackQuery.trim().toLowerCase();
    if (!query) return;

    try {
      setIsFastTrackBusy(true);
      const users = await adminApi.getUsers();
      const client = users.find(
        u =>
          u.role === 'client' &&
          (u.username.toLowerCase() === query || u.email.toLowerCase() === query),
      );
      if (!client) {
        setFastTrackError('هیچ مراجع دریایی با این شناسه یافت نشد.');
        return;
      }
      setFastTrackClient(client);
    } catch (error) {
      console.error('Failed to search client for Fast-Track:', error);
      setFastTrackError('خطا در جستجوی مراجع. لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsFastTrackBusy(false);
    }
  };

  const handleToggleFastTrack = async () => {
    if (!fastTrackClient) return;
    setFastTrackError('');
    try {
      setIsFastTrackBusy(true);
      const updated = await adminApi.setFastTrackPermission(
        fastTrackClient.id,
        !fastTrackClient.canRequestFastTrack,
      );
      setFastTrackClient(updated);
    } catch (error) {
      console.error('Failed to update Fast-Track permission:', error);
      setFastTrackError('خطا در به‌روزرسانی دسترسی Fast-Track.');
    } finally {
      setIsFastTrackBusy(false);
    }
  };

  const getStatusBadge = (status: Project['status']) => {
    const variants: Record<
      Project['status'],
      { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }
    > = {
      draft: { label: 'پیش‌نویس', variant: 'default' },
      under_review: { label: 'در حال بررسی', variant: 'info' },
      approved: { label: 'تأیید شده', variant: 'success' },
      rejected: { label: 'رد شده', variant: 'danger' },
      archived: { label: 'بایگانی شده', variant: 'default' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">در حال بارگذاری اطلاعات داشبورد...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            پیشخوان مدیر بررسی پروژه‌های دریایی
          </h1>
          <p className="text-gray-600 mt-1">
            پایش وضعیت پروژه‌ها، پروژه‌های Fast-Track و مدیریت دسترسی مراجعان.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="کل پروژه‌های دریایی"
            value={stats?.totalProjects ?? 0}
            icon={<FileTextIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="پروژه‌های در انتظار تصمیم"
            value={stats?.pendingReviews ?? 0}
            icon={<ClockIcon className="w-6 h-6" />}
            color="yellow"
          />
          <StatsCard
            title="پروژه‌های Fast-Track"
            value={stats?.fastTrackProjects ?? 0}
            icon={<ZapIcon className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="گواهی‌های صادر شده"
            value={stats?.certificatesIssued ?? 0}
            icon={<AwardIcon className="w-6 h-6" />}
            color="green"
          />
        </div>

        {/* Projects Table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              پروژه‌های دریایی در حال بررسی
            </h2>
            <Link to="/projects">
              <Button variant="ghost" size="sm">
                مشاهده همه پروژه‌ها
              </Button>
            </Link>
          </div>

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
                header: 'عنوان پروژه',
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
                render: project => getStatusBadge(project.status),
              },
              {
                key: 'fastTrack',
                header: 'Fast-Track',
                render: project =>
                  project.isFastTrack ? (
                    <Badge variant="warning">
                      <ZapIcon className="w-3 h-3 inline ml-1" />
                      فعال
                    </Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
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
                    <Button size="sm">بررسی پروژه</Button>
                  </Link>
                ),
              },
            ]}
            emptyMessage="پروژه‌ای در وضعیت بررسی برای نمایش وجود ندارد."
          />
        </Card>

        {/* Fast‑Track permission management */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            مدیریت دسترسی Fast-Track برای مراجعان
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input
                  label="شناسه مراجع (ایمیل یا نام کاربری)"
                  type="text"
                  value={fastTrackQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFastTrackQuery(e.target.value)
                  }
                />
              </div>
              <Button
                size="sm"
                onClick={handleFastTrackSearch}
                isLoading={isFastTrackBusy}
              >
                جستجو
              </Button>
            </div>

            {fastTrackError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {fastTrackError}
              </div>
            )}

            {fastTrackClient && (
              <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {fastTrackClient.name}{' '}
                    <span className="text-xs text-gray-500">
                      ({fastTrackClient.email})
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    وضعیت دسترسی Fast-Track:{' '}
                    <span className="font-semibold">
                      {fastTrackClient.canRequestFastTrack ? 'فعال' : 'غیرفعال'}
                    </span>
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={fastTrackClient.canRequestFastTrack ? 'secondary' : 'primary'}
                  onClick={handleToggleFastTrack}
                  isLoading={isFastTrackBusy}
                >
                  {fastTrackClient.canRequestFastTrack
                    ? 'لغو دسترسی Fast-Track'
                    : 'اعطای دسترسی Fast-Track'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

