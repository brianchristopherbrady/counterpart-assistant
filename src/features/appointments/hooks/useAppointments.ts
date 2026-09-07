import { useQuery } from "@tanstack/react-query";
import { repository } from "@/data/repository";
import type { ActorContext } from "@/domain/models";

export function useAppointments(actor: ActorContext) {
  return useQuery({
    queryKey: ["appointments", actor],
    queryFn: () => repository.listAppointments(actor),
  });
}
