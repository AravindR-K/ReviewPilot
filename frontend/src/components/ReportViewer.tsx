import Markdown from 'react-markdown';
import type { InsightReport } from '../api/types';
import { TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';

interface ReportViewerProps {
  report: InsightReport;
}

export default function ReportViewer({ report }: ReportViewerProps) {
  const trendIcon =
    report.ratingTrend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-emerald-600" />
    ) : report.ratingTrend === 'down' ? (
      <TrendingDown className="h-4 w-4 text-rose-600" />
    ) : (
      <Minus className="h-4 w-4 text-gray-400" />
    );

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-600">Total Reviews</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {report.totalReviews}
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-600">Avg Rating</p>
          <div className="mt-1 flex items-center gap-1.5">
            <p className="text-2xl font-bold text-amber-900">
              {report.avgRating?.toFixed(1) ?? 'N/A'}
            </p>
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4">
          <p className="text-xs font-medium text-purple-600">Rating Trend</p>
          <div className="mt-1 flex items-center gap-1.5">
            {trendIcon}
            <span className="text-lg font-semibold capitalize text-purple-900">
              {report.ratingTrend || 'N/A'}
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-600">Period</p>
          <p className="mt-1 text-sm font-semibold text-emerald-900">
            {new Date(report.periodStart).toLocaleDateString()} –{' '}
            {new Date(report.periodEnd).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      {report.sentimentBreakdown && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Sentiment Breakdown
          </h4>
          <div className="flex gap-4">
            <div className="flex-1 rounded-lg bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">
                {report.sentimentBreakdown.positive}
              </p>
              <p className="text-xs text-emerald-600">Positive</p>
            </div>
            <div className="flex-1 rounded-lg bg-amber-50 p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">
                {report.sentimentBreakdown.neutral}
              </p>
              <p className="text-xs text-amber-600">Neutral</p>
            </div>
            <div className="flex-1 rounded-lg bg-rose-50 p-3 text-center">
              <p className="text-2xl font-bold text-rose-700">
                {report.sentimentBreakdown.negative}
              </p>
              <p className="text-xs text-rose-600">Negative</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Complaints */}
      {report.topComplaints && report.topComplaints.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Top Complaints
          </h4>
          <div className="space-y-2">
            {report.topComplaints.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-rose-50 px-4 py-2">
                <span className="text-sm font-medium text-rose-800">
                  {c.topic}
                </span>
                <span className="text-sm font-bold text-rose-700">
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Praises */}
      {report.topPraises && report.topPraises.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Top Praises
          </h4>
          <div className="space-y-2">
            {report.topPraises.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-2">
                <span className="text-sm font-medium text-emerald-800">
                  {p.topic}
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  {p.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Action */}
      {report.suggestedAction && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
          <h4 className="text-sm font-semibold text-indigo-700 mb-2">
            💡 Suggested Action
          </h4>
          <p className="text-sm text-indigo-900">{report.suggestedAction}</p>
        </div>
      )}

      {/* Full Report Markdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">
          Full Report
        </h4>
        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700">
          <Markdown>{report.fullReport}</Markdown>
        </div>
      </div>
    </div>
  );
}
