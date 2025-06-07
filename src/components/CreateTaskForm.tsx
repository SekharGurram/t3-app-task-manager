"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { convertFileToBase64 } from "~/helpers/fileToBase";
import SimpleToast from "./Toast";
import { v4 as uuidv4 } from 'uuid';

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function CreateTaskForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTask = api.task.createTask.useMutation();
  const uploadImage = api.task.uploadFileToBackblaze.useMutation();

  const [titleError, setTitleError] = useState("");
  const [statusError, setStatusError] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (e.target.value.trim()) setTitleError("");
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    if (e.target.value.trim()) setStatusError("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
  };
  const sanitizeFileName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9.-_]/g, "_");
  };
  const handleCreateTask = async () => {
    let valid = true;
    if (!title.trim()) {
      setTitleError("Title is required.");
      valid = false;
    }
    if (!status.trim()) {
      setStatusError("Status is required.");
      valid = false;
    }
    if (!valid) return;

    setIsSubmitting(true);

    try {
      let imageUrl:string = "";
      if (image) {
        const base64 = await convertFileToBase64(image);
        const fileName = `${uuidv4()}${sanitizeFileName(image.name)}`;
        const response = await uploadImage.mutateAsync({
          name:fileName,
          type: image.type,
          base64,
        });
        imageUrl =fileName;
      }

      await createTask.mutateAsync({
        title,
        description,
        status: status as "pending" | "in-progress" | "completed",
        imageUrl: imageUrl,
      });
      setShowToast(true);
      setToastMessage("Task created Successfully");
      window.location.href = "/tasks"
    } catch (error) {
      setToastType("error");
      setToastMessage("Failed to create the task!");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md px-8 py-6 space-y-6 relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold cursor-pointer"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Create Task</h1>

        <div>
          <label htmlFor="title" className="block mb-1 font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            className={`w-full rounded border p-2 focus:outline-none focus:ring-2 ${titleError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
            placeholder="Enter task title"
          />
          {titleError && <p className="mt-1 text-red-600 text-sm">{titleError}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block mb-1 font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            rows={3}
            className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional task description"
          />
        </div>

        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <div className="md:w-1/2">
            <label htmlFor="status" className="block mb-1 font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={status}
              onChange={handleStatusChange}
              className={`w-full rounded border p-2 focus:outline-none focus:ring-2 ${statusError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
            >
              {statusOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {statusError && <p className="mt-1 text-red-600 text-sm">{statusError}</p>}
          </div>
          <div className="md:w-1/2">
            <label htmlFor="image" className="block mb-1 font-medium text-gray-700">
              Upload Image
            </label>
            <label
              htmlFor="image"
              className="flex items-center justify-center h-[72px] border-2 border-dashed border-blue-400 rounded-md p-3 cursor-pointer hover:bg-blue-50"
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
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCreateTask}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
          {showToast && (
            <SimpleToast
              message={toastMessage}
              type={toastType}
              onClose={() => setShowToast(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
