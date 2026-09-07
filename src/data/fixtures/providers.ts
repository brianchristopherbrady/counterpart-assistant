import type { Provider } from "@/domain/models";

export const providers: Provider[] = [
  {
    id: "prov-chen",
    name: "Dr. Maria Chen",
    role: "Family Medicine",
    locationIds: ["loc-downtown", "loc-northside"],
    supportedModes: ["in-person", "virtual"],
    acceptsNewPatients: true,
  },
  {
    id: "prov-okafor",
    name: "Dr. James Okafor",
    role: "Family Medicine",
    locationIds: ["loc-downtown"],
    supportedModes: ["in-person", "virtual"],
    acceptsNewPatients: true,
  },
  {
    id: "prov-patel",
    name: "Dr. Priya Patel",
    role: "Internal Medicine",
    locationIds: ["loc-northside"],
    supportedModes: ["in-person"],
    acceptsNewPatients: true,
  },
  {
    id: "prov-rivera",
    name: "Dr. Sam Rivera",
    role: "Family Medicine",
    locationIds: ["loc-downtown", "loc-northside"],
    supportedModes: ["virtual"],
    acceptsNewPatients: false,
  },
  {
    id: "prov-kowalski",
    name: "Dr. Lena Kowalski",
    role: "Internal Medicine",
    locationIds: ["loc-downtown"],
    supportedModes: ["in-person", "virtual"],
    acceptsNewPatients: true,
  },
  {
    id: "prov-haddad",
    name: "Dr. Omar Haddad",
    role: "Family Medicine",
    locationIds: ["loc-northside"],
    supportedModes: ["in-person"],
    acceptsNewPatients: false,
  },
];
