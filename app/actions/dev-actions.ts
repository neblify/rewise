'use server';

import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { redirect } from 'next/navigation';

export async function loginAsRole(role: 'teacher' | 'student' | 'parent') {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('This action is only available in development mode');
  }

  await dbConnect();

  // Find an existing user with this role
  let user = await User.findOne({ role });

  if (!user) {
    // specific logic for parent to ensure they have children if needed,
    // but for now simple creation is fine.
    // We might need to handle the unique clerkId constraint carefully.
    const mockClerkId = `mock_${role}_${Date.now()}`;

    user = await User.create({
      clerkId: mockClerkId,
      email: `mock_${role}@example.com`,
      role,
      firstName: `Mock`,
      lastName: `${role.charAt(0).toUpperCase() + role.slice(1)}`,
      // Add necessary fields based on role if validation requires them
      ...(role === 'student' ? { grade: '10', board: 'NIOS' } : {}),
    });
  }

  const cookieStore = await cookies();
  cookieStore.set('mock_session', user.clerkId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // dev mode
  });

  redirect('/');
}

export async function clearMockSession() {
  if (process.env.NODE_ENV !== 'development') return;

  const cookieStore = await cookies();
  cookieStore.delete('mock_session');
  redirect('/');
}
