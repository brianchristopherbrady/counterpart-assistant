import { useQuery } from "@tanstack/react-query";
import { repository } from "@/data/repository";

export function usePatient(patientId: string | undefined) {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => repository.getPatient(patientId as string),
    enabled: patientId !== undefined,
  });
}
