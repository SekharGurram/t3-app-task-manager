import Link from "next/link";
import { api } from "~/trpc/server";
import TaskTable from "~/components/TaskTable";

export default async function TasksPage() {
  let tasksObj:any = await api.task.getTaks();
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Task Manager</h1>
        <Link
          href="/tasks/create"
          className="rounded-md bg-blue-600 px-5 py-2.5 text-white font-semibold shadow hover:bg-blue-700 transition"
        >
          Create Task
        </Link>
      </div>

      <TaskTable tasks={tasksObj.tasks || []} />
    </div>
  );
}
