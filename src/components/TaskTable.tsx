"use client";

import React, { useState } from "react";
import TaskTableRow from "./TaskTableRow";
import SimpleToast from "~/components/Toast";

interface TaskTableProps {
  tasks: any;
}

export default function TaskTable({ tasks }: TaskTableProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const handleShowToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  return (
    <div className="overflow-x-auto shadow rounded-md relative">
      <table className="min-w-full table-auto border-collapse border border-gray-300 bg-white">
        <thead className="bg-blue-600 text-gray-700 uppercase text-sm">
          <tr>
            <th className="border border-gray-300 px-6 py-3 text-center text-white">Title</th>
            <th className="border border-gray-300 px-6 py-3 text-center text-white">Status</th>
            <th className="border border-gray-300 px-6 py-3 text-center text-white">Description</th>
            <th className="border border-gray-300 px-6 py-3 text-center text-white">Updated at</th>
            <th className="border border-gray-300 px-6 py-3 text-center text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task: any) => (
            <TaskTableRow
              key={task.id}
              task={task}
              onShowToast={handleShowToast}
            />
          ))}
        </tbody>
      </table>
      {showToast && (
        <SimpleToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
