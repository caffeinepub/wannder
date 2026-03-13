import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navLinks = [
  { to: "/hotels", label: "Hotels", ocid: "nav.hotels_link" },
  { to: "/flights", label: "Flights", ocid: "nav.flights_link" },
  { to: "/dorms", label: "Dorms", ocid: "nav.dorms_link" },
  { to: "/activities", label: "Activities", ocid: "nav.activities_link" },
  { to: "/maps", label: "Maps", ocid: "nav.maps_link" },
  { to: "/news", label: "News", ocid: "nav.news_link" },
  { to: "/itinerary", label: "Itinerary", ocid: "nav.itinerary_link" },
  { to: "/bookings", label: "My Trips", ocid: "nav.bookings_link" },
];

export function Navbar() {
  const { identity, login, clear } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/assets/generated/wannder-logo-transparent.dim_200x200.png"
            alt="Wannder"
            className="h-9 w-9 object-contain"
          />
          <span className="font-display text-xl font-bold text-primary">
            Wannder
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={link.ocid}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-foreground hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            data-ocid="nav.admin_link"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname === "/admin"
                ? "text-primary bg-primary/10"
                : "text-foreground/70 hover:text-foreground hover:bg-white/5"
            }`}
          >
            Admin
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {identity ? (
            <>
              <Link to="/profile" data-ocid="nav.profile_link">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={login}
              size="sm"
              className="gold-gradient text-primary-foreground font-semibold gap-2"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden glass border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={link.ocid}
              onClick={() => setMobileOpen(false)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === link.to
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            data-ocid="nav.admin_link"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-md text-sm font-medium text-foreground/70"
          >
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
