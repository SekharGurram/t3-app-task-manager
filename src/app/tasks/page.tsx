"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "~/trpc/react";
import TaskTable from "~/components/TaskTable";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "in-progress" | "completed">("all");
  const router = useRouter();

  const { data, isLoading, error } = api.task.getTasks.useQuery({
    search,
    status: status === "all" ? undefined : status,
    page: 1,
    limit: 100,
  });

    useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      router.push("/auth/login");
    }
  }, [error, router]);


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 font-semibold">
          Task Manager
        </h1>

        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="search by title"
            className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="all">Status (All)</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <Link
            href="/tasks/create"
            className="rounded-md bg-blue-600 px-5 py-2.5 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            Create Task
          </Link>
        </div>
      </div>

      {isLoading && <p>Loading tasks...</p>}
      {error && <p className="text-red-600">Failed to load tasks</p>}

      <TaskTable tasks={data?.tasks || []} />
    </div>
  );
}
