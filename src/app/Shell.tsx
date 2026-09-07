import { NavLink, Outlet } from "react-router-dom";
import { ScenariosDrawer } from "@/features/scenarios/ScenariosDrawer";
import { Button } from "@/design-system/react";
import { usePreparationStore } from "@/state/preparationStore";

const NAV_ITEMS = [
  { to: "/book", label: "Book care" },
  { to: "/appointments", label: "Appointments" },
  { to: "/study", label: "Study" },
];

export function Shell() {
  const preparationVisible = usePreparationStore((s) => s.visible);
  const togglePreparation = usePreparationStore((s) => s.toggle);

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="border-b border-border bg-surface-raised">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-text-primary">Care Booking</span>
            <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium text-text-muted">
              Demo · fictional data
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
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

