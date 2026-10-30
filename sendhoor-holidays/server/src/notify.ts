import nodemailer from 'nodemailer';

export interface Notification {
  subject: string;
  // Full text for email.
  text: string;
  // Short text for SMS and WhatsApp.
  short: string;
  replyTo?: string;
}

export type ChannelResult = 'sent' | 'failed' | 'not_configured';

export interface NotifyResult {
  email: ChannelResult;
  sms: ChannelResult;
  whatsapp: ChannelResult;
}

const env = (name: string) => process.env[name]?.trim() || undefined;

const list = (name: string) =>
  (env(name) ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const smtpPort = Number(env('SMTP_PORT') ?? 465);

const transporter = nodemailer.createTransport({
  host: env('SMTP_HOST') ?? 'smtp.gmail.com',
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
});

async function sendEmail(notification: Notification) {
  const to = env('OWNER_EMAIL');
  if (!to || !env('SMTP_USER') || !env('SMTP_PASS')) throw new NotConfigured();

  await transporter.sendMail({
    from: `Sendhoor Website <${env('SMTP_USER')}>`,
    to,
    replyTo: notification.replyTo,
    subject: notification.subject,
    text: notification.text,
  });
}

// Twilio sends both SMS and WhatsApp through the same REST endpoint.
async function sendTwilio(to: string, from: string, body: string) {
  const sid = env('TWILIO_ACCOUNT_SID');
  const token = env('TWILIO_AUTH_TOKEN');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });

  // Only the status is thrown. Twilio's error body can echo the phone number.
  if (!response.ok) throw new Error(`Twilio responded with status ${response.status}`);
}

async function sendSms(notification: Notification) {
  const from = env('TWILIO_SMS_FROM');
  const owners = list('OWNER_PHONES');
  if (!env('TWILIO_ACCOUNT_SID') || !env('TWILIO_AUTH_TOKEN') || !from || owners.length === 0) {
    throw new NotConfigured();
  }
  await Promise.all(owners.map((to) => sendTwilio(to, from, notification.short)));
}

async function sendWhatsApp(notification: Notification) {
  const from = env('TWILIO_WHATSAPP_FROM');
  const owners = list('OWNER_PHONES');
  if (!env('TWILIO_ACCOUNT_SID') || !env('TWILIO_AUTH_TOKEN') || !from || owners.length === 0) {
    throw new NotConfigured();
  }
  await Promise.all(
    owners.map((to) => sendTwilio(`whatsapp:${to}`, `whatsapp:${from}`, notification.short)),
  );
}

class NotConfigured extends Error {}

async function attempt(channel: 'email' | 'sms' | 'whatsapp', send: () => Promise<void>): Promise<ChannelResult> {
  try {
    await send();
    return 'sent';
  } catch (error) {
    if (error instanceof NotConfigured) {
      console.warn(`[notify] ${channel} is not configured. Check the .env file.`);
      return 'not_configured';
    }
    console.error(`[notify] ${channel} failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    return 'failed';
  }
}

// Sends to all three channels. One channel failing does not stop the others.
export async function notifyOwner(notification: Notification): Promise<NotifyResult> {
  const [email, sms, whatsapp] = await Promise.all([
    attempt('email', () => sendEmail(notification)),
    attempt('sms', () => sendSms(notification)),
    attempt('whatsapp', () => sendWhatsApp(notification)),
  ]);
  return { email, sms, whatsapp };
}
