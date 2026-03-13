import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AltitudeWidget } from "./components/AltitudeWidget";
import { Navbar } from "./components/Navbar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { ActivitiesPage } from "./pages/ActivitiesPage";
import { AdminPage } from "./pages/AdminPage";
import { BookingsPage } from "./pages/BookingsPage";
import { DormsPage } from "./pages/DormsPage";
import { FlightsPage } from "./pages/FlightsPage";
import { HomePage } from "./pages/HomePage";
import { HotelsPage } from "./pages/HotelsPage";
import { ItineraryPage } from "./pages/ItineraryPage";
import { MapsPage } from "./pages/MapsPage";
import { NewsPage } from "./pages/NewsPage";
import { ProfilePage } from "./pages/ProfilePage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  if (isInitializing)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  if (!identity) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="/dorms" element={<DormsPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/maps" element={<MapsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route
            path="/itinerary"
            element={
              <ProtectedRoute>
                <ItineraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <AltitudeWidget />
        <Toaster richColors />
      </div>
    </BrowserRouter>
  );
}
