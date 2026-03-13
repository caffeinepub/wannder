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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Car,
  Coffee,
  Dumbbell,
  MapPin,
  Star,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ListingType } from "../backend";
import { useActor } from "../hooks/useActor";

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-3 w-3" />,
  Parking: <Car className="h-3 w-3" />,
  Restaurant: <Coffee className="h-3 w-3" />,
  Gym: <Dumbbell className="h-3 w-3" />,
};

const hotelImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  "https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
];

export function HotelsPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [filterCountry, setFilterCountry] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [bookingHotel, setBookingHotel] = useState<any>(null);
  const [roomType, setRoomType] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

  const { data: hotels, isLoading } = useQuery({
    queryKey: ["hotels"],
    queryFn: () => actor!.getAllHotels(),
    enabled: !!actor,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const ci = BigInt(new Date(checkIn).getTime() * 1000000);
      const co = BigInt(new Date(checkOut).getTime() * 1000000);
      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
      );
      const total = bookingHotel.pricePerNight * nights * Number(guests);
      return actor!.createBooking(
        ListingType.hotel,
        bookingHotel.id,
        ci,
        co,
        null,
        BigInt(guests),
        total,
      );
    },
    onSuccess: () => {
      toast.success("Hotel booked successfully!");
      setBookingHotel(null);
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: () => toast.error("Booking failed. Please sign in."),
  });

  const countries = [...new Set((hotels || []).map((h) => h.country))];
  const filtered = (hotels || []).filter((h) => {
    if (filterCountry !== "all" && h.country !== filterCountry) return false;
    if (maxPrice && h.pricePerNight > Number(maxPrice)) return false;
    return true;
  });

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">Hotels</h1>
        <p className="text-muted-foreground">
          Discover world-class accommodations
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Select value={filterCountry} onValueChange={setFilterCountry}>
          <SelectTrigger
            data-ocid="hotels.filter_select"
            className="w-48 glass border-border"
          >
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Max price/night"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-40 glass border-border"
          type="number"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["s0", "s1", "s2", "s3", "s4", "s5"].map((sk) => (
            <div
              key={sk}
              className="h-72 rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((hotel, idx) => (
          <Card
            key={String(hotel.id)}
            className="glass border-border overflow-hidden group hover:border-primary/40 transition-all"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={
                  hotel.imageUrls[0] || hotelImages[idx % hotelImages.length]
                }
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    hotelImages[idx % hotelImages.length];
                }}
              />
              <div className="absolute top-3 right-3">
                <Badge className="gold-gradient text-primary-foreground font-semibold">
                  ${hotel.pricePerNight}/night
                </Badge>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display font-bold text-lg leading-tight">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-semibold">
                    {hotel.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-1 mb-3">
                <MapPin className="h-3 w-3" />
                {hotel.location}, {hotel.country}
              </p>
              <div className="flex flex-wrap gap-1 mb-4">
                {hotel.amenities.slice(0, 4).map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1 text-xs bg-white/10 px-2 py-0.5 rounded-full text-foreground/70"
                  >
                    {amenityIcons[a] || <Building2 className="h-3 w-3" />}
                    {a}
                  </span>
                ))}
              </div>
              <Button
                data-ocid={`hotels.book_button.${idx + 1}`}
                className="w-full gold-gradient text-primary-foreground font-semibold"
                onClick={() => {
                  setBookingHotel(hotel);
                  setRoomType(hotel.roomTypes[0] || "");
                }}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!bookingHotel}
        onOpenChange={(o) => !o && setBookingHotel(null)}
      >
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle className="font-display">
              Book {bookingHotel?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Room Type</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger className="glass border-border mt-1">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {(bookingHotel?.roomTypes || []).map((rt: string) => (
                    <SelectItem key={rt} value={rt}>
                      {rt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            {checkIn && checkOut && (
              <div className="glass rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-primary">
                    $
                    {(
                      bookingHotel?.pricePerNight *
                      Math.max(
                        1,
                        Math.ceil(
                          (new Date(checkOut).getTime() -
                            new Date(checkIn).getTime()) /
                            86400000,
                        ),
                      ) *
                      Number(guests)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                data-ocid="booking.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setBookingHotel(null)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="booking.confirm_button"
                className="flex-1 gold-gradient text-primary-foreground font-semibold"
                disabled={!checkIn || !checkOut || bookMutation.isPending}
                onClick={() => bookMutation.mutate()}
              >
                {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
