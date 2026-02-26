import { Resend } from 'resend';

/**
 * Email configuration:
 * - RESEND_API_KEY (required)
 * - NEXT_PUBLIC_APP_URL or VERCEL_URL for challenge link base URL
 * - INVITE_FROM_EMAIL (optional, defaults to "ReWise <info@nios.neblify.com>")
 */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL)
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://rewise.online';
}

export type OpenChallengeInviteParams = {
  testTitle: string;
  scoreToBeat: number;
  testId: string;
  /** Inviter display name or email; if missing, "Someone" is used */
  inviterDisplayName?: string;
};

export async function sendOpenChallengeInvite(
  to: string,
  params: OpenChallengeInviteParams
): Promise<{ sent: boolean; error?: string }> {
  if (!resend) {
    console.error('RESEND_API_KEY is missing; cannot send invite email');
    return { sent: false, error: 'Email service not configured' };
  }

  const baseUrl = getBaseUrl();
  const testPath = `/student/test/${params.testId}`;
  const challengeUrl = `${baseUrl}/sign-up?redirect_url=${encodeURIComponent(testPath)}`;

  const inviter = params.inviterDisplayName?.trim() || 'Someone';
  const subject = `You're invited to beat the score: ${params.testTitle}`;
  const text = [
    `${inviter} invited you to take an Open Challenge on ReWise.`,
    ``,
    `Challenge: ${params.testTitle}`,
    `Score to beat: ${params.scoreToBeat}`,
    ``,
    `Take the challenge here: ${challengeUrl}`,
    ``,
    `— ReWise`,
  ].join('\n');

  const html = [
    `<p>${inviter} invited you to take an Open Challenge on ReWise.</p>`,
    `<p><strong>Challenge:</strong> ${params.testTitle}</p>`,
    `<p><strong>Score to beat:</strong> ${params.scoreToBeat}</p>`,
    `<p><a href="${challengeUrl}">Take the challenge</a></p>`,
    `<p>— ReWise</p>`,
  ].join('');

  try {
    const from =
      process.env.INVITE_FROM_EMAIL || 'ReWise <info@nios.neblify.com>';
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error('Open Challenge invite email failed:', error);
      return { sent: false, error: String(error) };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Open Challenge invite email failed:', message);
    return { sent: false, error: message };
  }
}
