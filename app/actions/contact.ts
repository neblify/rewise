'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export async function submitContactForm(
  prevState: unknown,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  const validatedFields = contactSchema.safeParse({
    email,
    subject,
    message,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Please fill in all required fields correctly.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Check for API key
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing');
    return {
      success: false,
      message: 'Server configuration error. Please try again later.',
    };
  }

  try {
    const { data: _data, error } = await resend.emails.send({
      from: 'ReWise <info@nios.neblify.com>', // Default testing domain
      to: ['deepak@neblify.com'],
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        New User Feedback/Issue Report
        
        From: ${email}
        Subject: ${subject}
        
        Message:
        ${message}
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return {
        success: false,
        message: 'Failed to send message. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
