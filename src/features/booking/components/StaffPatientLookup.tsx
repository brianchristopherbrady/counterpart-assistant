import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Field, StatusMessage } from "@/design-system/react";
import { repository } from "@/data/repository";
import { formatDateOfBirth } from "@/lib/datetime";
import type { BookingSubject, Patient } from "@/domain/models";
import type { StaffActorContext } from "@/domain/repository";

export interface StaffPatientLookupProps {
  actor: StaffActorContext;
  onIdentified: (subject: BookingSubject) => void;
}

const newPatientSchema = z.object({
  fullName: z.string().trim().min(1, "Enter the patient's full name."),
  dateOfBirth: z
    .string()
    .min(1, "Enter a date of birth.")
    .refine((val) => !Number.isNaN(Date.parse(val)), "Enter a valid date."),
  contactValue: z.string().trim().min(1, "Enter an email address.").email("Enter a valid email address."),
});
type NewPatientFormValues = z.infer<typeof newPatientSchema>;

/** Staff identify the patient before discovery — this stays the persistent "Booking for" subject afterward. */
export function StaffPatientLookup({ actor, onIdentified }: StaffPatientLookupProps) {
  const [mode, setMode] = useState<"search" | "new">("search");
  const [query, setQuery] = useState("");

  const searchQuery = useQuery({
    queryKey: ["staffPatientSearch", query],
    queryFn: () => repository.searchPatients(query, actor),
    enabled: query.trim().length >= 2,
  });

  const { control, handleSubmit } = useForm<NewPatientFormValues>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: { fullName: "", dateOfBirth: "", contactValue: "" },
  });

  function selectPatient(patient: Patient) {
    onIdentified({
      patientId: patient.id,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      contact: patient.contact,
    });
  }

  const submitNewPatient = handleSubmit((values) => {
    onIdentified({
      fullName: values.fullName,
      dateOfBirth: values.dateOfBirth,
      contact: { method: "email", value: values.contactValue },
    });
  });

  if (mode === "new") {
    return (
      <form onSubmit={submitNewPatient} noValidate className="flex max-w-md flex-col gap-4">
        <h2 className="font-semibold text-text-primary">Enter new patient details</h2>
        <Controller
          control={control}
          name="fullName"
          render={({ field, fieldState }) => (
            <Field
              label="Full name"
              required
              value={field.value}
              onValueChange={field.onChange}
              invalid={Boolean(fieldState.error)}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field, fieldState }) => (
            <Field
              label="Date of birth"
              type="date"
              required
              value={field.value}
              onValueChange={field.onChange}
              invalid={Boolean(fieldState.error)}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="contactValue"
          render={({ field, fieldState }) => (
            <Field
              label="Email address"
              type="email"
              required
              value={field.value}
              onValueChange={field.onChange}
              invalid={Boolean(fieldState.error)}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <div className="flex gap-2">
          <Button type="button" intent="secondary" onClick={() => setMode("search")}>
            Back to search
          </Button>
          <Button type="submit">Continue with this patient</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      <h2 className="font-semibold text-text-primary">Find the patient</h2>
      <Field
        label="Search by name or reference"
        value={query}
        onValueChange={setQuery}
        placeholder="e.g. Jordan Blake"
        hint="Matches name, email, or date of birth."
      />

      {searchQuery.isFetching ? <p className="text-sm text-text-muted">Searching…</p> : null}
      {searchQuery.data && searchQuery.data.length === 0 ? (
        <StatusMessage intent="info">No matching patients. You can enter new patient details instead.</StatusMessage>
      ) : null}

      <ul className="flex flex-col gap-2">
        {(searchQuery.data ?? []).map((patient) => (
          <li key={patient.id}>
            <button
              type="button"
              onClick={() => selectPatient(patient)}
              className="w-full rounded-md border border-border bg-surface-raised p-3 text-left hover:bg-surface-sunken"
            >
              <p className="font-medium text-text-primary">{patient.fullName}</p>
              <p className="text-sm text-text-muted">
                {formatDateOfBirth(patient.dateOfBirth)} · {patient.contact.value}
              </p>
            </button>
          </li>
        ))}
      </ul>

      <div>
        <Button intent="secondary" onClick={() => setMode("new")}>
          Enter a new patient instead
        </Button>
      </div>
    </div>
  );
}
