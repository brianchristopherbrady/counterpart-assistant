import { useQuery } from "@tanstack/react-query";
import { repository } from "@/data/repository";
import { useScenarioStore } from "@/state/scenarioStore";
import type { ProviderQuery } from "@/domain/repository";

/** Query key includes scenario version so an "Apply scenario" invalidates in-flight/cached reads. */
export function useProviders(query: ProviderQuery) {
  const scenarioVersion = useScenarioStore((s) => s.version);
  return useQuery({
    queryKey: ["providers", query, scenarioVersion],
    queryFn: ({ signal }) => repository.searchProviders(query, signal),
  });
}
