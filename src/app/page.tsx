  // src/app/page.tsx
  import TasksPage from "./tasks/page";
  import { api, HydrateClient } from "~/trpc/server";

  export default async function Home() {
    return (
      <HydrateClient>
        <TasksPage />
      </HydrateClient>
    );
  }
