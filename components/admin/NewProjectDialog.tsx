"use client";

import { FolderPlus } from "lucide-react";
import { createProject } from "@/app/beheer/actions";
import { AdminFormDialog, type Field } from "@/components/admin/AdminFormDialog";
import type { AdminCustomer } from "@/components/admin/AdminDashboard";

export function NewProjectDialog({ customers, onDone }: { customers: AdminCustomer[]; onDone: () => void }) {
  const fields: Field[] = [
    {
      name: "customerId",
      label: "Klant",
      type: "select",
      required: true,
      options: customers.map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "name", label: "Projectnaam", placeholder: "Bijvoorbeeld: Ticket Bot v2", required: true },
    {
      name: "department",
      label: "Afdeling",
      type: "select",
      required: true,
      options: [
        { value: "SOFTWARE", label: "Software" },
        { value: "GAME", label: "Game Development" },
        { value: "MEDIA", label: "Media" },
      ],
    },
    { name: "deadline", label: "Deadline (optioneel)", type: "date" },
  ];

  return (
    <AdminFormDialog
      trigger={<><FolderPlus /> Nieuw project</>}
      title="Nieuw project"
      description="Het projectnummer wordt automatisch toegekend. De klant ziet het project meteen in zijn portaal."
      submitLabel="Project aanmaken"
      fields={fields}
      action={createProject}
      onDone={onDone}
      disabled={customers.length === 0}
      disabledReason="Maak eerst een klant aan"
    />
  );
}
