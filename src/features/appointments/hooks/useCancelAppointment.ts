import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repository } from "@/data/repository";
import type { CancelInput } from "@/domain/repository";
import type { ActorContext } from "@/domain/models";

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, actor, key }: { input: CancelInput; actor: ActorContext; key: string }) =>
      repository.cancel(input, actor, key),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}
