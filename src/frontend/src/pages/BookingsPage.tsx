import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BedDouble, Building2, Calendar, Compass, Plane } from "lucide-react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

const typeIcon: Record<string, React.ReactNode> = {
  hotel: <Building2 className="h-4 w-4" />,
  flight: <Plane className="h-4 w-4" />,
  dorm: <BedDouble className="h-4 w-4" />,
  activity: <Compass className="h-4 w-4" />,
};

const statusColor: Record<string, string> = {
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

function formatDate(ns?: bigint) {
  if (!ns) return "—";
  return new Date(Number(ns) / 1_000_000).toLocaleDateString();
}

export function BookingsPage() {
  const { actor } = useActor();
  const qc = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => actor!.getCallerBookings(),
    enabled: !!actor,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: bigint) => actor!.updateBookingStatus(id, "cancelled"),
    onSuccess: () => {
      toast.success("Booking cancelled.");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  return (
    <div className="pt-20 max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold mb-2">My Bookings</h1>
      <p className="text-muted-foreground mb-8">
        All your upcoming and past bookings
      </p>

      {isLoading && (
        <div className="space-y-4">
          {["s0", "s1", "s2"].map((sk) => (
            <div
              key={sk}
              className="h-24 rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && (!bookings || bookings.length === 0) && (
        <div data-ocid="bookings.empty_state" className="text-center py-20">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No bookings yet. Start exploring!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {(bookings || []).map((b, idx) => (
          <Card
            key={String(b.id)}
            data-ocid={`bookings.item.${idx + 1}`}
            className="glass border-border"
          >
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-primary-foreground">
                  {typeIcon[b.listingType as string] || (
                    <Calendar className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize">
                      {b.listingType as string}
                    </span>
                    <Badge
                      className={`text-xs border ${statusColor[b.status] || statusColor.pending}`}
                    >
                      {b.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {b.checkInDate
                      ? `${formatDate(b.checkInDate)} - ${formatDate(b.checkOutDate)}`
                      : b.activityDate
                        ? formatDate(b.activityDate)
                        : formatDate(b.bookingDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {String(b.numGuestsOrSeats)} guest(s) ·{" "}
                    <span className="text-primary font-semibold">
                      ${b.totalPrice.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
              {b.status !== "cancelled" && (
                <Button
                  data-ocid={`bookings.cancel_button.${idx + 1}`}
                  variant="destructive"
                  size="sm"
                  onClick={() => cancelMutation.mutate(b.id)}
                >
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
