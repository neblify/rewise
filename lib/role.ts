import { clerkClient } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';

export type NavbarVariant = 'student' | 'teacher' | 'parent' | 'admin';

export async function getRole(userId: string): Promise<string> {
  if (userId.startsWith('mock_')) {
    await dbConnect();
    const dbUser = await User.findOne({ clerkId: userId })
      .select('role')
      .lean();
    return dbUser?.role ?? 'student';
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (user.publicMetadata?.role as string) ?? 'student';
}

export function getRoleAsNavbarVariant(role: string): NavbarVariant {
  switch (role) {
    case 'teacher':
    case 'parent':
    case 'admin':
      return role;
    default:
      return 'student';
  }
}

export function getDashboardHref(role: string): string {
  if (role === 'teacher') return '/dashboard';
  if (role === 'parent') return '/parent';
  if (role === 'admin') return '/admin';
  return '/student';
}
