import { useEffect, useState, type ChangeEvent } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { adminApi } from '../lib/api/client';
import type { User, UserRole } from '../lib/types';

type EditableUser = User & { pendingRole: UserRole };

const ROLE_LABELS: Record<UserRole, string> = {
  expert: 'کارشناس',
  manager: 'مدیر',
  admin: 'مدیر سامانه',
  client: 'مراجع',
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await adminApi.getUsers();
        setUsers(data.map(u => ({ ...u, pendingRole: u.role })));
      } catch (err) {
        console.error('Failed to load users:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'خطا در بارگذاری فهرست کاربران.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const handleRoleChange = (id: string, role: UserRole) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, pendingRole: role } : u)),
    );
  };

  const handleSaveRole = async (user: EditableUser) => {
    try {
      const updated = await adminApi.updateUserRole(user.id, user.pendingRole);
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...updated, pendingRole: updated.role } : u,
        ),
      );
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مدیریت کاربران</h1>
          <p className="text-gray-600 mt-1">
            مشاهده و به‌روزرسانی نقش کاربران سامانه.
          </p>
        </div>

        <Card>
          {isLoading ? (
            <div className="py-12 text-center text-gray-500">
              در حال بارگذاری کاربران...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : (
            <Table
              data={users}
              columns={[
                {
                  key: 'name',
                  header: 'نام',
                  render: u => (
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  ),
                },
                {
                  key: 'username',
                  header: 'نام کاربری',
                  render: u => (
                    <span className="font-mono text-sm">{u.username}</span>
                  ),
                },
                {
                  key: 'role',
                  header: 'نقش',
                  render: u => (
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      value={u.pendingRole}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        handleRoleChange(u.id, e.target.value as UserRole)
                      }
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ),
                },
                {
                  key: 'actions',
                  header: 'عملیات',
                  render: u => (
                    <Button
                      size="sm"
                      disabled={u.pendingRole === u.role}
                      onClick={() => void handleSaveRole(u)}
                    >
                      ذخیره
                    </Button>
                  ),
                },
              ]}
              emptyMessage="کاربری برای نمایش وجود ندارد."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

