import { MockBookingRepository } from "./mockRepository";
import { systemClock } from "@/lib/clock";
import { useScenarioStore } from "@/state/scenarioStore";

/** One repository instance for the whole app — its scenario reader always reflects current scenario state. */
export const repository = new MockBookingRepository(systemClock, () => {
  const { config, version } = useScenarioStore.getState();
  return { dataScenario: config.dataScenario, version };
});
