import Link from 'next/link';
import { getOpenChallengeInvitesForCurrentUser } from '@/app/open-challenge/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Mail } from 'lucide-react';

export async function InvitedToOpenChallengeCard() {
  const { invites } = await getOpenChallengeInvitesForCurrentUser();
  if (invites.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/50 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          You&apos;re invited to an Open Challenge
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {invites.length === 1 && invites[0].inviterDisplayName
            ? `${invites[0].inviterDisplayName} invited you to beat their score. Take the challenge from the list below.`
            : 'You have open challenge invites. Take the challenges from the list below.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {invites.map(inv => (
            <li
              key={inv.testId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200/60 bg-white/50 px-3 py-2 dark:border-amber-800/60 dark:bg-black/20"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  {inv.testTitle}
                </span>
                {inv.inviterDisplayName && (
                  <span className="text-xs text-muted-foreground">
                    Invited by {inv.inviterDisplayName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {inv.scoreToBeat != null && (
                  <span className="text-sm text-muted-foreground">
                    Score to beat: <strong>{inv.scoreToBeat}</strong>
                  </span>
                )}
                <Button asChild size="sm" variant="gradient">
                  <Link href={`/student/test/${inv.testId}`}>
                    <Play className="h-4 w-4 mr-1" />
                    Take challenge
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
