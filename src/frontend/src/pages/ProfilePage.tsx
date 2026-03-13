import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";

export function ProfilePage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => actor!.getCallerUserProfile(),
    enabled: !!actor,
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setEmail(profile.email);
      setAvatarUrl(profile.avatarUrl);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: () =>
      actor!.saveCallerUserProfile({
        displayName,
        email,
        avatarUrl,
        role: profile?.role || UserRole.user,
      }),
    onSuccess: () => {
      toast.success("Profile saved!");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Failed to save profile."),
  });

  return (
    <div className="pt-20 max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold mb-8">My Profile</h1>
      <Card className="glass border-border">
        <CardContent className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {displayName.charAt(0) || "W"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-2xl font-bold">
                {displayName || "Traveler"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {email || "No email set"}
              </p>
              {profile?.role && (
                <Badge className="mt-2 capitalize gold-gradient text-primary-foreground">
                  {profile.role}
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="glass border-border mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass border-border mt-1"
              />
            </div>
            <div>
              <Label>Avatar URL</Label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="glass border-border mt-1"
              />
            </div>
            <Button
              data-ocid="profile.save_button"
              className="w-full gold-gradient text-primary-foreground font-semibold"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
