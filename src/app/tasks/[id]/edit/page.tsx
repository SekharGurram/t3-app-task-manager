"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import UpdateTaskForm from "~/app/_components/UpdateTaskForm";

export default function UpdateTaskPage() {
  const params = useParams();
  const taskIdParam = params.id;  // string | string[] | undefined

  // Ensure single string:
  const taskId = Array.isArray(taskIdParam) ? taskIdParam[0] : taskIdParam;

  const { data: task, isLoading, error } = api.task.getTaskById.useQuery(
    { id: taskId! },  // Non-null assertion, be sure taskId exists
    { enabled: !!taskId }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error || !task) return <div>Failed to load task data</div>;

  return (
    <UpdateTaskForm
      taskId={task.id}
      initialTitle={task.title}
      initialDescription={task.description ?? ""}
      initialStatus={task.status}
    />
  );
}
