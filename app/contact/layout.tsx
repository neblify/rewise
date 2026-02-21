import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | ReWise',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
