import { useQuery } from "@tanstack/react-query";
import { repository } from "@/data/repository";
import { useScenarioStore } from "@/state/scenarioStore";
import type { SlotQuery } from "@/domain/repository";

/** Query key includes scenario version so an "Apply scenario" invalidates in-flight/cached reads. */
export function useSlots(query: SlotQuery | null) {
  const scenarioVersion = useScenarioStore((s) => s.version);
  return useQuery({
    queryKey: ["slots", query, scenarioVersion],
    queryFn: ({ signal }) => repository.getSlots(query as SlotQuery, signal),
    enabled: query !== null,
  });
}
