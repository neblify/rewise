'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function DevTools() {
  const [isDev, setIsDev] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsDev(true);
    }
  }, []);

  if (!isDev) return null;

  // Determine if we're on a role page (already logged in)
  const isOnRolePage =
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/student') ||
    pathname.startsWith('/parent') ||
    pathname.startsWith('/admin');

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold hover:brightness-110 transition-all"
        title="Toggle Dev Tools"
      >
        {isOpen ? '×' : 'D'}
      </button>

      {isOpen && (
        <div className="mb-10 p-4 bg-card/90 backdrop-blur shadow-xl rounded-lg border border-border w-64">
          <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider flex justify-between items-center">
            <span>Dev Tools</span>
            <span className="text-[10px] bg-violet-light px-1.5 py-0.5 rounded">
              Local
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {!isOnRolePage && (
              <>
                <form
                  action={async () => {
                    const { loginAsRole } =
                      await import('@/app/actions/dev-actions');
                    await loginAsRole('teacher');
                  }}
                >
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-violet-light rounded-md text-muted-foreground hover:text-primary font-medium transition-colors border border-transparent hover:border-border flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Login as Teacher
                  </button>
                </form>
                <form
                  action={async () => {
                    const { loginAsRole } =
                      await import('@/app/actions/dev-actions');
                    await loginAsRole('student');
                  }}
                >
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-violet-light rounded-md text-muted-foreground hover:text-primary font-medium transition-colors border border-transparent hover:border-border flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Login as Student
                  </button>
                </form>
                <form
                  action={async () => {
                    const { loginAsRole } =
                      await import('@/app/actions/dev-actions');
                    await loginAsRole('parent');
                  }}
                >
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-violet-light rounded-md text-muted-foreground hover:text-primary font-medium transition-colors border border-transparent hover:border-border flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Login as Parent
                  </button>
                </form>
              </>
            )}
            <form
              action={async () => {
                const { clearMockSession } =
                  await import('@/app/actions/dev-actions');
                await clearMockSession();
              }}
            >
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 rounded-md text-red-600 hover:text-red-700 font-medium border-t border-border mt-1 pt-2 transition-colors flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Clear Session
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
