import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  Building2,
  Compass,
  Plane,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";

const statusColor: Record<string, string> = {
  confirmed: "bg-green-500/20 text-green-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  cancelled: "bg-red-500/20 text-red-400",
};

function formatDate(ns?: bigint) {
  if (!ns) return "—";
  return new Date(Number(ns) / 1_000_000).toLocaleDateString();
}

export function AdminPage() {
  const { actor } = useActor();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (actor) {
      actor.isCallerAdmin().then((v) => {
        setIsAdmin(v);
        if (!v) navigate("/");
      });
    }
  }, [actor, navigate]);

  const { data: analytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => actor!.getAnalytics(),
    enabled: !!actor && isAdmin === true,
  });
  const { data: allBookings } = useQuery({
    queryKey: ["allBookings"],
    queryFn: () => actor!.getAllBookings(),
    enabled: !!actor && isAdmin === true,
  });
  const { data: allUsers } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => actor!.getAllUsers(),
    enabled: !!actor && isAdmin === true,
  });

  const updateBooking = useMutation({
    mutationFn: ({ id, status }: { id: bigint; status: string }) =>
      actor!.updateBookingStatus(id, status),
    onSuccess: () => {
      toast.success("Booking updated.");
      qc.invalidateQueries({ queryKey: ["allBookings"] });
    },
  });

  const assignRole = useMutation({
    mutationFn: ({ user, role }: { user: any; role: UserRole }) =>
      actor!.assignCallerUserRole(user, role),
    onSuccess: () => {
      toast.success("Role updated.");
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });

  if (isAdmin === null)
    return (
      <div className="pt-20 text-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mt-20" />
      </div>
    );
  if (isAdmin === false)
    return (
      <div className="pt-20 text-center py-20">
        <ShieldCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p>Access denied. Admins only.</p>
      </div>
    );

  const stats = [
    {
      label: "Total Bookings",
      value: String(analytics?.totalBookings || 0),
      icon: BookOpen,
      sub: "All time",
    },
    {
      label: "Total Revenue",
      value: `$${(analytics?.totalRevenue || 0).toFixed(0)}`,
      icon: TrendingUp,
      sub: "All time",
    },
    {
      label: "Hotel Bookings",
      value: String(analytics?.hotelBookings || 0),
      icon: Building2,
      sub: "",
    },
    {
      label: "Flight Bookings",
      value: String(analytics?.flightBookings || 0),
      icon: Plane,
      sub: "",
    },
    {
      label: "Activity Bookings",
      value: String(analytics?.activityBookings || 0),
      icon: Compass,
      sub: "",
    },
    {
      label: "Total Users",
      value: String(allUsers?.length || 0),
      icon: Users,
      sub: "",
    },
  ];

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Manage your Wannder platform</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="glass border border-border mb-8">
          <TabsTrigger value="overview" data-ocid="admin.overview_tab">
            Overview
          </TabsTrigger>
          <TabsTrigger value="bookings" data-ocid="admin.bookings_tab">
            Bookings
          </TabsTrigger>
          <TabsTrigger value="users" data-ocid="admin.users_tab">
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="glass border-border">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{s.label}</p>
                      <p className="font-display text-3xl font-bold text-primary mt-1">
                        {s.value}
                      </p>
                      {s.sub && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {s.sub}
                        </p>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
                      <s.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <Card className="glass border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(allBookings || []).map((b, idx) => (
                    <TableRow
                      key={String(b.id)}
                      data-ocid={`admin.bookings.row.${idx + 1}`}
                      className="border-border"
                    >
                      <TableCell className="text-muted-foreground text-xs">
                        {String(b.id).slice(0, 8)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {b.listingType as string}
                      </TableCell>
                      <TableCell>{formatDate(b.bookingDate)}</TableCell>
                      <TableCell className="text-primary font-semibold">
                        ${b.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${statusColor[b.status] || statusColor.pending}`}
                        >
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={b.status}
                          onValueChange={(v) =>
                            updateBooking.mutate({ id: b.id, status: v })
                          }
                        >
                          <SelectTrigger className="h-7 w-28 text-xs glass border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!allBookings || allBookings.length === 0) && (
                <div
                  data-ocid="admin.bookings.empty_state"
                  className="text-center py-10 text-muted-foreground"
                >
                  No bookings yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="glass border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Principal</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assign Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(allUsers || []).map(([principal, profile], idx) => (
                    <TableRow
                      key={principal.toString()}
                      data-ocid={`admin.users.row.${idx + 1}`}
                      className="border-border"
                    >
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {principal.toString().slice(0, 12)}...
                      </TableCell>
                      <TableCell>{profile.displayName || "—"}</TableCell>
                      <TableCell>{profile.email || "—"}</TableCell>
                      <TableCell>
                        <Badge className="capitalize bg-primary/20 text-primary">
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={profile.role}
                          onValueChange={(v) =>
                            assignRole.mutate({
                              user: principal,
                              role: v as UserRole,
                            })
                          }
                        >
                          <SelectTrigger className="h-7 w-24 text-xs glass border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!allUsers || allUsers.length === 0) && (
                <div
                  data-ocid="admin.users.empty_state"
                  className="text-center py-10 text-muted-foreground"
                >
                  No users yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
