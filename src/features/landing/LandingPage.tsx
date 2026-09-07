import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Field, StatusMessage } from "@/design-system/react";
import { repository } from "@/data/repository";
import { useSessionStore } from "@/state/sessionStore";
import { generateId } from "@/lib/id";
import { usePatient } from "@/features/booking/hooks/usePatient";

export function LandingPage() {
  const navigate = useNavigate();
  const actor = useSessionStore((s) => s.actor);
  const setActor = useSessionStore((s) => s.setActor);
  const { data: signedInPatient } = usePatient(actor.kind === "patient" ? actor.patientId : undefined);

  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  function continueAsGuest() {
    if (actor.kind !== "guest") {
      setActor({ kind: "guest", sessionId: generateId("session") });
    }
    navigate("/book");
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    setError(undefined);
    try {
      const patient = await repository.findPatientByEmail(email);
      if (!patient) {
        setError("No patient portal account matches that email. Try jordan.blake@example.com, or continue as a guest.");
        return;
      }
      setActor({ kind: "patient", patientId: patient.id });
      navigate("/book");
    } finally {
      setPending(false);
    }
  }

  function signOut() {
    setActor({ kind: "guest", sessionId: generateId("session") });
  }

  return (
    <div className="mx-auto flex max-w-content flex-col gap-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-text-primary">Welcome to Care Booking</h1>
        <p className="max-w-prose text-text-muted">
          Book routine visits at Downtown or Northside Clinic. Continue as a guest to book without an
          account, or sign in to your patient portal for prefilled details and appointment history.
        </p>
      </div>

      {actor.kind === "patient" ? (
        <div className="flex max-w-md flex-col gap-4 rounded-md border border-border bg-surface-raised p-6">
          <StatusMessage intent="success">
            Signed in as {signedInPatient?.fullName ?? "returning patient"}.
          </StatusMessage>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/book")}>Continue to booking</Button>
            <Button intent="secondary" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-6">
            <h2 className="text-lg font-semibold text-text-primary">Continue as guest</h2>
            <p className="text-sm text-text-muted">
              Book without creating an account. Your booking is only visible in this browser session.
            </p>
            <div>
              <Button onClick={continueAsGuest}>Continue as guest</Button>
            </div>
          </div>

          <form
            onSubmit={handleSignIn}
            className="flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-6"
          >
            <h2 className="text-lg font-semibold text-text-primary">Patient portal sign-in</h2>
            <p className="text-sm text-text-muted">
              Demo sign-in: only the email is checked, no password is collected or validated.
            </p>
            <Field
              label="Email address"
              type="email"
              required
              value={email}
              onValueChange={setEmail}
              hint="Use jordan.blake@example.com to sign in as an existing patient."
            />
            {error ? <StatusMessage intent="error">{error}</StatusMessage> : null}
            <div>
              <Button type="submit" pending={pending}>
                Sign in
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
