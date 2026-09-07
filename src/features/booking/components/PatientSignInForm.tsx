import { useState } from "react";
import type { FormEvent } from "react";
import { Field, Button, StatusMessage } from "@/design-system/react";
import { repository } from "@/data/repository";
import type { BookingSubject, Patient } from "@/domain/models";

export interface PatientSignInFormProps {
  /** Used to simulate creating a fresh demo account when the email doesn't match an existing patient. */
  subjectForNewAccount?: BookingSubject;
  onSignedIn: (patient: Patient) => void;
}

/** No password is collected or validated — this is a labeled simulation, not a real login. */
export function PatientSignInForm({ subjectForNewAccount, onSignedIn }: PatientSignInFormProps) {
  const [email, setEmail] = useState(subjectForNewAccount?.contact.value ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    setError(undefined);
    try {
      const existing = await repository.findPatientByEmail(email);
      if (existing) {
        onSignedIn(existing);
        return;
      }
      if (subjectForNewAccount) {
        const created = await repository.registerPatient({
          ...subjectForNewAccount,
          contact: { method: "email", value: email },
        });
        onSignedIn(created);
        return;
      }
      setError("Enter the details used for this booking first, then try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <StatusMessage intent="info">
        Demo sign-in: only the email is checked. No password is collected or validated.
      </StatusMessage>
      <Field
        label="Email address"
        type="email"
        required
        value={email}
        onValueChange={setEmail}
        hint="Use jordan.blake@example.com to sign in as an existing patient, or any other address to simulate a new account."
      />
      {error ? <StatusMessage intent="error">{error}</StatusMessage> : null}
      <div>
        <Button type="submit" pending={pending}>
          Sign in and continue
        </Button>
      </div>
    </form>
  );
}
