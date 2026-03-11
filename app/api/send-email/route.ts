export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { loadLocaleConfig } from '@/lib/loadConfig';
import { buildRecommendationEmailHtml } from '@/lib/emailTemplate';

// Cloudflare Worker/Node.js compatible POST handler
export async function POST(request: Request) {
  let body: any = null;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { email, recommendations, guidance = '', thinkingProcess = '', notes = '', locale } = body || {};
  if (!email || !recommendations || !locale) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const config = await loadLocaleConfig(locale);
  if (!config) {
    return NextResponse.json({ error: 'Configuration not found.' }, { status: 404 });
  }
  const emailConfig = config.configuration.email;
  if (!emailConfig.enabled) {
    return NextResponse.json({ error: 'Email feature is disabled.' }, { status: 403 });
  }

  const { fromEmail, fromName, subject, adminEmail } = emailConfig;

  // Build email HTML (Worker-safe, no react-dom/server)
  let emailHtml = '';
  try {
    emailHtml = buildRecommendationEmailHtml(recommendations, {
      guidance,
      thinkingProcess,
      notes,
      templateConfig: emailConfig.template || {},
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to render email template.' }, { status: 500 });
  }

  // Use Resend API (Cloudflare/Node.js compatible)
  let data: any = null;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const safeFromName = String(fromName || '').replace(/[\r\n<>]/g, '').trim();

    data = await resend.emails.send({
      from: `${safeFromName || 'Quiz Results'} <${fromEmail}>`,
      to: email,
      bcc: adminEmail,
      subject,
      html: emailHtml,
      replyTo: adminEmail || fromEmail,
      tags: [
        { name: 'source', value: 'quiz-recommendation' },
        { name: 'locale', value: String(locale) },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to send email.' }, { status: 500 });
  }

  if (data?.error) {
    return NextResponse.json({ error: data.error.message || 'Failed to send email.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
