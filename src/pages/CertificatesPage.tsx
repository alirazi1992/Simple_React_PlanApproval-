import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { projectsApi, certificatesApi } from '../lib/api/client';
import type { Certificate, Project } from '../lib/types';

export function CertificatesPage() {
  const [rows, setRows] = useState<Array<{ id: string; project: Project; certificate: Certificate }>>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<Certificate | null>(null);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const projects = await projectsApi.getProjects();
        const certificates = await Promise.all(
          projects.map(async project => ({
            project,
            certificate: await certificatesApi.getCertificate(project.id),
          })),
        );
        const withCertificates = certificates
          .filter(c => c.certificate !== null)
          .map(c => ({
            id: (c.certificate as Certificate).id,
            project: c.project,
            certificate: c.certificate as Certificate,
          }));
        setRows(withCertificates);
      } catch (error) {
        console.error('Failed to load certificates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyResult(null);
    const code = verifyInput.trim();
    if (!code) {
      return;
    }
    try {
      const cert = await certificatesApi.verifyCertificate(code);
      if (!cert) {
        setVerifyError('گواهی با این شماره یافت نشد.');
      } else {
        setVerifyResult(cert);
      }
    } catch (error) {
      console.error('Failed to verify certificate:', error);
      setVerifyError('خطا در استعلام گواهی.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">گواهی‌ها</h1>
          <p className="text-gray-600 mt-1">
            مشاهده گواهی‌های صادر شده برای پروژه‌ها و استعلام اعتبار آن‌ها.
          </p>
        </div>

        <Card>
          <form
            className="flex flex-col sm:flex-row gap-3 items-end"
            onSubmit={handleVerify}
          >
            <div className="flex-1 min-w-[200px]">
              <Input
                label="استعلام شماره گواهی"
                placeholder="مثال: ACS-2025-000001"
                value={verifyInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setVerifyInput(e.target.value)
                }
              />
            </div>
            <Button type="submit">استعلام</Button>
          </form>

          {verifyError && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {verifyError}
            </div>
          )}

          {verifyResult && (
            <div className="mt-4 border border-green-200 bg-green-50 rounded-lg px-4 py-3 text-sm text-gray-800">
              <div>
                <span className="font-semibold">شماره گواهی: </span>
                {verifyResult.certificateNumber}
              </div>
              <div>
                <span className="font-semibold">پروژه: </span>
                {verifyResult.projectTitle}
              </div>
              <div>
                <span className="font-semibold">وضعیت: </span>
                {verifyResult.status === 'active'
                  ? 'فعال'
                  : verifyResult.status === 'revoked'
                  ? 'باطل شده'
                  : 'جایگزین شده'}
              </div>
            </div>
          )}
        </Card>

        <Card>
          {isLoading ? (
            <div className="py-12 text-center text-gray-500">
              در حال بارگذاری گواهی‌ها...
            </div>
          ) : (
            <Table
              data={rows}
              columns={[
                {
                  key: 'code',
                  header: 'کد پروژه',
                  render: row => (
                    <span className="font-mono text-sm">
                      {row.project.code}
                    </span>
                  ),
                },
                {
                  key: 'title',
                  header: 'پروژه',
                  render: row => (
                    <div>
                      <p className="font-medium">{row.project.title}</p>
                      <p className="text-xs text-gray-500">
                        {row.project.organizationalUnit}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'number',
                  header: 'شماره گواهی',
                  render: row => (
                    <span className="font-mono text-sm">
                      {row.certificate.certificateNumber}
                    </span>
                  ),
                },
                {
                  key: 'issueDate',
                  header: 'تاریخ صدور',
                  render: row => (
                    <span className="text-sm text-gray-600">
                      {new Date(row.certificate.issueDate).toLocaleDateString(
                        'fa-IR',
                      )}
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'وضعیت',
                  render: row => (
                    <span className="text-sm text-gray-700">
                      {row.certificate.status === 'active'
                        ? 'فعال'
                        : row.certificate.status === 'revoked'
                        ? 'باطل شده'
                        : 'جایگزین شده'}
                    </span>
                  ),
                },
              ]}
              emptyMessage="گواهی فعالی برای پروژه‌ها ثبت نشده است."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
