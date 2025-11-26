import {
  User,
  LoginCredentials,
  AuthResponse,
  Project,
  Document,
  Certificate,
  Notification,
  AuditLogEvent,
  ReviewComment,
  DashboardStats,
  ProjectFilters,
  AuditLogFilters,
  DocumentReview,
} from '../types';
import {
  mockUsers,
  mockProjects,
  mockDocuments,
  mockCertificates,
  mockNotifications,
  mockAuditLogs,
  mockComments,
  mockDashboardStats,
} from './mockData';

// Simulate API delay
const delay = (ms: number = 300) => new Promise<void>(resolve => setTimeout(resolve, ms));

// In‑memory runtime state based on mocks
let currentUser: User | null = null;
let projects = [...mockProjects];
let documents = [...mockDocuments];
let certificates = [...mockCertificates];
let notifications = [...mockNotifications];
let auditLogs = [...mockAuditLogs];
let comments = [...mockComments];

// Auth API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay();

    const identifier = (credentials.username ?? '').trim().toLowerCase();
    const password = (credentials.password ?? '').trim();

    const user =
      mockUsers.find(u => u.username.toLowerCase() === identifier) ??
      mockUsers.find(u => u.email.toLowerCase() === identifier) ??
      mockUsers.find(u => u.name.toLowerCase() === identifier);

    if (!user) {
      throw new Error('نام کاربری یا ایمیل یافت نشد.');
    }

    if (password !== 'password') {
      throw new Error('رمز عبور نادرست است.');
    }

    currentUser = user;

    return {
      accessToken: `mock-token-${user.id}-${Date.now()}`,
      user,
    };
  },

  async verify2FA(code: string): Promise<{ success: boolean }> {
    await delay(200);
    if (code === '123456') {
      return { success: true };
    }
    throw new Error('کد تأیید دو مرحله‌ای نادرست است.');
  },

  async getProfile(): Promise<User> {
    await delay(200);
    if (!currentUser) {
      throw new Error('کاربری وارد نشده است.');
    }
    return currentUser;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    await delay();
    if (!currentUser) {
      throw new Error('کاربری وارد نشده است.');
    }
    currentUser = {
      ...currentUser,
      ...data,
    };
    return currentUser;
  },

  logout() {
    currentUser = null;
  },
};

// Projects API
export const projectsApi = {
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    await delay();
    let filtered = [...projects];

    if (filters?.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters?.isFastTrack !== undefined) {
      filtered = filtered.filter(p => p.isFastTrack === filters.isFastTrack);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        p => p.title.toLowerCase().includes(search) || p.code.toLowerCase().includes(search),
      );
    }

    return filtered;
  },

  async getProjectById(id: string): Promise<Project> {
    await delay();
    const project = projects.find(p => p.id === id);
    if (!project) {
      throw new Error('پروژه مورد نظر یافت نشد.');
    }
    return project;
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    await delay();
    const newProject: Project = {
      id: `p${projects.length + 1}`,
      code: `MRN-2025-${String(projects.length + 1).padStart(3, '0')}`,
      title: data.title || '',
      description: data.description || '',
      organizationalUnit: data.organizationalUnit || '',
      status: 'draft',
      isFastTrack: data.isFastTrack || false,
      clientId: currentUser?.id || '',
      clientName: currentUser?.name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deadline: data.deadline,
    };
    projects.push(newProject);
    return newProject;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    await delay();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('پروژه مورد نظر یافت نشد.');
    }
    projects[index] = {
      ...projects[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return projects[index];
  },
};

