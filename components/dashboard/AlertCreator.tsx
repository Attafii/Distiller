"use client";

import { useRouter } from "next/navigation";
import { CreateAlertForm } from "@/components/dashboard/CreateAlertForm";

export function AlertCreator() {
  const router = useRouter();

  return (
    <CreateAlertForm
      onCreated={() => {
        router.refresh();
      }}
    />
  );
}
