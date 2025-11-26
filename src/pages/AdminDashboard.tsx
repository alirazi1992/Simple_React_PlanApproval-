import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { StatsCard } from "../components/dashboard/StatsCard";
import { Card } from "../components/ui/Card";
import { UsersIcon, FileTextIcon, AwardIcon, ActivityIcon } from "lucide-react";
import { dashboardApi, adminApi } from "../lib/api/client";
import { DashboardStats, User } from "../lib/types";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        dashboardApi.getStats("admin"),
        adminApi.getUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">داشبورد ادمین</h1>
          <p className="text-gray-600 mt-1">مدیریت سیستم و کاربران</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="کاربران"
            value={users.length}
            icon={<UsersIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="کل پروژه‌ها"
            value={stats?.totalProjects || 0}
            icon={<FileTextIcon className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="گواهی‌های صادر شده"
            value={stats?.certificatesIssued || 0}
            icon={<AwardIcon className="w-6 h-6" />}
            color="yellow"
          />
          <StatsCard
            title="میانگین زمان بررسی"
            value={`${stats?.avgReviewTime || 0} روز`}
            icon={<ActivityIcon className="w-6 h-6" />}
            color="red"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                مدیریت کاربران
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                مشاهده و ویرایش کاربران و نقش‌ها
              </p>
              <Link to="/admin/users">
                <Button size="sm">مشاهده کاربران</Button>
              </Link>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ActivityIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">گزارش فعالیت</h3>
              <p className="text-sm text-gray-600 mb-4">
                مشاهده لاگ‌های سیستم و فعالیت کاربران
              </p>
              <Link to="/admin/audit-logs">
                <Button size="sm">مشاهده گزارش‌ها</Button>
              </Link>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileTextIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">پروژه‌ها</h3>
              <p className="text-sm text-gray-600 mb-4">
                مشاهده و مدیریت تمام پروژه‌ها
              </p>
              <Link to="/projects">
                <Button size="sm">مشاهده پروژه‌ها</Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            فعالیت‌های اخیر
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <AwardIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  گواهی جدید صادر شد
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  پروژه "طرح کشتی تجاری" توسط محمد رضایی
                </p>
                <p className="text-xs text-gray-400 mt-1">۲ ساعت پیش</p>
              </div>
            </div>
            <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <UsersIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  کاربر جدید ثبت شد
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  حسین کریمی به عنوان مشتری
                </p>
                <p className="text-xs text-gray-400 mt-1">۵ ساعت پیش</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <FileTextIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  پروژه جدید ثبت شد
                </p>
                <p className="text-xs text-gray-600 mt-1">طرح لنج خلیج</p>
                <p className="text-xs text-gray-400 mt-1">۱ روز پیش</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
