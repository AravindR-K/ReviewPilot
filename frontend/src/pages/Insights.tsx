import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { InsightReport } from '../api/types';
import { BarChart3, TrendingUp, TrendingDown, Minus, FileText, Loader } from 'lucide-react';

export default function Insights() {
  const [reports, setReports] = useState<InsightReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [periodDays, setPeriodDays] = useState(7);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchReports = useCallback(async () => {
    try {
      const data = await api.getInsights();
      setReports(data.reports);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');
    try {
      const result = await api.generateInsights(periodDays);
      setMessage(result.message || 'Report generation started! It will appear shortly.');
      // Poll for the new report
      setTimeout(fetchReports, 5000);
      setTimeout(fetchReports, 10000);
      setTimeout(fetchReports, 20000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-rose-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Insights & Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          AI-generated weekly summaries of customer feedback trends
        </p>
      </div>

      {/* Generate section */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Generate New Report</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create an AI-powered analysis of recent reviews
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Period</label>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {generating ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                Generate Weekly Report
              </>
            )}
          </button>
        </div>
        {message && (
          <p className={`mt-3 text-sm ${message.startsWith('Error') ? 'text-rose-600' : 'text-emerald-600'}`}>
            {message}
          </p>
        )}
      </div>

      {/* Reports list */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-16">
          <FileText className="h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-500">No reports yet</h2>
          <p className="mt-1 text-sm text-gray-400">
            Generate your first weekly report above
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              {/* Report header */}
              <div
                className="flex cursor-pointer items-center justify-between p-6 hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {new Date(report.periodStart).toLocaleDateString()} —{' '}
                      {new Date(report.periodEnd).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {report.totalReviews} reviews analyzed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Quick stats */}
                  <div className="hidden items-center gap-4 sm:flex">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">
                        {report.avgRating?.toFixed(1) || 'N/A'}
                      </p>
                      <p className="text-[10px] text-gray-400">Avg Rating</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(report.ratingTrend || undefined)}
                      <span className="text-xs capitalize text-gray-500">
                        {report.ratingTrend || 'stable'}
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedId === report.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded report */}
              {expandedId === report.id && (
                <div className="border-t border-gray-100 px-6 pb-6">
                  {/* Sentiment breakdown */}
                  {report.sentimentBreakdown && (
                    <div className="mt-4 flex gap-3">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        👍 {(report.sentimentBreakdown as any).positive || 0} positive
                      </span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        😐 {(report.sentimentBreakdown as any).neutral || 0} neutral
                      </span>
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                        👎 {(report.sentimentBreakdown as any).negative || 0} negative
                      </span>
                    </div>
                  )}

                  {/* Full markdown report */}
                  <div className="mt-4 rounded-lg bg-gray-50 p-6">
                    <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                      {report.fullReport.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) {
                          return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
                        }
                        if (line.startsWith('### ')) {
                          return <h3 key={i} className="text-base font-semibold mt-3 mb-1">{line.replace('### ', '')}</h3>;
                        }
                        if (line.startsWith('- ') || line.startsWith('* ')) {
                          return <li key={i} className="ml-4 text-gray-700">{line.replace(/^[-*] /, '')}</li>;
                        }
                        if (line.match(/^\d+\./)) {
                          return <li key={i} className="ml-4 list-decimal text-gray-700">{line.replace(/^\d+\.\s*/, '')}</li>;
                        }
                        if (line.trim() === '') return <br key={i} />;
                        return <p key={i} className="text-gray-700">{line}</p>;
                      })}
                    </div>
                  </div>

                  {/* Suggested action */}
                  {report.suggestedAction && (
                    <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">
                        💡 Suggested Action
                      </p>
                      <p className="mt-1 text-sm font-medium text-indigo-800">
                        {report.suggestedAction}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
