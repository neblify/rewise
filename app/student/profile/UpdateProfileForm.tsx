'use client';

import { useState } from 'react';
import { updateProfile } from './actions';
import { useRouter } from 'next/navigation';
import { BOARDS } from '@/lib/constants/boards';
import { getGradesForBoard } from '@/lib/constants/levels';

export default function UpdateProfileForm({
  initialBoard,
  initialGrade,
}: {
  initialBoard: string;
  initialGrade: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [board, setBoard] = useState(initialBoard);
  const router = useRouter();

  const gradeOptions = getGradesForBoard(board);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await updateProfile(formData);

    if (result.success) {
      alert('Profile updated successfully!');
      router.refresh();
    } else {
      alert(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="board"
          className="block text-sm font-medium text-gray-700"
        >
          Board
        </label>
        <select
          name="board"
          id="board"
          required
          value={board}
          onChange={e => setBoard(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        >
          <option value="">Select Board</option>
          {BOARDS.map(b => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="grade"
          className="block text-sm font-medium text-gray-700"
        >
          Grade / Class
        </label>
        <select
          name="grade"
          id="grade"
          required
          defaultValue={initialGrade}
          key={board} // Reset when board changes
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        >
          <option value="">Select Grade</option>
          {gradeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
