// AEEG Practice Buddy - API Client (Enterprise Edition)
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
  revealAnswer: (id: string) => apiRequest(`/questions/${id}/reveal`, { method: 'POST' }),
  toggleBookmark: (id: string, note?: string) =>
    apiRequest(`/questions/${id}/bookmark`, { method: 'POST', body: { note } }),
  flagQuestion: (id: string, flagType: string, description: string) =>
    apiRequest(`/questions/${id}/flag`, { method: 'POST', body: { flagType, description } }),

  // Practice
  startSession: (data: any) => apiRequest('/practice/sessions', { method: 'POST', body: data }),
  submitAnswer: (sessionId: string, data: any) =>
    apiRequest(`/practice/sessions/${sessionId}/answer`, { method: 'POST', body: data }),
  getSessions: () => apiRequest('/practice/sessions'),
  getSession: (id: string) => apiRequest(`/practice/sessions/${id}`),
  completeSession: (id: string) => apiRequest(`/practice/sessions/${id}/complete`, { method: 'POST' }),

  // Mastery
  getMastery: () => apiRequest('/mastery'),
  getMasterySummary: () => apiRequest('/mastery/summary'),

  // Analytics
  getStudentAnalytics: () => apiRequest('/analytics/student'),

  // Assignments
  getAssignments: () => apiRequest('/assignments'),
  startAssignment: (id: string) => apiRequest(`/assignments/${id}/start`, { method: 'POST' }),
  submitAssignment: (id: string) => apiRequest(`/assignments/${id}/submit`, { method: 'POST' }),

  // Access Codes
  redeemCode: (code: string) => apiRequest('/access-codes/redeem', { method: 'POST', body: { code } }),

  // Subscriptions
  getPlans: () => apiRequest('/subscriptions/plans'),
  getMySubscriptions: () => apiRequest('/subscriptions/my'),

  // ─── ENTERPRISE API EXTENSIONS ───

  // MicroSkills
  getMicroSkills: (categoryId?: string) =>
    apiRequest(`/micro-skills${categoryId ? `?categoryId=${categoryId}` : ''}`),
  createMicroSkill: (data: any) => apiRequest('/micro-skills', { method: 'POST', body: data }),

  // Learning Objects
  getLearningObjects: (skillId?: string) =>
    apiRequest(`/learning-objects${skillId ? `?microSkillId=${skillId}` : ''}`),
  getLearningObject: (id: string) => apiRequest(`/learning-objects/${id}`),
  createLearningObject: (data: any) => apiRequest('/learning-objects', { method: 'POST', body: data }),

  // Diagnostics
  startDiagnostic: (examType: string) =>
    apiRequest('/diagnostics/start', { method: 'POST', body: { examType } }),
  submitDiagnosticAnswer: (sessionId: string, data: any) =>
    apiRequest(`/diagnostics/${sessionId}/answer`, { method: 'POST', body: data }),
  completeDiagnostic: (sessionId: string) =>
    apiRequest(`/diagnostics/${sessionId}/complete`, { method: 'POST' }),
  getDiagnosticResults: () => apiRequest('/diagnostics/results'),
  getDiagnosticRecommendations: () => apiRequest('/diagnostics/recommendations'),

  // Mock Exams
  getMockExams: (examId?: string) =>
    apiRequest(`/mock-exams${examId ? `?examId=${examId}` : ''}`),
  startMockExam: (mockExamId: string) =>
    apiRequest('/mock-exams/start', { method: 'POST', body: { mockExamId } }),
  submitMockExamAnswer: (attemptId: string, data: any) =>
    apiRequest(`/mock-exams/${attemptId}/answer`, { method: 'POST', body: data }),
  completeMockExam: (attemptId: string) =>
    apiRequest(`/mock-exams/${attemptId}/complete`, { method: 'POST' }),
  getMockExamResults: (attemptId: string) =>
    apiRequest(`/mock-exams/${attemptId}/results`),

  // Speaking
  uploadSpeaking: (promptId: string, audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('promptId', promptId);
    const token = typeof window !== 'undefined' ? localStorage.getItem('pb_token') : null;
    return fetch(`${API_BASE}/speaking/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    }).then(r => r.json());
  },
  getSpeakingResults: () => apiRequest('/speaking/results'),

  // Writing
  startWritingSession: (promptId: string) =>
    apiRequest('/writing/start-session', { method: 'POST', body: { promptId } }),
  submitWriting: (sessionId: string, content: string) =>
    apiRequest(`/writing/${sessionId}/submit`, { method: 'POST', body: { content } }),
  getWritingResults: () => apiRequest('/writing/results'),

  // Teacher Workflow
  getPendingReviews: () => apiRequest('/teacher/pending-reviews'),
  getSubmissions: (type?: string) =>
    apiRequest(`/teacher/submissions${type ? `?type=${type}` : ''}`),
  reviewSubmission: (submissionId: string, data: any) =>
    apiRequest(`/teacher/review/${submissionId}`, { method: 'PUT', body: data }),
  approveSubmission: (submissionId: string) =>
    apiRequest(`/teacher/approve/${submissionId}`, { method: 'PUT' }),
  returnSubmission: (submissionId: string, notes: string) =>
    apiRequest(`/teacher/return/${submissionId}`, { method: 'PUT', body: { notes } }),

  // Analytics (Enterprise)
  getTeacherAnalytics: () => apiRequest('/analytics/teacher'),
  getParentAnalytics: () => apiRequest('/analytics/parent'),
  getAdminAnalytics: () => apiRequest('/analytics/admin'),
  getSchoolAnalytics: () => apiRequest('/analytics/school'),

  // Adaptive Learning
  getNextSkill: (subjectId?: string) =>
    apiRequest('/adaptive/next-skill', { method: 'POST', body: { subjectId } }),
  getRecommendations: () => apiRequest('/adaptive/recommendations', { method: 'POST' }),
  predictScore: (targetExam: string, targetDate: string) =>
    apiRequest('/adaptive/predict-score', { method: 'POST', body: { targetExam, targetDate } }),
  generateStudySchedule: (targetExam: string, targetDate: string, hoursPerWeek: number) =>
    apiRequest('/adaptive/study-schedule', { method: 'POST', body: { targetExam, targetDate, hoursPerWeek } }),

  // Subscriptions (Enterprise Licensing)
  getLicenses: () => apiRequest('/subscriptions/licenses'),
  activateLicense: (planId: string, type: string) =>
    apiRequest('/subscriptions/activate', { method: 'POST', body: { planId, type } }),
  cancelLicense: (licenseId: string) =>
    apiRequest(`/subscriptions/${licenseId}/cancel`, { method: 'PUT' }),
  assignSeat: (licenseId: string, userId: string) =>
    apiRequest('/subscriptions/assign-seat', { method: 'POST', body: { licenseId, userId } }),

  // CMS
  cms: {
    createQuestion: (data: any) => apiRequest('/cms/questions', { method: 'POST', body: data }),
    updateQuestion: (id: string, data: any) => apiRequest(`/cms/questions/${id}`, { method: 'PUT', body: data }),
    createLearningObject: (data: any) => apiRequest('/cms/learning-objects', { method: 'POST', body: data }),
    updateLearningObject: (id: string, data: any) => apiRequest(`/cms/learning-objects/${id}`, { method: 'PUT', body: data }),
    createMockExam: (data: any) => apiRequest('/cms/mock-exams', { method: 'POST', body: data }),
    updateMockExam: (id: string, data: any) => apiRequest(`/cms/mock-exams/${id}`, { method: 'PUT', body: data }),
    uploadAudio: (file: File) => {
      const formData = new FormData();
      formData.append('audio', file);
      const token = typeof window !== 'undefined' ? localStorage.getItem('pb_token') : null;
      return fetch(`${API_BASE}/cms/audio`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      }).then(r => r.json());
    },
    getRubrics: () => apiRequest('/cms/rubrics'),
    createRubric: (data: any) => apiRequest('/cms/rubrics', { method: 'POST', body: data }),
    getCurricula: () => apiRequest('/cms/curricula'),
    createCurriculum: (data: any) => apiRequest('/cms/curricula', { method: 'POST', body: data }),
  },

  // Admin (existing)
  admin: {
    getQuestions: (filters?: Record<string, string>) => {
      const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
      return apiRequest(`/admin/questions${params}`);
    },
    createQuestion: (data: any) => apiRequest('/admin/questions', { method: 'POST', body: data }),
    updateQuestion: (id: string, data: any) => apiRequest(`/admin/questions/${id}`, { method: 'PUT', body: data }),
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
    updateUser: (id: string, data: any) => apiRequest(`/admin/users/${id}`, { method: 'PUT', body: data }),
    getFlags: () => apiRequest('/admin/flags'),
    resolveFlag: (id: string, status: string) =>
      apiRequest(`/admin/flags/${id}`, { method: 'PUT', body: { status } }),
    getAuditLog: () => apiRequest('/admin/audit'),
    getAdminAnalytics: () => apiRequest('/analytics/admin'),
    createAccessCode: (data: any) => apiRequest('/access-codes', { method: 'POST', body: data }),
    getAccessCodes: () => apiRequest('/access-codes'),
    createPlan: (data: any) => apiRequest('/subscriptions/plans', { method: 'POST', body: data }),
    createSubscription: (data: any) => apiRequest('/subscriptions/create', { method: 'POST', body: data }),
    assignSeat: (data: any) => apiRequest('/subscriptions/seats', { method: 'POST', body: data }),
  },

  // Teacher (existing)
  teacher: {
    getClasses: () => apiRequest('/teacher/classes'),
    createClass: (data: any) => apiRequest('/teacher/classes', { method: 'POST', body: data }),
    getClass: (id: string) => apiRequest(`/teacher/classes/${id}`),
    addStudent: (classId: string, studentId: string) =>
      apiRequest(`/teacher/classes/${classId}/students`, { method: 'POST', body: { studentId } }),
    removeStudent: (classId: string, studentId: string) =>
      apiRequest(`/teacher/classes/${classId}/students/${studentId}`, { method: 'DELETE' }),
    getAssignments: () => apiRequest('/teacher/assignments'),
    createAssignment: (data: any) => apiRequest('/teacher/assignments', { method: 'POST', body: data }),
    getAssignment: (id: string) => apiRequest(`/teacher/assignments/${id}`),
    getStudents: () => apiRequest('/teacher/students'),
    createStudent: (data: any) => apiRequest('/teacher/students', { method: 'POST', body: data }),
    inviteStudent: (studentId: string) =>
      apiRequest('/teacher/students/invite', { method: 'POST', body: { studentId } }),
    resetStudentPassword: (id: string, password: string) =>
      apiRequest(`/teacher/students/${id}/reset-password`, { method: 'POST', body: { password } }),
    suspendStudent: (id: string) => apiRequest(`/teacher/students/${id}/suspend`, { method: 'PUT' }),
    restoreStudent: (id: string) => apiRequest(`/teacher/students/${id}/restore`, { method: 'PUT' }),
    getStudentProgress: (id: string) => apiRequest(`/teacher/students/${id}/progress`),
    getClassAnalytics: (classId: string) => apiRequest(`/analytics/teacher/class/${classId}`),
  },
};

export default api;