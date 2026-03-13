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
import { BedDouble, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ListingType } from "../backend";
import { useActor } from "../hooks/useActor";

const dormImages = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
  "https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=600&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80",
  "https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=600&q=80",
];

export function DormsPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [bookingDorm, setBookingDorm] = useState<any>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

  const { data: dorms, isLoading } = useQuery({
    queryKey: ["dorms"],
    queryFn: () => actor!.getAllDorms(),
    enabled: !!actor,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const ci = BigInt(new Date(checkIn).getTime() * 1000000);
      const co = BigInt(new Date(checkOut).getTime() * 1000000);
      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            86400000,
        ),
      );
      const total = bookingDorm.pricePerNight * nights * Number(guests);
      return actor!.createBooking(
        ListingType.dorm,
        bookingDorm.id,
        ci,
        co,
        null,
        BigInt(guests),
        total,
      );
    },
    onSuccess: () => {
      toast.success("Dorm booked!");
      setBookingDorm(null);
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: () => toast.error("Booking failed. Please sign in."),
  });

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">
          Dorms & Hostels
        </h1>
        <p className="text-muted-foreground">
          Budget-friendly stays without compromising comfort
        </p>
      </div>
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["s0", "s1", "s2", "s3"].map((sk) => (
            <div
              key={sk}
              className="h-64 rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(dorms || []).map((dorm, idx) => (
          <Card
            key={String(dorm.id)}
            className="glass border-border overflow-hidden hover:border-primary/40 transition-all group"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={dorm.imageUrls[0] || dormImages[idx % dormImages.length]}
                alt={dorm.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    dormImages[idx % dormImages.length];
                }}
              />
              <div className="absolute top-3 right-3">
                <Badge className="gold-gradient text-primary-foreground">
                  ${dorm.pricePerNight}/night
                </Badge>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display font-bold text-lg">{dorm.name}</h3>
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-sm">{dorm.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-1 mb-2">
                <MapPin className="h-3 w-3" />
                {dorm.location}, {dorm.country}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {dorm.bedTypes.map((bt: string) => (
                  <Badge
                    key={bt}
                    variant="outline"
                    className="text-xs border-border"
                  >
                    <BedDouble className="h-3 w-3 mr-1" />
                    {bt}
                  </Badge>
                ))}
              </div>
              <Button
                data-ocid={`dorms.book_button.${idx + 1}`}
                className="w-full gold-gradient text-primary-foreground font-semibold"
                onClick={() => setBookingDorm(dorm)}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!bookingDorm}
        onOpenChange={(o) => !o && setBookingDorm(null)}
      >
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle className="font-display">
              Book {bookingDorm?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Check-in</Label>
                <Input
                  data-ocid="booking.checkin_input"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="glass border-border mt-1"
                />
              </div>
              <div>
                <Label>Check-out</Label>
                <Input
                  data-ocid="booking.checkout_input"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="glass border-border mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Guests</Label>
              <Input
                data-ocid="booking.guests_input"
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="glass border-border mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button
                data-ocid="booking.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setBookingDorm(null)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="booking.confirm_button"
                className="flex-1 gold-gradient text-primary-foreground"
                disabled={!checkIn || !checkOut || bookMutation.isPending}
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
