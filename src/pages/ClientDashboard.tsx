import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatsCard } from '../components/dashboard/StatsCard';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FileTextIcon, AwardIcon, PlusIcon, ZapIcon } from 'lucide-react';
import { dashboardApi, projectsApi } from '../lib/api/client';
import type { DashboardStats, Project } from '../lib/types';
import { useAuth } from '../lib/hooks/useAuth';

export function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, projectsData] = await Promise.all([
          dashboardApi.getStats('client'),
          projectsApi.getProjects(),
        ]);
        setStats(statsData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load client dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">پیشخوان مراجع دریایی</h1>
            <p className="text-gray-600 mt-1">
              مدیریت پروژه‌های دریایی، شناورها و مستندات مرتبط.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.canRequestFastTrack && (
              <Link to="/projects/new">
                <Button variant="ghost">
                  <ZapIcon className="w-5 h-5" />
                  پروژه Fast-Track
                </Button>
              </Link>
            )}
            <Link to="/projects/new">
              <Button>
                <PlusIcon className="w-5 h-5" />
                ایجاد پروژه جدید
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="تعداد کل پروژه‌های دریایی"
            value={stats?.totalProjects ?? 0}
            icon={<FileTextIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="پروژه‌های در انتظار بررسی"
            value={stats?.pendingReviews ?? 0}
            icon={<ZapIcon className="w-6 h-6" />}
            color="yellow"
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
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              پروژه‌های دریایی شما
            </h2>
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
                render: project => (
                  <div className="flex items-center gap-2">
                    {getStatusBadge(project.status)}
                    {project.status === 'approved' && (
                      <Badge variant="success">
                        <AwardIcon className="w-3 h-3 inline ml-1" />
                        دارای گواهی
                      </Badge>
                    )}
                  </div>
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
                    <Button size="sm">مشاهده جزئیات</Button>
                  </Link>
                ),
              },
            ]}
            emptyMessage="هنوز پروژه‌ای در سامانه ثبت نکرده‌اید."
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}

