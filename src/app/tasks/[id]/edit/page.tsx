"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import UpdateTaskForm from "~/components/UpdateTaskForm";

export default function UpdateTaskPage() {
  const params = useParams();
  const taskIdParam = params.id;

  // Ensure single string:
  const taskId = Array.isArray(taskIdParam) ? taskIdParam[0] : taskIdParam;

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
    <UpdateTaskForm
      taskId={task.id}
      initialTitle={task.title}
      initialDescription={task.description ?? ""}
      initialStatus={task.status}
      initialImageUrl={task.imageUrl || ""}
    />
  );
}
