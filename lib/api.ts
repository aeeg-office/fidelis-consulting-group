// AEEG Practice Buddy - API Client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pb_token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    apiRequest('/auth/login', { method: 'POST', body: { username, password } }),
  
  register: (data: any) =>
    apiRequest('/auth/register', { method: 'POST', body: data }),
  
  getMe: () => apiRequest('/auth/me'),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),

  // Questions
  getQuestions: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return apiRequest(`/questions${params}`);
  },
  
  getQuestion: (id: string) => apiRequest(`/questions/${id}`),
  
  revealAnswer: (id: string) =>
    apiRequest(`/questions/${id}/reveal`, { method: 'POST' }),
  
  toggleBookmark: (id: string, note?: string) =>
    apiRequest(`/questions/${id}/bookmark`, { method: 'POST', body: { note } }),
  
  flagQuestion: (id: string, flagType: string, description: string) =>
    apiRequest(`/questions/${id}/flag`, { method: 'POST', body: { flagType, description } }),

  // Practice
  startSession: (data: any) =>
    apiRequest('/practice/sessions', { method: 'POST', body: data }),
  
  submitAnswer: (sessionId: string, data: any) =>
    apiRequest(`/practice/sessions/${sessionId}/answer`, { method: 'POST', body: data }),
  
  getSessions: () => apiRequest('/practice/sessions'),
  
  getSession: (id: string) => apiRequest(`/practice/sessions/${id}`),
  
  completeSession: (id: string) =>
    apiRequest(`/practice/sessions/${id}/complete`, { method: 'POST' }),

  // Mastery
  getMastery: () => apiRequest('/mastery'),
  getMasterySummary: () => apiRequest('/mastery/summary'),

  // Analytics
  getStudentAnalytics: () => apiRequest('/analytics/student'),

  // Assignments
  getAssignments: () => apiRequest('/assignments'),
  startAssignment: (id: string) =>
    apiRequest(`/assignments/${id}/start`, { method: 'POST' }),
  submitAssignment: (id: string) =>
    apiRequest(`/assignments/${id}/submit`, { method: 'POST' }),

  // Access Codes
  redeemCode: (code: string) =>
    apiRequest('/access-codes/redeem', { method: 'POST', body: { code } }),

  // Subscriptions
  getPlans: () => apiRequest('/subscriptions/plans'),
  getMySubscriptions: () => apiRequest('/subscriptions/my'),

  // Admin
  admin: {
    getQuestions: (filters?: Record<string, string>) => {
      const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
      return apiRequest(`/admin/questions${params}`);
    },
    createQuestion: (data: any) =>
      apiRequest('/admin/questions', { method: 'POST', body: data }),
    updateQuestion: (id: string, data: any) =>
      apiRequest(`/admin/questions/${id}`, { method: 'PUT', body: data }),
    bulkUpdateQuestions: (questionIds: string[], updates: any) =>
      apiRequest('/admin/questions/bulk', { method: 'POST', body: { questionIds, updates } }),
    getExams: () => apiRequest('/admin/exams'),
    createExam: (data: any) => apiRequest('/admin/exams', { method: 'POST', body: data }),
    createSubject: (data: any) => apiRequest('/admin/subjects', { method: 'POST', body: data }),
    createDomain: (data: any) => apiRequest('/admin/domains', { method: 'POST', body: data }),
    createCategory: (data: any) => apiRequest('/admin/categories', { method: 'POST', body: data }),
    createSubcategory: (data: any) => apiRequest('/admin/subcategories', { method: 'POST', body: data }),
    getUsers: (filters?: Record<string, string>) => {
      const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
      return apiRequest(`/admin/users${params}`);
    },
    updateUser: (id: string, data: any) =>
      apiRequest(`/admin/users/${id}`, { method: 'PUT', body: data }),
    getFlags: () => apiRequest('/admin/flags'),
    resolveFlag: (id: string, status: string) =>
      apiRequest(`/admin/flags/${id}`, { method: 'PUT', body: { status } }),
    getAuditLog: () => apiRequest('/admin/audit'),
    getAdminAnalytics: () => apiRequest('/analytics/admin'),
    createAccessCode: (data: any) =>
      apiRequest('/access-codes', { method: 'POST', body: data }),
    getAccessCodes: () => apiRequest('/access-codes'),
    createPlan: (data: any) =>
      apiRequest('/subscriptions/plans', { method: 'POST', body: data }),
    createSubscription: (data: any) =>
      apiRequest('/subscriptions/create', { method: 'POST', body: data }),
    assignSeat: (data: any) =>
      apiRequest('/subscriptions/seats', { method: 'POST', body: data }),
  },

  // Teacher
  teacher: {
    getClasses: () => apiRequest('/teacher/classes'),
    createClass: (data: any) =>
      apiRequest('/teacher/classes', { method: 'POST', body: data }),
    getClass: (id: string) => apiRequest(`/teacher/classes/${id}`),
    addStudent: (classId: string, studentId: string) =>
      apiRequest(`/teacher/classes/${classId}/students`, { method: 'POST', body: { studentId } }),
    removeStudent: (classId: string, studentId: string) =>
      apiRequest(`/teacher/classes/${classId}/students/${studentId}`, { method: 'DELETE' }),
    getAssignments: () => apiRequest('/teacher/assignments'),
    createAssignment: (data: any) =>
      apiRequest('/teacher/assignments', { method: 'POST', body: data }),
    getAssignment: (id: string) => apiRequest(`/teacher/assignments/${id}`),
    getStudents: () => apiRequest('/teacher/students'),
    createStudent: (data: any) =>
      apiRequest('/teacher/students', { method: 'POST', body: data }),
    inviteStudent: (studentId: string) =>
      apiRequest('/teacher/students/invite', { method: 'POST', body: { studentId } }),
    resetStudentPassword: (id: string, password: string) =>
      apiRequest(`/teacher/students/${id}/reset-password`, { method: 'POST', body: { password } }),
    suspendStudent: (id: string) =>
      apiRequest(`/teacher/students/${id}/suspend`, { method: 'PUT' }),
    restoreStudent: (id: string) =>
      apiRequest(`/teacher/students/${id}/restore`, { method: 'PUT' }),
    getStudentProgress: (id: string) =>
      apiRequest(`/teacher/students/${id}/progress`),
    getClassAnalytics: (classId: string) =>
      apiRequest(`/analytics/teacher/class/${classId}`),
  },
};

export default api;