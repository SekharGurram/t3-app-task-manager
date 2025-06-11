
import TasksPage from "./tasks/page";
import { api, HydrateClient } from "~/trpc/server";
import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/auth/login");
  // return (
  //   <HydrateClient>
  //     <TasksPage />
  //   </HydrateClient>
  // );
}
