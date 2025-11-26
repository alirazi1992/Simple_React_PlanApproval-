import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { projectsApi, documentsApi } from '../lib/api/client';
import type { Document, DocumentStatus, Project } from '../lib/types';

const STATUS_LABELS: Record<DocumentStatus, string> = {
  pending: 'در صف بررسی',
  under_review: 'در حال بررسی',
  approved_stage1: 'تأیید مرحله اول',
  awaiting_manager: 'در انتظار مدیر',
  final_approved: 'تأیید نهایی',
  rejected: 'رد شده',
  needs_revision: 'نیازمند اصلاح',
};

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projectsById, setProjectsById] = useState<Record<string, Project>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const projects = await projectsApi.getProjects();
        const docsByProject = await Promise.all(
          projects.map(p => documentsApi.getProjectDocuments(p.id)),
        );
        const allDocs = docsByProject.flat();

        const map: Record<string, Project> = {};
        projects.forEach(p => {
          map[p.id] = p;
        });

        setProjectsById(map);
        setDocuments(allDocs);
      } catch (error) {
        console.error('Failed to load documents list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const getStatusBadge = (status: DocumentStatus) => {
    const variant: 'default' | 'success' | 'warning' | 'danger' | 'info' =
      status === 'final_approved' || status === 'approved_stage1'
        ? 'success'
        : status === 'rejected'
        ? 'danger'
        : status === 'needs_revision' || status === 'awaiting_manager'
        ? 'warning'
        : 'info';

    return <Badge variant={variant}>{STATUS_LABELS[status]}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مستندات</h1>
          <p className="text-gray-600 mt-1">
            فهرست مستندات پروژه‌ها برای مشاهده وضعیت و ادامه فرایند بررسی.
          </p>
        </div>

        <Card>
          {isLoading ? (
            <div className="py-12 text-center text-gray-500">
              در حال بارگذاری مستندات...
            </div>
          ) : (
            <Table
              data={documents}
              columns={[
                {
                  key: 'project',
                  header: 'پروژه',
                  render: doc => {
                    const project = projectsById[doc.projectId];
                    return (
                      <div>
                        <p className="font-medium">
                          {project ? project.title : doc.projectTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          کد: {project?.code ?? doc.projectId}
                        </p>
                      </div>
                    );
                  },
                },
                {
                  key: 'file',
                  header: 'فایل',
                  render: doc => (
                    <span className="text-sm text-gray-700">{doc.fileName}</span>
                  ),
                },
                {
                  key: 'status',
                  header: 'وضعیت',
                  render: doc => getStatusBadge(doc.status),
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
                {
                  key: 'actions',
                  header: 'عملیات',
                  render: doc => (
                    <Link to={`/documents/${doc.id}`}>
                      <Button size="sm">جزئیات</Button>
                    </Link>
                  ),
                },
              ]}
              emptyMessage="هیچ مستندی برای نمایش وجود ندارد."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

