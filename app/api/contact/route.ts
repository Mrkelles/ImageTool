import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const ALLOWED_TOPICS = new Set([
  'General inquiry',
  'Bug report',
  'Format or conversion request',
  'Privacy & feedback',
]);

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request payload.' },
      { status: 400 }
    );
  }

  const payload = (body ?? {}) as Record<string, unknown>;

  // Silently accept honeypot bot submissions without sending email
  if (typeof payload.website === 'string' && payload.website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const rawTopic = typeof payload.topic === 'string' ? payload.topic.trim() : '';
  const topic = ALLOWED_TOPICS.has(rawTopic) ? rawTopic : 'General inquiry';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json(
      { ok: false, error: 'Please provide your name (2–120 characters).' },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a valid email address.' },
      { status: 400 }
    );
  }

  if (message.length < 10 || message.length > 4000) {
    return NextResponse.json(
      { ok: false, error: 'Message must be between 10 and 4,000 characters.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || 'ImageTools <onboarding@resend.dev>';

  if (!apiKey || !toEmail) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Email delivery is not configured yet. Please set RESEND_API_KEY and CONTACT_TO_EMAIL in your server environment secrets.',
      },
      { status: 503 }
    );
  }

  try {
    const resend = new Resend(apiKey);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeTopic = escapeHtml(topic);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `[ImageTools · ${topic}] Message from ${name}`,
      text: [
        `New ImageTools contact form submission`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        `Topic: ${topic}`,
        ``,
        `Message:`,
        message,
      ].join('\n'),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #16211a; background: #f6f7f4; padding: 24px; border-radius: 14px;">
          <div style="background: #ffffff; border: 1px solid #dde3d8; border-radius: 12px; padding: 24px;">
            <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #0f766e;">ImageTools Contact Form</p>
            <h2 style="margin: 0 0 16px; font-size: 20px; color: #16211a;">${safeTopic}</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #5b6b60; width: 72px;"><strong>From</strong></td>
                <td style="padding: 6px 0; color: #16211a;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #5b6b60;"><strong>Email</strong></td>
                <td style="padding: 6px 0;"><a href="mailto:${safeEmail}" style="color: #0f766e;">${safeEmail}</a></td>
              </tr>
            </table>
            <div style="border-top: 1px solid #dde3d8; padding-top: 16px; font-size: 14px; line-height: 1.6; color: #16211a;">
              ${safeMessage}
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Contact API] Resend delivery error:', error);
      return NextResponse.json(
        {
          ok: false,
          error:
            error.message ||
            'Email delivery failed. Please verify your Resend sender domain and API key.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    console.error('[Contact API] Unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: 'Unexpected error while delivering your message.' },
      { status: 500 }
    );
  }
}
