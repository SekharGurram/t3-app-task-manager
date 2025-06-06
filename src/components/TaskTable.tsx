// src/app/tasks/components/TaskTable.tsx
import React from "react";
import TaskTableRow from "./TaskTableRow";
import { tasks } from "~/server/db/schemas";

interface TaskTableProps {
  tasks:any;
}

export default function TaskTable({ tasks }: TaskTableProps) {
  return (
    <div className="overflow-x-auto shadow rounded-md">
      <table className="min-w-full table-auto border-collapse border border-gray-300 bg-white">
        <thead className="bg-blue-600 text-gray-700 uppercase text-sm">
          <tr>
            <th className="border border-gray-300 px-6 py-3 text-center text-white">Title</th>
            <th className="border border-gray-300 px-6 py-3 text-center text-white">Status</th>
            <th className="border border-gray-300 px-6 py-3 text-center text-white">Description</th>
            <th className="border border-gray-300 px-6 py-3 text-center text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task:any) => (
            <TaskTableRow key={task.id} task={task} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
