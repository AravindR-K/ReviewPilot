import { Star } from 'lucide-react';
import SentimentBadge from './SentimentBadge';
import TopicTag from './TopicTag';
import type { Review } from '../api/types';

interface ReviewCardProps {
  review: Review;
  expanded?: boolean;
  onToggle?: () => void;
}

function StarRating({ rating }: { rating?: number }) {
  if (rating == null) return <span className="text-xs text-gray-400">N/A</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new_raw: 'bg-blue-100 text-blue-700',
    collected: 'bg-sky-100 text-sky-700',
    analyzed: 'bg-violet-100 text-violet-700',
    reply_drafted: 'bg-amber-100 text-amber-700',
    reply_approved: 'bg-emerald-100 text-emerald-700',
    reply_auto_sent: 'bg-green-100 text-green-700',
    spam: 'bg-gray-200 text-gray-600',
    duplicate: 'bg-gray-200 text-gray-600',
  };

  const style = styles[status] || 'bg-gray-100 text-gray-700';
  const label = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}
    >
      {label}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const styles: Record<string, string> = {
    Google: 'bg-blue-50 text-blue-700 border-blue-200',
    Swiggy: 'bg-orange-50 text-orange-700 border-orange-200',
    Zomato: 'bg-red-50 text-red-700 border-red-200',
    Form: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const style = styles[platform] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {platform}
    </span>
  );
}

export default function ReviewCard({
  review,
  expanded,
  onToggle,
}: ReviewCardProps) {
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">
              {review.customerName}
            </h3>
            <PlatformBadge platform={review.platform} />
            <StatusBadge status={review.status} />
            {review.sentiment && (
              <SentimentBadge sentiment={review.sentiment} />
            )}
          </div>
          <StarRating rating={review.rating} />
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p
        className={`mt-3 text-sm text-gray-600 leading-relaxed ${
          expanded ? '' : 'line-clamp-2'
        }`}
      >
        {review.reviewText}
      </p>

      {review.topics && review.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.topics.map((topic) => (
            <TopicTag key={topic} topic={topic} />
          ))}
        </div>
      )}

      {expanded && review.draftReply && (
        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-xs font-semibold text-indigo-600 mb-1">
            Draft Reply
          </p>
          <p className="text-sm text-indigo-900">{review.draftReply}</p>
        </div>
      )}

      {expanded && review.urgency === 'urgent' && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-red-700">
            URGENT — {review.urgencyReason}
          </span>
        </div>
      )}
    </div>
  );
}

export { StarRating, StatusBadge, PlatformBadge };
