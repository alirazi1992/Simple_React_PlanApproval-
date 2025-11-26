import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { documentsApi } from '../lib/api/client';
import { useAuth } from '../lib/hooks/useAuth';
import type { Document, DocumentStatus, ReviewComment } from '../lib/types';

const STATUS_LABELS: Record<DocumentStatus, string> = {
  pending: 'در صف بررسی',
  under_review: 'در حال بررسی',
  approved_stage1: 'تأیید مرحله اول',
  awaiting_manager: 'در انتظار مدیر',
  final_approved: 'تأیید نهایی',
  rejected: 'رد شده',
  needs_revision: 'نیازمند اصلاح',
};

type ReviewAction = 'approve' | 'reject' | 'request_revision';

export function DocumentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const canReview = user && (user.role === 'expert' || user.role === 'manager');

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [doc, docComments] = await Promise.all([
          documentsApi.getDocumentById(id),
          documentsApi.getDocumentComments(id),
        ]);
        setDocumentData(doc);
        setComments(docComments);
      } catch (err) {
        console.error('Failed to load document:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'خطا در بارگذاری اطلاعات مستند.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

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

  const handleReview = async (action: ReviewAction) => {
    if (!id || !documentData) return;
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const updated = await documentsApi.reviewDocument(id, {
        documentId: id,
        action,
        comment: reviewComment,
      });
      setDocumentData(updated);
      const docComments = await documentsApi.getDocumentComments(id);
      setComments(docComments);
      setReviewComment('');
    } catch (err) {
      console.error('Failed to submit review:', err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'خطا در ثبت نتیجه بررسی. لطفاً مجدداً تلاش کنید.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">در حال بارگذاری...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      ) : !documentData ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">مستند مورد نظر یافت نشد.</div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {documentData.projectTitle}
            </h1>
            <p className="text-gray-600 mt-1">{documentData.fileName}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="space-y-4 lg:col-span-2">
              <div className="flex flex-wrap items-center gap-4 justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">وضعیت مستند</div>
                  {getStatusBadge(documentData.status)}
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">نسخه</div>
                  <div className="text-sm text-gray-900">
                    {documentData.version ?? 1}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">تاریخ بارگذاری</div>
                  <div className="text-sm text-gray-900">
                    {new Date(documentData.uploadedAt).toLocaleDateString(
                      'fa-IR',
                    )}
                  </div>
                </div>
                {documentData.deadline && (
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">مهلت بررسی</div>
                    <div className="text-sm text-gray-900">
                      {new Date(documentData.deadline).toLocaleDateString(
                        'fa-IR',
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <span className="text-gray-500">بارگذاری توسط: </span>
                  {documentData.uploadedBy}
                </div>
                {documentData.reviewedBy && (
                  <div>
                    <span className="text-gray-500">آخرین بازبین: </span>
                    {documentData.reviewedBy}{' '}
                    {documentData.reviewedAt && (
                      <span className="text-xs text-gray-500 mr-2">
                        ({' '}
                        {new Date(
                          documentData.reviewedAt,
                        ).toLocaleDateString('fa-IR')}
                        )
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {canReview && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  ثبت نتیجه بررسی
                </h2>
                <form
                  className="space-y-3"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    void handleReview('approve');
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      توضیحات / توضیح برای مراجع
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                      value={reviewComment}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        setReviewComment(e.target.value)
                      }
                      placeholder="توضیحات لازم برای رد، اصلاح یا تأیید مستند..."
                    />
                  </div>

                  {submitError && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                      {submitError}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => void handleReview('reject')}
                    >
                      رد مستند
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => void handleReview('request_revision')}
                    >
                      نیازمند اصلاح
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      تأیید مستند
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              توضیحات و یادداشت‌ها
            </h2>
            {comments.length === 0 ? (
              <div className="text-gray-500 text-sm">
                تاکنون توضیحی ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div
                    key={comment.id}
                    className="border border-gray-100 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {comment.userName}{' '}
                        <span className="text-xs text-gray-500">
                          ({comment.userRole})
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString(
                          'fa-IR',
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {comment.content}
                    </p>
                    {comment.isInternal && (
                      <span className="inline-flex mt-2 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-xs">
                        یادداشت داخلی
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

