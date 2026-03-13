import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Destination } from "../backend";
import { useActor } from "../hooks/useActor";

export function MapsPage() {
  const { actor } = useActor();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersAddedRef = useRef(false);

  const { data: destinations } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => actor!.getAllDestinations(),
    enabled: !!actor,
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");
      const map = L.map(mapRef.current!).setView([20, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);
      mapInstanceRef.current = { map, L };
    });
    return () => {
      if (mapInstanceRef.current?.map) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
        markersAddedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!destinations?.length || markersAddedRef.current) return;
    const timer = setInterval(() => {
      if (!mapInstanceRef.current) return;
      clearInterval(timer);
      markersAddedRef.current = true;
      const { map, L } = mapInstanceRef.current;
      for (const dest of destinations) {
        const alt = Number(dest.altitude);
        const color =
          alt > 5000 ? "#ef4444" : alt > 2500 ? "#f59e0b" : "#22c55e";
        const icon = L.divIcon({
          html: `<div style="width:28px;height:28px;background:${color};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-size:10px;color:white;font-weight:bold;">${String(dest.altitude).slice(0, 2)}</div>`,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([dest.lat, dest.lon], { icon });
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:180px">
            <h3 style="margin:0 0 4px;font-weight:bold;font-size:16px">${dest.city}</h3>
            <p style="margin:0 0 2px;color:#666;font-size:13px">${dest.country}</p>
            <p style="margin:2px 0;font-size:13px"><b>Altitude:</b> ${Number(dest.altitude).toLocaleString()}m</p>
            <p style="margin:2px 0;font-size:13px"><b>O2 Level:</b> ${dest.oxygenLevel.toFixed(1)}%</p>
            <p style="margin:4px 0 0;font-size:12px;color:#444">${dest.description}</p>
          </div>
        `);
        marker.addTo(map);
      }
    }, 200);
    return () => clearInterval(timer);
  }, [destinations]);

  const handleOfflineDownload = () => {
    if (destinations) {
      localStorage.setItem(
        "wannder_offline_destinations",
        JSON.stringify(
          destinations.map((d: Destination) => ({
            ...d,
            id: String(d.id),
            altitude: String(d.altitude),
          })),
        ),
      );
      toast.success("Destination data saved for offline use!");
    }
  };

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">Explore Maps</h1>
          <p className="text-muted-foreground">
            Interactive world map with altitude data for every destination
          </p>
        </div>
        <Button
          data-ocid="maps.download_button"
          variant="outline"
          className="border-border gap-2"
          onClick={handleOfflineDownload}
        >
          <Download className="h-4 w-4" />
          Save Offline
        </Button>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-border">
        <div className="px-4 py-3 border-b border-border flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Normal (&lt;2500m)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Moderate (2500-5000m)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">High (&gt;5000m)</span>
          </div>
        </div>
        <div
          data-ocid="maps.canvas_target"
          ref={mapRef}
          style={{ height: "550px", width: "100%" }}
        />
      </div>
    </div>
  );
}
