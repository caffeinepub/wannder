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
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export function ItineraryPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showAddDay, setShowAddDay] = useState<string | null>(null);
  const [dayNumber, setDayNumber] = useState("1");
  const [dayDate, setDayDate] = useState("");
  const [dayActivities, setDayActivities] = useState("");
  const [dayNotes, setDayNotes] = useState("");

  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () => actor!.getTravelerTrips(),
    enabled: !!actor,
  });

  const createTrip = useMutation({
    mutationFn: () =>
      actor!.createTrip(
        tripName,
        destination,
        BigInt(new Date(startDate).getTime() * 1000000),
        BigInt(new Date(endDate).getTime() * 1000000),
      ),
    onSuccess: () => {
      toast.success("Trip created!");
      setShowCreate(false);
      setTripName("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      qc.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: () => toast.error("Failed to create trip."),
  });

  const deleteTrip = useMutation({
    mutationFn: (id: bigint) => actor!.deleteTrip(id),
    onSuccess: () => {
      toast.success("Trip deleted.");
      qc.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const addDay = useMutation({
    mutationFn: (tripId: bigint) =>
      actor!.addItineraryDay(
        tripId,
        BigInt(dayNumber),
        BigInt(new Date(dayDate).getTime() * 1000000),
        dayActivities.split("\n").filter(Boolean),
        dayNotes,
      ),
    onSuccess: () => {
      toast.success("Day added!");
      setShowAddDay(null);
      setDayActivities("");
      setDayNotes("");
      qc.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: () => toast.error("Failed to add day."),
  });

  return (
    <div className="pt-20 max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">
            My Itineraries
          </h1>
          <p className="text-muted-foreground">
            Plan your perfect day-by-day adventure
          </p>
        </div>
        <Button
          data-ocid="itinerary.create_button"
          className="gold-gradient text-primary-foreground font-semibold gap-2"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-4 w-4" />
          New Trip
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {["s0", "s1"].map((sk) => (
            <div
              key={sk}
              className="h-32 rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && (!trips || trips.length === 0) && (
        <div data-ocid="itinerary.empty_state" className="text-center py-20">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No trips yet. Create your first itinerary!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {(trips || []).map((trip) => {
          const tripId = String(trip.id);
          const isExpanded = expandedTrip === tripId;
          return (
            <Card key={tripId} className="glass border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-xl">
                      {trip.tripName}
                    </h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {trip.destination}
                    </p>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(
                        Number(trip.startDate) / 1000000,
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        Number(trip.endDate) / 1000000,
                      ).toLocaleDateString()}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-2 border-border text-xs"
                    >
                      {trip.itineraryDays.length} days planned
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedTrip(isExpanded ? null : tripId)
                      }
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      data-ocid="itinerary.delete_button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteTrip.mutate(trip.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    {trip.itineraryDays
                      .slice()
                      .sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber))
                      .map((day) => (
                        <div
                          key={String(day.dayNumber)}
                          className="glass rounded-xl p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="gold-gradient text-primary-foreground">
                              Day {String(day.dayNumber)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(
                                Number(day.date) / 1000000,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {day.activities.length > 0 && (
                            <ul className="space-y-1 mb-2">
                              {day.activities.map((a) => (
                                <li
                                  key={a}
                                  className="text-sm flex items-start gap-2"
                                >
                                  <span className="text-primary mt-0.5">•</span>
                                  {a}
                                </li>
                              ))}
                            </ul>
                          )}
                          {day.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              {day.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    <Button
                      data-ocid="itinerary.add_day_button"
                      variant="outline"
                      size="sm"
                      className="border-border gap-2"
                      onClick={() => setShowAddDay(tripId)}
                    >
                      <Plus className="h-3 w-3" />
                      Add Day
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Trip Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Create New Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Trip Name</Label>
              <Input
                data-ocid="itinerary.trip_name_input"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g. Himalayan Adventure"
                className="glass border-border mt-1"
              />
            </div>
            <div>
              <Label>Destination</Label>
              <Input
                data-ocid="itinerary.destination_input"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kathmandu, Nepal"
                className="glass border-border mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass border-border mt-1"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass border-border mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gold-gradient text-primary-foreground"
                disabled={
                  !tripName ||
                  !destination ||
                  !startDate ||
                  !endDate ||
                  createTrip.isPending
                }
                onClick={() => createTrip.mutate()}
              >
                {createTrip.isPending ? "Creating..." : "Create Trip"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Day Dialog */}
      <Dialog
        open={!!showAddDay}
        onOpenChange={(o) => !o && setShowAddDay(null)}
      >
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle className="font-display">
              Add Itinerary Day
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Day Number</Label>
                <Input
                  type="number"
                  min="1"
                  value={dayNumber}
                  onChange={(e) => setDayNumber(e.target.value)}
                  className="glass border-border mt-1"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={dayDate}
                  onChange={(e) => setDayDate(e.target.value)}
                  className="glass border-border mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Activities (one per line)</Label>
              <Textarea
                value={dayActivities}
                onChange={(e) => setDayActivities(e.target.value)}
                placeholder="Visit Boudhanath Stupa&#10;Trekking in Langtang"
                className="glass border-border mt-1"
                rows={4}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={dayNotes}
                onChange={(e) => setDayNotes(e.target.value)}
                placeholder="Any special notes..."
                className="glass border-border mt-1"
                rows={2}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddDay(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gold-gradient text-primary-foreground"
                disabled={!dayDate || addDay.isPending}
                onClick={() => {
                  if (showAddDay) addDay.mutate(BigInt(showAddDay));
                }}
              >
                {addDay.isPending ? "Adding..." : "Add Day"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
