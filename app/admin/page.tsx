import {
  getAdminStats,
  getUsers,
  getTests,
  getQuestions,
  getChallengesForAdmin,
} from './actions';
import AdminView from './admin-view';

export const dynamic = 'force-dynamic'; // Ensure fresh data on every request

export default async function AdminPage() {
  const [stats, users, tests, questions, challenges] = await Promise.all([
    getAdminStats(),
    getUsers(),
    getTests(),
    getQuestions(),
    getChallengesForAdmin(),
  ]);

  return (
    <AdminView
      stats={stats}
      users={users}
      tests={tests}
      questions={questions}
      challenges={challenges}
    />
  );
}
