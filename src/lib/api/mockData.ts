import { User, Project, Document, Certificate, Notification, AuditLogEvent, ReviewComment, DashboardStats } from '../types';

// Mock Users - VERIFIED WORKING CREDENTIALS
export const mockUsers: User[] = [{
  id: '1',
  username: 'expert1',
  email: 'expert@example.com',
  name: 'علی احمدی',
  role: 'expert',
  organizationalUnit: 'واحد فنی',
  has2FA: true,
  isActive: true, canRequestFastTrack: false,
  createdAt: '2024-01-01T10:00:00Z'
}, {
  id: '2',
  username: 'manager1',
  email: 'manager@example.com',
  name: 'محمد رضایی',
  role: 'manager',
  organizationalUnit: 'مدیریت',
  has2FA: true,
  isActive: true, canRequestFastTrack: false,
  createdAt: '2024-01-01T10:00:00Z'
}, {
  id: '3',
  username: 'admin1',
  email: 'admin@example.com',
  name: 'سارا محمدی',
  role: 'admin',
  organizationalUnit: 'مدیریت سیستم',
  has2FA: false,
  isActive: true, canRequestFastTrack: false,
  createdAt: '2024-01-01T10:00:00Z'
}, {
  id: '4',
  username: 'client1',
  email: 'client@example.com',
  name: 'حسین کریمی',
  role: 'client',
  organizationalUnit: 'شرکت مهندسی آریا',
  has2FA: false,
  isActive: true, canRequestFastTrack: false,
  createdAt: '2024-01-15T10:00:00Z'
}];

// Log users on module load to verify they're available
console.log('📋 Mock users loaded:', mockUsers.map(u => u.username));

// Mock Projects
export const mockProjects: Project[] = [{
  id: 'p1',
  code: 'PRJ-2025-001',
  title: 'طرح لنج ساحل',
  description: 'طراحی و نقشه کشی لنج ساحل در منطقه دریایی بوشهر',
  organizationalUnit: 'شرکت مهندسی آریا',
  status: 'under_review',
  isFastTrack: true,
  clientId: '4',
  clientName: 'حسین کریمی',
  createdAt: '2025-01-10T09:00:00Z',
  updatedAt: '2025-01-15T14:30:00Z',
  deadline: '2025-02-01T23:59:59Z'
}, {
  id: 'p2',
  code: 'PRJ-2025-002',
  title: 'طرح کشتی تجاری',
  description: 'طراحی کشتی تجاری 3 موتوره',
  organizationalUnit: 'شرکت کشتیزانی پارس',
  status: 'approved',
  isFastTrack: false,
  clientId: '4',
  clientName: 'حسین کریمی',
  createdAt: '2024-12-20T10:00:00Z',
  updatedAt: '2025-01-10T16:00:00Z',
  deadline: '2025-01-25T23:59:59Z'
}, {
  id: 'p3',
  code: 'PRJ-2025-003',
  title: 'طرح قایق تفریحی',
  description: 'طراحی قایق تفریحی در شمال',
  organizationalUnit: 'دفتر معماری نوین',
  status: 'draft',
  isFastTrack: false,
  clientId: '4',
  clientName: 'حسین کریمی',
  createdAt: '2025-01-18T11:00:00Z',
  updatedAt: '2025-01-18T11:00:00Z'
}];

// Mock Documents
export const mockDocuments: Document[] = [{
  id: 'd1',
  projectId: 'p1',
  projectTitle: 'طرح کشتی تجاری 3 موتوره',
  type: 'نقشه معماری',
  fileName: 'architectural-plan-v2.pdf',
  fileUrl: '/files/arch-plan.pdf',
  version: 2,
  status: 'under_review',
  uploadedBy: 'حسین کریمی',
  uploadedAt: '2025-01-15T10:00:00Z',
  assignedExpertId: '1',
  assignedExpertName: 'علی احمدی',
  deadline: '2025-01-25T23:59:59Z'
}, {
  id: 'd2',
  projectId: 'p1',
  projectTitle: 'طرح کشتی تجاری 3 موتوره',
  type: 'نقشه سازه',
  fileName: 'structural-plan.pdf',
  fileUrl: '/files/struct-plan.pdf',
  version: 1,
  status: 'approved_stage1',
  uploadedBy: 'حسین کریمی',
  uploadedAt: '2025-01-12T14:00:00Z',
  reviewedBy: 'علی احمدی',
  reviewedAt: '2025-01-14T16:30:00Z',
  assignedExpertId: '1',
  assignedExpertName: 'علی احمدی'
}, {
  id: 'd3',
  projectId: 'p2',
  projectTitle: 'طرح کشتی تجاری',
  type: 'نقشه معماری',
  fileName: 'commercial-arch.pdf',
  fileUrl: '/files/commercial.pdf',
  version: 1,
  status: 'final_approved',
  uploadedBy: 'حسین کریمی',
  uploadedAt: '2024-12-22T09:00:00Z',
  reviewedBy: 'محمد رضایی',
  reviewedAt: '2025-01-10T15:00:00Z',
  assignedExpertId: '1',
  assignedExpertName: 'علی احمدی'
}];

