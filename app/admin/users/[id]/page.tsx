import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUserByIdWithFriends } from '../../actions';
import { formatDate } from '@/lib/utils';

interface AdminUserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminUserDetailPage(
  props: AdminUserDetailPageProps,
) {
  const { id } = await props.params;
  const data = await getUserByIdWithFriends(id);

  if (!data) {
    notFound();
  }

  const { user, friends } = data as {
    user: {
      _id: string;
      clerkId: string;
      email: string;
      role: string;
      firstName?: string;
      lastName?: string;
      board?: string;
      grade?: string;
      createdAt: string | Date;
      updatedAt: string | Date;
      children?: string[];
      [key: string]: unknown;
    };
    friends: Array<{
      _id: string;
      addedBy: string;
      email: string;
      scoreToBeat?: number;
      name?: string;
      location?: string;
      class?: string;
      linkedClerkId?: string;
      createdAt: string | Date;
      updatedAt: string | Date;
      challengeTestId: string;
      challengeResultId: string;
      linkedUser?: {
        _id: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
        board?: string;
        grade?: string;
      };
    }>;
  };

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  const displayName = fullName || user.email;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
          <p className="text-sm text-muted-foreground">
            Admin view for user profile and friends
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-primary hover:underline font-medium"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              User details
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">
                  {fullName || <span className="italic text-muted-foreground">Not set</span>}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Board</p>
                  <p className="font-medium">
                    {user.board || (
                      <span className="italic text-muted-foreground">
                        Not set
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Grade</p>
                  <p className="font-medium">
                    {user.grade || (
                      <span className="italic text-muted-foreground">
                        Not set
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {formatDate(new Date(user.createdAt))}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last updated</p>
                  <p className="font-medium">
                    {formatDate(new Date(user.updatedAt))}
                  </p>
                </div>
              </div>
              {user.children && user.children.length > 0 && (
                <div>
                  <p className="text-muted-foreground">Linked children</p>
                  <p className="font-medium text-xs break-all">
                    {user.children.join(', ')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Clerk ID</p>
                <p className="font-mono text-xs break-all">{user.clerkId}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Friends
              </h2>
              <p className="text-sm text-muted-foreground">
                Total: {friends.length}
              </p>
            </div>

            {friends.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                This user has not invited any friends yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-background">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Friend Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Friend Profile
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Challenge
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Linked User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Added
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {friends.map(friend => {
                      const linkedFullName =
                        friend.linkedUser &&
                        [friend.linkedUser.firstName, friend.linkedUser.lastName]
                          .filter(Boolean)
                          .join(' ');

                      return (
                        <tr key={friend._id}>
                          <td className="px-4 py-4 text-sm font-medium text-foreground">
                            {friend.email}
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            <div className="space-y-1">
                              <div>
                                <span className="font-medium">Name: </span>
                                {friend.name || (
                                  <span className="italic">Not set</span>
                                )}
                              </div>
                              <div>
                                <span className="font-medium">Location: </span>
                                {friend.location || (
                                  <span className="italic">Not set</span>
                                )}
                              </div>
                              <div>
                                <span className="font-medium">Class: </span>
                                {friend.class || (
                                  <span className="italic">Not set</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            <div className="space-y-1">
                              <div>
                                <span className="font-medium">
                                  Score to beat:{' '}
                                </span>
                                {friend.scoreToBeat ?? (
                                  <span className="italic">Not set</span>
                                )}
                              </div>
                              <div className="text-xs break-all">
                                <span className="font-medium">Test ID: </span>
                                {friend.challengeTestId}
                              </div>
                              <div className="text-xs break-all">
                                <span className="font-medium">Result ID: </span>
                                {friend.challengeResultId}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {friend.linkedUser ? (
                              <div className="space-y-1">
                                <div>
                                  <span className="font-medium">Name: </span>
                                  {linkedFullName || (
                                    <span className="italic">Not set</span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-medium">Email: </span>
                                  {friend.linkedUser.email}
                                </div>
                                <div>
                                  <span className="font-medium">Role: </span>
                                  {friend.linkedUser.role}
                                </div>
                              </div>
                            ) : (
                              <span className="italic">Not linked</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(new Date(friend.createdAt))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

