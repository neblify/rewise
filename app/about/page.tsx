import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/app/_components/landing/Footer';

export default function AboutPage() {
  return (
    <>
      <div className="bg-card px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-primary hover:text-primary/90 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            About Us
          </h2>
          <p className="mt-2 text-lg leading-8 text-muted-foreground">
            ReWise is a smart education platform that brings AI-powered grading
            and role-based experiences to students, teachers, and parents.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
