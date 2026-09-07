import { Link } from "react-router-dom";
import { useAppointments } from "./hooks/useAppointments";
import { AppointmentItem } from "./components/AppointmentItem";
import { Button, StatusMessage } from "@/design-system/react";
import { useSessionStore } from "@/state/sessionStore";

export function AppointmentsPage() {
  const actor = useSessionStore((s) => s.actor);
  const { data, isPending, isError } = useAppointments(actor);
  const upcoming = (data ?? []).filter((a) => a.status === "confirmed");

  return (
    <div className="mx-auto flex max-w-content flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold text-text-primary">Appointments</h1>
      {actor.kind === "guest" ? (
        <p className="text-sm text-text-muted">
          Showing bookings made in this browser session. Sign in as a returning patient to see your full history.
        </p>
      ) : null}

      {isPending ? <p className="text-sm text-text-muted">Loading appointments…</p> : null}
      {isError ? <StatusMessage intent="error">Something went wrong loading appointments.</StatusMessage> : null}
      {!isPending && !isError && upcoming.length === 0 ? (
        <StatusMessage intent="info">No upcoming appointments yet.</StatusMessage>
      ) : null}

      <ul className="flex flex-col gap-3">
        {upcoming.map((appointment) => (
          <AppointmentItem key={appointment.id} appointment={appointment} />
        ))}
      </ul>

      <div>
        <Link to="/book">
          <Button intent="secondary">Book another appointment</Button>
        </Link>
      </div>
    </div>
  );
}
