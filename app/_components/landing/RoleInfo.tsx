'use client';

import { motion } from 'framer-motion';
import { GraduationCap, School, UserCheck } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlayfulCard } from '@/components/playful';

const roles = [
  {
    title: 'For Students',
    description:
      'Take control of your learning journey. Practice with smart tests, get instant feedback, and track your improvement over time.',
    icon: GraduationCap,
    benefits: [
      'Access to practice tests',
      'Instant AI feedback',
      'Performance tracking',
    ],
    shadowColor: 'sky' as const,
    iconBg: 'bg-sky-light',
    iconColor: 'text-[#0C7FA8]',
  },
  {
    title: 'For Teachers',
    description:
      'Simplify your workload with automated tools. Create tests in minutes, let AI handle the grading, and focus on mentoring.',
    icon: School,
    benefits: [
      'Easy test creation',
      'Automated grading',
      'Class performance insights',
    ],
    shadowColor: 'mint' as const,
    iconBg: 'bg-mint-light',
    iconColor: 'text-mint',
  },
  {
    title: 'For Parents',
    description:
      "Stay informed about your child's education. Monitor progress, view test results, and understand their learning needs.",
    icon: UserCheck,
    benefits: [
      'View detailed reports',
      'Track exam readiness',
      'Stay connected with progress',
    ],
    shadowColor: 'coral' as const,
    iconBg: 'bg-coral-light',
    iconColor: 'text-coral',
  },
];

export function RoleInfo() {
  return (
    <div className="relative bg-card py-24 sm:py-32">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(135deg, var(--sky-light) 0%, transparent 40%, transparent 60%, var(--coral-light) 100%)',
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for Everyone
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            A complete ecosystem connecting students, teachers, and parents.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <PlayfulCard
                shadowColor={role.shadowColor}
                className="flex flex-col h-full"
              >
                <CardHeader>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${role.iconBg} mb-4`}
                  >
                    <role.icon className={`h-6 w-6 ${role.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold leading-7 text-foreground">
                    {role.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="flex-auto text-base leading-7 text-muted-foreground mb-6">
                    {role.description}
                  </p>
                  <ul className="space-y-3">
                    {role.benefits.map(benefit => (
                      <li
                        key={benefit}
                        className="flex gap-x-3 text-sm text-muted-foreground"
                      >
                        <svg
                          className={`h-6 w-5 flex-none ${role.iconColor}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </PlayfulCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