// Documents API
export const documentsApi = {
  async getProjectDocuments(projectId: string): Promise<Document[]> {
    await delay();
    return documents.filter(d => d.projectId === projectId);
  },

  async getDocumentById(id: string): Promise<Document> {
    await delay();
    const document = documents.find(d => d.id === id);
    if (!document) {
      throw new Error('مستند مورد نظر یافت نشد.');
    }
    return document;
  },

  async uploadDocument(projectId: string, file: File): Promise<Document> {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('پروژه مورد نظر یافت نشد.');
    }
    const newDocument: Document = {
      id: `d${documents.length + 1}`,
      projectId,
      projectTitle: project.title,
      type: 'مستند فنی دریایی',
      fileName: file.name,
      fileUrl: `/files/${file.name}`,
      version: 1,
      status: 'pending',
      uploadedBy: currentUser?.name || '',
      uploadedAt: new Date().toISOString(),
    };
    documents.push(newDocument);
    return newDocument;
  },

  async reviewDocument(id: string, review: DocumentReview): Promise<Document> {
    await delay();
    const index = documents.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('مستند مورد نظر یافت نشد.');
    }

    let newStatus: Document['status'] = 'under_review';
    if (review.action === 'approve') {
      newStatus = currentUser?.role === 'manager' ? 'final_approved' : 'approved_stage1';
    } else if (review.action === 'reject') {
      newStatus = 'rejected';
    } else {
      newStatus = 'needs_revision';
    }

    documents[index] = {
      ...documents[index],
      status: newStatus,
      reviewedBy: currentUser?.name,
      reviewedAt: new Date().toISOString(),
    };

    if (review.comment) {
      comments.push({
        id: `c${comments.length + 1}`,
        documentId: id,
        userId: currentUser?.id || '',
        userName: currentUser?.name || '',
        userRole: currentUser?.role || 'expert',
        content: review.comment,
        createdAt: new Date().toISOString(),
        isInternal: review.action === 'approve',
      });
    }

    return documents[index];
  },

  async getDocumentComments(documentId: string): Promise<ReviewComment[]> {
    await delay();
    return comments.filter(c => c.documentId === documentId);
  },
};

// Certificates API
export const certificatesApi = {
  async getCertificate(projectId: string): Promise<Certificate | null> {
    await delay();
    return certificates.find(c => c.projectId === projectId) || null;
  },

  async verifyCertificate(certificateNumber: string): Promise<Certificate | null> {
    await delay();
    return certificates.find(c => c.certificateNumber === certificateNumber) || null;
  },

  async issueCertificate(projectId: string): Promise<Certificate> {
    await delay();
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('پروژه مورد نظر یافت نشد.');
    }
    const newCertificate: Certificate = {
      id: `cert${certificates.length + 1}`,
      certificateNumber: `SEA-2025-${String(certificates.length + 1).padStart(6, '0')}`,
      projectId,
      projectTitle: project.title,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      issuedBy: currentUser?.name || '',
      qrCode: `QR-SEA-2025-${String(certificates.length + 1).padStart(6, '0')}`,
      digitalSignatures: [
        {
          id: `sig${Date.now()}`,
          userId: currentUser?.id || '',
          userName: currentUser?.name || '',
          level: 'level2',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    certificates.push(newCertificate);

    // Update project status
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      projects[projectIndex].status = 'approved';
    }

    return newCertificate;
  },
};

// Notifications API
export const notificationsApi = {
  async getNotifications(userId?: string): Promise<Notification[]> {
    await delay();
    if (userId) {
      return notifications.filter(n => n.userId === userId);
    }
    return notifications.filter(n => n.userId === currentUser?.id);
  },

  async markNotificationRead(id: string): Promise<void> {
    await delay(200);
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].isRead = true;
    }
  },

  async markAllRead(): Promise<void> {
    await delay(200);
    notifications = notifications.map(n =>
      n.userId === currentUser?.id
        ? {
            ...n,
            isRead: true,
          }
        : n,
    );
  },
};

// Admin API (used by admin + manager views)
export const adminApi = {
  async getUsers(): Promise<User[]> {
    await delay();
    return mockUsers;
  },

  async updateUserRole(userId: string, role: User['role']): Promise<User> {
    await delay();
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('کاربر مورد نظر یافت نشد.');
    }
    user.role = role;
    return user;
  },

  async setFastTrackPermission(
    userId: string,
    canRequestFastTrack: boolean,
  ): Promise<User> {
    await delay();
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('کاربر مورد نظر یافت نشد.');
    }
    user.canRequestFastTrack = canRequestFastTrack;
    return user;
  },

  async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogEvent[]> {
    await delay();
    let filtered = [...auditLogs];
    if (filters?.eventType) {
      filtered = filtered.filter(log => log.eventType === filters.eventType);
    }
    if (filters?.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }
    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  },
};

// Dashboard API
export const dashboardApi = {
  async getStats(role: User['role']): Promise<DashboardStats> {
    await delay();
    return mockDashboardStats[role] || mockDashboardStats.client;
  },
};

