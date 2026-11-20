'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, RotateCcw, Send } from 'lucide-react';

const TOPICS = [
  'General inquiry',
  'Bug report',
  'Format or conversion request',
  'Privacy & feedback',
] as const;

const MAX_MESSAGE_LENGTH = 4000;

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // spam honeypot

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address so we can reply.');
      return;
    }
    if (trimmedMessage.length < 10) {
      setError('Please enter a message of at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          topic,
          message: trimmedMessage,
          website,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
      };

      if (!response.ok || !data.ok) {
        setError(
          data.error ||
            'Your message could not be delivered right now. Please try again shortly.'
        );
        return;
      }

      setSentTo(true);
      setName('');
      setEmail('');
      setTopic(TOPICS[0]);
      setMessage('');
      setWebsite('');
    } catch {
      setError('Network error while sending your message. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 sm:p-8 dark:border-emerald-800 dark:bg-emerald-950/50">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h2 className="font-display text-lg font-bold text-emerald-950 dark:text-emerald-100">
              Message sent
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">
              Thanks for reaching out. Your note has been delivered, and any reply will go
              directly to the email address you provided.
            </p>
            <button
              type="button"
              onClick={() => setSentTo(false)}
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:bg-[#16201b] dark:text-emerald-100 dark:hover:bg-[#1e2b23]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Send another message</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-2xl border border-[#dde3d8] bg-white p-5 sm:p-7 dark:border-[#2a3a2f] dark:bg-[#16201b]"
    >
      <div>
        <h2 className="font-display text-lg font-bold text-[#16211a] dark:text-[#eef4ef]">
          Send a message
        </h2>
        <p className="mt-1 text-xs text-[#5b6b60] sm:text-sm dark:text-[#a7b8ac]">
          Questions, bug reports, or format requests — delivered directly via email.
        </p>
      </div>

      {/* Honeypot field hidden from human visitors */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Name
          </span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder="Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3.5 py-2.5 text-sm text-[#16211a] placeholder:text-[#5b6b60]/70 focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:placeholder:text-[#a7b8ac]/60 dark:focus:border-[#2dd4bf]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={160}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3.5 py-2.5 text-sm text-[#16211a] placeholder:text-[#5b6b60]/70 focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:placeholder:text-[#a7b8ac]/60 dark:focus:border-[#2dd4bf]"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
          Topic
        </span>
        <select
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3.5 py-2.5 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
        >
          {TOPICS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="flex items-center justify-between text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
          <span>Message</span>
          <span className="font-mono text-[11px] font-normal tabular-nums text-[#5b6b60] dark:text-[#a7b8ac]">
            {message.length} / {MAX_MESSAGE_LENGTH}
          </span>
        </span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Describe what you need help with, which browser you are using, or what feature you would like to see..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 w-full resize-y rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3.5 py-2.5 text-sm leading-relaxed text-[#16211a] placeholder:text-[#5b6b60]/70 focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:placeholder:text-[#a7b8ac]/60 dark:focus:border-[#2dd4bf]"
        />
      </label>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/70 dark:bg-red-950/60 dark:text-red-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-3 pt-1 sm:flex-row sm:items-center">
        <p className="text-xs text-[#5b6b60] dark:text-[#a7b8ac]">
          Please never attach or paste private images here — all image tools run 100% locally.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-all active:scale-[0.98] hover:bg-[#134e4a] disabled:opacity-50 sm:w-auto dark:bg-[#2dd4bf] dark:text-[#06231f] dark:hover:bg-[#5eead4]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending…</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send message</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
