interface SentimentBadgeProps {
  sentiment: string;
}

export default function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    positive: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Positive' },
    neutral: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Neutral' },
    negative: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Negative' },
  };

  const c = config[sentiment] || { bg: 'bg-gray-100', text: 'text-gray-700', label: sentiment };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
}
