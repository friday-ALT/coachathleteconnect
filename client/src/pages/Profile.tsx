import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Loader2, Upload, User, Trophy, Star, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { AthleteProfile, CoachProfile } from "@shared/schema";

const athleteSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  age: z.coerce.number().int().min(5).max(100),
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  locationCity: z.string().min(2, "City is required"),
  locationState: z.string().min(2, "State/County is required"),
  goals: z.string().optional(),
});

const coachSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  name: z.string().min(2, "Name is required"),
  locationCity: z.string().min(2, "City is required"),
  locationState: z.string().min(2, "State/County is required"),
  experience: z.string().min(10).max(300, "Experience must be between 10 and 300 characters"),
  pricePerHour: z.coerce.number().int().min(0, "Price must be 0 or more"),
});

export default function Profile() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isAthlete, isCoach, hasBothProfiles, setActiveRole, clearRole } = useRole();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { data: athleteProfile, isLoading: athleteLoading } = useQuery<AthleteProfile>({
    queryKey: ["/api/profiles/athlete"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: coachProfile, isLoading: coachLoading } = useQuery<CoachProfile>({
    queryKey: ["/api/profiles/coach"],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/auth/login");
  }, [authLoading, isAuthenticated, setLocation]);

  const athleteForm = useForm({
    resolver: zodResolver(athleteSchema),
    defaultValues: { phone: "", age: 18 as any, skillLevel: "Beginner" as const, locationCity: "", locationState: "", goals: "" },
  });

  const coachForm = useForm({
    resolver: zodResolver(coachSchema),
    defaultValues: { phone: "", name: "", locationCity: "", locationState: "", experience: "", pricePerHour: 0 as any },
  });

  useEffect(() => {
    if (athleteProfile) {
      athleteForm.reset({
        phone: user?.phone || "",
        age: athleteProfile.age,
        skillLevel: athleteProfile.skillLevel as any,
        locationCity: athleteProfile.locationCity,
        locationState: athleteProfile.locationState,
        goals: (athleteProfile as any).goals || "",
      });
    }
  }, [athleteProfile, user]);

  useEffect(() => {
    if (coachProfile) {
      coachForm.reset({
        phone: user?.phone || "",
        name: coachProfile.name,
        locationCity: coachProfile.locationCity,
        locationState: coachProfile.locationState,
        experience: coachProfile.experience,
        pricePerHour: coachProfile.pricePerHour / 100,
      });
      setPreviewUrl(coachProfile.avatarUrl || "");
    }
  }, [coachProfile, user]);

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Failed to upload avatar");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/profiles/coach"] }),
  });

  const athleteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof athleteSchema>) => apiRequest("PUT", "/api/profiles/athlete", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/athlete"] });
      toast({ title: "Athlete profile updated ✓" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const coachMutation = useMutation({
    mutationFn: async (data: z.infer<typeof coachSchema>) => {
      return apiRequest("PUT", "/api/profiles/coach", { ...data, pricePerHour: Math.round(data.pricePerHour * 100) });
    },
    onSuccess: async () => {
      if (avatarFile) {
        await uploadAvatarMutation.mutateAsync(avatarFile);
        setAvatarFile(null);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/coach"] });
      toast({ title: "Coach profile updated ✓" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setAvatarFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  if (authLoading || athleteLoading || coachLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const backHref = isAthlete ? "/athlete/dashboard" : isCoach ? "/coach/dashboard" : "/";
  const hasNoProfile = !athleteProfile && !coachProfile;

  // Determine which tab to show by default
  const defaultTab = isAthlete ? "athlete" : isCoach ? "coach" : (athleteProfile ? "athlete" : "coach");

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 md:py-10">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">My Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your profile information</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => { window.location.href = "/api/logout"; }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>

      {/* Account info */}
      <Card className="mb-6">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.profileImageUrl || coachProfile?.avatarUrl || undefined} />
            <AvatarFallback>{user?.firstName?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {athleteProfile && <Badge variant="secondary" className="text-xs"><User className="h-3 w-3 mr-1" />Athlete</Badge>}
            {coachProfile && <Badge variant="secondary" className="text-xs"><Trophy className="h-3 w-3 mr-1" />Coach</Badge>}
          </div>
        </CardContent>
      </Card>

      {hasNoProfile && (
        <Card className="text-center py-8">
          <CardHeader>
            <CardTitle>No Profile Yet</CardTitle>
            <CardDescription>Create a profile to start connecting.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/role-selection">
              <Button>Create Profile</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!hasNoProfile && (
        <Tabs defaultValue={defaultTab}>
          {hasBothProfiles && (
            <TabsList className="w-full mb-6">
              <TabsTrigger value="athlete" className="flex-1">
                <User className="h-4 w-4 mr-2" />
                Athlete Profile
              </TabsTrigger>
              <TabsTrigger value="coach" className="flex-1">
                <Trophy className="h-4 w-4 mr-2" />
                Coach Profile
              </TabsTrigger>
            </TabsList>
          )}

          {/* Athlete profile tab */}
          {athleteProfile && (
            <TabsContent value="athlete">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Athlete Profile</CardTitle>
                  <CardDescription>Update your training preferences and location</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...athleteForm}>
                    <form onSubmit={athleteForm.handleSubmit((d) => athleteMutation.mutate(d))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={athleteForm.control} name="phone" render={({ field }) => (
                          <FormItem className="col-span-2 sm:col-span-1">
                            <FormLabel>Phone</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={athleteForm.control} name="age" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl><Input type="number" min={5} max={100} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={athleteForm.control} name="skillLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={athleteForm.control} name="locationCity" render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={athleteForm.control} name="locationState" render={({ field }) => (
                          <FormItem>
                            <FormLabel>County / State</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={athleteForm.control} name="goals" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goals <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                          <FormControl>
                            <Textarea placeholder="What do you want to improve?" className="resize-none" rows={3} {...field} />
                          </FormControl>
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={athleteMutation.isPending}>
                        {athleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Coach profile tab */}
          {coachProfile && (
            <TabsContent value="coach">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-lg">Coach Profile</CardTitle>
                      <CardDescription>Your public profile that athletes see</CardDescription>
                    </div>
                    {coachProfile.ratingAvg && coachProfile.ratingAvg > 0 ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{(coachProfile.ratingAvg as number).toFixed(1)}</span>
                        <span className="text-muted-foreground">({coachProfile.ratingCount} reviews)</span>
                      </div>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Avatar upload */}
                  <div className="flex flex-col items-center gap-3 mb-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={previewUrl || coachProfile.avatarUrl || undefined} />
                      <AvatarFallback className="text-xl">{coachProfile.name[0]}</AvatarFallback>
                    </Avatar>
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("avatar-upload")?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      {avatarFile ? "Photo selected ✓" : "Upload Photo"}
                    </Button>
                  </div>

                  <Form {...coachForm}>
                    <form onSubmit={coachForm.handleSubmit((d) => coachMutation.mutate(d))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={coachForm.control} name="name" render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Display Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={coachForm.control} name="phone" render={({ field }) => (
                          <FormItem className="col-span-2 sm:col-span-1">
                            <FormLabel>Phone</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={coachForm.control} name="pricePerHour" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rate (£/hr)</FormLabel>
                            <FormControl><Input type="number" min={0} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={coachForm.control} name="locationCity" render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={coachForm.control} name="locationState" render={({ field }) => (
                          <FormItem>
                            <FormLabel>County / State</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={coachForm.control} name="experience" render={({ field }) => (
                        <FormItem>
                          <FormLabel>About You / Experience</FormLabel>
                          <FormControl>
                            <Textarea className="resize-none min-h-[100px]" placeholder="Your coaching background, qualifications, style..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="flex gap-3">
                        <Button type="submit" className="flex-1" disabled={coachMutation.isPending}>
                          {coachMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                        <Link href={`/coach/${coachProfile.userId}`}>
                          <Button type="button" variant="outline">View Public Profile</Button>
                        </Link>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
