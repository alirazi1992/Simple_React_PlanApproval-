// User & Auth Types
export type UserRole = 'expert' | 'manager' | 'admin' | 'client';
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  organizationalUnit?: string;
  has2FA: boolean;
  isActive: boolean;
  canRequestFastTrack: boolean;
  createdAt: string;
  avatar?: string;
}
export interface LoginCredentials {
  username: string;
  password: string;
}
export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Project Types
export type ProjectStatus = 'draft' | 'under_review' | 'approved' | 'rejected' | 'archived';
export interface Project {
  id: string;
  code: string;
  title: string;
  description: string;
  organizationalUnit: string;
  status: ProjectStatus;
  isFastTrack: boolean;
  clientId: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
}

// Document Types
export type DocumentStatus = 'pending' | 'under_review' | 'approved_stage1' | 'awaiting_manager' | 'final_approved' | 'rejected' | 'needs_revision';
export interface Document {
  id: string;
  projectId: string;
  projectTitle: string;
  type: string;
  fileName: string;
  fileUrl: string;
  version: number;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  deadline?: string;
  assignedExpertId?: string;
  assignedExpertName?: string;
}
export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  changes: string;
}

// Review & Comments
export interface ReviewComment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
  isInternal: boolean;
}
export interface DocumentReview {
  documentId: string;
  action: 'approve' | 'reject' | 'request_revision';
  comment: string;
  signature?: DigitalSignature;
}

// Digital Signature
export type SignatureLevel = 'level1' | 'level2';
export interface DigitalSignature {
  id: string;
  userId: string;
  userName: string;
  level: SignatureLevel;
  timestamp: string;
  certificateId?: string;
}

// Certificate Types
export type CertificateStatus = 'active' | 'revoked' | 'superseded';
export interface Certificate {
  id: string;
  certificateNumber: string;
  projectId: string;
  projectTitle: string;
  issueDate: string;
  expiryDate: string;
  status: CertificateStatus;
  issuedBy: string;
  qrCode: string;
  digitalSignatures: DigitalSignature[];
}

// Notification Types
export type NotificationType = 'task' | 'warning' | 'info' | 'success';
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// Audit Log
export interface AuditLogEvent {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  eventType: string;
  description: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress?: string;
}

// Invoice & Payment
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export interface Invoice {
  id: string;
  projectId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalProjects: number;
  pendingReviews: number;
  fastTrackProjects: number;
  overdueProjects: number;
  avgReviewTime: number;
  certificatesIssued: number;
}

// Filters
export interface ProjectFilters {
  status?: ProjectStatus;
  isFastTrack?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
export interface AuditLogFilters {
  eventType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}
