import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatsCard } from '../components/dashboard/StatsCard';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FileTextIcon, ClockIcon, ZapIcon, AlertCircleIcon } from 'lucide-react';
import { dashboardApi, documentsApi } from '../lib/api/client';
import { DashboardStats, Document } from '../lib/types';
import { Link } from 'react-router-dom';
export function ExpertDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    try {
      const [statsData] = await Promise.all([dashboardApi.getStats('expert')]);
      setStats(statsData);
      // Mock: Get documents assigned to expert
      const allDocs = await documentsApi.getProjectDocuments('p1');
      setDocuments(allDocs.filter(d => d.status === 'under_review' || d.status === 'pending'));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const getStatusBadge = (status: Document['status']) => {
    const variants: Record<Document['status'], {
      label: string;
      variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
    }> = {
      pending: {
        label: 'در انتظار',
        variant: 'default'
      },
      under_review: {
        label: 'در حال بررسی',
        variant: 'info'
      },
      approved_stage1: {
        label: 'تأیید مرحله ۱',
        variant: 'success'
      },
      awaiting_manager: {
        label: 'در انتظار مدیر',
        variant: 'warning'
      },
      final_approved: {
        label: 'تأیید نهایی',
        variant: 'success'
      },
      rejected: {
        label: 'رد شده',
        variant: 'danger'
      },
      needs_revision: {
        label: 'نیاز به اصلاح',
        variant: 'warning'
      }
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  if (isLoading) {
    return <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            داشبورد کارشناس فنی
          </h1>
          <p className="text-gray-600 mt-1">مدیریت و بررسی مدارک پروژه‌ها</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="پروژه‌های جاری" value={stats?.totalProjects || 0} icon={<FileTextIcon className="w-6 h-6" />} color="blue" />
          <StatsCard title="در انتظار بررسی" value={stats?.pendingReviews || 0} icon={<ClockIcon className="w-6 h-6" />} color="yellow" />
          <StatsCard title="Fast-Track" value={stats?.fastTrackProjects || 0} icon={<ZapIcon className="w-6 h-6" />} color="green" />
          <StatsCard title="معوق" value={stats?.overdueProjects || 0} icon={<AlertCircleIcon className="w-6 h-6" />} color="red" />
        </div>

        {/* Documents Table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              مدارک در انتظار بررسی
            </h2>
            <Link to="/documents">
              <Button variant="ghost" size="sm">
                مشاهده همه
              </Button>
            </Link>
          </div>

          <Table data={documents} columns={[{
          key: 'project',
          header: 'پروژه',
          render: doc => <div>
                    <p className="font-medium">{doc.projectTitle}</p>
                    <p className="text-xs text-gray-500">{doc.type}</p>
                  </div>
        }, {
          key: 'file',
          header: 'فایل',
          render: doc => <span className="text-sm text-gray-600">{doc.fileName}</span>
        }, {
          key: 'status',
          header: 'وضعیت',
          render: doc => getStatusBadge(doc.status)
        }, {
          key: 'deadline',
          header: 'مهلت',
          render: doc => <span className="text-sm text-gray-600">
                    {doc.deadline ? new Date(doc.deadline).toLocaleDateString('fa-IR') : '-'}
                  </span>
        }, {
          key: 'actions',
          header: 'عملیات',
          render: doc => <Link to={`/documents/${doc.id}`}>
                    <Button size="sm">بررسی</Button>
                  </Link>
        }]} emptyMessage="مدرکی برای بررسی وجود ندارد" />
        </Card>
      </div>
    </DashboardLayout>;
}
