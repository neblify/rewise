'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const NAV_PEEK_PX = 80;
const DARK_SECTION_IDS = ['hero', 'footer'];

const navItems = [
  { href: '/open-challenge', label: 'Open Challenge' },
  { href: '/#features', label: 'Features' },
  { href: '/#testimonials', label: 'Testimonials' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

function useNavLinkColor() {
  const [isDarkBg, setIsDarkBg] = useState(true);

  useEffect(() => {
    const check = () => {
      const y = NAV_PEEK_PX;
      const el = document.elementFromPoint(0, y);
      const section = el?.closest?.('section, [id="roleinfo"], footer');
      const id = section?.id ?? null;
      setIsDarkBg(id !== null && DARK_SECTION_IDS.includes(id));
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return isDarkBg;
}

const linkBase =
  'text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded';

export function LandingTopNav() {
  const isDarkBg = useNavLinkColor();

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 flex min-h-[calc(30px+3rem)] items-center justify-end bg-transparent pt-12 pb-3"
      aria-label="Landing navigation"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-6 px-4 sm:px-6 lg:px-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              isDarkBg
                ? `${linkBase} text-white/90 hover:text-white focus-visible:outline-white`
                : `${linkBase} text-foreground/90 hover:text-foreground focus-visible:outline-foreground`
            }
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
