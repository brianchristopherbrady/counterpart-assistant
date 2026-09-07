import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { Shell } from "./Shell";
import { BookingPage } from "@/features/booking/BookingPage";
import { AppointmentsPage } from "@/features/appointments/AppointmentsPage";
import { StudyPage } from "@/features/study/StudyPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Navigate to="/book" replace />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="*" element={<Navigate to="/book" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
