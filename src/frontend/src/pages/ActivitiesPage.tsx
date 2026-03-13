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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ListingType } from "../backend";
import { useActor } from "../hooks/useActor";

const activityImages = [
  "https://images.unsplash.com/photo-1527004013197-933b5e9f5dc4?w=600&q=80",
  "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
  "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=600&q=80",
];

const categories = ["all", "tour", "adventure", "cultural", "food", "wellness"];

export function ActivitiesPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [category, setCategory] = useState("all");
  const [bookingActivity, setBookingActivity] = useState<any>(null);
  const [actDate, setActDate] = useState("");
  const [spots, setSpots] = useState("1");

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => actor!.getAllActivities(),
    enabled: !!actor,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const date = BigInt(new Date(actDate).getTime() * 1000000);
      const total = bookingActivity.price * Number(spots);
      return actor!.createBooking(
        ListingType.activity,
        bookingActivity.id,
        null,
        null,
        date,
        BigInt(spots),
        total,
      );
    },
    onSuccess: () => {
      toast.success("Activity booked!");
      setBookingActivity(null);
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: () => toast.error("Booking failed. Please sign in."),
  });

  const filtered = (activities || []).filter(
    (a) => category === "all" || a.category === category,
  );

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">
          Local Activities
        </h1>
        <p className="text-muted-foreground">
          Immersive experiences curated by local experts
        </p>
      </div>

      <Tabs value={category} onValueChange={setCategory} className="mb-8">
        <TabsList className="glass border border-border">
          {categories.map((c) => (
            <TabsTrigger
              key={c}
              value={c}
              data-ocid={`activities.${c}_tab`}
              className="capitalize"
            >
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
        {filtered.map((act, idx) => (
          <Card
            key={String(act.id)}
            className="glass border-border overflow-hidden hover:border-primary/40 transition-all group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={
                  act.imageUrls[0] ||
                  activityImages[idx % activityImages.length]
                }
                alt={act.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    activityImages[idx % activityImages.length];
                }}
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-black/50 text-white capitalize">
                  {act.category}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge className="gold-gradient text-primary-foreground">
                  ${act.price}
                </Badge>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display font-bold text-lg leading-tight">
                  {act.name}
                </h3>
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-sm">{act.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" />
                {act.destinationCity}, {act.country}
              </p>
              <p className="text-muted-foreground text-sm flex items-center gap-1 mb-3">
                <Clock className="h-3 w-3" />
                {act.durationHours}h duration
              </p>
              <p className="text-foreground/70 text-sm line-clamp-2 mb-4">
                {act.description}
              </p>
              <Button
                data-ocid={`activities.book_button.${idx + 1}`}
                className="w-full gold-gradient text-primary-foreground font-semibold"
                onClick={() => setBookingActivity(act)}
              >
                Book Activity
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!bookingActivity}
        onOpenChange={(o) => !o && setBookingActivity(null)}
      >
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle className="font-display">
              Book {bookingActivity?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Activity Date</Label>
              <Input
                data-ocid="booking.checkin_input"
                type="date"
                value={actDate}
                onChange={(e) => setActDate(e.target.value)}
                className="glass border-border mt-1"
              />
            </div>
            <div>
              <Label>Number of Spots</Label>
              <Input
                data-ocid="booking.guests_input"
                type="number"
                min="1"
                value={spots}
                onChange={(e) => setSpots(e.target.value)}
                className="glass border-border mt-1"
              />
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-primary">
                  ${((bookingActivity?.price || 0) * Number(spots)).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                data-ocid="booking.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setBookingActivity(null)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="booking.confirm_button"
                className="flex-1 gold-gradient text-primary-foreground"
                disabled={!actDate || bookMutation.isPending}
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
