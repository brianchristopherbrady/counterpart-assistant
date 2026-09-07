import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { locations, providers } from "@/data/fixtures";
import { Button } from "@/design-system/react";
import { formatInstant, VIEWER_TIME_ZONE } from "@/lib/datetime";
import { useBookingDraftStore } from "@/features/booking/state/bookingDraftStore";
import { useScenarioStore } from "@/state/scenarioStore";
import { useSessionStore } from "@/state/sessionStore";
import { CancelAppointmentDialog } from "./CancelAppointmentDialog";
import type { Appointment } from "@/domain/models";

export function AppointmentItem({ appointment }: { appointment: Appointment }) {
  const navigate = useNavigate();
  const startReschedule = useBookingDraftStore((s) => s.startReschedule);
  const discoveryMode = useScenarioStore((s) => s.config.discoveryMode);
  const actor = useSessionStore((s) => s.actor);
  const [cancelOpen, setCancelOpen] = useState(false);

  const provider = providers.find((p) => p.id === appointment.providerId);
  const location = locations.find((l) => l.id === appointment.locationId);
  const displayZone = appointment.mode === "virtual" ? VIEWER_TIME_ZONE : (location?.timeZone ?? VIEWER_TIME_ZONE);

  return (
    <li className="rounded-md border border-border bg-surface-raised p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-text-primary">{provider?.name ?? appointment.providerId}</p>
          <p className="text-sm text-text-muted">
            {formatInstant(appointment.startInstant, displayZone)}
            {" · "}
            {appointment.mode === "in-person" ? "In-person" : "Virtual"}
            {location ? ` · ${location.name}` : ""}
          </p>
          <p className="text-sm text-text-muted">Reference {appointment.reference}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              appointment.status === "confirmed"
                ? "bg-status-success-bg text-status-success-fg"
                : "bg-status-error-bg text-status-error-fg"
            }`}
          >
            {appointment.status === "confirmed" ? "Confirmed" : "Canceled"}
          </span>
          {appointment.status === "confirmed" ? (
            <>
              <Button
                intent="secondary"
                size="sm"
                onClick={() => {
                  startReschedule(appointment, discoveryMode);
                  navigate("/book");
                }}
              >
                Reschedule
              </Button>
              <Button intent="destructive" size="sm" onClick={() => setCancelOpen(true)}>
                Cancel
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <CancelAppointmentDialog
        appointment={appointment}
        providerName={provider?.name ?? appointment.providerId}
        displayZone={displayZone}
        actor={actor}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </li>
  );
}

