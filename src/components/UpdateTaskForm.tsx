"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import SimpleToast from "./Toast";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

interface UpdateTaskFormProps {
  taskId: string;
  initialTitle: string;
  initialDescription?: string;
  initialStatus: "pending" | "in-progress" | "completed";
}

export default function UpdateTaskForm({
  taskId,
  initialTitle,
  initialDescription = "",
  initialStatus,
}: UpdateTaskFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState(initialStatus);
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTask = api.task.updateTask.useMutation();


  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await updateTask.mutateAsync({
        id: taskId,
        title,
        description,
        status,
        image_url: undefined,
      });
      setShowToast(true);
      setToastMessage("Task updated Successfully");
      window.location.href = "/tasks"
    } catch (error) {
      setToastType("error");
      setToastMessage("Failed to update the task!");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md px-8 py-6 relative">
        {/* Back button top-left */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Update Task</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block mb-1 font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block mb-1 font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional task description"
            />
          </div>

          {/* Status + Image Upload side-by-side */}
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            {/* Status Dropdown */}
            <div className="md:w-1/2">
              <label htmlFor="status" className="block mb-1 font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload Box */}
            <div className="md:w-1/2">
              <label htmlFor="image" className="block mb-1 font-medium text-gray-700">
                Upload Image
              </label>
              <label
                htmlFor="image"
                className="flex items-center justify-center h-[72px] border-2 border-dashed border-blue-400 rounded-md p-3 cursor-pointer hover:bg-blue-50 transition"
              >
                {image ? (
                  <span className="text-gray-700 text-sm truncate">{image.name}</span>
                ) : (
                  <span className="text-gray-400 text-sm">Click to upload</span>
                )}
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition cursor-pointer"
            >
              {isSubmitting ? "Updating..." : "Update Task"}
            </button>
            {showToast && (
              <SimpleToast
                message={toastMessage}
                type={toastType}
                onClose={() => setShowToast(false)}
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
