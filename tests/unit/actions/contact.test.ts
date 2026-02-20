import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 1. Hoist the mock function so it can be used in vi.mock factory
const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

// 2. Mock Resend module with a Class
vi.mock('resend', () => {
  return {
    Resend: class {
      emails: { send: typeof mockSend };
      constructor() {
        this.emails = {
          send: mockSend,
        };
      }
    },
  };
});

// 3. Import the action
import { submitContactForm } from '@/app/actions/contact';

describe('Contact Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock default successful response
    mockSend.mockResolvedValue({ data: { id: 'test_email_id' }, error: null });

    // Mock process.env
    vi.stubEnv('RESEND_API_KEY', 'test_api_key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('submitContactForm', () => {
    it('should fail if required fields are invalid', async () => {
      const formData = new FormData();
      formData.append('email', '');
      formData.append('subject', '');
      formData.append('message', 'Short'); // Too short

      const result = await submitContactForm({}, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Please fill in all required fields correctly.'
      );
      expect(result.errors?.message).toBeDefined();
    });

    it('should fail if API Key is missing', async () => {
      // We need to clear it specifically for this test
      vi.stubEnv('RESEND_API_KEY', '');

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('subject', 'Test Subject');
      formData.append('message', 'This is a valid long message.');

      const result = await submitContactForm({}, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Server configuration error. Please try again later.'
      );
    });

    it('should send email successfully', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('subject', 'Test Subject');
      formData.append('message', 'This is a valid message body.');

      const result = await submitContactForm({}, formData);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['deepak@neblify.com'],
          replyTo: 'test@example.com',
          subject: 'New Contact Form Submission: Test Subject',
        })
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Thank you! Your message has been sent successfully.'
      );
    });

    it('should handle Resend API errors', async () => {
      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'API Error' },
      });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('subject', 'Test Subject');
      formData.append('message', 'This is a valid message body.');

      const result = await submitContactForm({}, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to send message. Please try again.');
    });
  });
});
