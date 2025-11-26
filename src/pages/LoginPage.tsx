import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/hooks/useAuth";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AlertCircleIcon } from "lucide-react";

export function LoginPage() {
  const { login, verify2FA, needs2FA, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code2FA, setCode2FA] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && !needs2FA && user) {
      const dashboardRoutes: Record<string, string> = {
        expert: "/expert/dashboard",
        manager: "/manager/dashboard",
        client: "/client/dashboard",
        admin: "/admin/dashboard",
      };

      navigate(dashboardRoutes[user.role] ?? "/", { replace: true });
    }
  }, [isAuthenticated, needs2FA, user, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(username, password);
      console.log("[Login] login success:", success);
      // Navigation happens in useEffect once auth state updates
    } catch (err) {
      console.error("[Login] login failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "خطا در ورود. لطفاً مجدداً تلاش کنید."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await verify2FA(code2FA);
      console.log("[Login] 2FA verification success:", success);
      // Navigation happens in useEffect once auth state updates
    } catch (err) {
      console.error("[Login] 2FA verification failed:", err);
      setError(err instanceof Error ? err.message : "کد تأیید نامعتبر است.");
      setCode2FA("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setError("");
    setCode2FA("");
    sessionStorage.removeItem("pendingUser");
    sessionStorage.removeItem("pendingToken");
    window.location.reload();
  };

  // Don't render login form if already authenticated
  if (isAuthenticated && !needs2FA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center">
        <div className="text-gray-600">در حال هدایت به داشبورد...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600 mb-2">
            سامانه مدیریت بررسی و صدور گواهی
          </h1>
          <p className="text-gray-600">
            برای ادامه، لطفاً با نام کاربری و رمز عبور خود وارد شوید.
          </p>
        </div>

        {!needs2FA ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="نام کاربری یا ایمیل"
              type="text"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              placeholder="نام کاربری خود را وارد کنید"
              required
              autoFocus
              autoComplete="username"
            />

            <Input
              label="رمز عبور"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="رمز عبور خود را وارد کنید"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              ورود به سامانه
            </Button>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
              <p className="font-medium mb-3">حساب‌های آزمایشی:</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span>کارشناس:</span>
                  <span className="font-mono">
                    <strong>expert1</strong> / <strong>password</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span>مدیر:</span>
                  <span className="font-mono">
                    <strong>manager1</strong> / <strong>password</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span>مدیر سامانه:</span>
                  <span className="font-mono">
                    <strong>admin1</strong> / <strong>password</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span>مراجع:</span>
                  <span className="font-mono">
                    <strong>client1</strong> / <strong>password</strong>
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-600 text-center">
                برای حساب‌هایی که 2FA فعال است، کد آزمایشی:{" "}
                <strong>123456</strong>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handle2FAVerify} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                تأیید دو مرحله‌ای
              </h2>
              <p className="text-sm text-gray-600">
                کد ارسال شده را وارد کنید تا ورود شما تکمیل شود.
              </p>
            </div>

            <Input
              label="کد تأیید"
              type="text"
              value={code2FA}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCode2FA(e.target.value.replace(/\D/g, ""))
              }
              placeholder="123456"
              maxLength={6}
              required
              autoFocus
              className="text-center text-2xl tracking-widest"
            />

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading || code2FA.length !== 6}
            >
              تأیید کد و ورود
            </Button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              بازگشت به صفحه ورود
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
