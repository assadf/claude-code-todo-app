import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from '@/components/SignOutButton';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { TodoListsDisplay } from '@/components/dashboard/TodoListsDisplay';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <DashboardClient>
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white">
                Welcome back, {session.user.name || session.user.email}!
              </h1>
              <p className="text-gray-400">
                Manage your TODO lists and stay organized
              </p>
            </div>
            <SignOutButton />
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStats />
          </div>

          {/* Todo Lists Display */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Your Todo Lists
              </h2>
              <button className="btn-primary create-list-button">
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New List
              </button>
            </div>
            <TodoListsDisplay />
          </div>
        </div>
      </div>
    </DashboardClient>
  );
}
