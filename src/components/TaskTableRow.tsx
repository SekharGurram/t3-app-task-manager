"use client";

import Link from "next/link";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import SimpleToast from "./Toast";

interface TaskTableRowProps {
  task: any;
}

export default function TaskTableRow({ task }: TaskTableRowProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const [loading, setLoading] = useState(false);

  const actionsRef = useRef<HTMLTableCellElement | null>(null);
  const deleteTask = api.task.deleteTask.useMutation();

  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  const openConfirm = () => {
    setIsLoading(true);

    setTimeout(() => {
      if (actionsRef.current) {
        const rect = actionsRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < 200 && spaceAbove > 200) {
          setShowAbove(true);
        } else {
          setShowAbove(false);
        }
      }

      setIsLoading(false);
      setShowConfirm(true);
    }, 200); // Reduced delay for better UX
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await deleteTask.mutateAsync({ id: task.id });
      setShowConfirm(false);
      setToastMessage("Task deleted successfully");
      setToastType("success");
      setShowToast(true);
      router.refresh(); // Refresh instead of full reload
    } catch (error) {
      setToastType("error");
      setToastMessage("Failed to delete the task!");
      setShowConfirm(false);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <tr
        className={`${
          isLoading ? "opacity-50 pointer-events-none" : ""
        } hover:bg-gray-50 transition-colors`}
      >
        <td className="border border-gray-300 px-6 py-4 text-center text-gray-900 font-medium">
          {isLoading ? "Loading..." : task.title}
        </td>
        <td className="border border-gray-300 px-6 py-4 text-center capitalize text-gray-700">
          {task.status}
        </td>
        <td className="border border-gray-300 px-6 py-4 text-center text-gray-600 max-w-xs truncate">
          {task.description || "-"}
        </td>

        <td
          ref={actionsRef}
          className="border border-gray-300 px-6 py-4 text-center space-x-4 relative overflow-visible"
        >
          <Link href={`/tasks/${task.id}`} className="text-blue-600 hover:underline">
            View
          </Link>
          <Link href={`/tasks/${task.id}/edit`} className="text-yellow-600 hover:underline">
            Edit
          </Link>
          <button
            onClick={openConfirm}
            disabled={isLoading}
            className="text-red-600 hover:underline cursor-pointer"
          >
            Delete
          </button>

          {/* Popup */}
          {showConfirm && (
            <div
              className={`absolute z-50 w-[280px] bg-white border shadow-lg rounded-lg p-4 ${
                showAbove ? "bottom-full mb-2" : "top-full mt-2"
              } right-0`}
            >
              <p className="text-sm text-gray-800 mb-3">
                Are you sure you want to delete this task?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </td>
      </tr>

      {/* Toast outside table row */}
      {showToast && (
        <SimpleToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
