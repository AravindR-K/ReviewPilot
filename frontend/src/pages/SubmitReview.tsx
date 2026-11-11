import { useState } from 'react';
import { api } from '../api/client';
import { Star, Send, CheckCircle } from 'lucide-react';

export default function SubmitReview() {
  const [customerName, setCustomerName] = useState('');
  const [platform, setPlatform] = useState('form');
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !reviewText.trim()) {
      setError('Please fill in your name and review.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.submitReview({
        customerName: customerName.trim(),
        platform,
        rating: rating ?? undefined,
        reviewText: reviewText.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setCustomerName('');
        setPlatform('form');
        setRating(null);
        setReviewText('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Share Your Experience</h1>
        <p className="mt-2 text-gray-500">
          Tell us about your visit to Spice Garden. Your feedback helps us improve!
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {submitted ? (
          <div className="flex flex-col items-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Thank You!</h2>
            <p className="mt-2 text-center text-gray-500">
              Your review has been submitted. Our AI agents will process it shortly
              and you'll receive a personalized response.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="form">Direct Feedback</option>
                <option value="google">Google</option>
                <option value="swiggy">Swiggy</option>
                <option value="zomato">Zomato</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rating
              </label>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star === rating ? null : star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        (hoverRating ?? rating ?? 0) >= star
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {rating && (
                  <span className="ml-2 self-center text-sm text-gray-500">
                    {rating}/5
                  </span>
                )}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Review <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us about your experience... (supports English, Tamil, Hindi, and Tanglish)"
                rows={5}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="mt-1 text-xs text-gray-400">
                {reviewText.length} characters
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Submit Review
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
