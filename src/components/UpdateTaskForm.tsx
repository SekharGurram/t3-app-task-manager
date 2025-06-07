"use client";

import { useState, useEffect } from "react";
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
  initialImageUrl?: string;
}

export default function UpdateTaskForm({
  taskId,
  initialTitle,
  initialDescription = "",
  initialStatus,
  initialImageUrl,
}: UpdateTaskFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState(initialStatus);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);

  const updateTask = api.task.updateTask.useMutation();

  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: fileUrlData,
    refetch: refetchSignedUrl,
    isFetching: isFetchingSignedUrl,
  } = api.task.getUploadedFile.useQuery(
    { name: initialImageUrl ?? "" },
    { enabled: false }
  );

  useEffect(() => {
    if (initialImageUrl) {
      refetchSignedUrl();
    } else {
      setSignedImageUrl(null);
    }
  }, [initialImageUrl, refetchSignedUrl]);

  useEffect(() => {
    if (fileUrlData?.success && fileUrlData.data) {
      setSignedImageUrl(fileUrlData.data);
    } else {
      setSignedImageUrl(null);
    }
  }, [fileUrlData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateTask.mutateAsync({
        id: taskId,
        title,
        description,
        status,
        imageUrl: initialImageUrl,
      });

      setToastType("success");
      setToastMessage("Task updated successfully");
      setShowToast(true);
      window.location.href = "/tasks"
    } catch (error) {
      setToastType("error");
      setToastMessage("Failed to update task");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md px-8 py-6 relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Update Task
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full rounded border border-gray-300 p-2"
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label htmlFor="description" className="block mb-1 font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded border border-gray-300 p-2"
              placeholder="Optional task description"
            />
          </div>
          <div className="flex gap-6">
            <div className="w-1/2">
              <label htmlFor="status" className="block mb-1 font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded border border-gray-300 p-2"
              >
                {statusOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium text-gray-700">Image</label>
              {isFetchingSignedUrl ? (
                <p>Loading image...</p>
              ) : signedImageUrl ? (
                <img
                  src={signedImageUrl}
                  alt="Task"
                  className="w-32 h-32 object-cover rounded border border-gray-300"
                />
              ) : (
                <div className="h-[72px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md text-gray-400">
                  No image uploaded
                </div>
              )}
            </div>
          </div>
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
