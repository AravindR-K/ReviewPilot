import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { Review } from '../api/types';
import SentimentBadge from '../components/SentimentBadge';
import TopicTag from '../components/TopicTag';
import { CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

export default function ApprovalQueue() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      const data = await api.getReviews({ status: 'reply_drafted', limit: 50 });
      setReviews(data.reviews);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 3000);
    return () => clearInterval(interval);
  }, [fetchPending]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.approveReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await api.rejectReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Queue</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review AI-drafted replies before they're sent to customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
            {reviews.length} pending
          </span>
          <button
            onClick={fetchPending}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">All caught up!</h2>
          <p className="mt-2 text-gray-500">No reviews pending approval. 🎉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-xl border bg-white p-6 shadow-sm ${
                review.urgency === 'urgent'
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : 'border-gray-200'
              }`}
            >
              {/* Urgent banner */}
              {review.urgency === 'urgent' && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  <AlertTriangle className="h-4 w-4" />
                  URGENT — {review.urgencyReason?.replace(/_/g, ' ') || 'Food safety concern'}
                </div>
              )}

              {/* Customer info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.customerName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{review.platform}</span>
                      {review.rating && (
                        <span>
                          {'⭐'.repeat(review.rating)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.sentiment && <SentimentBadge sentiment={review.sentiment} />}
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Original review */}
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Original Review
                </p>
                <p className="mt-1 text-sm text-gray-700">{review.reviewText}</p>
                {review.topics && Array.isArray(review.topics) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(review.topics as string[]).map((t) => (
                      <TopicTag key={t} topic={t} />
                    ))}
                  </div>
                )}
              </div>

              {/* Drafted reply */}
              <div className="mt-3 rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">
                  AI-Drafted Reply
                </p>
                <p className="mt-1 text-sm text-gray-800">{review.draftReply}</p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleReject(review.id)}
                  disabled={actionLoading === review.id}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 text-rose-500" />
                  Reject & Re-draft
                </button>
                <button
                  onClick={() => handleApprove(review.id)}
                  disabled={actionLoading === review.id}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading === review.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Approve & Send
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
