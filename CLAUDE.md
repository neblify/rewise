# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `vercel dev` - Start development server
- `npm run build` - Build for production

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check Prettier formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run knip` - Find unused dependencies

### Testing
- `npm test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run unit tests with Vitest
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI mode

### Environment Setup
- `npm run fresh-install` - Reinstall dependencies from scratch

## Architecture Overview

**NIOS Prep** is a Next.js education platform with role-based testing and AI-powered grading.

### Core Architecture
- **Framework**: Next.js 16 App Router with route groups for role-based views
- **Database**: MongoDB via Mongoose with models: User, Test, Question, Result
- **Authentication**: Clerk with middleware-based route protection
- **AI Grading**: Groq SDK for evaluating subjective answers
- **Styling**: Tailwind CSS + shadcn/ui + Radix UI components
- **Form Validation**: Zod schemas

### Role-Based Route Structure
- `/student/*` - Student dashboard, test taking, results viewing
- `/teacher/*` - Test creation, student progress management
- `/parent/*` - Child performance monitoring

### Development Support
- Middleware includes dev mode mock session bypass for testing auth flows
- Path alias `@` maps to project root
- PDF parsing support via serverExternalPackages configuration