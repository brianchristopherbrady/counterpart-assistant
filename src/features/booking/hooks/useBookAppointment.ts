import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repository } from "@/data/repository";
import type { BookingInput } from "@/domain/repository";
import type { ActorContext } from "@/domain/models";

export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, actor, key }: { input: BookingInput; actor: ActorContext; key: string }) =>
      repository.book(input, actor, key),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}
