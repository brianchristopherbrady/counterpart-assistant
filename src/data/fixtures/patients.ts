import type { Patient } from "@/domain/models";

/** Seeded, established fixture patients — all already known to the practice. */
export const patients: Patient[] = [
  {
    id: "pat-blake",
    fullName: "Jordan Blake",
    dateOfBirth: "1988-04-12",
    contact: { method: "email", value: "jordan.blake@example.com" },
  },
  {
    id: "pat-nguyen",
    fullName: "Casey Nguyen",
    dateOfBirth: "1975-11-02",
    contact: { method: "email", value: "casey.nguyen@example.com" },
  },
  {
    id: "pat-thompson",
    fullName: "Riley Thompson",
    dateOfBirth: "1990-07-23",
    contact: { method: "email", value: "riley.thompson@example.com" },
  },
];
