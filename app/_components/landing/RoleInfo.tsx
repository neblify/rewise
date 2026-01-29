'use client';

import { motion } from 'framer-motion';
import { GraduationCap, School, UserCheck } from 'lucide-react';

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
    color: 'bg-blue-50 text-blue-700',
    iconColor: 'text-blue-600',
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
    color: 'bg-green-50 text-green-700',
    iconColor: 'text-green-600',
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
    color: 'bg-purple-50 text-purple-700',
    iconColor: 'text-purple-600',
  },
];

export function RoleInfo() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Built for Everyone
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
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
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${role.color} mb-6`}
              >
                <role.icon className={`h-6 w-6 ${role.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold leading-7 text-gray-900">
                {role.title}
              </h3>
              <p className="mt-4 flex-auto text-base leading-7 text-gray-600">
                {role.description}
              </p>
              <ul className="mt-8 space-y-3">
                {role.benefits.map(benefit => (
                  <li
                    key={benefit}
                    className="flex gap-x-3 text-sm text-gray-600"
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
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