// Mock Comments
export const mockComments: ReviewComment[] = [{
  id: 'c1',
  documentId: 'd1',
  userId: '1',
  userName: 'علی احمدی',
  userRole: 'expert',
  content: 'نقشه سازه نیاز به اصلاح در قسمت پلان  دارد. لطفاً ابعاد را مطابق با استانداردها تنظیم کنید.',
  createdAt: '2025-01-16T10:30:00Z',
  isInternal: false
}, {
  id: 'c2',
  documentId: 'd2',
  userId: '1',
  userName: 'علی احمدی',
  userRole: 'expert',
  content: 'نقشه سازه تأیید شد. آماده ارسال به مدیر جهت تأیید نهایی.',
  createdAt: '2025-01-14T16:30:00Z',
  isInternal: true
}];

// Mock Certificates
export const mockCertificates: Certificate[] = [{
  id: 'cert1',
  certificateNumber: 'ACS-2025-000001',
  projectId: 'p2',
  projectTitle: 'طرح کشتی تجاری',
  issueDate: '2025-01-10T16:00:00Z',
  expiryDate: '2026-01-10T23:59:59Z',
  status: 'active',
  issuedBy: 'محمد رضایی',
  qrCode: 'QR-ACS-2025-000001',
  digitalSignatures: [{
    id: 'sig1',
    userId: '1',
    userName: 'علی احمدی',
    level: 'level1',
    timestamp: '2025-01-09T14:00:00Z'
  }, {
    id: 'sig2',
    userId: '2',
    userName: 'محمد رضایی',
    level: 'level2',
    timestamp: '2025-01-10T16:00:00Z'
  }]
}];

// Mock Notifications
export const mockNotifications: Notification[] = [{
  id: 'n1',
  userId: '1',
  type: 'task',
  title: 'پروژه جدید برای بررسی',
  message: 'پروژه "طرح کشتی تجاری 3 موتوره" به شما ارجاع شد',
  link: '/documents/d1',
  isRead: false,
  createdAt: '2025-01-15T10:05:00Z'
}, {
  id: 'n2',
  userId: '4',
  type: 'warning',
  title: 'درخواست اصلاح مدرک',
  message: 'نقشه سازه پروژه شما نیاز به اصلاح دارد',
  link: '/documents/d1',
  isRead: false,
  createdAt: '2025-01-16T10:35:00Z'
}, {
  id: 'n3',
  userId: '4',
  type: 'success',
  title: 'گواهی صادر شد',
  message: 'گواهی پروژه "طرح کشتی تجاری" صادر شد',
  link: '/projects/p2',
  isRead: true,
  createdAt: '2025-01-10T16:05:00Z'
}];

// Mock Audit Logs
export const mockAuditLogs: AuditLogEvent[] = [{
  id: 'log1',
  userId: '1',
  userName: 'علی احمدی',
  userRole: 'expert',
  eventType: 'document_review',
  description: 'بررسی و تأیید مدرک نقشه سازه',
  entityType: 'document',
  entityId: 'd2',
  timestamp: '2025-01-14T16:30:00Z',
  ipAddress: '192.168.1.100'
}, {
  id: 'log2',
  userId: '2',
  userName: 'محمد رضایی',
  userRole: 'manager',
  eventType: 'certificate_issue',
  description: 'صدور گواهی برای پروژه طرح کشتی تجاری',
  entityType: 'certificate',
  entityId: 'cert1',
  timestamp: '2025-01-10T16:00:00Z',
  ipAddress: '192.168.1.101'
}, {
  id: 'log3',
  userId: '4',
  userName: 'حسین کریمی',
  userRole: 'client',
  eventType: 'document_upload',
  description: 'بارگذاری نقشه سازه نسخه 2',
  entityType: 'document',
  entityId: 'd1',
  timestamp: '2025-01-15T10:00:00Z',
  ipAddress: '185.10.20.30'
}];

// Mock Dashboard Stats
export const mockDashboardStats: Record<string, DashboardStats> = {
  expert: {
    totalProjects: 8,
    pendingReviews: 3,
    fastTrackProjects: 2,
    overdueProjects: 1,
    avgReviewTime: 2.5,
    certificatesIssued: 0
  },
  manager: {
    totalProjects: 25,
    pendingReviews: 5,
    fastTrackProjects: 4,
    overdueProjects: 2,
    avgReviewTime: 3.2,
    certificatesIssued: 18
  },
  admin: {
    totalProjects: 156,
    pendingReviews: 0,
    fastTrackProjects: 12,
    overdueProjects: 5,
    avgReviewTime: 3.0,
    certificatesIssued: 98
  },
  client: {
    totalProjects: 3,
    pendingReviews: 1,
    fastTrackProjects: 1,
    overdueProjects: 0,
    avgReviewTime: 0,
    certificatesIssued: 1
  }
};
