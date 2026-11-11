import type {
  DashboardStats,
  Review,
  ReviewFilters,
  ReviewsResponse,
  SubmitReviewData,
  TaskFilters,
  TasksResponse,
  TaskSummary,
  Task,
  InsightsResponse,
  InsightReport,
  AgentStatus,
} from './types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'API error');
  }
  return res.json();
}

export const api = {
  // Dashboard
  getStats: () => request<DashboardStats>('/dashboard/stats'),

  // Reviews
  getReviews: (params?: ReviewFilters) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.sentiment) query.set('sentiment', params.sentiment);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return request<ReviewsResponse>(`/reviews?${query}`);
  },
  getReview: (id: string) => request<Review>(`/reviews/${id}`),
  submitReview: (data: SubmitReviewData) =>
    request<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  approveReview: (id: string) =>
    request<Review>(`/reviews/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approvedBy: 'owner' }),
    }),
  rejectReview: (id: string) =>
    request<Review>(`/reviews/${id}/reject`, { method: 'PATCH' }),
  importReviews: (reviews: SubmitReviewData[]) =>
    request<{ count: number }>('/reviews/import', {
      method: 'POST',
      body: JSON.stringify({ reviews }),
    }),

  // Tasks
  getTasks: (params?: TaskFilters) => {
    const query = new URLSearchParams();
    if (params?.team) query.set('team', params.team);
    if (params?.status) query.set('status', params.status);
    if (params?.grouped) query.set('grouped', 'true');
    return request<TasksResponse>(`/tasks?${query}`);
  },
  updateTask: (id: string, status: string) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getTaskSummary: () => request<TaskSummary>('/tasks/summary'),

  // Insights
  generateInsights: (periodDays?: number) =>
    request<{ message: string }>('/insights/generate', {
      method: 'POST',
      body: JSON.stringify({ periodDays }),
    }),
  getInsights: () => request<InsightsResponse>('/insights'),
  getInsight: (id: string) => request<InsightReport>(`/insights/${id}`),

  // Agents
  getAgents: () => request<AgentStatus[]>('/agents'),
  toggleAgent: (id: string) =>
    request<AgentStatus>(`/agents/${id}/toggle`, { method: 'PATCH' }),
  runAllAgents: () =>
    request<{ message: string }>('/agents/run-all', { method: 'POST' }),
};
