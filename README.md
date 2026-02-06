# NIOS Prep - Smart Education Platform

NIOS Prep is a comprehensive education platform designed to help students prepare for their exams efficiently. It features a role-based system for Students, Teachers, and Parents, offering tools for taking tests, tracking results, and receiving AI-powered grading and feedback.

Built with **Next.js**, **MongoDB**, **Clerk**, and **Groq AI**.

## 🚀 Features

- **Role-Based Access Control**:
  - **Students**: Take tests, view results, and receive AI feedback.
  - **Teachers**: Create and manage tests, assignments, and view student progress.
  - **Parents**: Monitor their child's performance and progress.
- **Smart Testing Engine**:
  - Supports Multiple Choice, True/False, Match the Following, and Subjective questions.
  - Organization by Sections (e.g., Physics, Chemistry).
- **AI-Powered Grading**:
  - Auto-grading for objective questions.
  - AI evaluation for subjective answers using **Groq** (Llama models).
  - Detailed feedback on weak areas and overall performance.
- **Secure Authentication**:
  - Powered by **Clerk** (Sign In / Sign Up).
- **Modern UI**:
  - Built with **Tailwind CSS**, **Framer Motion**, and **shadcn/ui** for a responsive, accessible, and modern experience.

## 🛠 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Auth**: [Clerk](https://clerk.com/)
- **AI/LLM**: [Groq SDK](https://groq.com/) (Llama-3.3-70b-versatile)
- **Styling**: Tailwind CSS, shadcn/ui
- **Validation**: Zod & React Hook Form

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Groq AI
GROQ_API_KEY=your_groq_api_key
```

## 🏃 Getting Started

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd nios-prep
   ```

2. **Install dependencies**:
   npm install

3. **Set up environment variables**:

   ```bash
   vercel link
   vercel env pull
   ```

4. **Run the development server**:

   ```bash
   vercel dev


   ```

5. **Open the app**:
   - Visit [http://localhost:3000](http://localhost:3000).

## 🧪 Testing

The project uses **Vitest** for unit/integration testing and **Playwright** for end-to-end (E2E) testing.

### Running Unit Tests

```bash
npm run test:unit
```

### Running E2E Tests

```bash
npm run test:e2e
```

To run E2E tests with UI mode:

```bash
npm run test:e2e:ui
```

### Running All Tests

```bash
npm test
```

## 📂 Project Structure

- `app/`: Next.js App Router pages and layouts.
  - `globals.css`: Global styles (includes shadcn/ui variables).
  - `sign-in/`, `sign-up/`: Authentication pages.
  - `student/`: Student dashboard and learning interface.
  - `teacher/`: Teacher dashboard and test creation.
  - `parent/`: Parent monitoring view.
  - `onboarding/`: Profile setup flow.
  - `actions/`: Server actions for data mutations.
- `lib/`: Shared utilities.
  - `db/`: MongoDB connection and Mongoose models (`User`, `Test`, `Result`).
  - `ai/`: Groq AI integration logic (`grader.ts`).
- `components/`:
  - `ui/`: Reusable shadcn/ui components (Button, Card, Badge, etc.).
- `public/`: Static assets.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
