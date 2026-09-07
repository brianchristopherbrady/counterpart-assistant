import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repository } from "@/data/repository";
import type { RescheduleInput } from "@/domain/repository";
import type { ActorContext } from "@/domain/models";

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, actor, key }: { input: RescheduleInput; actor: ActorContext; key: string }) =>
      repository.reschedule(input, actor, key),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}
