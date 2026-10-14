import React, { useState } from 'react';
import {
  X,
  Send,
  AlertCircle,
  CheckCircle2,
  Flag,
  ShieldCheck,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { reportDispute } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisputeModal({ isOpen, onClose, scanResult }) {
  const [reportType, setReportType] = useState('FALSE_POSITIVE');
  const [comment, setComment] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const url = scanResult?.url || '';
  const verdict = scanResult?.verdict || 'UNKNOWN';
  const trustScore = scanResult?.trust_score;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSubmitSuccess(null);

    try {
      const response = await reportDispute({
        url,
        reportType,
        comment: comment.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        originalVerdict: verdict,
        originalTrustScore: typeof trustScore === 'number' ? trustScore : undefined,
      });

      setSubmitSuccess(response.message || 'Report submitted successfully.');
      setTimeout(() => {
        onClose();
        setSubmitSuccess(null);
        setComment('');
        setContactEmail('');
      }, 2200);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative bg-slate-950/90 text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Submit Threat Dispute / Review
              </h2>
              <p className="text-xs text-slate-400">
                Feeds into SentiGuard continuous retraining loop.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target URL Display */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Target URL
            </label>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 truncate">
              {url}
            </div>
          </div>

          {/* Current Verdict Pill */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Current AI Verdict:</span>
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                verdict === 'SAFE'
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                  : 'text-rose-400 bg-rose-950/40 border-rose-500/30'
              }`}
            >
              {verdict} ({trustScore}/100)
            </span>
          </div>

          {/* Report Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Dispute Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReportType('FALSE_POSITIVE')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  reportType === 'FALSE_POSITIVE'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold mb-0.5 text-[11px]">False Positive</div>
                <div className="text-[10px] text-slate-400">Legitimate site marked as phishing</div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('FALSE_NEGATIVE')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  reportType === 'FALSE_NEGATIVE'
                    ? 'border-rose-500 bg-rose-950/40 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold mb-0.5 text-[11px]">False Negative</div>
                <div className="text-[10px] text-slate-400">Phishing link marked as safe</div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('NEW_THREAT')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  reportType === 'NEW_THREAT'
                    ? 'border-purple-500 bg-purple-950/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold mb-0.5 text-[11px]">Zero-Day Threat</div>
                <div className="text-[10px] text-slate-400">Active new phishing campaign</div>
              </button>
            </div>
          </div>

          {/* Rationale / Comment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Reason / Evidence (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., Internal company SSO portal erroneously flagged; brand impersonation in subdomain..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              maxLength={2000}
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Contact Email (Optional)
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="security@enterprise.com"
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              maxLength={256}
            />
          </div>

          {/* Feedback Alerts */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-300"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{submitSuccess}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!submitSuccess}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
