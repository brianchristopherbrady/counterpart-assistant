import { BookingFlow } from "./BookingFlow";

export function BookingPage() {
  return (
    <div className="mx-auto flex max-w-content flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-text-primary">Book care</h1>
      <BookingFlow />
    </div>
  );
}
