import { locations } from "@/data/fixtures";
import { Select, Field, Button } from "@/design-system/react";
import type { BookingFilters as BookingFiltersType } from "@/domain/models";

const MODE_OPTIONS = [
  { value: "", label: "Any visit mode" },
  { value: "in-person", label: "In-person" },
  { value: "virtual", label: "Virtual" },
];

export interface BookingFiltersProps {
  filters: BookingFiltersType;
  onChange: (filters: Partial<BookingFiltersType>) => void;
}

const LOCATION_OPTIONS = [
  { value: "", label: "Any location" },
  ...locations.map((l) => ({ value: l.id, label: l.name })),
];

export function BookingFilters({ filters, onChange }: BookingFiltersProps) {
  const hasActiveFilters = Boolean(filters.locationId || filters.mode || filters.providerNameQuery);

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-md border border-border bg-surface-raised p-4">
      <div className="min-w-[180px]">
        <Select
          value={filters.locationId ?? ""}
          options={LOCATION_OPTIONS}
          aria-label="Location"
          onValueChange={(value) => onChange({ locationId: value || undefined })}
        />
      </div>
      <div className="min-w-[160px]">
        <Select
          value={filters.mode ?? ""}
          options={MODE_OPTIONS}
          aria-label="Visit mode"
          onValueChange={(value) => onChange({ mode: (value || undefined) as BookingFiltersType["mode"] })}
        />
      </div>
      <div className="min-w-[200px] flex-1">
        <Field
          label="Search providers by name"
          value={filters.providerNameQuery ?? ""}
          placeholder="e.g. Dr. Chen"
          onValueChange={(value) => onChange({ providerNameQuery: value || undefined })}
        />
      </div>
      {hasActiveFilters ? (
        <Button
          intent="secondary"
          size="sm"
          onClick={() => onChange({ locationId: undefined, mode: undefined, providerNameQuery: undefined })}
        >
          Reset filters
        </Button>
      ) : null}
    </div>
  );
}
