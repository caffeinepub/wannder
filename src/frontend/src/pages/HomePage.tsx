import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  BedDouble,
  Building2,
  Compass,
  MapPin,
  Mountain,
  Plane,
  Star,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActor } from "../hooks/useActor";

const categories = [
  {
    icon: Building2,
    label: "Hotels",
    desc: "Luxury stays worldwide",
    to: "/hotels",
  },
  {
    icon: Plane,
    label: "Flights",
    desc: "Best fares, any destination",
    to: "/flights",
  },
  {
    icon: BedDouble,
    label: "Dorms",
    desc: "Budget-friendly hostels",
    to: "/dorms",
  },
  {
    icon: Compass,
    label: "Activities",
    desc: "Unforgettable experiences",
    to: "/activities",
  },
];

export function HomePage() {
  const { actor } = useActor();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [seeded, setSeeded] = useState(false);

  const { data: destinations } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => actor!.getAllDestinations(),
    enabled: !!actor,
  });

  const { data: hotels } = useQuery({
    queryKey: ["hotels"],
    queryFn: () => actor!.getAllHotels(),
    enabled: !!actor,
  });

  useEffect(() => {
    if (actor && !seeded && hotels !== undefined && hotels.length === 0) {
      actor.seedData().then(() => setSeeded(true));
    }
  }, [actor, hotels, seeded]);

  const handleSearch = () => {
    if (search.trim()) navigate(`/hotels?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <img
          src="/assets/generated/hero-bg.dim_1600x900.jpg"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 animate-fade-in">
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-4">
            Premium Travel Experience
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Wander the World
            <br />
            with <span className="text-primary">Wannder</span>
          </h1>
          <p className="text-foreground/80 text-lg mb-10">
            Discover extraordinary destinations, book with confidence, travel
            with purpose.
          </p>
          <div className="flex gap-3 max-w-xl mx-auto">
            <Input
              data-ocid="home.search_input"
              placeholder="Where do you want to go?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm flex-1"
            />
            <Button
              data-ocid="home.search_button"
              onClick={handleSearch}
              className="gold-gradient text-primary-foreground font-semibold px-6"
            >
              Explore
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-2">
          Plan Your Journey
        </h2>
        <p className="text-muted-foreground text-center mb-10">
          Everything you need for the perfect trip
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card
              key={cat.label}
              onClick={() => navigate(cat.to)}
              className="cursor-pointer group glass border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <cat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">
                  {cat.label}
                </h3>
                <p className="text-muted-foreground text-sm">{cat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="font-display text-3xl font-bold mb-2">
          Featured Destinations
        </h2>
        <p className="text-muted-foreground mb-8">
          Explore our curated selection of world-class destinations
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(destinations || []).slice(0, 6).map((dest) => (
            <Card
              key={String(dest.id)}
              onClick={() => navigate(`/news?city=${dest.city}`)}
              className="cursor-pointer glass border-border hover:border-primary/40 transition-all group overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold text-xl">
                      {dest.city}
                    </h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {dest.country}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary">
                      <Mountain className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        {Number(dest.altitude).toLocaleString()}m
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Wind className="h-3 w-3" />
                      <span className="text-xs">
                        {dest.oxygenLevel.toFixed(1)}% O₂
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-foreground/70 text-sm line-clamp-2">
                  {dest.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-primary text-xs font-medium">
                  <Star className="h-3 w-3 fill-current" />
                  <span>Explore destination</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
