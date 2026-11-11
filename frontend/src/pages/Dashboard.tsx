import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../api/client';
import type { DashboardStats } from '../api/types';
import StatsCard from '../components/StatsCard';
import SentimentBadge from '../components/SentimentBadge';

const SENTIMENT_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700 font-medium">Failed to load dashboard</p>
        <p className="text-sm text-red-500 mt-1">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const sentimentData = [
    { name: 'Positive', value: stats.sentimentBreakdown.positive },
    { name: 'Neutral', value: stats.sentimentBreakdown.neutral },
    { name: 'Negative', value: stats.sentimentBreakdown.negative },
  ];

  const ratingData = stats.ratingDistribution.map((d) => ({
    name: `${d.rating}★`,
    count: d.count,
  }));

  const maxTopicCount = Math.max(...stats.topTopics.map((t) => t.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Real-time overview of your restaurant reviews
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Reviews"
          value={stats.totalReviews}
          icon={MessageSquare}
          color="bg-blue-600"
        />
        <StatsCard
          title="Avg Rating"
          value={`${stats.avgRating.toFixed(1)} ⭐`}
          icon={Star}
          color="bg-amber-500"
        />
        <StatsCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={Clock}
          color="bg-orange-500"
        />
        <StatsCard
          title="Open Tasks"
          value={stats.openTasks}
          icon={AlertTriangle}
          color="bg-rose-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sentiment Pie Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sentiment Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {sentimentData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SENTIMENT_COLORS[index]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Rating Distribution Bar Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Rating Distribution
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Complaint Topics */}
      {stats.topTopics.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Topics
          </h2>
          <div className="space-y-3">
            {stats.topTopics.map((topic) => (
              <div key={topic.topic} className="flex items-center gap-4">
                <span className="w-32 text-sm font-medium text-gray-700 truncate">
                  {topic.topic}
                </span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${(topic.count / maxTopicCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold text-gray-900">
                  {topic.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reviews Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Reviews
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentReviews.map((review) => (
                <>
                  <tr
                    key={review.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === review.id ? null : review.id
                      )
                    }
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {review.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {review.rating != null
                          ? [1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i <= review.rating!
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {review.sentiment ? (
                        <SentimentBadge sentiment={review.sentiment} />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 capitalize">
                        {review.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                  {expandedRow === review.id && (
                    <tr key={`${review.id}-expanded`}>
                      <td
                        colSpan={5}
                        className="px-6 py-4 bg-gray-50 text-sm text-gray-700"
                      >
                        {review.reviewText}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {stats.recentReviews.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No reviews yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
