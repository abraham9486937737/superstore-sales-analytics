import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageSquare, Send } from "lucide-react";

function resolveFeedbackApiUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return `${configuredBaseUrl.replace(/\/$/, "")}/api/feedback`;
  }

  if (typeof window !== "undefined" && window.location.port === "4173") {
    return "http://localhost:3001/api/feedback";
  }

  return "/api/feedback";
}

function resolveFeedbackHealthUrl() {
  return resolveFeedbackApiUrl().replace(/\/feedback$/, "/health");
}

/**
 * FeedbackForm
 * Purpose: User suggestions form that sends feedback via the Express + Nodemailer backend.
 * Accessibility: All inputs have id/htmlFor pairs, required labels, and ARIA attributes.
 */
function FeedbackForm({ isDark = false }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [serverStatus, setServerStatus] = useState({ loading: true, online: false, emailConfigured: false });
  const feedbackApiUrl = resolveFeedbackApiUrl();
  const feedbackHealthUrl = resolveFeedbackHealthUrl();

  useEffect(() => {
    let active = true;

    async function loadHealth() {
      try {
        const response = await fetch(feedbackHealthUrl);
        const data = await response.json().catch(() => ({}));
        if (!active) {
          return;
        }
        setServerStatus({
          loading: false,
          online: response.ok,
          emailConfigured: Boolean(data.emailConfigured),
        });
      } catch {
        if (!active) {
          return;
        }
        setServerStatus({ loading: false, online: false, emailConfigured: false });
      }
    }

    loadHealth();

    return () => {
      active = false;
    };
  }, [feedbackHealthUrl]);

  const canSubmit = name.trim() && email.trim() && message.trim() && status !== "sending";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("sending");
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(feedbackApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      setStatus("success");
      setSuccessMsg(data.message || "Feedback processed successfully.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err.message ||
          "Could not send feedback. Make sure the backend server is running on port 3001, then try again."
      );
    }
  };

  const inputCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200 ${
    isDark
      ? "border-slate-600 bg-slate-800 text-slate-100 placeholder-slate-500"
      : "border-slate-300 bg-white text-slate-800 placeholder-slate-400"
  }`;

  const labelCls = `mb-1.5 block text-xs font-semibold uppercase tracking-wide ${
    isDark ? "text-slate-300" : "text-slate-600"
  }`;

  if (status === "success") {
    return (
      <div className="mt-6 flex min-h-[55vh] flex-col items-center justify-center gap-5 text-center">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full ${
            isDark ? "bg-emerald-900/60" : "bg-emerald-100"
          }`}
        >
          <CheckCircle2 size={44} className="text-emerald-500" aria-hidden="true" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Thank You!
        </h2>
        <p className={`max-w-sm text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          {successMsg || "Your feedback has been sent to our team. We appreciate you helping us improve the dashboard."}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
      {/* Info panel */}
      <div
        className={`rounded-2xl border p-6 ${
          isDark ? "border-slate-700 bg-slate-800/60" : "border-blue-100 bg-blue-50/70"
        }`}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow">
          <MessageSquare size={22} aria-hidden="true" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Share Your Feedback
        </h2>
        <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          Have suggestions, found a bug, or want a new feature? We&apos;d love to hear from you.
          Your feedback directly shapes the next version of this dashboard.
        </p>

        <ul className={`mt-4 space-y-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          <li>• Feature requests &amp; improvements</li>
          <li>• Bug reports &amp; data quality issues</li>
          <li>• New chart or KPI suggestions</li>
          <li>• Performance or UI comments</li>
          <li>• General feedback</li>
        </ul>

        <div
          className={`mt-5 rounded-xl border p-3 text-xs ${
            isDark ? "border-slate-700 text-slate-400" : "border-blue-200 text-slate-500"
          }`}
        >
          <p className="font-semibold">Responses sent to:</p>
          <p className="mt-1 font-mono">abraham.gobi@gmail.com</p>
        </div>

        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            serverStatus.loading
              ? isDark
                ? "border-slate-700 bg-slate-900/60 text-slate-300"
                : "border-slate-200 bg-slate-50 text-slate-600"
              : serverStatus.online && serverStatus.emailConfigured
              ? isDark
                ? "border-emerald-800 bg-emerald-950/50 text-emerald-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
              : serverStatus.online
              ? isDark
                ? "border-amber-800 bg-amber-950/50 text-amber-200"
                : "border-amber-200 bg-amber-50 text-amber-700"
              : isDark
              ? "border-rose-800 bg-rose-950/50 text-rose-200"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {serverStatus.loading && "Checking feedback server status..."}
          {!serverStatus.loading && serverStatus.online && serverStatus.emailConfigured && "Feedback server is online and email delivery is configured."}
          {!serverStatus.loading && serverStatus.online && !serverStatus.emailConfigured && "Feedback server is online, but email delivery is not configured yet. Submissions will be accepted but not emailed."}
          {!serverStatus.loading && !serverStatus.online && "Feedback server is offline. Start the backend on port 3001 before submitting."}
        </div>

        <p className={`mt-3 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Requires the feedback backend server to be running. See{" "}
          <code className="rounded bg-slate-200/60 px-1 py-0.5 text-xs dark:bg-slate-700/60">
            src/server/README.md
          </code>{" "}
          for setup.
        </p>
      </div>

      {/* Form panel */}
      <form
        onSubmit={handleSubmit}
        aria-label="User feedback form"
        noValidate
        className={`rounded-2xl border p-6 shadow-md ${
          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="fb-name" className={labelCls}>
              Your Name <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="fb-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
              aria-required="true"
              autoComplete="name"
              maxLength={120}
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="fb-email" className={labelCls}>
              Email Address <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="fb-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              aria-required="true"
              autoComplete="email"
              maxLength={254}
              className={inputCls}
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="fb-message" className={labelCls}>
              Your Feedback <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <textarea
              id="fb-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think, what's missing, or what could be improved…"
              required
              aria-required="true"
              rows={6}
              maxLength={5000}
              className={`${inputCls} resize-y`}
            />
            <p className={`mt-1 text-right text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {message.length}/5000
            </p>
          </div>
        </div>

        {/* Error message */}
        {status === "error" && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {errorMsg}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send size={16} aria-hidden="true" />
              Send Feedback
            </>
          )}
        </button>

        <p className={`mt-3 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Fields marked <span className="text-red-500">*</span> are required.
        </p>
      </form>
    </div>
  );
}

export default FeedbackForm;
