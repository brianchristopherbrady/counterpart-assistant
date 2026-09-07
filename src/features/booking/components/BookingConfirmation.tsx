import { Link } from "react-router-dom";
import { Button } from "@/design-system/react";
import { formatInstant } from "@/lib/datetime";
import type { Appointment } from "@/domain/models";

export interface BookingConfirmationProps {
  appointment: Appointment;
  providerName: string;
  locationName: string;
  displayZone: string;
  /** New-patient guest bookings have no account yet, so no "view appointments" link is shown. */
  canViewAppointments: boolean;
}

export function BookingConfirmation({
  appointment,
  providerName,
  locationName,
  displayZone,
  canViewAppointments,
}: BookingConfirmationProps) {
  return (
    <div className="flex max-w-lg flex-col gap-4 rounded-md border border-border bg-surface-raised p-6">
      <h2 className="text-xl font-semibold text-text-primary">Booking confirmed</h2>
      <p className="text-text-primary">
        Confirmation reference <span className="font-mono font-semibold">{appointment.reference}</span>
      </p>
      <p className="text-text-primary">
        {providerName} · {formatInstant(appointment.startInstant, displayZone)} · {locationName}
      </p>
      {canViewAppointments ? (
        <Link to="/appointments">
          <Button>View my appointments</Button>
        </Link>
      ) : (
        <p className="text-sm text-text-muted">
          This booking is tied to this browser session. Use the Appointments tab from here to view, reschedule, or
          cancel it.
        </p>
      )}
    </div>
  );
}
