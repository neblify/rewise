import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

/**
 * Wrapper around Clerk's auth() to support mock sessions in development.
 * If a 'mock_session' cookie exists and we are in dev mode, it returns
 * the mocked userId. Otherwise, it returns the real Clerk auth.
 */
export async function currentAuth() {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    const cookieStore = await cookies();
    const mockSession = cookieStore.get('mock_session');

    if (mockSession?.value) {
      return {
        userId: mockSession.value,
        sessionId: 'mock_session_id',
        getToken: async () => 'mock_token',
        debug: () => console.log('Mock auth active'),
      };
    }
  }

  return auth();
}
