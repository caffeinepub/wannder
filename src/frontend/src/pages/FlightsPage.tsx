import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Clock, Plane } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ListingType } from "../backend";
import { useActor } from "../hooks/useActor";

function formatTime(ns: bigint) {
  return new Date(Number(ns) / 1_000_000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FlightsPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [bookingFlight, setBookingFlight] = useState<any>(null);
  const [seats, setSeats] = useState("1");

  const { data: flights, isLoading } = useQuery({
    queryKey: ["flights"],
    queryFn: () => actor!.getAllFlights(),
    enabled: !!actor,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const total = bookingFlight.price * Number(seats);
      return actor!.createBooking(
        ListingType.flight,
        bookingFlight.id,
        null,
        null,
        null,
        BigInt(seats),
        total,
      );
    },
    onSuccess: () => {
      toast.success("Flight booked!");
      setBookingFlight(null);
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: () => toast.error("Booking failed. Please sign in."),
  });

  const filtered = (flights || []).filter((f) => {
    if (origin && !f.originCity.toLowerCase().includes(origin.toLowerCase()))
      return false;
    if (dest && !f.destinationCity.toLowerCase().includes(dest.toLowerCase()))
      return false;
    return true;
  });

  const classColor = (c: string) =>
    c === "first"
      ? "gold-gradient text-primary-foreground"
      : c === "business"
        ? "bg-primary/20 text-primary"
        : "bg-white/10 text-foreground";

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">Flights</h1>
        <p className="text-muted-foreground">
          Search and book flights to any destination
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Input
          placeholder="From (city)"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="w-48 glass border-border"
        />
        <Input
          placeholder="To (city)"
          value={dest}
          onChange={(e) => setDest(e.target.value)}
          className="w-48 glass border-border"
        />
      </div>

      {isLoading && (
        <div className="space-y-4">
          {["s0", "s1", "s2", "s3"].map((sk) => (
            <div
              key={sk}
              className="h-24 rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((flight, idx) => (
          <Card
            key={String(flight.id)}
            className="glass border-border hover:border-primary/40 transition-all"
          >
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Plane className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{flight.airline}</span>
                    <span className="text-muted-foreground text-sm">
                      {flight.flightNumber}
                    </span>
                    <Badge
                      className={`text-xs ${classColor(flight.flightClass)}`}
                    >
                      {flight.flightClass}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{flight.originCity}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {flight.destinationCity}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatTime(flight.departureDateTime)} →{" "}
                    {formatTime(flight.arrivalDateTime)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    ${flight.price}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {String(flight.availableSeats)} seats left
                  </div>
                </div>
                <Button
                  data-ocid={`flights.book_button.${idx + 1}`}
                  className="gold-gradient text-primary-foreground font-semibold"
                  onClick={() => setBookingFlight(flight)}
                >
                  Book
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!bookingFlight}
        onOpenChange={(o) => !o && setBookingFlight(null)}
      >
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Book Flight</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glass rounded-xl p-4">
              <p className="font-semibold">
                {bookingFlight?.airline} {bookingFlight?.flightNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                {bookingFlight?.originCity} → {bookingFlight?.destinationCity}
              </p>
              <p className="text-sm text-muted-foreground">
                {bookingFlight && formatTime(bookingFlight.departureDateTime)}
              </p>
            </div>
            <div>
              <Label>Number of Seats</Label>
              <Input
                data-ocid="booking.guests_input"
                type="number"
                min="1"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="glass border-border mt-1"
              />
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-primary">
                  ${((bookingFlight?.price || 0) * Number(seats)).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                data-ocid="booking.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setBookingFlight(null)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="booking.confirm_button"
                className="flex-1 gold-gradient text-primary-foreground font-semibold"
                disabled={bookMutation.isPending}
                onClick={() => bookMutation.mutate()}
              >
                {bookMutation.isPending ? "Booking..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
