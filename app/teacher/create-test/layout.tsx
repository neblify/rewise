import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Test | ReWise',
};

export default function CreateTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
