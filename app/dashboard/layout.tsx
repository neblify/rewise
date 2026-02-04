import Navbar from '@/app/_components/dashboard/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="teacher" />
      <main className="py-8">{children}</main>
    </div>
  );
}
