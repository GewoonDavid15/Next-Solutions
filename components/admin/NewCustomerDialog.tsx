"use client";

import { UserPlus } from "lucide-react";
import { createCustomer } from "@/app/beheer/actions";
import { AdminFormDialog, type Field } from "@/components/admin/AdminFormDialog";

const fields: Field[] = [
  {
    name: "discordId",
    label: "Discord user-id",
    placeholder: "123456789012345678",
    hint: "Zet in Discord de ontwikkelaarsmodus aan, klik rechts op de gebruiker en kies 'Gebruikers-ID kopiëren'.",
    required: true,
  },
  { name: "name", label: "Naam", placeholder: "Bedrijfs- of klantnaam", required: true },
  { name: "email", label: "E-mail (optioneel)", placeholder: "klant@voorbeeld.nl", type: "email" },
];

export function NewCustomerDialog({ onDone }: { onDone: () => void }) {
  return (
    <AdminFormDialog
      trigger={<><UserPlus /> Nieuwe klant</>}
      title="Nieuwe klant"
      description="Koppel een Discord-account aan een klant, zodat die persoon zijn eigen projecten ziet in het portaal."
      submitLabel="Klant toevoegen"
      fields={fields}
      action={createCustomer}
      onDone={onDone}
    />
  );
}
