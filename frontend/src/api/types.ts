export interface Review {
  id: string;
  platform: string;
  platformId?: string;
  customerName: string;
  rating?: number;
  reviewText: string;
  language?: string;
  status: string;
  sentiment?: string;
  topics?: string[];
  urgency?: string;
  urgencyReason?: string;
  draftReply?: string;
  replyLanguage?: string;
  replyApprovedBy?: string;
  replyApprovedAt?: string;
  finalReply?: string;
  isDuplicate: boolean;
  isSpam: boolean;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  reviewId: string;
  team: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  review?: Review;
}

export interface AgentStatus {
  id: string;
  isActive: boolean;
  lastRunAt?: string;
  lastError?: string;
  processedCount: number;
  updatedAt: string;
}

export interface InsightReport {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalReviews: number;
  avgRating?: number;
  ratingTrend?: string;
  topComplaints: Array<{ topic: string; count: number; examples: string[] }>;
  topPraises: Array<{ topic: string; count: number; examples: string[] }>;
  sentimentBreakdown?: { positive: number; neutral: number; negative: number };
  suggestedAction?: string;
  fullReport: string;
  createdAt: string;
}

export interface DashboardStats {
  totalReviews: number;
  avgRating: number;
  pendingApprovals: number;
  openTasks: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  ratingDistribution: Array<{ rating: number; count: number }>;
  recentReviews: Review[];
  topTopics: Array<{ topic: string; count: number }>;
}

export interface ReviewFilters {
  status?: string;
  sentiment?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaskFilters {
  team?: string;
  status?: string;
  grouped?: boolean;
}

export interface SubmitReviewData {
  platform?: string;
  customerName: string;
  rating?: number;
  reviewText: string;
  platformId?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
}

export interface InsightsResponse {
  reports: InsightReport[];
}

export interface TaskSummary {
  summary: Array<{ team: string; topic: string; count: number }>;
}
