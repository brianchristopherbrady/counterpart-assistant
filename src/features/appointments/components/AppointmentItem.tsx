import { locations, providers } from "@/data/fixtures";
import { formatInstant } from "@/lib/datetime";
import type { Appointment } from "@/domain/models";

export function AppointmentItem({ appointment }: { appointment: Appointment }) {
  const provider = providers.find((p) => p.id === appointment.providerId);
  const location = locations.find((l) => l.id === appointment.locationId);
  const displayZone = appointment.mode === "virtual" ? undefined : location?.timeZone;

  return (
    <li className="rounded-md border border-border bg-surface-raised p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-text-primary">{provider?.name ?? appointment.providerId}</p>
          <p className="text-sm text-text-muted">
            {formatInstant(appointment.startInstant, displayZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone)}
            {" · "}
            {appointment.mode === "in-person" ? "In-person" : "Virtual"}
            {location ? ` · ${location.name}` : ""}
          </p>
          <p className="text-sm text-text-muted">Reference {appointment.reference}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            appointment.status === "confirmed"
              ? "bg-status-success-bg text-status-success-fg"
              : "bg-status-error-bg text-status-error-fg"
          }`}
        >
          {appointment.status === "confirmed" ? "Confirmed" : "Canceled"}
        </span>
      </div>
    </li>
  );
}
