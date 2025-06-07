import Link from "next/link";
import { api } from "~/trpc/server";
import TaskTable from "~/components/TaskTable";

export default async function TasksPage() {
  let tasksObj: any = await api.task.getTaks();
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 font-semibold">
          Task Manager
        </h1>

        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="search by title"
            className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Filter Dropdown */}
          <select
            className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="all"
          >
            <option value="all">Status (All)</option>
            <option value="pending">Pending</option>
            <option value="inprogress">Inprogress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Create Task Button */}
          <Link
            href="/tasks/create"
            className="rounded-md bg-blue-600 px-5 py-2.5 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            Create Task
          </Link>
        </div>
      </div>

      <TaskTable tasks={tasksObj.tasks || []} />
    </div>
  );
}
