import { useQuery } from "@tanstack/react-query";
import { Mountain, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Destination } from "../backend";
import { useActor } from "../hooks/useActor";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function AltitudeWidget() {
  const { actor } = useActor();
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [nearest, setNearest] = useState<Destination | null>(null);
  const [alerted, setAlerted] = useState(false);

  const { data: destinations } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => actor!.getAllDestinations(),
    enabled: !!actor,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {},
      );
    }
  }, []);

  useEffect(() => {
    if (!position || !destinations?.length) return;
    let min = Number.POSITIVE_INFINITY;
    let closest: Destination | null = null;
    for (const d of destinations) {
      const dist = haversine(position.lat, position.lon, d.lat, d.lon);
      if (dist < min) {
        min = dist;
        closest = d;
      }
    }
    setNearest(closest);
  }, [position, destinations]);

  useEffect(() => {
    if (!nearest || alerted) return;
    const alt = Number(nearest.altitude);
    if (alt > 2500) {
      toast.warning(
        `Altitude Advisory: ${nearest.city} is at ${alt}m. Oxygen levels may be reduced.`,
      );
      setAlerted(true);
    }
  }, [nearest, alerted]);

  if (!nearest) return null;

  const alt = Number(nearest.altitude);
  const o2 = nearest.oxygenLevel;
  const statusColor =
    alt > 5000
      ? "text-red-400"
      : alt > 2500
        ? "text-yellow-400"
        : "text-green-400";
  const statusLabel =
    alt > 5000 ? "High Altitude" : alt > 2500 ? "Moderate Alt." : "Normal";

  return (
    <div
      data-ocid="altitude.widget_panel"
      className="fixed bottom-6 right-6 z-40 glass rounded-2xl p-4 w-52 shadow-gold animate-fade-in"
    >
      <div className="flex items-center gap-2 mb-2">
        <Mountain className={`h-4 w-4 ${statusColor}`} />
        <span className="text-xs font-semibold text-foreground/80">
          Altitude Monitor
        </span>
      </div>
      <p className="text-xs text-muted-foreground truncate">
        {nearest.city}, {nearest.country}
      </p>
      <div className="mt-2 flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Altitude</span>
          <span className={`text-sm font-bold ${statusColor}`}>
            {alt.toLocaleString()}m
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Wind className="h-3 w-3" />
            O₂ Level
          </span>
          <span className={`text-sm font-bold ${statusColor}`}>
            {o2.toFixed(1)}%
          </span>
        </div>
        <div className="mt-1">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
