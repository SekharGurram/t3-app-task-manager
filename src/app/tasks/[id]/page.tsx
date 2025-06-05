"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function ViewTaskPage() {
  const params = useParams();
  const router = useRouter();

  const taskId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: task, isLoading, error } = api.task.getTaskById.useQuery(
    { id: taskId! },
    { enabled: !!taskId }
  );

  if (isLoading) {
    return <p className="p-8 text-center">Loading task...</p>;
  }

  if (error) {
    return <p className="p-8 text-center text-red-600">Error: {error.message}</p>;
  }

  if (!task) {
    return <p className="p-8 text-center text-gray-600">Task not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md px-8 py-6 space-y-6 relative">
        {/* Back Button inside container */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">View Task</h1>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block mb-1 font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={task.title}
            readOnly
            className="w-full rounded border border-gray-300 p-2 bg-white text-gray-900 cursor-default"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-1 font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={task.description ?? ""}
            readOnly
            rows={3}
            className="w-full rounded border border-gray-300 p-2 bg-white text-gray-600 cursor-default resize-none"
          />
        </div>

        {/* Status + Image side by side */}
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          {/* Status */}
          <div className="md:w-1/2">
            <label htmlFor="status" className="block mb-1 font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={task.status}
              disabled
              className="w-full rounded border border-gray-300 p-2 bg-white text-gray-700 cursor-default"
            >
              {statusOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Image */}
          <div className="md:w-1/2">
            <label className="block mb-1 font-medium text-gray-700">Image</label>
            {task.imageUrl ? (
              <img
                src={task.imageUrl}
                alt={`Image for ${task.title}`}
                className="max-w-full rounded"
              />
            ) : (
              <div className="h-[72px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md text-gray-400">
                No image uploaded
              </div>
            )}
          </div>
        </div>

        {/* Created At */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Created At</label>
          <input
            type="text"
            value={new Date(task.createdAt).toLocaleString()}
            readOnly
            className="w-full rounded border border-gray-300 p-2 bg-white text-gray-500 cursor-default"
          />
        </div>
      </div>
    </div>
  );
}
