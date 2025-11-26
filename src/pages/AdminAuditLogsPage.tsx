import { useEffect, useState, type ChangeEvent } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { adminApi } from '../lib/api/client';
import type { AuditLogEvent } from '../lib/types';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await adminApi.getAuditLogs(
          eventTypeFilter ? { eventType: eventTypeFilter } : undefined,
        );
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'خطا در بارگذاری لاگ‌های ممیزی.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [eventTypeFilter]);

  const eventTypes = Array.from(new Set(logs.map(log => log.eventType)));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لاگ‌های ممیزی</h1>
            <p className="text-gray-600 mt-1">
              تاریخچه رویدادهای مهم سامانه برای پایش و ردیابی.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نوع رویداد
            </label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={eventTypeFilter}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setEventTypeFilter(e.target.value)
              }
            >
              <option value="">همه رویدادها</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Card>
          {isLoading ? (
            <div className="py-12 text-center text-gray-500">
              در حال بارگذاری لاگ‌ها...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : (
            <Table
              data={logs}
              columns={[
                {
                  key: 'time',
                  header: 'زمان',
                  render: log => (
                    <span className="text-sm text-gray-700">
                      {new Date(log.timestamp).toLocaleString('fa-IR')}
                    </span>
                  ),
                },
                {
                  key: 'user',
                  header: 'کاربر',
                  render: log => (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.userName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.userRole} • {log.ipAddress}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'event',
                  header: 'رویداد',
                  render: log => (
                    <div>
                      <p className="text-sm text-gray-900">{log.eventType}</p>
                      <p className="text-xs text-gray-600">
                        {log.description}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'entity',
                  header: 'موجودیت',
                  render: log => (
                    <span className="text-xs text-gray-700">
                      {log.entityType} #{log.entityId}
                    </span>
                  ),
                },
              ]}
              emptyMessage="هیچ لاگ ممیزی برای نمایش وجود ندارد."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

