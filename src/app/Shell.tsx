import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ScenariosDrawer } from "@/features/scenarios/ScenariosDrawer";
import { Button } from "@/design-system/react";
import { usePreparationStore } from "@/state/preparationStore";
import { useSessionStore } from "@/state/sessionStore";
import { generateId } from "@/lib/id";
import { usePatient } from "@/features/booking/hooks/usePatient";

const NAV_ITEMS = [
  { to: "/book", label: "Book care" },
  { to: "/appointments", label: "Appointments" },
  { to: "/study", label: "Study" },
];

export function Shell() {
  const preparationVisible = usePreparationStore((s) => s.visible);
  const togglePreparation = usePreparationStore((s) => s.toggle);
  const actor = useSessionStore((s) => s.actor);
  const setActor = useSessionStore((s) => s.setActor);
  const { data: signedInPatient } = usePatient(actor.kind === "patient" ? actor.patientId : undefined);
  const { pathname } = useLocation();
  // The landing page IS the "Book care"/"Appointments" entry point (via its guest/sign-in
  // choice) — repeating them in the nav there is redundant before that choice is made.
  const isLanding = pathname === "/";
  const navItems = isLanding ? NAV_ITEMS.filter((item) => item.to === "/study") : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="border-b border-border bg-surface-raised">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 p-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-lg font-semibold text-text-primary">Care Booking</span>
            <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium text-text-muted">
              Demo · fictional data
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-action-primary-bg text-action-primary-fg" : "text-text-primary hover:bg-surface-sunken"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {actor.kind === "patient" ? (
              <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
                <span className="text-sm text-text-muted">{signedInPatient?.fullName ?? "Signed in"}</span>
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={() => setActor({ kind: "guest", sessionId: generateId("session") })}
                >
                  Sign out
                </Button>
              </div>
            ) : null}
            {preparationVisible ? <ScenariosDrawer /> : null}
          </nav>
        </div>
      </header>
      <Outlet />
      {!preparationVisible ? (
        <div className="fixed bottom-4 right-4">
          <Button intent="secondary" size="sm" onClick={togglePreparation}>
            Show preparation controls
          </Button>
        </div>
      ) : null}
    </div>
  );
}

