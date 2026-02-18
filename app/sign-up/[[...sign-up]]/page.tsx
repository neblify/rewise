import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden gradient-navy text-white">
      <div className="p-8">
        <SignUp />
      </div>
    </div>
  );
}
